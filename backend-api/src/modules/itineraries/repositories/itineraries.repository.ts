import { Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabaseService } from '../../../database/database.service';
import { withTransaction } from '../../../database/transaction';
import type {
  DayData,
  MoneyAmount,
  PlannerOutput,
  TipData,
  TimelineItemData,
  WarningData,
} from '../../../integrations/openai/interfaces/ai-planner.interface';

// ---------------------------------------------------------------------------
// Row types returned by SELECT queries
// ---------------------------------------------------------------------------

export interface ItineraryHeaderRow {
  id: number;
  public_id: string;
  user_id: number;
  destination_id: number;
  title: string;
  start_date: string | null;
  nights: number;
  days: number;
  traveler_type: string;
  budget_level: string;
  pace: string;
  travel_styles: string[];
  interests: string[];
  language: string;
  currency: string;
  total_activities: number;
  estimated_cost_amount: number;
  estimated_cost_currency: string;
  estimated_cost_display: string | null;
  budget_label: string | null;
  generated_by: string;
  is_saved: boolean;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  // joined from destinations
  dest_slug: string;
  dest_code: string | null;
  dest_name_ko: string;
  dest_name_en: string;
  dest_name_vi: string;
  dest_hero_image_url: string | null;
}

export interface ItineraryDayRow {
  id: number;
  itinerary_id: number;
  day_number: number;
  date_value: string | null;
  date_label: string | null;
  day_label: string | null;
  title: string;
  weather_condition_code: string | null;
  weather_condition_label: string | null;
  weather_temperature_c: number | null;
  weather_note: string | null;
  weather_icon_key: string | null;
  estimated_cost_amount: number;
  estimated_cost_currency: string;
  estimated_cost_display: string | null;
  activity_count: number;
}

export interface TimelineItemRow {
  id: number;
  itinerary_day_id: number;
  item_public_id: string;
  item_type: string;
  start_time: string;
  duration_minutes: number;
  duration_label: string | null;
  title: string;
  description: string | null;
  location_name: string | null;
  location_address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  estimated_cost_amount: number | null;
  estimated_cost_currency: string | null;
  estimated_cost_display: string | null;
  tip_text: string | null;
  booking_required: boolean;
  booking_url: string | null;
  accent_color: string | null;
  icon_key: string | null;
  image_url: string | null;
  sort_order: number;
  /** json_agg result — null if no tags, else array of {label, sort_order} */
  tags: Array<{ label: string; sort_order: number }> | null;
}

export interface WarningRow {
  id: number;
  itinerary_day_id: number;
  warning_type: string;
  title: string | null;
  text: string;
  count_value: number | null;
  sort_order: number;
}

export interface BookingNeededRow {
  id: number;
  itinerary_day_id: number;
  label: string;
  sort_order: number;
}

export interface SmartTipRow {
  id: number;
  itinerary_day_id: number;
  order_no: number;
  text: string;
  icon_key: string | null;
}

export interface ItineraryListRow {
  public_id: string;
  title: string;
  language: string;
  start_date: string | null;
  nights: number;
  days: number;
  total_activities: number;
  estimated_cost_amount: number;
  estimated_cost_currency: string;
  is_saved: boolean;
  generated_by: string;
  cover_image_url: string | null;
  dest_name_ko: string;
  dest_name_en: string;
  dest_name_vi: string;
  dest_hero_image_url: string | null;
}

// ---------------------------------------------------------------------------
// Insert parameter types — mirrors PlannerOutput + extra header fields
// ---------------------------------------------------------------------------

export interface InsertItineraryParams {
  publicId: string;
  userId: number;
  destinationId: number;
  title: string;
  startDate: string | null;
  nights: number;
  days: number;
  travelerType: string;
  budgetLevel: string;
  pace: string;
  travelStyles: string[];
  interests: string[];
  language: string;
  currency: string;
  totalActivities: number;
  estimatedCostAmount: number;
  estimatedCostCurrency: string;
  estimatedCostDisplay: string | null;
  budgetLabel: string | null;
  generatedBy: string;
  coverImageUrl: string | null;
  plannerDays: DayData[];
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

/**
 * Raw SQL repository for the itinerary domain.
 *
 * Insert strategy:
 * - Everything runs inside a single transaction.
 * - We insert the header first to get the DB id, then each day, then each
 *   day's items/warnings/tips — all via individual parameterized INSERTs.
 * - No multi-row unnest or COPY for MVP simplicity; all statements are
 *   parameterized and safe against injection.
 *
 * Read strategy:
 * - One query for the header + destination join.
 * - One query for all days.
 * - One query for all timeline items + tags (json_agg).
 * - Three separate queries for warnings, booking_needed, smart_tips.
 * - Grouping by day_id happens in TypeScript to avoid a super-wide join.
 */
@Injectable()
export class ItinerariesRepository {
  constructor(private readonly db: DatabaseService) {}

