import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';

// ---------------------------------------------------------------------------
// Localized sub-types (returned inside json_agg columns)
// ---------------------------------------------------------------------------

export interface LocalizedBadge {
  label_ko: string;
  label_en: string;
  label_vi: string;
  badge_type: string | null;
}

export interface LocalizedTag {
  label_ko: string;
  label_en: string;
  label_vi: string;
}

// ---------------------------------------------------------------------------
// Row types — snake_case, direct from pg
// ---------------------------------------------------------------------------

export interface DestinationCardRow {
  id: number;
  slug: string;
  name_ko: string;
  name_en: string;
  name_vi: string;
  region_label_ko: string | null;
  region_label_en: string | null;
  region_label_vi: string | null;
  country_label_ko: string | null;
  country_label_en: string | null;
  country_label_vi: string | null;
  hero_image_url: string | null;
  rating: number;
  review_count: number;
  match_percent: number | null;
  badges: LocalizedBadge[];
}

export interface DestinationDetailRow {
  id: number;
  slug: string;
  name_ko: string;
  name_en: string;
  name_vi: string;
  region_label_ko: string | null;
  region_label_en: string | null;
  region_label_vi: string | null;
  country_label_ko: string | null;
  country_label_en: string | null;
  country_label_vi: string | null;
  hero_image_url: string | null;
  rating: number;
  review_count: number;
  visit_count: number;
  match_percent: number | null;
  short_description_ko: string | null;
  short_description_en: string | null;
  short_description_vi: string | null;
  overview_description_ko: string | null;
  overview_description_en: string | null;
  overview_description_vi: string | null;
  best_season_label_ko: string | null;
  best_season_label_en: string | null;
  best_season_label_vi: string | null;
  average_temperature_c: number | null;
  language_label_ko: string | null;
  language_label_en: string | null;
  language_label_vi: string | null;
  currency_label_ko: string | null;
  currency_label_en: string | null;
  currency_label_vi: string | null;
}

export interface PlaceRow {
  id: number;
  name_ko: string;
  name_en: string;
  name_vi: string;
  category_label_ko: string | null;
  category_label_en: string | null;
  category_label_vi: string | null;
  short_description_ko: string | null;
  short_description_en: string | null;
  short_description_vi: string | null;
  cover_image_url: string | null;
  rating: number;
  review_count: number;
  visit_duration_label_ko: string | null;
  visit_duration_label_en: string | null;
  visit_duration_label_vi: string | null;
  ticket_price_amount: number | null;
  ticket_price_currency: string | null;
  tags: LocalizedTag[];
}

export interface HotelCardRow {
  id: number;
  slug: string;
  name: string;
  cover_image_url: string | null;
  rating: number;
  review_count: number;
  nightly_from_price: number | null;
  currency: string;
  badges: LocalizedBadge[];
}

export interface SeasonRow {
  season_key: string;
  label_ko: string;
  label_en: string;
  label_vi: string;
  months_label_ko: string | null;
  months_label_en: string | null;
  months_label_vi: string | null;
  note_ko: string | null;
  note_en: string | null;
  note_vi: string | null;
  icon_key: string | null;
}

export interface PackingItemRow {
  icon_key: string | null;
  label_ko: string;
  label_en: string;
  label_vi: string;
}

export interface TipRow {
  id: number;
  order_no: number;
  text_ko: string;
  text_en: string;
  text_vi: string;
}

export interface EssentialAppRow {
  id: number;
  name: string;
  subtitle: string | null;
  icon_url: string | null;
  external_url: string | null;
}

// ---------------------------------------------------------------------------
// Find-all options
// ---------------------------------------------------------------------------

export interface FindAllOptions {
  search?: string;
  category?: string;
  page: number;
  limit: number;
  sortBy: string;
  sortDir: 'ASC' | 'DESC';
}

