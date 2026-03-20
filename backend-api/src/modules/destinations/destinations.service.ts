import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  IWeatherApiService,
  WEATHER_API_SERVICE,
  type CurrentWeather,
} from '../../integrations/weatherapi/interfaces/weather.interface';
import { DestinationsRepository } from './repositories/destinations.repository';
import type {
  DestinationCardRow,
  DestinationDetailRow,
  EssentialAppRow,
  HotelCardRow,
  LocalizedBadge,
  LocalizedTag,
  PackingItemRow,
  PlaceRow,
  SeasonRow,
  TipRow,
} from './repositories/destinations.repository';

// ---------------------------------------------------------------------------
// Language helpers
// ---------------------------------------------------------------------------

type Lang = 'ko' | 'en' | 'vi';
type LangRow = Record<string, unknown>;

function resolveLang(lang?: string): Lang {
  if (lang === 'en' || lang === 'vi') return lang;
  return 'ko';
}

/**
 * Picks the localized variant of `field` for the requested language.
 * Falls back to Korean if the localized value is null/empty.
 */
function pickLoc(row: LangRow, field: string, lang: Lang): string | null {
  const localized = row[`${field}_${lang}`];
  if (typeof localized === 'string' && localized.length > 0) return localized;
  const korean = row[`${field}_ko`];
  return typeof korean === 'string' && korean.length > 0 ? korean : null;
}

/** Picks the badge label for the requested language, falls back to Korean. */
function pickBadgeLabel(badge: LocalizedBadge | LocalizedTag, lang: Lang): string {
  const row = badge as unknown as LangRow;
  const v = row[`label_${lang}`];
  if (typeof v === 'string' && v.length > 0) return v;
  return badge.label_ko;
}

// ---------------------------------------------------------------------------
// Response shape interfaces (camelCase, API-ready)
// ---------------------------------------------------------------------------

export interface FeaturedDestinationItem {
  id: number;
  slug: string;
  name: string;
  regionLabel: string | null;
  countryLabel: string | null;
  heroImage: string | null;
  rating: number;
  reviewCount: number;
  matchPercent: number | null;
  isFavorite: boolean;
  tags: string[];
}

export interface DestinationListItem {
  id: number;
  slug: string;
  name: string;
  regionLabel: string | null;
  coverImage: string | null;
  rating: number;
  reviewCount: number;
  matchPercent: number | null;
  isFavorite: boolean;
  categoryLabels: string[];
}

export interface DestinationDetail {
  id: number;
  slug: string;
  name: string;
  regionLabel: string | null;
  countryLabel: string | null;
  heroImage: string | null;
  rating: number;
  reviewCount: number;
  visitCount: number;
  matchPercent: number | null;
  shortDescription: string | null;
  overviewDescription: string | null;
  bestSeasonLabel: string | null;
  averageTemperatureC: number | null;
  languageLabel: string | null;
  currencyLabel: string | null;
  isFavorite: boolean;
  badges: string[];
  featureTags: string[];
}

export interface PlaceItem {
  id: number;
  name: string;
  categoryLabel: string | null;
  shortDescription: string | null;
  coverImage: string | null;
  rating: number;
  reviewCount: number;
  visitDurationLabel: string | null;
  ticketPriceAmount: number | null;
  ticketPriceCurrency: string | null;
  tags: string[];
}

export interface HotelCardItem {
  id: number;
  slug: string;
  name: string;
  coverImage: string | null;
  rating: number;
  reviewCount: number;
  nightlyPrice: number | null;
  currency: string;
  badges: string[];
}

export interface SeasonBlock {
  seasonKey: string;
  label: string;
  monthsLabel: string | null;
  note: string | null;
  iconKey: string | null;
}

export interface PackingItem {
  iconKey: string | null;
  label: string;
}

export interface TipItem {
  id: number;
  orderNo: number;
  text: string;
}

