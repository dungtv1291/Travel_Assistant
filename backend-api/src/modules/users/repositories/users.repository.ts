import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';

// ---------------------------------------------------------------------------
// Row types — snake_case, direct from pg
// ---------------------------------------------------------------------------

export interface UserRow {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  avatar_url: string | null;
  language: string;
  preferred_currency: string;
  dark_mode_enabled: boolean;
  push_notification_enabled: boolean;
  is_active: boolean;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

// Columns returned on every public-facing read (no password_hash)
const PUBLIC_COLS = `
  id, email, full_name, avatar_url, language, preferred_currency,
  dark_mode_enabled, push_notification_enabled, is_active,
  last_login_at, created_at, updated_at
`;

/**
 * Raw SQL repository for the `users` table.
 *
 * Rules:
 * - All queries use $N parameterised placeholders — no string concatenation.
 * - Methods that need the password_hash (auth) explicitly SELECT it.
 * - Methods used for profile data never SELECT password_hash.
 * - Callers are responsible for omitting password_hash from API responses.
 */
@Injectable()
export class UsersRepository {
  constructor(private readonly db: DatabaseService) {}

  // -------------------------------------------------------------------------
  // Auth reads — include password_hash
  // -------------------------------------------------------------------------

  async findByEmailWithPassword(email: string): Promise<UserRow | null> {
    return this.db.queryOne<UserRow>(
      `SELECT id, email, password_hash, full_name, avatar_url, language,
              preferred_currency, dark_mode_enabled, push_notification_enabled,
              is_active, last_login_at, created_at, updated_at
       FROM users
       WHERE email = $1`,
      [email],
    );
  }

  async findByIdWithPassword(id: number): Promise<UserRow | null> {
    return this.db.queryOne<UserRow>(
      `SELECT id, email, password_hash, full_name, avatar_url, language,
              preferred_currency, dark_mode_enabled, push_notification_enabled,
              is_active, last_login_at, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id],
    );
  }

  // -------------------------------------------------------------------------
  // General reads — no password_hash
  // -------------------------------------------------------------------------

  async findById(id: number): Promise<Omit<UserRow, 'password_hash'> | null> {
    return this.db.queryOne<Omit<UserRow, 'password_hash'>>(
      `SELECT ${PUBLIC_COLS} FROM users WHERE id = $1`,
      [id],
    );
  }

  // -------------------------------------------------------------------------
  // Writes
  // -------------------------------------------------------------------------

  async insert(data: {
    email: string;
    passwordHash: string;
    fullName: string;
    language: string;
  }): Promise<UserRow> {
    const row = await this.db.queryOne<UserRow>(
      `INSERT INTO users (email, password_hash, full_name, language)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, password_hash, full_name, avatar_url, language,
                 preferred_currency, dark_mode_enabled, push_notification_enabled,
                 is_active, last_login_at, created_at, updated_at`,
      [data.email, data.passwordHash, data.fullName, data.language],
    );
    return row!;
  }

  async updateProfile(
    id: number,
    data: { fullName?: string; avatarUrl?: string },
  ): Promise<Omit<UserRow, 'password_hash'> | null> {
    const setClauses: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (data.fullName !== undefined) {
      setClauses.push(`full_name = $${idx++}`);
      params.push(data.fullName);
    }
    if (data.avatarUrl !== undefined) {
      setClauses.push(`avatar_url = $${idx++}`);
      params.push(data.avatarUrl);
    }
    if (setClauses.length === 0) return this.findById(id);

    setClauses.push(`updated_at = now()`);
    params.push(id);

    return this.db.queryOne<Omit<UserRow, 'password_hash'>>(
      `UPDATE users
       SET ${setClauses.join(', ')}
       WHERE id = $${idx}
       RETURNING ${PUBLIC_COLS}`,
      params,
    );
  }

  async updateSettings(
    id: number,
    data: {
      language?: string;
      preferredCurrency?: string;
      darkModeEnabled?: boolean;
      pushNotificationEnabled?: boolean;
    },
  ): Promise<void> {
    const setClauses: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (data.language !== undefined) {
      setClauses.push(`language = $${idx++}`);
      params.push(data.language);
    }
    if (data.preferredCurrency !== undefined) {
      setClauses.push(`preferred_currency = $${idx++}`);
      params.push(data.preferredCurrency);
    }
    if (data.darkModeEnabled !== undefined) {
      setClauses.push(`dark_mode_enabled = $${idx++}`);
      params.push(data.darkModeEnabled);
    }
    if (data.pushNotificationEnabled !== undefined) {
      setClauses.push(`push_notification_enabled = $${idx++}`);
      params.push(data.pushNotificationEnabled);
    }
    if (setClauses.length === 0) return;

    setClauses.push(`updated_at = now()`);
    params.push(id);

    await this.db.execute(
      `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${idx}`,
      params,
    );
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.db.execute(
      `UPDATE users SET last_login_at = now() WHERE id = $1`,
      [id],
    );
  }

  /**
   * Returns aggregate counts used by GET /users/profile.
   * Requires itineraries, bookings, and favorites tables to be migrated.
   */
  async getProfileCounts(
    userId: number,
  ): Promise<{ saved_trips_count: number; bookings_count: number; favorites_count: number }> {
    const row = await this.db.queryOne<{
      saved_trips_count: number;
      bookings_count: number;
      favorites_count: number;
    }>(
      `SELECT
         (SELECT COUNT(*) FROM itineraries WHERE user_id = $1 AND is_saved = true)::int AS saved_trips_count,
         (SELECT COUNT(*) FROM bookings   WHERE user_id = $1)::int                      AS bookings_count,
         (SELECT COUNT(*) FROM favorites  WHERE user_id = $1)::int                      AS favorites_count`,
      [userId],
    );
    return row!;
  }
}
