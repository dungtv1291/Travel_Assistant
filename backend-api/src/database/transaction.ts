import type { PoolClient } from 'pg';
import type { DatabaseService } from './database.service';

/**
 * Executes `fn` inside a single PostgreSQL transaction managed by DatabaseService.
 * Issues BEGIN before calling `fn`, COMMIT on success, and ROLLBACK on any error.
 * The client is always released back to the pool.
 *
 * All queries inside `fn` MUST use the provided `client`, not the DatabaseService
 * query methods, to ensure every statement runs within the same transaction.
 *
 * Errors from the pg driver are wrapped as DatabaseError (exported from
 * database.service.ts). Catch them in the calling service to convert constraint
 * violations into HTTP exceptions before they reach the global filter.
 *
 * Repository usage:
 *   import { withTransaction } from 'src/database/transaction';
 *   import { DatabaseError } from 'src/database/database.service';
 *
 *   try {
 *     await withTransaction(this.db, async (client) => {
 *       await client.query('INSERT INTO itineraries ...', [...]);
 *       await client.query('INSERT INTO itinerary_days ...', [...]);
 *     });
 *   } catch (err) {
 *     if (err instanceof DatabaseError && err.isForeignKeyViolation) {
 *       throw new BadRequestException('Referenced resource does not exist');
 *     }
 *     throw err;
 *   }
 */
export async function withTransaction<T>(
  db: DatabaseService,
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  return db.transaction(fn);
}