  // -------------------------------------------------------------------------
  // INSERT — full itinerary tree in one transaction
  // -------------------------------------------------------------------------

  async insert(params: InsertItineraryParams): Promise<string> {
    await withTransaction(this.db, async (client) => {
      // 1. Master header
      const itineraryResult = await client.query<{ id: number }>(
        `INSERT INTO itineraries (
           public_id, user_id, destination_id, title,
           start_date, nights, days,
           traveler_type, budget_level, pace,
           travel_styles, interests,
           language, currency,
           total_activities,
           estimated_cost_amount, estimated_cost_currency, estimated_cost_display,
           budget_label, generated_by, cover_image_url
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21
         ) RETURNING id`,
        [
          params.publicId,
          params.userId,
          params.destinationId,
          params.title,
          params.startDate,
          params.nights,
          params.days,
          params.travelerType,
          params.budgetLevel,
          params.pace,
          JSON.stringify(params.travelStyles),
          JSON.stringify(params.interests),
          params.language,
          params.currency,
          params.totalActivities,
          params.estimatedCostAmount,
          params.estimatedCostCurrency,
          params.estimatedCostDisplay,
          params.budgetLabel,
          params.generatedBy,
          params.coverImageUrl,
        ],
      );

      const itineraryId = itineraryResult.rows[0].id;

      // 2. Days + children
      for (const day of params.plannerDays) {
        await this.insertDay(client, itineraryId, day);
      }
    });

    return params.publicId;
  }

  private async insertDay(
    client: PoolClient,
    itineraryId: number,
    day: DayData,
  ): Promise<void> {
    const dayResult = await client.query<{ id: number }>(
      `INSERT INTO itinerary_days (
         itinerary_id, day_number, date_value, date_label, day_label,
         title,
         weather_condition_code, weather_condition_label,
         weather_temperature_c, weather_note, weather_icon_key,
         estimated_cost_amount, estimated_cost_currency, estimated_cost_display,
         activity_count
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING id`,
      [
        itineraryId,
        day.dayNumber,
        day.date,
        day.dateLabel,
        day.dayLabel,
        day.title,
        day.weather.conditionCode,
        day.weather.conditionLabel,
        day.weather.temperatureC,
        day.weather.note,
        day.weather.iconKey ?? null,
        day.estimatedCost.amount,
        day.estimatedCost.currency,
        day.estimatedCost.display,
        day.items.length,
      ],
    );

    const dayId = dayResult.rows[0].id;

    // 2a. Timeline items
    for (let i = 0; i < day.items.length; i++) {
      await this.insertTimelineItem(client, dayId, day.items[i], i);
    }

    // 2b. Warnings
    for (let i = 0; i < day.warnings.length; i++) {
      await this.insertWarning(client, dayId, day.warnings[i], i);
    }

    // 2c. Booking-needed labels
    for (let i = 0; i < day.bookingNeededItems.length; i++) {
      await client.query(
        `INSERT INTO itinerary_booking_needed_items (itinerary_day_id, label, sort_order)
         VALUES ($1, $2, $3)`,
        [dayId, day.bookingNeededItems[i], i],
      );
    }

    // 2d. Smart tips
    for (const tip of day.smartTips) {
      await this.insertSmartTip(client, dayId, tip);
    }
  }