export interface EssentialApp {
  id: number;
  name: string;
  subtitle: string | null;
  iconUrl: string | null;
  externalUrl: string | null;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class DestinationsService {
  private readonly logger = new Logger(DestinationsService.name);

  constructor(
    private readonly repo: DestinationsRepository,
    @Inject(WEATHER_API_SERVICE)
    private readonly weatherApi: IWeatherApiService,
  ) {}

  // -------------------------------------------------------------------------
  // Featured destinations
  // -------------------------------------------------------------------------

  async getFeatured(opts: {
    lang?: string;
    userId?: number;
  }): Promise<{ items: FeaturedDestinationItem[] }> {
    const lang = resolveLang(opts.lang);
    const rows = await this.repo.findFeatured();

    const favoriteIds =
      opts.userId != null
        ? await this.repo.findFavoriteDestinationIds(
            opts.userId,
            rows.map((r) => r.id),
          )
        : new Set<number>();

    return {
      items: rows.map((r) => this.toFeaturedItem(r, lang, favoriteIds)),
    };
  }

  // -------------------------------------------------------------------------
  // Paginated list
  // -------------------------------------------------------------------------

  async getList(opts: {
    search?: string;
    category?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    lang?: string;
    userId?: number;
  }): Promise<{
    items: DestinationListItem[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
    };
  }> {
    const lang = resolveLang(opts.lang);
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(50, Math.max(1, opts.limit ?? 20));

    const sortDir: 'ASC' | 'DESC' =
      opts.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const { rows, total } = await this.repo.findAll({
      search: opts.search,
      category: opts.category,
      page,
      limit,
      sortBy: opts.sortBy ?? 'sort_order',
      sortDir,
    });

    const favoriteIds =
      opts.userId != null
        ? await this.repo.findFavoriteDestinationIds(
            opts.userId,
            rows.map((r) => r.id),
          )
        : new Set<number>();

    return {
      items: rows.map((r) => this.toListItem(r, lang, favoriteIds)),
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // -------------------------------------------------------------------------
  // Detail by slug
  // -------------------------------------------------------------------------

  async getDetail(
    slug: string,
    opts: { lang?: string; userId?: number },
  ): Promise<DestinationDetail> {
    const lang = resolveLang(opts.lang);

    // Try slug lookup first.  If the caller passed a numeric string ID (as the
    // mobile app does when it stores raw.id rather than raw.slug), resolve it
    // to the canonical slug via the lightweight findById query and retry.
    let dest = await this.repo.findBySlug(slug);
    if (!dest) {
      const numericId = Number(slug);
      if (!Number.isNaN(numericId)) {
        const minimal = await this.repo.findById(numericId);
        if (minimal) dest = await this.repo.findBySlug(minimal.slug);
      }
    }

    if (!dest) throw new NotFoundException('Destination not found');

    const [badges, featureTags, favoriteIds] = await Promise.all([
      this.repo.findBadgesByDestinationId(dest.id),
      this.repo.findFeatureTagsByDestinationId(dest.id),
      opts.userId != null
        ? this.repo.findFavoriteDestinationIds(opts.userId, [dest.id])
        : Promise.resolve(new Set<number>()),
    ]);

    return this.toDetail(dest, badges, featureTags, lang, favoriteIds);
  }

  // -------------------------------------------------------------------------
  // Places tab
  // -------------------------------------------------------------------------

  async getPlaces(
    destinationId: number,
    opts: { lang?: string },
  ): Promise<{ items: PlaceItem[] }> {
    await this.requireDestinationById(destinationId);
    const lang = resolveLang(opts.lang);
    const rows = await this.repo.findPlacesByDestinationId(destinationId);
    return { items: rows.map((r) => this.toPlaceItem(r, lang)) };
  }

  // -------------------------------------------------------------------------
  // Hotels tab
  // -------------------------------------------------------------------------

  async getHotels(
    destinationId: number,
    opts: { lang?: string },
  ): Promise<{ items: HotelCardItem[] }> {
    await this.requireDestinationById(destinationId);
    const lang = resolveLang(opts.lang);
    const rows = await this.repo.findHotelsByDestinationId(destinationId);
    return { items: rows.map((r) => this.toHotelCardItem(r, lang)) };
  }

  // -------------------------------------------------------------------------
  // Weather tab
  // -------------------------------------------------------------------------

  async getWeather(
    destinationId: number,
    opts: { lang?: string },
  ): Promise<{
    currentWeather: CurrentWeather | null;
    bestTravelPeriod: { label: string | null; description: null };
    seasonBlocks: SeasonBlock[];
    packingItems: PackingItem[];
  }> {
    // findForPlanner selects name_en/name_ko which we need for the weather query.
    // It doubles as an existence check — if null, the destination does not exist.
    const [plannerData, seasons, packingItems] = await Promise.all([
      this.repo.findForPlanner(destinationId),
      this.repo.findSeasonsByDestinationId(destinationId),
      this.repo.findPackingItemsByDestinationId(destinationId),
    ]);

    if (!plannerData) throw new NotFoundException('Destination not found');

    const lang = resolveLang(opts.lang);

    // Use English name as the WeatherAPI query — it resolves city names reliably.
    // Fall back to Korean name if the English name is somehow absent.
    const weatherQuery = plannerData.name_en || plannerData.name_ko;

    const currentWeather = await this.weatherApi
      .getCurrentWeather(weatherQuery, lang)
      .catch((err: Error) => {
        // Degrade gracefully — live weather is non-critical.
        // This path is expected in dev when WEATHER_API_KEY is not set.
        this.logger.warn(
          `[destinations] live weather unavailable for "${weatherQuery}": ${err.message}`,
        );
        return null as CurrentWeather | null;
      });

    return {
      currentWeather,
      bestTravelPeriod: {
        label: null,
        description: null,
      },
      seasonBlocks: seasons.map((s) => this.toSeasonBlock(s, lang)),
      packingItems: packingItems.map((p) => this.toPackingItem(p, lang)),
    };
  }

  // -------------------------------------------------------------------------
  // Tips tab
  // -------------------------------------------------------------------------

  async getTips(
    destinationId: number,
    opts: { lang?: string },
  ): Promise<{ tips: TipItem[]; essentialApps: EssentialApp[] }> {
    await this.requireDestinationById(destinationId);
    const lang = resolveLang(opts.lang);

    const [tips, apps] = await Promise.all([
      this.repo.findTipsByDestinationId(destinationId),
      this.repo.findEssentialAppsByDestinationId(destinationId),
    ]);

    return {
      tips: tips.map((t) => this.toTipItem(t, lang)),
      essentialApps: apps.map(this.toEssentialApp),
    };
  }

  // -------------------------------------------------------------------------
  // Private helpers — existence check
  // -------------------------------------------------------------------------

  private async requireDestinationById(id: number) {
    const dest = await this.repo.findById(id);
    if (!dest) throw new NotFoundException('Destination not found');
    return dest;
  }

  // -------------------------------------------------------------------------
  // Private mappers — row → response item
  // -------------------------------------------------------------------------

  private toFeaturedItem(
    r: DestinationCardRow,
    lang: Lang,
    favoriteIds: Set<number>,
  ): FeaturedDestinationItem {
    return {
      id: r.id,
      slug: r.slug,
      name: pickLoc(r as unknown as LangRow, 'name', lang) ?? r.name_ko,
      regionLabel: pickLoc(r as unknown as LangRow, 'region_label', lang),
      countryLabel: pickLoc(r as unknown as LangRow, 'country_label', lang),
      heroImage: r.hero_image_url,
      rating: r.rating,
      reviewCount: r.review_count,
      matchPercent: r.match_percent,
      isFavorite: favoriteIds.has(r.id),
      tags: r.badges.map((b) => pickBadgeLabel(b, lang)),
    };
  }

  private toListItem(
    r: DestinationCardRow,
    lang: Lang,
    favoriteIds: Set<number>,
  ): DestinationListItem {
    const categoryLabels = r.badges
      .filter((b) => b.badge_type === 'category')
      .map((b) => pickBadgeLabel(b, lang));

    return {
      id: r.id,
      slug: r.slug,
      name: pickLoc(r as unknown as LangRow, 'name', lang) ?? r.name_ko,
      regionLabel: pickLoc(r as unknown as LangRow, 'region_label', lang),
      coverImage: r.hero_image_url,
      rating: r.rating,
      reviewCount: r.review_count,
      matchPercent: r.match_percent,
      isFavorite: favoriteIds.has(r.id),
      categoryLabels,
    };
  }

  private toDetail(
    r: DestinationDetailRow,
    badges: LocalizedBadge[],
    featureTags: LocalizedTag[],
    lang: Lang,
    favoriteIds: Set<number>,
  ): DestinationDetail {
    return {
      id: r.id,
      slug: r.slug,
      name: pickLoc(r as unknown as LangRow, 'name', lang) ?? r.name_ko,
      regionLabel: pickLoc(r as unknown as LangRow, 'region_label', lang),
      countryLabel: pickLoc(r as unknown as LangRow, 'country_label', lang),
      heroImage: r.hero_image_url,
      rating: r.rating,
      reviewCount: r.review_count,
      visitCount: r.visit_count,
      matchPercent: r.match_percent,
      shortDescription: pickLoc(r as unknown as LangRow, 'short_description', lang),
      overviewDescription: pickLoc(r as unknown as LangRow, 'overview_description', lang),
      bestSeasonLabel: pickLoc(r as unknown as LangRow, 'best_season_label', lang),
      averageTemperatureC: r.average_temperature_c,
      languageLabel: pickLoc(r as unknown as LangRow, 'language_label', lang),
      currencyLabel: pickLoc(r as unknown as LangRow, 'currency_label', lang),
      isFavorite: favoriteIds.has(r.id),
      badges: badges.map((b) => pickBadgeLabel(b, lang)),
      featureTags: featureTags.map((t) => pickBadgeLabel(t, lang)),
    };
  }

  private toPlaceItem(r: PlaceRow, lang: Lang): PlaceItem {
    return {
      id: r.id,
      name: pickLoc(r as unknown as LangRow, 'name', lang) ?? r.name_ko,
      categoryLabel: pickLoc(r as unknown as LangRow, 'category_label', lang),
      shortDescription: pickLoc(r as unknown as LangRow, 'short_description', lang),
      coverImage: r.cover_image_url,
      rating: r.rating,
      reviewCount: r.review_count,
      visitDurationLabel: pickLoc(r as unknown as LangRow, 'visit_duration_label', lang),
      ticketPriceAmount: r.ticket_price_amount,
      ticketPriceCurrency: r.ticket_price_currency,
      tags: r.tags.map((t) => pickBadgeLabel(t, lang)),
    };
  }

  private toHotelCardItem(r: HotelCardRow, lang: Lang): HotelCardItem {
    return {
      id: r.id,
      slug: r.slug,
      name: r.name,
      coverImage: r.cover_image_url,
      rating: r.rating,
      reviewCount: r.review_count,
      nightlyPrice: r.nightly_from_price,
      currency: r.currency,
      badges: r.badges.map((b) => pickBadgeLabel(b, lang)),
    };
  }

  private toSeasonBlock(r: SeasonRow, lang: Lang): SeasonBlock {
    return {
      seasonKey: r.season_key,
      label: pickLoc(r as unknown as LangRow, 'label', lang) ?? r.label_ko,
      monthsLabel: pickLoc(r as unknown as LangRow, 'months_label', lang),
      note: pickLoc(r as unknown as LangRow, 'note', lang),
      iconKey: r.icon_key,
    };
  }

  private toPackingItem(r: PackingItemRow, lang: Lang): PackingItem {
    return {
      iconKey: r.icon_key,
      label: pickLoc(r as unknown as LangRow, 'label', lang) ?? r.label_ko,
    };
  }

  private toTipItem(r: TipRow, lang: Lang): TipItem {
    return {
      id: r.id,
      orderNo: r.order_no,
      text: pickLoc(r as unknown as LangRow, 'text', lang) ?? r.text_ko,
    };
  }

  private toEssentialApp(r: EssentialAppRow): EssentialApp {
    return {
      id: r.id,
      name: r.name,
      subtitle: r.subtitle,
      iconUrl: r.icon_url,
      externalUrl: r.external_url,
    };
  }
}
