import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, QueryResultRow, types } from 'pg';

// Parse bigint (OID 20 = int8/bigserial) as JS number instead of string.
// Safe for all IDs in this application — they will not exceed Number.MAX_SAFE_INTEGER.
types.setTypeParser(20, (val: string) => parseInt(val, 10));

// Parse numeric / decimal (OID 1700) as JS float instead of string.
// Used for rating columns (numeric(2,1)) and coordinate columns (numeric(10,7)).
types.setTypeParser(1700, (val: string) => parseFloat(val));

// ---------------------------------------------------------------------------
// Typed database error
// ---------------------------------------------------------------------------

/**
 * Wraps a pg driver error and exposes typed helpers for common PostgreSQL
 * error codes. Repositories should catch this to convert constraint violations
 * into appropriate HTTP exceptions instead of leaking driver details.
 *
 * Repository usage:
 *   try {
 *     await this.db.execute('INSERT INTO users (email, ...) VALUES ($1, ...)', [...]);
 *   } catch (err) {
 *     if (err instanceof DatabaseError && err.isUniqueViolation) {
 *       throw new ConflictException('Email already in use');
 *     }
 *     throw err;
 *   }
 */
export class DatabaseError extends Error {
  /** PostgreSQL error code, e.g. '23505' for unique violation. */
  readonly code: string | undefined;
  /** Name of the violated constraint, e.g. 'uq_users_email'. */
  readonly constraint: string | undefined;
  /** Detail message from the PostgreSQL error. */
  readonly detail: string | undefined;

  constructor(cause: Error & { code?: string; constraint?: string; detail?: string }) {
    super(cause.message);
    this.name = 'DatabaseError';
    this.code = cause.code;
    this.constraint = cause.constraint;
    this.detail = cause.detail;
  }

  /** UNIQUE constraint violated (pg code 23505). */
  get isUniqueViolation(): boolean {
    return this.code === '23505';
  }

  /** FOREIGN KEY constraint violated (pg code 23503). */
  get isForeignKeyViolation(): boolean {
    return this.code === '23503';
  }

  /** NOT NULL constraint violated (pg code 23502). */
  get isNotNullViolation(): boolean {
    return this.code === '23502';
  }
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * Thin wrapper around a `pg.Pool`. All queries are parameterised — never
 * build SQL strings via concatenation; always use $1, $2, ... placeholders.
 *
 * Repositories should inject this service and use:
 *   - query()     for SELECT that returns multiple rows
 *   - queryOne()  for SELECT that returns at most one row
 *   - execute()   for INSERT / UPDATE / DELETE with no return value needed
 *   - getClient() only when building a raw transaction outside withTransaction()
 *
 * For multi-statement transactions, prefer withTransaction() from transaction.ts.
 */
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool!: Pool;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    this.pool = new Pool({
      host: this.configService.get<string>('db.host'),
      port: this.configService.get<number>('db.port'),
      database: this.configService.get<string>('db.name'),
      user: this.configService.get<string>('db.user'),
      password: this.configService.get<string>('db.password'),
      min: this.configService.get<number>('db.poolMin'),
      max: this.configService.get<number>('db.poolMax'),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });

    // Log unexpected idle-client errors so they appear in application logs.
    this.pool.on('error', (err) => {
      this.logger.error('Unexpected pg pool error', err.stack);
    });

    this.logger.log('Database pool initialized');
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
    this.logger.log('Database pool closed');
  }

  // ---------------------------------------------------------------------------
  // Query helpers — use these in repositories
  // ---------------------------------------------------------------------------

  /**
   * Execute a parameterised query and return ALL rows.
   *
   * Example:
   *   const rows = await this.db.query<DestinationRow>(
   *     'SELECT id, name, country FROM destinations WHERE active = $1',
   *     [true],
   *   );
   */
  async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params: unknown[] = [],
  ): Promise<T[]> {
    try {
      const result = await this.pool.query<T>(sql, params);
      return result.rows;
    } catch (err) {
      throw this.wrapError(err);
    }
  }

  /**
   * Execute a parameterised query and return the FIRST row, or null.
   *
   * Example:
   *   const user = await this.db.queryOne<UserRow>(
   *     'SELECT * FROM users WHERE id = $1',
   *     [userId],
   *   );
   *   if (!user) throw new NotFoundException('User not found');
   */
  async queryOne<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params: unknown[] = [],
  ): Promise<T | null> {
    try {
      const result = await this.pool.query<T>(sql, params);
      return result.rows[0] ?? null;
    } catch (err) {
      throw this.wrapError(err);
    }
  }

  /**
   * Execute an INSERT, UPDATE, or DELETE where the result rows are not needed.
   * Throws DatabaseError on constraint violations so callers can convert them
   * to appropriate HTTP exceptions.
   *
   * Example:
   *   await this.db.execute(
   *     'UPDATE users SET last_login = now() WHERE id = $1',
   *     [userId],
   *   );
   */
  async execute(sql: string, params: unknown[] = []): Promise<void> {
    try {
      await this.pool.query(sql, params);
    } catch (err) {
      throw this.wrapError(err);
    }
  }

  /**
   * Acquire a raw PoolClient.
   * Prefer withTransaction() from transaction.ts for managed transactions.
   * If used directly, the caller MUST call client.release() in a finally block.
   */
  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  /**
   * Run a function inside a single transaction.
   * Issues BEGIN before calling fn, COMMIT on success, ROLLBACK on any error.
   * The client is always released back to the pool.
   * Called by withTransaction() in transaction.ts — prefer that helper in services.
   */
  async transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw this.wrapError(err);
    } finally {
      client.release();
    }
  }

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------

  /** Wraps pg driver errors in DatabaseError; re-throws anything else as-is. */
  private wrapError(err: unknown): unknown {
    if (err instanceof Error && 'code' in err) {
      return new DatabaseError(
        err as Error & { code?: string; constraint?: string; detail?: string },
      );
    }
    return err;
  }

  /** Ping the database. Used by the health check. */
  async ping(): Promise<void> {
    await this.pool.query('SELECT 1');
  }
}