  private async insertTimelineItem(
    client: PoolClient,
    dayId: number,
    item: TimelineItemData,
    sortOrder: number,
  ): Promise<void> {
    const itemResult = await client.query<{ id: number }>(
      `INSERT INTO itinerary_timeline_items (
         itinerary_day_id, item_public_id, item_type,
         start_time, duration_minutes, duration_label,
         title, description,
         location_name, location_address, location_lat, location_lng,
         estimated_cost_amount, estimated_cost_currency, estimated_cost_display,
         tip_text, booking_required, booking_url,
         accent_color, icon_key, image_url, sort_order
       ) VALUES (
         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
       ) RETURNING id`,
      [
        dayId,
        item.itemPublicId,
        item.type,
        item.startTime,
        item.durationMinutes,
        item.durationLabel ?? null,
        item.title,
        item.description ?? null,
        item.location.name ?? null,
        item.location.address ?? null,
        item.location.lat ?? null,
        item.location.lng ?? null,
        item.estimatedCost?.amount ?? null,
        item.estimatedCost?.currency ?? null,
        item.estimatedCost?.display ?? null,
        item.tipText ?? null,
        item.bookingRequired ?? false,
        item.bookingUrl ?? null,
        item.accentColor,
        item.iconKey,
        item.imageUrl ?? null,
        sortOrder,
      ],
    );

    const itemId = itemResult.rows[0].id;

    // Tags
    if (item.tags && item.tags.length > 0) {
      for (let i = 0; i < item.tags.length; i++) {
        await client.query(
          `INSERT INTO itinerary_item_tags (timeline_item_id, label, sort_order)
           VALUES ($1, $2, $3)`,
          [itemId, item.tags[i], i],
        );
      }
    }
  }

