import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Thin wrapper around ioredis.
 *
 * - get/set/del operate only on string keys.
 * - setJson / getJson handle JSON serialization transparently.
 * - TTL is always in seconds.
 * - All errors are caught and logged; read misses return null gracefully.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const host = this.config.get<string>('redis.host') ?? 'localhost';
    const port = this.config.get<number>('redis.port') ?? 6379;
    const password = this.config.get<string>('redis.password') || undefined;

    this.client = new Redis({ host, port, password, lazyConnect: true });

    this.client.on('error', (err: Error) => {
      // Log but do not crash — cache failures are non-fatal.
      this.logger.warn(`Redis error: ${err.message}`);
    });

    this.client
      .connect()
      .then(() => this.logger.log(`Redis connected at ${host}:${port}`))
      .catch((err: Error) =>
        this.logger.warn(`Redis connect failed (non-fatal): ${err.message}`),
      );
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit().catch(() => void 0);
  }

  // -------------------------------------------------------------------------
  // Core operations
  // -------------------------------------------------------------------------

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (err) {
      this.logger.warn(`Redis GET [${key}] failed: ${(err as Error).message}`);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    try {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } catch (err) {
      this.logger.warn(`Redis SET [${key}] failed: ${(err as Error).message}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (err) {
      this.logger.warn(`Redis DEL [${key}] failed: ${(err as Error).message}`);
    }
  }

  // -------------------------------------------------------------------------
  // JSON helpers
  // -------------------------------------------------------------------------

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.get(key);
    if (raw == null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async setJson<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttlSeconds);
  }

  // -------------------------------------------------------------------------
  // Health
  // -------------------------------------------------------------------------

  isReady(): boolean {
    return this.client.status === 'ready';
  }
}
