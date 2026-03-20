import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';

// ---------------------------------------------------------------------------
// Row type
// ---------------------------------------------------------------------------

export interface UserPreferencesRow {
  id: number;
  user_id: number;
  traveler_type: string | null;
  budget_level: string | null;
  pace: string | null;
  travel_styles: string[];
  interest_keywords: string[];
  created_at: Date;
  updated_at: Date;
}

/**
 * Raw SQL repository for `user_preferences`.
 *
 * Preferences are tied 1-to-1 with a user (unique constraint on user_id).
 * All writes use INSERT … ON CONFLICT DO UPDATE so a missing row is created
 * automatically — callers do not need to distinguish insert vs update.
 */
@Injectable()
export class UserPreferencesRepository {
  constructor(private readonly db: DatabaseService) {}

  async findByUserId(userId: number): Promise<UserPreferencesRow | null> {
    return this.db.queryOne<UserPreferencesRow>(
      `SELECT id, user_id, traveler_type, budget_level, pace,
              travel_styles, interest_keywords, created_at, updated_at
       FROM user_preferences
       WHERE user_id = $1`,
      [userId],
    );
  }

  /**
   * Creates an empty preferences row for a newly registered user.
   * Safe to call multiple times — does nothing if the row already exists.
   */
  async initForUser(userId: number): Promise<void> {
    await this.db.execute(
      `INSERT INTO user_preferences (user_id)
       VALUES ($1)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId],
    );
  }

  /**
   * Partial upsert: only the provided fields are updated.
   * Fields that are undefined keep their current DB value.
   */
  async upsert(
    userId: number,
    data: {
      travelerType?: string;
      budgetLevel?: string;
      pace?: string;
      travelStyles?: string[];
      interestKeywords?: string[];
    },
  ): Promise<UserPreferencesRow> {
    // Fetch current to enable field-level merge
    const current = await this.findByUserId(userId);

    const merged = {
      traveler_type: data.travelerType ?? current?.traveler_type ?? null,
      budget_level: data.budgetLevel ?? current?.budget_level ?? null,
      pace: data.pace ?? current?.pace ?? null,
      travel_styles: data.travelStyles ?? current?.travel_styles ?? [],
      interest_keywords: data.interestKeywords ?? current?.interest_keywords ?? [],
    };

    const row = await this.db.queryOne<UserPreferencesRow>(
      `INSERT INTO user_preferences
         (user_id, traveler_type, budget_level, pace, travel_styles, interest_keywords)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE SET
         traveler_type      = EXCLUDED.traveler_type,
         budget_level       = EXCLUDED.budget_level,
         pace               = EXCLUDED.pace,
         travel_styles      = EXCLUDED.travel_styles,
         interest_keywords  = EXCLUDED.interest_keywords,
         updated_at         = now()
       RETURNING id, user_id, traveler_type, budget_level, pace,
                 travel_styles, interest_keywords, created_at, updated_at`,
      [
        userId,
        merged.traveler_type,
        merged.budget_level,
        merged.pace,
        merged.travel_styles,
        merged.interest_keywords,
      ],
    );
    return row!;
  }
}
