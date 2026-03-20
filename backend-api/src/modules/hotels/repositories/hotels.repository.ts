import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';

// ---------------------------------------------------------------------------
// Row types
// ---------------------------------------------------------------------------

export interface HotelCardRow {
  id: number;
  slug: string;
  name: string;
  destination_label_ko: string | null;
  destination_label_en: string | null;
  destination_label_vi: string | null;
  hotel_type_label_ko: string | null;
  hotel_type_label_en: string | null;
  hotel_type_label_vi: string | null;
  star_rating: number;
  rating: number;
  review_count: number;
  cover_image_url: string | null;
  nightly_from_price: number | null;
  currency: string;
  is_recommended: boolean;
}

export interface HotelDetailRow extends HotelCardRow {
  address_full_ko: string | null;
  address_full_en: string | null;
  address_full_vi: string | null;
  short_description_ko: string | null;
  short_description_en: string | null;
  short_description_vi: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  cancellation_policy_label_ko: string | null;
  cancellation_policy_label_en: string | null;
  cancellation_policy_label_vi: string | null;
  pets_policy_label_ko: string | null;
  pets_policy_label_en: string | null;
  pets_policy_label_vi: string | null;
  smoking_policy_label_ko: string | null;
  smoking_policy_label_en: string | null;
  smoking_policy_label_vi: string | null;
  policy_notice_ko: string | null;
  policy_notice_en: string | null;
  policy_notice_vi: string | null;
}

export interface HotelBadgeRow {
  hotel_id: number;
  label_ko: string;
  label_en: string;
  label_vi: string;
  badge_type: string | null;
  sort_order: number;
}

export interface HotelAmenityRow {
  hotel_id: number;
  amenity_key: string;
  label_ko: string;
  label_en: string;
  label_vi: string;
  icon_key: string | null;
  sort_order: number;
}

export interface RoomTypeRow {
  id: number;
  hotel_id: number;
  name_ko: string;
  name_en: string;
  name_vi: string;
  bed_label_ko: string | null;
  bed_label_en: string | null;
  bed_label_vi: string | null;
  room_size_m2: number | null;
  max_guests: number | null;
  cover_image_url: string | null;
  nightly_price: number;
  currency: string;
  is_default_selected: boolean;
}

export interface RoomBadgeRow {
  room_type_id: number;
  label_ko: string;
  label_en: string;
  label_vi: string;
  badge_group: string | null;
  sort_order: number;
}

export interface HotelReviewRow {
  id: number;
  hotel_id: number;
  reviewer_name: string;
  reviewer_initial: string | null;
  rating: number;
  review_date: string;
  content_ko: string | null;
  content_en: string | null;
  content_vi: string | null;
}

// ---------------------------------------------------------------------------
// Query options
// ---------------------------------------------------------------------------

export interface HotelListOptions {
  destinationId?: number;
  search?: string;
  page: number;
  limit: number;
  sortBy: string;
  sortDir: 'ASC' | 'DESC';
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

@Injectable()
export class HotelsRepository {
  constructor(private readonly db: DatabaseService) {}

  // -------------------------------------------------------------------------
  // Recommended
  // -------------------------------------------------------------------------

  async findRecommended(): Promise<HotelCardRow[]> {
    return this.db.query<HotelCardRow>(
      `SELECT
         id, slug, name,
         destination_label_ko, destination_label_en, destination_label_vi,
         hotel_type_label_ko, hotel_type_label_en, hotel_type_label_vi,
         star_rating, rating, review_count,
         cover_image_url, nightly_from_price, currency, is_recommended
       FROM hotels
       WHERE is_recommended = true AND is_active = true
       ORDER BY sort_order ASC`,
    );
  }

  // -------------------------------------------------------------------------
  // Paginated list
  // -------------------------------------------------------------------------