// ---------------------------------------------------------------------------
// Shared badge aggregation fragment
// Produces a JSON array of {label_ko, label_en, label_vi, badge_type} objects.
// The FILTER ensures no null items when the LEFT JOIN finds no matching row.
// ---------------------------------------------------------------------------
const BADGE_AGG = `
  COALESCE(
    json_agg(
      json_build_object(
        'label_ko', b.label_ko,
        'label_en', b.label_en,
        'label_vi', b.label_vi,
        'badge_type', b.badge_type
      ) ORDER BY b.sort_order
    ) FILTER (WHERE b.id IS NOT NULL),
    '[]'::json
  ) AS badges
`.trim();

// Safe sort column map — user input is validated against DTO @IsIn, then
// mapped here to a fully qualified column expression (never interpolated raw).
const SORT_COL_MAP: Record<string, string> = {
  sort_order: 'd.sort_order',
  rating: 'd.rating',
  review_count: 'd.review_count',
};

/**
 * Raw SQL repository for the destination domain.
 *
 * Repository contract:
 * - All queries use $N parameterized placeholders — no string value interpolation.
 * - Sort column names come from a whitelist map (SORT_COL_MAP), never from user input.
 * - Rows are returned in snake_case; the service layer maps them to camelCase.
 * - json_agg is used to avoid N+1 queries for badges and tags.
 *
 * Caching note: these methods are stateless and purely read-only, making them
 * trivial to cache at the service layer (Redis) in a future iteration without
 * changing the repository interface.
 */
@Injectable()
export class DestinationsRepository {
  constructor(private readonly db: DatabaseService) {}

  // -------------------------------------------------------------------------
  // Featured destinations — home screen top destinations
  // -------------------------------------------------------------------------

  async findFeatured(): Promise<DestinationCardRow[]> {
    return this.db.query<DestinationCardRow>(
      `SELECT
         d.id, d.slug,
         d.name_ko, d.name_en, d.name_vi,
         d.region_label_ko, d.region_label_en, d.region_label_vi,
         d.country_label_ko, d.country_label_en, d.country_label_vi,
         d.hero_image_url, d.rating, d.review_count, d.match_percent,
         ${BADGE_AGG}
       FROM destinations d
       LEFT JOIN destination_badges b ON b.destination_id = d.id
       WHERE d.is_featured = true AND d.is_active = true
       GROUP BY d.id
       ORDER BY d.sort_order ASC`,
    );
  }

  // -------------------------------------------------------------------------
  // Paginated list — explore screen
  // -------------------------------------------------------------------------