  private async insertWarning(
    client: PoolClient,
    dayId: number,
    warning: WarningData,
    sortOrder: number,
  ): Promise<void> {
    await client.query(
      `INSERT INTO itinerary_warnings (
         itinerary_day_id, warning_type, title, text, count_value, sort_order
       ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [dayId, warning.type, warning.title ?? null, warning.text, warning.count ?? null, sortOrder],
    );
  }

  private async insertSmartTip(
    client: PoolClient,
    dayId: number,
    tip: TipData,
  ): Promise<void> {
    await client.query(
      `INSERT INTO itinerary_smart_tips (itinerary_day_id, order_no, text, icon_key)
       VALUES ($1, $2, $3, $4)`,
      [dayId, tip.orderNo, tip.text, tip.iconKey ?? null],
    );
  }

  // -------------------------------------------------------------------------
  // DELETE days (for regenerate — CASCADE handles all children)
  // -------------------------------------------------------------------------

  async deleteDaysByItineraryId(itineraryId: number): Promise<void> {
    await this.db.execute(
      `DELETE FROM itinerary_days WHERE itinerary_id = $1`,
      [itineraryId],
    );
  }

  /**
   * Atomically replaces all day/children data and updates the header for a
   * regenerated itinerary.  Runs the entire operation in one transaction so
   * the record is never left in a half-replaced state.
   */
  async regenerateDays(
    itineraryId: number,
    plannerDays: DayData[],
    headerPatch: {
      title: string;
      totalActivities: number;
      estimatedCostAmount: number;
      estimatedCostCurrency: string;
      estimatedCostDisplay: string | null;
      budgetLabel: string | null;
    },
  ): Promise<void> {
    await withTransaction(this.db, async (client) => {
      // 1. Remove all existing days (CASCADE deletes all children)
      await client.query(
        `DELETE FROM itinerary_days WHERE itinerary_id = $1`,
        [itineraryId],
      );

      // 2. Insert new days
      for (const day of plannerDays) {
        await this.insertDay(client, itineraryId, day);
      }

      // 3. Update the header fields that change on regeneration
      await client.query(
        `UPDATE itineraries
         SET title = $1,
             total_activities = $2,
             estimated_cost_amount = $3,
             estimated_cost_currency = $4,
             estimated_cost_display = $5,
             budget_label = $6,
             updated_at = now()
         WHERE id = $7`,
        [
          headerPatch.title,
          headerPatch.totalActivities,
          headerPatch.estimatedCostAmount,
          headerPatch.estimatedCostCurrency,
          headerPatch.estimatedCostDisplay,
          headerPatch.budgetLabel,
          itineraryId,
        ],
      );
    });
  }

  // -------------------------------------------------------------------------
  // UPDATE header fields after regeneration
  // -------------------------------------------------------------------------

  async updateAfterRegeneration(
    itineraryId: number,
    patch: {
      title: string;
      totalActivities: number;
      estimatedCostAmount: number;
      estimatedCostCurrency: string;
      estimatedCostDisplay: string | null;
      budgetLabel: string | null;
    },
  ): Promise<void> {
    await this.db.execute(
      `UPDATE itineraries
       SET title = $1,
           total_activities = $2,
           estimated_cost_amount = $3,
           estimated_cost_currency = $4,
           estimated_cost_display = $5,
           budget_label = $6,
           updated_at = now()
       WHERE id = $7`,
      [
        patch.title,
        patch.totalActivities,
        patch.estimatedCostAmount,
        patch.estimatedCostCurrency,
        patch.estimatedCostDisplay,
        patch.budgetLabel,
        itineraryId,
      ],
    );
  }

  // -------------------------------------------------------------------------
  // UPDATE is_saved
  // -------------------------------------------------------------------------

  /**
   * Sets is_saved = true.  The WHERE clause includes user_id to prevent
   * one authenticated user from saving another user's itinerary.
   * Returns null when the public_id does not exist or belongs to a
   * different user (so the caller can issue a 404).
   */
  async markSaved(
    publicId: string,
    userId: number,
  ): Promise<string | null> {
    const row = await this.db.queryOne<{ updated_at: string }>(
      `UPDATE itineraries
       SET is_saved = true, updated_at = now()
       WHERE public_id = $1 AND user_id = $2
       RETURNING updated_at`,
      [publicId, userId],
    );
    return row?.updated_at ?? null;
  }

  // -------------------------------------------------------------------------
  // FIND — header lookup
  // -------------------------------------------------------------------------

  async findByPublicId(publicId: string): Promise<ItineraryHeaderRow | null> {
    return this.db.queryOne<ItineraryHeaderRow>(
      `SELECT
         i.id, i.public_id, i.user_id, i.destination_id,
         i.title, i.start_date, i.nights, i.days,
         i.traveler_type, i.budget_level, i.pace,
         i.travel_styles, i.interests,
         i.language, i.currency,
         i.total_activities,
         i.estimated_cost_amount, i.estimated_cost_currency, i.estimated_cost_display,
         i.budget_label, i.generated_by, i.is_saved, i.cover_image_url,
         i.created_at, i.updated_at,
         d.slug   AS dest_slug,
         d.code   AS dest_code,
         d.name_ko AS dest_name_ko,
         d.name_en AS dest_name_en,
         d.name_vi AS dest_name_vi,
         d.hero_image_url AS dest_hero_image_url
       FROM itineraries i
       JOIN destinations d ON d.id = i.destination_id
       WHERE i.public_id = $1`,
      [publicId],
    );
  }

  async findById(id: number): Promise<ItineraryHeaderRow | null> {
    return this.db.queryOne<ItineraryHeaderRow>(
      `SELECT
         i.id, i.public_id, i.user_id, i.destination_id,
         i.title, i.start_date, i.nights, i.days,
         i.traveler_type, i.budget_level, i.pace,
         i.travel_styles, i.interests,
         i.language, i.currency,
         i.total_activities,
         i.estimated_cost_amount, i.estimated_cost_currency, i.estimated_cost_display,
         i.budget_label, i.generated_by, i.is_saved, i.cover_image_url,
         i.created_at, i.updated_at,
         d.slug   AS dest_slug,
         d.code   AS dest_code,
         d.name_ko AS dest_name_ko,
         d.name_en AS dest_name_en,
         d.name_vi AS dest_name_vi,
         d.hero_image_url AS dest_hero_image_url
       FROM itineraries i
       JOIN destinations d ON d.id = i.destination_id
       WHERE i.id = $1`,
      [id],
    );
  }

  // -------------------------------------------------------------------------
  // FIND — days
  // -------------------------------------------------------------------------

  async findDaysByItineraryId(itineraryId: number): Promise<ItineraryDayRow[]> {
    return this.db.query<ItineraryDayRow>(
      `SELECT
         id, itinerary_id, day_number,
         date_value, date_label, day_label, title,
         weather_condition_code, weather_condition_label,
         weather_temperature_c, weather_note, weather_icon_key,
         estimated_cost_amount, estimated_cost_currency, estimated_cost_display,
         activity_count
       FROM itinerary_days
       WHERE itinerary_id = $1
       ORDER BY day_number ASC`,
      [itineraryId],
    );
  }

  // -------------------------------------------------------------------------
  // FIND — timeline items for all days (batch, avoids N+1)
  // -------------------------------------------------------------------------

  async findItemsByDayIds(dayIds: number[]): Promise<TimelineItemRow[]> {
    if (dayIds.length === 0) return [];
    return this.db.query<TimelineItemRow>(
      `SELECT
         ti.id, ti.itinerary_day_id, ti.item_public_id, ti.item_type,
         ti.start_time, ti.duration_minutes, ti.duration_label,
         ti.title, ti.description,
         ti.location_name, ti.location_address, ti.location_lat, ti.location_lng,
         ti.estimated_cost_amount, ti.estimated_cost_currency, ti.estimated_cost_display,
         ti.tip_text, ti.booking_required, ti.booking_url,
         ti.accent_color, ti.icon_key, ti.image_url, ti.sort_order,
         COALESCE(
           json_agg(
             json_build_object('label', t.label, 'sort_order', t.sort_order)
             ORDER BY t.sort_order
           ) FILTER (WHERE t.id IS NOT NULL),
           '[]'::json
         ) AS tags
       FROM itinerary_timeline_items ti
       LEFT JOIN itinerary_item_tags t ON t.timeline_item_id = ti.id
       WHERE ti.itinerary_day_id = ANY($1::bigint[])
       GROUP BY ti.id
       ORDER BY ti.itinerary_day_id, ti.sort_order`,
      [dayIds],
    );
  }

  // -------------------------------------------------------------------------
  // FIND — warnings for all days
  // -------------------------------------------------------------------------

  async findWarningsByDayIds(dayIds: number[]): Promise<WarningRow[]> {
    if (dayIds.length === 0) return [];
    return this.db.query<WarningRow>(
      `SELECT id, itinerary_day_id, warning_type, title, text, count_value, sort_order
       FROM itinerary_warnings
       WHERE itinerary_day_id = ANY($1::bigint[])
       ORDER BY itinerary_day_id, sort_order`,
      [dayIds],
    );
  }

  // -------------------------------------------------------------------------
  // FIND — booking-needed items for all days
  // -------------------------------------------------------------------------

  async findBookingNeededByDayIds(dayIds: number[]): Promise<BookingNeededRow[]> {
    if (dayIds.length === 0) return [];
    return this.db.query<BookingNeededRow>(
      `SELECT id, itinerary_day_id, label, sort_order
       FROM itinerary_booking_needed_items
       WHERE itinerary_day_id = ANY($1::bigint[])
       ORDER BY itinerary_day_id, sort_order`,
      [dayIds],
    );
  }

  // -------------------------------------------------------------------------
  // FIND — smart tips for all days
  // -------------------------------------------------------------------------

  async findSmartTipsByDayIds(dayIds: number[]): Promise<SmartTipRow[]> {
    if (dayIds.length === 0) return [];
    return this.db.query<SmartTipRow>(
      `SELECT id, itinerary_day_id, order_no, text, icon_key
       FROM itinerary_smart_tips
       WHERE itinerary_day_id = ANY($1::bigint[])
       ORDER BY itinerary_day_id, order_no`,
      [dayIds],
    );
  }

  // -------------------------------------------------------------------------
  // FIND — list (summary cards) for a user
  // -------------------------------------------------------------------------

  async findAllByUserId(userId: number, savedOnly: boolean): Promise<ItineraryListRow[]> {
    const conditions = ['i.user_id = $1'];
    const params: unknown[] = [userId];

    if (savedOnly) {
      conditions.push('i.is_saved = true');
    }

    const where = conditions.join(' AND ');

    return this.db.query<ItineraryListRow>(
      `SELECT
         i.public_id, i.title, i.language, i.start_date,
         i.nights, i.days, i.total_activities,
         i.estimated_cost_amount, i.estimated_cost_currency,
         i.is_saved, i.generated_by, i.cover_image_url,
         d.name_ko AS dest_name_ko,
         d.name_en AS dest_name_en,
         d.name_vi AS dest_name_vi,
         d.hero_image_url AS dest_hero_image_url
       FROM itineraries i
       JOIN destinations d ON d.id = i.destination_id
       WHERE ${where}
       ORDER BY i.created_at DESC`,
      params,
    );
  }

  // -------------------------------------------------------------------------
  // AI generation log
  // -------------------------------------------------------------------------

  async insertAiLog(params: {
    userId: number;
    featureType: string;
    requestPayload: object;
    responsePayload: object | null;
    status: 'success' | 'error';
    providerName: string;
    modelName: string | null;
    tokensUsed: number | null;
    errorMessage: string | null;
  }): Promise<void> {
    await this.db.execute(
      `INSERT INTO ai_generation_logs (
         user_id, feature_type,
         request_payload, response_payload,
         status, provider_name, model_name, tokens_used, error_message
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        params.userId,
        params.featureType,
        JSON.stringify(params.requestPayload),
        params.responsePayload ? JSON.stringify(params.responsePayload) : null,
        params.status,
        params.providerName,
        params.modelName,
        params.tokensUsed,
        params.errorMessage,
      ],
    );
  }
}
