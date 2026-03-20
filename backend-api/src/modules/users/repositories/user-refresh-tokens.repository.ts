import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';

// ---------------------------------------------------------------------------
// Row type
// ---------------------------------------------------------------------------

export interface RefreshTokenRow {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  revoked_at: Date | null;
  created_at: Date;
}

/**
 * Raw SQL repository for `user_refresh_tokens`.
 *
 * Token storage strategy:
 * - Raw token = cryptographically random UUID (never persisted)
 * - Stored hash = SHA-256 hex of the raw token (fast, indexable)
 * - Revocation: set revoked_at rather than DELETE so audit history is preserved
 * - Expired+revoked rows can be purged by a background job in the future
 */
@Injectable()
export class UserRefreshTokensRepository {
  constructor(private readonly db: DatabaseService) {}

  async insert(data: {
    userId: number;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.db.execute(
      `INSERT INTO user_refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [data.userId, data.tokenHash, data.expiresAt],
    );
  }

  /**
   * Finds a token that is not revoked and not yet expired.
   * Returns null if the token does not exist, was already used, or has expired.
   */
  async findActiveByHash(tokenHash: string): Promise<RefreshTokenRow | null> {
    return this.db.queryOne<RefreshTokenRow>(
      `SELECT id, user_id, token_hash, expires_at, revoked_at, created_at
       FROM user_refresh_tokens
       WHERE token_hash = $1
         AND revoked_at IS NULL
         AND expires_at > now()`,
      [tokenHash],
    );
  }

  /** Soft-revokes a single token by id. Used during refresh rotation and logout. */
  async revoke(id: number): Promise<void> {
    await this.db.execute(
      `UPDATE user_refresh_tokens SET revoked_at = now() WHERE id = $1`,
      [id],
    );
  }

  /** Revokes all active tokens for a user. Useful for a "logout all devices" feature. */
  async revokeAllForUser(userId: number): Promise<void> {
    await this.db.execute(
      `UPDATE user_refresh_tokens
       SET revoked_at = now()
       WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId],
    );
  }
}