  async findAll(
    opts: FindAllOptions,
  ): Promise<{ rows: DestinationCardRow[]; total: number }> {
    const conditions: string[] = ['d.is_active = true'];
    const params: unknown[] = [];
    let idx = 1;

    if (opts.search) {
      // $idx referenced three times — valid in PostgreSQL, pushed once
      conditions.push(
        `(d.name_ko ILIKE $${idx} OR d.name_en ILIKE $${idx} OR d.name_vi ILIKE $${idx})`,
      );
      params.push(`%${opts.search}%`);
      idx++;
    }

    if (opts.category) {
      conditions.push(
        `EXISTS (
           SELECT 1 FROM destination_badges cb
           WHERE cb.destination_id = d.id
             AND cb.badge_type = 'category'
             AND (cb.label_ko = $${idx} OR cb.label_en = $${idx} OR cb.label_vi = $${idx})
         )`,
      );
      params.push(opts.category);
      idx++;
    }

    const where = conditions.join(' AND ');

    // Count uses only the destinations table — no badge JOIN needed since
    // category filter is an EXISTS subquery.
    const countRow = await this.db.queryOne<{ count: number }>(
      `SELECT COUNT(*) AS count FROM destinations d WHERE ${where}`,
      params,
    );

    const sortCol = SORT_COL_MAP[opts.sortBy] ?? 'd.sort_order';
    const orderClause = `ORDER BY ${sortCol} ${opts.sortDir}`;

    const rows = await this.db.query<DestinationCardRow>(
      `SELECT
         d.id, d.slug,
         d.name_ko, d.name_en, d.name_vi,
         d.region_label_ko, d.region_label_en, d.region_label_vi,
         d.hero_image_url, d.rating, d.review_count, d.match_percent,
         ${BADGE_AGG}
       FROM destinations d
       LEFT JOIN destination_badges b ON b.destination_id = d.id
       WHERE ${where}
       GROUP BY d.id
       ${orderClause}
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, opts.limit, (opts.page - 1) * opts.limit],
    );

    return { rows, total: countRow?.count ?? 0 };
  }

  // -------------------------------------------------------------------------
  // Detail by slug — overview tab
  // -------------------------------------------------------------------------

  async findBySlug(slug: string): Promise<DestinationDetailRow | null> {
    return this.db.queryOne<DestinationDetailRow>(
      `SELECT
         id, slug,
         name_ko, name_en, name_vi,
         region_label_ko, region_label_en, region_label_vi,
         country_label_ko, country_label_en, country_label_vi,
         hero_image_url, rating, review_count, visit_count, match_percent,
         short_description_ko, short_description_en, short_description_vi,
         overview_description_ko, overview_description_en, overview_description_vi,
         best_season_label_ko, best_season_label_en, best_season_label_vi,
         average_temperature_c,
         language_label_ko, language_label_en, language_label_vi,
         currency_label_ko, currency_label_en, currency_label_vi
       FROM destinations
       WHERE slug = $1 AND is_active = true`,
      [slug],
    );
  }

  async findById(id: number): Promise<{ id: number; slug: string } | null> {
    return this.db.queryOne<{ id: number; slug: string }>(
      `SELECT id, slug FROM destinations WHERE id = $1 AND is_active = true`,
      [id],
    );
  }

  /** Minimal projection used by the AI planner to build PlannerInput. */
  async findForPlanner(id: number): Promise<{
    id: number;
    slug: string;
    code: string | null;
    name_ko: string;
    name_en: string;
    name_vi: string;
    hero_image_url: string | null;
  } | null> {
    return this.db.queryOne(
      `SELECT id, slug, code, name_ko, name_en, name_vi, hero_image_url
       FROM destinations
       WHERE id = $1 AND is_active = true`,
      [id],
    );
  }

  async findBadgesByDestinationId(destinationId: number): Promise<LocalizedBadge[]> {
    return this.db.query<LocalizedBadge>(
      `SELECT label_ko, label_en, label_vi, badge_type
       FROM destination_badges
       WHERE destination_id = $1
       ORDER BY sort_order ASC`,
      [destinationId],
    );
  }

  async findFeatureTagsByDestinationId(destinationId: number): Promise<LocalizedTag[]> {
    return this.db.query<LocalizedTag>(
      `SELECT label_ko, label_en, label_vi
       FROM destination_feature_tags
       WHERE destination_id = $1
       ORDER BY sort_order ASC`,
      [destinationId],
    );
  }

  // -------------------------------------------------------------------------
  // Places tab
  // -------------------------------------------------------------------------

  async findPlacesByDestinationId(destinationId: number): Promise<PlaceRow[]> {
    return this.db.query<PlaceRow>(
      `SELECT
         p.id,
         p.name_ko, p.name_en, p.name_vi,
         p.category_label_ko, p.category_label_en, p.category_label_vi,
         p.short_description_ko, p.short_description_en, p.short_description_vi,
         p.cover_image_url, p.rating, p.review_count,
         p.visit_duration_label_ko, p.visit_duration_label_en, p.visit_duration_label_vi,
         p.ticket_price_amount, p.ticket_price_currency,
         COALESCE(
           json_agg(
             json_build_object(
               'label_ko', t.label_ko,
               'label_en', t.label_en,
               'label_vi', t.label_vi
             ) ORDER BY t.sort_order
           ) FILTER (WHERE t.id IS NOT NULL),
           '[]'::json
         ) AS tags
       FROM places p
       LEFT JOIN place_tags t ON t.place_id = p.id
       WHERE p.destination_id = $1 AND p.is_active = true
       GROUP BY p.id
       ORDER BY p.sort_order ASC`,
      [destinationId],
    );
  }

  // -------------------------------------------------------------------------
  // Hotels tab (lightweight card view — full hotel detail in hotels module)
  // -------------------------------------------------------------------------

  async findHotelsByDestinationId(destinationId: number): Promise<HotelCardRow[]> {
    return this.db.query<HotelCardRow>(
      `SELECT
         h.id, h.slug, h.name,
         h.cover_image_url, h.rating, h.review_count,
         h.nightly_from_price, h.currency,
         COALESCE(
           json_agg(
             json_build_object(
               'label_ko', b.label_ko,
               'label_en', b.label_en,
               'label_vi', b.label_vi,
               'badge_type', b.badge_type
             ) ORDER BY b.sort_order
           ) FILTER (WHERE b.id IS NOT NULL),
           '[]'::json
         ) AS badges
       FROM hotels h
       LEFT JOIN hotel_badges b ON b.hotel_id = h.id
       WHERE h.destination_id = $1 AND h.is_active = true
       GROUP BY h.id
       ORDER BY h.is_recommended DESC, h.sort_order ASC`,
      [destinationId],
    );
  }

  // -------------------------------------------------------------------------
  // Weather tab (static data — live weather comes from WeatherAPI integration)
  // -------------------------------------------------------------------------

  async findSeasonsByDestinationId(destinationId: number): Promise<SeasonRow[]> {
    return this.db.query<SeasonRow>(
      `SELECT season_key,
              label_ko, label_en, label_vi,
              months_label_ko, months_label_en, months_label_vi,
              note_ko, note_en, note_vi,
              icon_key
       FROM destination_seasons
       WHERE destination_id = $1
       ORDER BY sort_order ASC`,
      [destinationId],
    );
  }

  async findPackingItemsByDestinationId(destinationId: number): Promise<PackingItemRow[]> {
    return this.db.query<PackingItemRow>(
      `SELECT icon_key, label_ko, label_en, label_vi
       FROM destination_packing_items
       WHERE destination_id = $1
       ORDER BY sort_order ASC`,
      [destinationId],
    );
  }

  // -------------------------------------------------------------------------
  // Travel tips tab
  // -------------------------------------------------------------------------

  async findTipsByDestinationId(destinationId: number): Promise<TipRow[]> {
    return this.db.query<TipRow>(
      `SELECT id, order_no, text_ko, text_en, text_vi
       FROM destination_tips
       WHERE destination_id = $1 AND is_active = true
       ORDER BY order_no ASC`,
      [destinationId],
    );
  }

  async findEssentialAppsByDestinationId(destinationId: number): Promise<EssentialAppRow[]> {
    return this.db.query<EssentialAppRow>(
      `SELECT id, name, subtitle, icon_url, external_url
       FROM destination_essential_apps
       WHERE destination_id = $1 AND is_active = true
       ORDER BY sort_order ASC`,
      [destinationId],
    );
  }

  // -------------------------------------------------------------------------
  // Favorites lookup — resolves isFavorite for a set of destination IDs
  // -------------------------------------------------------------------------

  async findFavoriteDestinationIds(
    userId: number,
    destinationIds: number[],
  ): Promise<Set<number>> {
    if (destinationIds.length === 0) return new Set();
    const rows = await this.db.query<{ target_id: number }>(
      `SELECT target_id
       FROM favorites
       WHERE user_id = $1
         AND target_type = 'destination'
         AND target_id = ANY($2::bigint[])`,
      [userId, destinationIds],
    );
    return new Set(rows.map((r) => r.target_id));
  }
}
