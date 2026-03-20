import { Injectable, NotFoundException } from '@nestjs/common';
import {
  HotelAmenityRow,
  HotelBadgeRow,
  HotelCardRow,
  HotelDetailRow,
  HotelListOptions,
  HotelsRepository,
  HotelReviewRow,
  RoomBadgeRow,
  RoomTypeRow,
} from './repositories/hotels.repository';
import { HotelQueryDto } from './dto/hotel-query.dto';

// ---------------------------------------------------------------------------
// Language helpers
// ---------------------------------------------------------------------------

type Lang = 'ko' | 'en' | 'vi';
type LangRow = Record<string, unknown>;

function resolveLang(lang?: string): Lang {
  if (lang === 'en' || lang === 'vi') return lang;
  return 'ko';
}

function pickLoc(row: LangRow, field: string, lang: Lang): string | null {
  const localized = row[`${field}_${lang}`];
  if (typeof localized === 'string' && localized.length > 0) return localized;
  const korean = row[`${field}_ko`];
  return typeof korean === 'string' && korean.length > 0 ? korean : null;
}

// ---------------------------------------------------------------------------
// Response shape interfaces
// ---------------------------------------------------------------------------

export interface HotelListItem {
  id: number;
  slug: string;
  name: string;
  destinationLabel: string | null;
  hotelTypeLabel: string | null;
  starRating: number;
  rating: number;
  reviewCount: number;
  nightlyPrice: number | null;
  currency: string;
  coverImage: string | null;
  amenityBadges: string[];
  editorBadge: string | null;
  categoryBadge: string | null;
  isFavorite: boolean;
}

export interface HotelDetailResponse {
  id: number;
  slug: string;
  name: string;
  destinationLabel: string | null;
  addressFull: string | null;
  starRating: number;
  rating: number;
  reviewCount: number;
  coverImage: string | null;
  badges: string[];
  shortDescription: string | null;
  nightlyFromPrice: number | null;
  currency: string;
}

export interface RoomItem {
  id: number;
  name: string;
  bedLabel: string | null;
  roomSizeM2: number | null;
  maxGuests: number | null;
  coverImage: string | null;
  featureBadges: string[];
  mealBadges: string[];
  nightlyPrice: number;
  currency: string;
  isDefaultSelected: boolean;
}

export interface AmenitiesResponse {
  amenities: Array<{ key: string; label: string; iconKey: string | null }>;
  description: string | null;
}

export interface PoliciesResponse {
  checkInTime: string | null;
  checkOutTime: string | null;
  cancellationPolicyLabel: string | null;
  petsPolicyLabel: string | null;
  smokingPolicyLabel: string | null;
  noticeText: string | null;
}