  async findAll(
    opts: HotelListOptions,
  ): Promise<{ rows: HotelCardRow[]; total: number }> {
    const conditions: string[] = ['h.is_active = true'];
    const params: unknown[] = [];
    let idx = 1;

    if (opts.destinationId != null) {
      conditions.push(`h.destination_id = $${idx++}`);
      params.push(opts.destinationId);
    }

    if (opts.search) {
      conditions.push(`h.name ILIKE $${idx++}`);
      params.push(`%${opts.search}%`);
    }

    const where = conditions.join(' AND ');

    const allowedSort: Record<string, string> = {
      sort_order: 'h.sort_order',
      rating: 'h.rating',
      nightly_from_price: 'h.nightly_from_price',
      review_count: 'h.review_count',
    };
    const orderCol = allowedSort[opts.sortBy] ?? 'h.sort_order';
    const dir = opts.sortDir === 'DESC' ? 'DESC' : 'ASC';

    const offset = (opts.page - 1) * opts.limit;

    const [rows, countResult] = await Promise.all([
      this.db.query<HotelCardRow>(
        `SELECT
           h.id, h.slug, h.name,
           h.destination_label_ko, h.destination_label_en, h.destination_label_vi,
           h.hotel_type_label_ko, h.hotel_type_label_en, h.hotel_type_label_vi,
           h.star_rating, h.rating, h.review_count,
           h.cover_image_url, h.nightly_from_price, h.currency, h.is_recommended
         FROM hotels h
         WHERE ${where}
         ORDER BY ${orderCol} ${dir}
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, opts.limit, offset],
      ),
      this.db.queryOne<{ count: number }>(
        `SELECT COUNT(*) AS count FROM hotels h WHERE ${where}`,
        params,
      ),
    ]);

    return { rows, total: countResult?.count ?? 0 };
  }

  // -------------------------------------------------------------------------
  // Single hotel — card projection (for detail header)
  // -------------------------------------------------------------------------

  async findDetailById(id: number): Promise<HotelDetailRow | null> {
    return this.db.queryOne<HotelDetailRow>(
      `SELECT
         id, slug, name,
         destination_label_ko, destination_label_en, destination_label_vi,
         address_full_ko, address_full_en, address_full_vi,
         hotel_type_label_ko, hotel_type_label_en, hotel_type_label_vi,
         star_rating, rating, review_count,
         cover_image_url, nightly_from_price, currency,
         short_description_ko, short_description_en, short_description_vi,
         check_in_time, check_out_time,
         cancellation_policy_label_ko, cancellation_policy_label_en, cancellation_policy_label_vi,
         pets_policy_label_ko, pets_policy_label_en, pets_policy_label_vi,
         smoking_policy_label_ko, smoking_policy_label_en, smoking_policy_label_vi,
         policy_notice_ko, policy_notice_en, policy_notice_vi,
         is_recommended
       FROM hotels
       WHERE id = $1 AND is_active = true`,
      [id],
    );
  }

  async findDetailBySlug(slug: string): Promise<HotelDetailRow | null> {
    return this.db.queryOne<HotelDetailRow>(
      `SELECT
         id, slug, name,
         destination_label_ko, destination_label_en, destination_label_vi,
         address_full_ko, address_full_en, address_full_vi,
         hotel_type_label_ko, hotel_type_label_en, hotel_type_label_vi,
         star_rating, rating, review_count,
         cover_image_url, nightly_from_price, currency,
         short_description_ko, short_description_en, short_description_vi,
         check_in_time, check_out_time,
         cancellation_policy_label_ko, cancellation_policy_label_en, cancellation_policy_label_vi,
         pets_policy_label_ko, pets_policy_label_en, pets_policy_label_vi,
         smoking_policy_label_ko, smoking_policy_label_en, smoking_policy_label_vi,
         policy_notice_ko, policy_notice_en, policy_notice_vi,
         is_recommended
       FROM hotels
       WHERE slug = $1 AND is_active = true`,
      [slug],
    );
  }

  // -------------------------------------------------------------------------
  // Badges (batch)
  // -------------------------------------------------------------------------

  async findBadgesByHotelIds(hotelIds: number[]): Promise<HotelBadgeRow[]> {
    if (hotelIds.length === 0) return [];
    return this.db.query<HotelBadgeRow>(
      `SELECT hotel_id, label_ko, label_en, label_vi, badge_type, sort_order
       FROM hotel_badges
       WHERE hotel_id = ANY($1::bigint[])
       ORDER BY hotel_id, sort_order`,
      [hotelIds],
    );
  }

  async findBadgesByHotelId(hotelId: number): Promise<HotelBadgeRow[]> {
    return this.db.query<HotelBadgeRow>(
      `SELECT hotel_id, label_ko, label_en, label_vi, badge_type, sort_order
       FROM hotel_badges
       WHERE hotel_id = $1
       ORDER BY sort_order`,
      [hotelId],
    );
  }

  // -------------------------------------------------------------------------
  // Amenities
  // -------------------------------------------------------------------------

  async findAmenitiesByHotelId(hotelId: number): Promise<HotelAmenityRow[]> {
    return this.db.query<HotelAmenityRow>(
      `SELECT hotel_id, amenity_key, label_ko, label_en, label_vi, icon_key, sort_order
       FROM hotel_amenities
       WHERE hotel_id = $1
       ORDER BY sort_order`,
      [hotelId],
    );
  }

  // -------------------------------------------------------------------------
  // Room types + badges
  // -------------------------------------------------------------------------

  async findRoomsByHotelId(hotelId: number): Promise<RoomTypeRow[]> {
    return this.db.query<RoomTypeRow>(
      `SELECT id, hotel_id, name_ko, name_en, name_vi,
              bed_label_ko, bed_label_en, bed_label_vi,
              room_size_m2, max_guests, cover_image_url,
              nightly_price, currency, is_default_selected
       FROM hotel_room_types
       WHERE hotel_id = $1 AND is_active = true
       ORDER BY sort_order`,
      [hotelId],
    );
  }

  async findRoomBadgesByRoomIds(roomIds: number[]): Promise<RoomBadgeRow[]> {
    if (roomIds.length === 0) return [];
    return this.db.query<RoomBadgeRow>(
      `SELECT room_type_id, label_ko, label_en, label_vi, badge_group, sort_order
       FROM hotel_room_badges
       WHERE room_type_id = ANY($1::bigint[])
       ORDER BY room_type_id, badge_group, sort_order`,
      [roomIds],
    );
  }

  async findRoomById(roomId: number, hotelId: number): Promise<RoomTypeRow | null> {
    return this.db.queryOne<RoomTypeRow>(
      `SELECT id, hotel_id, name_ko, name_en, name_vi,
              bed_label_ko, bed_label_en, bed_label_vi,
              room_size_m2, max_guests, cover_image_url,
              nightly_price, currency, is_default_selected
       FROM hotel_room_types
       WHERE id = $1 AND hotel_id = $2 AND is_active = true`,
      [roomId, hotelId],
    );
  }

  // -------------------------------------------------------------------------
  // Reviews
  // -------------------------------------------------------------------------

  async findReviewsByHotelId(hotelId: number): Promise<HotelReviewRow[]> {
    return this.db.query<HotelReviewRow>(
      `SELECT id, hotel_id, reviewer_name, reviewer_initial,
              rating, review_date, content_ko, content_en, content_vi
       FROM hotel_reviews
       WHERE hotel_id = $1 AND is_active = true
       ORDER BY review_date DESC`,
      [hotelId],
    );
  }

  // -------------------------------------------------------------------------
  // Favorites lookup
  // -------------------------------------------------------------------------

  async findFavoriteHotelIds(
    userId: number,
    hotelIds: number[],
  ): Promise<Set<number>> {
    if (hotelIds.length === 0) return new Set();
    const rows = await this.db.query<{ target_id: number }>(
      `SELECT target_id
       FROM favorites
       WHERE user_id = $1
         AND target_type = 'hotel'
         AND target_id = ANY($2::bigint[])`,
      [userId, hotelIds],
    );
    return new Set(rows.map((r) => r.target_id));
  }
}