export interface ReviewsResponse {
  summary: { rating: number; reviewCount: number };
  items: Array<{
    id: number;
    reviewerName: string;
    reviewerInitial: string | null;
    rating: number;
    reviewDate: string;
    content: string | null;
  }>;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class HotelsService {
  constructor(private readonly repo: HotelsRepository) {}

  // -------------------------------------------------------------------------
  // Recommended list
  // -------------------------------------------------------------------------

  async getRecommended(opts: {
    lang?: string;
    userId?: number;
  }): Promise<{ items: HotelListItem[] }> {
    const lang = resolveLang(opts.lang);
    const rows = await this.repo.findRecommended();

    const [badges, amenities, favoriteIds] = await Promise.all([
      this.repo.findBadgesByHotelIds(rows.map((r) => r.id)),
      this.fetchAmenitiesBatch(rows.map((r) => r.id)),
      opts.userId != null
        ? this.repo.findFavoriteHotelIds(opts.userId, rows.map((r) => r.id))
        : Promise.resolve(new Set<number>()),
    ]);

    return {
      items: rows.map((r) =>
        this.toListItem(r, lang, badges, amenities, favoriteIds),
      ),
    };
  }

  // -------------------------------------------------------------------------
  // Paginated list
  // -------------------------------------------------------------------------

  async getList(
    query: HotelQueryDto,
    userId?: number,
  ): Promise<{
    items: HotelListItem[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  }> {
    const lang = resolveLang(query.lang);
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 20));
    const sortDir: 'ASC' | 'DESC' =
      query.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const opts: HotelListOptions = {
      destinationId: query.destinationId,
      search: query.search,
      page,
      limit,
      sortBy: query.sortBy ?? 'sort_order',
      sortDir,
    };

    const { rows, total } = await this.repo.findAll(opts);

    const [badges, amenities, favoriteIds] = await Promise.all([
      this.repo.findBadgesByHotelIds(rows.map((r) => r.id)),
      this.fetchAmenitiesBatch(rows.map((r) => r.id)),
      userId != null
        ? this.repo.findFavoriteHotelIds(userId, rows.map((r) => r.id))
        : Promise.resolve(new Set<number>()),
    ]);

    return {
      items: rows.map((r) =>
        this.toListItem(r, lang, badges, amenities, favoriteIds),
      ),
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // -------------------------------------------------------------------------
  // Hotel detail
  // -------------------------------------------------------------------------

  async getDetail(
    idOrSlug: string,
    opts: { lang?: string; userId?: number },
  ): Promise<HotelDetailResponse> {
    const lang = resolveLang(opts.lang);

    const numericId = Number(idOrSlug);
    const hotel = Number.isNaN(numericId)
      ? await this.repo.findDetailBySlug(idOrSlug)
      : await this.repo.findDetailById(numericId);

    if (!hotel) throw new NotFoundException('Hotel not found');

    const [badges] = await Promise.all([
      this.repo.findBadgesByHotelId(hotel.id),
    ]);

    return this.toDetailResponse(hotel, badges, lang);
  }

  // -------------------------------------------------------------------------
  // Rooms tab
  // -------------------------------------------------------------------------

  async getRooms(
    hotelId: number,
    opts: { lang?: string },
  ): Promise<{ rooms: RoomItem[] }> {
    await this.requireHotelById(hotelId);
    const lang = resolveLang(opts.lang);

    const rooms = await this.repo.findRoomsByHotelId(hotelId);
    if (rooms.length === 0) return { rooms: [] };

    const badges = await this.repo.findRoomBadgesByRoomIds(
      rooms.map((r) => r.id),
    );

    return { rooms: rooms.map((r) => this.toRoomItem(r, badges, lang)) };
  }

  // -------------------------------------------------------------------------
  // Amenities tab
  // -------------------------------------------------------------------------

  async getAmenities(
    hotelId: number,
    opts: { lang?: string },
  ): Promise<AmenitiesResponse> {
    const hotel = await this.requireHotelById(hotelId);
    const lang = resolveLang(opts.lang);

    const rows = await this.repo.findAmenitiesByHotelId(hotelId);

    return {
      amenities: rows.map((a) => ({
        key: a.amenity_key,
        label: pickLoc(a as unknown as LangRow, 'label', lang) ?? a.label_ko,
        iconKey: a.icon_key,
      })),
      description: null,
    };
  }

  // -------------------------------------------------------------------------
  // Policies tab
  // -------------------------------------------------------------------------

  async getPolicies(
    hotelId: number,
    opts: { lang?: string },
  ): Promise<PoliciesResponse> {
    const hotel = await this.repo.findDetailById(hotelId);
    if (!hotel) throw new NotFoundException('Hotel not found');

    const lang = resolveLang(opts.lang);
    const row = hotel as unknown as LangRow;

    return {
      checkInTime: hotel.check_in_time,
      checkOutTime: hotel.check_out_time,
      cancellationPolicyLabel: pickLoc(row, 'cancellation_policy_label', lang),
      petsPolicyLabel: pickLoc(row, 'pets_policy_label', lang),
      smokingPolicyLabel: pickLoc(row, 'smoking_policy_label', lang),
      noticeText: pickLoc(row, 'policy_notice', lang),
    };
  }

  // -------------------------------------------------------------------------
  // Reviews tab
  // -------------------------------------------------------------------------

  async getReviews(
    hotelId: number,
    opts: { lang?: string },
  ): Promise<ReviewsResponse> {
    const hotel = await this.requireHotelById(hotelId);
    const lang = resolveLang(opts.lang);

    const rows = await this.repo.findReviewsByHotelId(hotelId);

    return {
      summary: {
        rating: hotel.rating,
        reviewCount: hotel.review_count,
      },
      items: rows.map((r) => this.toReviewItem(r, lang)),
    };
  }

  // -------------------------------------------------------------------------
  // Private helpers — existence checks
  // -------------------------------------------------------------------------

  private async requireHotelById(id: number): Promise<HotelDetailRow> {
    const hotel = await this.repo.findDetailById(id);
    if (!hotel) throw new NotFoundException('Hotel not found');
    return hotel;
  }

  /**
   * Batch-fetches amenities for multiple hotels and returns them keyed by hotel_id.
   * Falls back to individual queries if the repository doesn't expose a batch method.
   */
  private async fetchAmenitiesBatch(
    hotelIds: number[],
  ): Promise<Map<number, HotelAmenityRow[]>> {
    if (hotelIds.length === 0) return new Map();
    // Individual fetches in parallel — repository wraps per-hotel
    const results = await Promise.all(
      hotelIds.map((id) =>
        this.repo.findAmenitiesByHotelId(id).then((rows) => ({ id, rows })),
      ),
    );
    const map = new Map<number, HotelAmenityRow[]>();
    for (const { id, rows } of results) map.set(id, rows);
    return map;
  }

  // -------------------------------------------------------------------------
  // Private mappers — row → response shape
  // -------------------------------------------------------------------------

  private toListItem(
    r: HotelCardRow,
    lang: Lang,
    allBadges: HotelBadgeRow[],
    amenitiesMap: Map<number, HotelAmenityRow[]>,
    favoriteIds: Set<number>,
  ): HotelListItem {
    const row = r as unknown as LangRow;
    const hotelBadges = allBadges.filter((b) => b.hotel_id === r.id);

    const editorBadge =
      hotelBadges.find((b) => b.badge_type === 'editor')
        ? this.pickBadgeLabel(hotelBadges.find((b) => b.badge_type === 'editor')!, lang)
        : null;

    const categoryBadge =
      hotelBadges.find((b) => b.badge_type === 'category')
        ? this.pickBadgeLabel(hotelBadges.find((b) => b.badge_type === 'category')!, lang)
        : null;

    const amenityRows = amenitiesMap.get(r.id) ?? [];
    const amenityBadges = amenityRows
      .slice(0, 3)
      .map((a) => pickLoc(a as unknown as LangRow, 'label', lang) ?? a.label_ko);

    return {
      id: r.id,
      slug: r.slug,
      name: pickLoc(row, 'name', lang) ?? (r as any).name,
      destinationLabel: pickLoc(row, 'destination_label', lang),
      hotelTypeLabel: pickLoc(row, 'hotel_type_label', lang),
      starRating: r.star_rating,
      rating: r.rating,
      reviewCount: r.review_count,
      nightlyPrice: r.nightly_from_price,
      currency: r.currency,
      coverImage: r.cover_image_url,
      amenityBadges,
      editorBadge,
      categoryBadge,
      isFavorite: favoriteIds.has(r.id),
    };
  }

  private toDetailResponse(
    r: HotelDetailRow,
    badges: HotelBadgeRow[],
    lang: Lang,
  ): HotelDetailResponse {
    const row = r as unknown as LangRow;
    return {
      id: r.id,
      slug: r.slug,
      name: pickLoc(row, 'name', lang) ?? (r as any).name,
      destinationLabel: pickLoc(row, 'destination_label', lang),
      addressFull: pickLoc(row, 'address_full', lang),
      starRating: r.star_rating,
      rating: r.rating,
      reviewCount: r.review_count,
      coverImage: r.cover_image_url,
      badges: badges.map((b) => this.pickBadgeLabel(b, lang)),
      shortDescription: pickLoc(row, 'short_description', lang),
      nightlyFromPrice: r.nightly_from_price,
      currency: r.currency,
    };
  }

  private toRoomItem(
    r: RoomTypeRow,
    allBadges: RoomBadgeRow[],
    lang: Lang,
  ): RoomItem {
    const row = r as unknown as LangRow;
    const roomBadges = allBadges.filter((b) => b.room_type_id === r.id);

    const featureBadges = roomBadges
      .filter((b) => b.badge_group !== 'meal')
      .map((b) => pickLoc(b as unknown as LangRow, 'label', lang) ?? b.label_ko);

    const mealBadges = roomBadges
      .filter((b) => b.badge_group === 'meal')
      .map((b) => pickLoc(b as unknown as LangRow, 'label', lang) ?? b.label_ko);

    return {
      id: r.id,
      name: pickLoc(row, 'name', lang) ?? r.name_ko,
      bedLabel: pickLoc(row, 'bed_label', lang),
      roomSizeM2: r.room_size_m2,
      maxGuests: r.max_guests,
      coverImage: r.cover_image_url,
      featureBadges,
      mealBadges,
      nightlyPrice: r.nightly_price,
      currency: r.currency,
      isDefaultSelected: r.is_default_selected,
    };
  }

  private toReviewItem(
    r: HotelReviewRow,
    lang: Lang,
  ): ReviewsResponse['items'][number] {
    return {
      id: r.id,
      reviewerName: r.reviewer_name,
      reviewerInitial: r.reviewer_initial,
      rating: r.rating,
      reviewDate: r.review_date,
      content: pickLoc(r as unknown as LangRow, 'content', lang),
    };
  }

  private pickBadgeLabel(
    badge: HotelBadgeRow,
    lang: Lang,
  ): string {
    const row = badge as unknown as LangRow;
    const v = row[`label_${lang}`];
    if (typeof v === 'string' && v.length > 0) return v;
    return badge.label_ko;
  }
}
