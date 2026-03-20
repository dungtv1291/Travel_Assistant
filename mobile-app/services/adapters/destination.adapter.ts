import {
  Destination,
  Attraction,
  WeatherInfo,
  DestinationCategory,
  AttractionCategory,
} from '../../types/destination.types';
import { resolveAssetUrl } from '../config/api.config';

// ── Exported shape for weather screen data ────────────────────────────────────
export interface MappedWeather {
  weather: WeatherInfo;
  bestSeason: string;
  seasonBlocks: Array<{
    seasonKey: string;
    label: string;
    monthsLabel: string;
    note: string;
    icon: string;
  }>;
  packingItems: Array<{ icon: string; label: string }>;
}

// ── Exported shape for tips screen data ──────────────────────────────────────
export interface MappedTips {
  tips: string[];
  essentialApps: Array<{
    icon: string;
    name: string;
    descKey: string;
    subtitle: string;
  }>;
}

// ── Category label → frontend enum ───────────────────────────────────────────

const CATEGORY_LABEL_MAP: Record<string, DestinationCategory> = {
  해변: 'beach',
  beach: 'beach',
  도시: 'city',
  city: 'city',
  산: 'mountain',
  mountain: 'mountain',
  문화: 'culture',
  culture: 'culture',
  가족: 'family',
  family: 'family',
  자연: 'mountain',
  nature: 'mountain',
  럭셔리: 'city',
  luxury: 'city',
};

function mapCategory(
  labels: string[] | undefined,
  slug?: string,
): DestinationCategory {
  if (labels?.length) {
    for (const label of labels) {
      const mapped = CATEGORY_LABEL_MAP[label.toLowerCase()];
      if (mapped) return mapped;
    }
  }
  return 'city';
}

const DEFAULT_WEATHER: WeatherInfo = {
  temperature: 27,
  condition: '맑음',
  humidity: 70,
  description: '맑고 화창',
  icon: '☀️',
};

// ── Featured destination (GET /destinations/featured items[]) ─────────────────

interface BackendFeaturedDestination {
  id: number;
  slug: string;
  name: string;
  regionLabel?: string;
  countryLabel?: string;
  rating?: number;
  reviewCount?: number;
  heroImage?: string | null;
  matchPercent?: number;
  isFavorite?: boolean;
  tags?: string[];
}

export function mapFeaturedDestination(raw: BackendFeaturedDestination): Destination {
  // [TEMP_FALLBACK] guard: safeMapList in the calling service catches this throw and skips the item
  if (!raw) throw new Error('null featured destination item');
  const imageUrl = resolveAssetUrl(raw.heroImage);
  return {
    id: String(raw.id),
    name: raw.name,
    nameKo: raw.name,
    region: raw.regionLabel ?? '',
    country: raw.countryLabel ?? 'Vietnam',
    imageUrl,
    images: imageUrl ? [imageUrl] : [],
    rating: raw.rating ?? 0,
    reviewCount: raw.reviewCount ?? 0,
    tags: raw.tags ?? [],
    category: 'city',
    description: '',
    descriptionKo: '',
    latitude: 0,
    longitude: 0,
    bestTimeToVisit: '',
    weather: DEFAULT_WEATHER,
    popularityScore: raw.matchPercent ?? 0,
    isFeatured: true,
  };
}

// ── Destination list item (GET /destinations items[]) ─────────────────────────

interface BackendDestinationListItem {
  id: number;
  slug: string;
  name: string;
  regionLabel?: string;
  countryLabel?: string;
  rating?: number;
  reviewCount?: number;
  coverImage?: string | null;
  categoryLabels?: string[];
  isFavorite?: boolean;
}

export function mapDestinationListItem(raw: BackendDestinationListItem): Destination {
  // [TEMP_FALLBACK] guard: safeMapList in the calling service catches this throw and skips the item
  if (!raw) throw new Error('null destination list item');
  const imageUrl = resolveAssetUrl(raw.coverImage);
  return {
    id: String(raw.id),
    name: raw.name,
    nameKo: raw.name,
    region: raw.regionLabel ?? '',
    country: raw.countryLabel ?? 'Vietnam',
    imageUrl,
    images: imageUrl ? [imageUrl] : [],
    rating: raw.rating ?? 0,
    reviewCount: raw.reviewCount ?? 0,
    tags: raw.categoryLabels ?? [],
    category: mapCategory(raw.categoryLabels, raw.slug),
    description: '',
    descriptionKo: '',
    latitude: 0,
    longitude: 0,
    bestTimeToVisit: '',
    weather: DEFAULT_WEATHER,
    popularityScore: 0,
    isFeatured: false,
  };
}

// ── Destination detail (GET /destinations/:slug) ───────────────────────────────

interface BackendDestinationDetail {
  id: number;
  slug: string;
  name: string;
  regionLabel?: string;
  countryLabel?: string;
  rating?: number;
  reviewCount?: number;
  heroImage?: string | null;
  badges?: string[];
  shortDescription?: string;
  overviewDescription?: string;
  bestSeasonLabel?: string;
  averageTemperatureC?: number;
  featureTags?: string[];
  isFavorite?: boolean;
}

export function mapDestinationDetail(raw: BackendDestinationDetail): Destination {
  // [TEMP_FALLBACK] guard: getById service falls back to null when this throws
  if (!raw) throw new Error('null destination detail');
  const imageUrl = resolveAssetUrl(raw.heroImage);
  const weather: WeatherInfo = {
    temperature: raw.averageTemperatureC ?? 27,
    condition: '맑음',
    humidity: 70,
    description: '맑고 화창',
    icon: '☀️',
  };
  return {
    id: String(raw.id),
    name: raw.name,
    nameKo: raw.name,
    region: raw.regionLabel ?? '',
    country: raw.countryLabel ?? 'Vietnam',
    imageUrl,
    images: imageUrl ? [imageUrl] : [],
    rating: raw.rating ?? 0,
    reviewCount: raw.reviewCount ?? 0,
    tags: raw.badges ?? raw.featureTags ?? [],
    category: 'city',
    description: raw.shortDescription ?? '',
    descriptionKo: raw.overviewDescription ?? raw.shortDescription ?? '',
    bestSeason: raw.bestSeasonLabel,
    latitude: 0,
    longitude: 0,
    bestTimeToVisit: raw.bestSeasonLabel ?? '',
    weather,
    popularityScore: 0,
    isFeatured: false,
  };
}

// ── Place / Attraction (GET /destinations/:id/places items[]) ─────────────────

interface BackendPlace {
  id: number;
  name: string;
  categoryLabel?: string;
  shortDescription?: string;
  rating?: number;
  reviewCount?: number;
  visitDurationLabel?: string;
  ticketPriceAmount?: number;
  ticketPriceCurrency?: string;
  coverImage?: string | null;
  tags?: string[];
}

const ATTRACTION_CATEGORY_MAP: Record<string, AttractionCategory> = {
  문화유산: 'heritage',
  culture: 'heritage',
  자연: 'nature',
  nature: 'nature',
  음식: 'food',
  food: 'food',
  엔터테인먼트: 'entertainment',
  entertainment: 'entertainment',
  쇼핑: 'market',
  shopping: 'market',
  스파: 'entertainment',
  wellness: 'entertainment',
};

export function mapPlace(
  raw: BackendPlace,
  destinationId: string,
): Attraction {
  // [TEMP_FALLBACK] guard: safeMapList in the calling service catches this throw and skips the item
  if (!raw) throw new Error('null place item');
  const imageUrl = resolveAssetUrl(raw.coverImage);
  const category: AttractionCategory =
    ATTRACTION_CATEGORY_MAP[raw.categoryLabel ?? ''] ?? 'culture';
  return {
    id: String(raw.id),
    destinationId,
    name: raw.name,
    nameKo: raw.name,
    imageUrl,
    images: imageUrl ? [imageUrl] : [],
    rating: raw.rating ?? 0,
    reviewCount: raw.reviewCount ?? 0,
    category,
    tags: raw.tags ?? [],
    description: raw.shortDescription ?? '',
    address: '',
    openingHours: {
      monday: '09:00 - 18:00',
      tuesday: '09:00 - 18:00',
      wednesday: '09:00 - 18:00',
      thursday: '09:00 - 18:00',
      friday: '09:00 - 18:00',
      saturday: '09:00 - 18:00',
      sunday: '09:00 - 18:00',
    },
    ticketPrice: raw.ticketPriceAmount != null
      ? {
          adult: raw.ticketPriceAmount,
          child: Math.round(raw.ticketPriceAmount * 0.5),
          currency: raw.ticketPriceCurrency ?? 'VND',
        }
      : undefined,
    suggestedDuration: raw.visitDurationLabel ?? '',
    duration: raw.visitDurationLabel,
    latitude: 0,
    longitude: 0,
    isPopularWithKoreans: false,
  };
}

// ── Weather endpoint (GET /destinations/:id/weather) ─────────────────────────

interface BackendWeatherResponse {
  currentWeather?: {
    tempC?: number;
    feelsLikeC?: number;
    conditionText?: string;
    conditionCode?: number;
    conditionIconUrl?: string;
    humidity?: number;
    windKph?: number;
    uvIndex?: number;
    isDay?: boolean;
  } | null;
  bestTravelPeriod?: { label?: string | null } | null;
  seasonBlocks?: Array<{
    seasonKey?: string;
    label?: string;
    monthsLabel?: string | null;
    note?: string | null;
    iconKey?: string | null;
  }>;
  packingItems?: Array<{
    iconKey?: string | null;
    label?: string;
  }>;
}

const SEASON_ICON_MAP: Record<string, string> = {
  spring: '🌸',
  summer: '☀️',
  autumn: '🍂',
  fall: '🍂',
  winter: '❄️',
};

const PACK_ICON_MAP: Record<string, string> = {
  sunscreen: '🧴',
  medicine: '💊',
  adapter: '🔌',
  cash: '💵',
  hat: '🧢',
  water: '💧',
  bag: '👜',
  camera: '📷',
  umbrella: '☂️',
  shoes: '👟',
};

export function mapWeatherResponse(
  raw: BackendWeatherResponse,
  fallbackBestSeason: string,
): MappedWeather {
  const cw = raw.currentWeather;
  const temp = cw?.tempC ?? 27;
  const humidity = cw?.humidity ?? 70;
  const conditionText = cw?.conditionText ?? '맑고 화창';

  const weather: WeatherInfo = {
    temperature: temp,
    condition: conditionText,
    humidity,
    description: conditionText,
    icon: '☀️',
    rainfall: 0,
  };

  const bestSeason = raw.bestTravelPeriod?.label ?? fallbackBestSeason;

  const seasonBlocks = (raw.seasonBlocks ?? []).map((s) => ({
    seasonKey: s.seasonKey ?? 'spring',
    label: s.label ?? '',
    monthsLabel: s.monthsLabel ?? '',
    note: s.note ?? '',
    icon: SEASON_ICON_MAP[s.seasonKey?.toLowerCase() ?? ''] ?? '🌤️',
  }));

  // If backend returns no season data, produce 4 placeholder blocks so the
  // season grid in the UI is never empty
  const resolvedSeasons = seasonBlocks.length > 0
    ? seasonBlocks
    : (['spring', 'summer', 'autumn', 'winter'] as const).map((sk) => ({
        seasonKey: sk,
        label: sk,
        monthsLabel: '',
        note: '',
        icon: SEASON_ICON_MAP[sk],
      }));

  const packingItems = (raw.packingItems ?? []).map((p, i) => ({
    icon: (p.iconKey ? PACK_ICON_MAP[p.iconKey.toLowerCase()] : null) ?? ['🧴','💊','🔌','💵','🧢','💧'][i % 6],
    label: p.label ?? '',
  }));

  // If backend returns no packing items, produce 6 generic placeholders
  const resolvedPacking = packingItems.length > 0
    ? packingItems
    : ['🧴','💊','🔌','💵','🧢','💧'].map((icon, i) => ({
        icon,
        label: ['선크림','의약품','어댑터','현금','모자','물'][i],
      }));

  return { weather, bestSeason, seasonBlocks: resolvedSeasons, packingItems: resolvedPacking };
}

// ── Tips endpoint (GET /destinations/:id/tips) ────────────────────────────────

interface BackendTipsResponse {
  tips?: Array<{ id?: number; orderNo?: number; text?: string }>;
  essentialApps?: Array<{
    id?: number;
    name?: string;
    subtitle?: string | null;
    iconUrl?: string | null;
    externalUrl?: string | null;
  }>;
}

// Map known app names to local emoji icons (used when iconUrl is a CDN path)
const APP_ICON_MAP: Record<string, string> = {
  grab: '🚗',
  'google maps': '🗺️',
  google: '🗺️',
  deepl: '🌐',
  xe: '💱',
  'xe money': '💱',
  tripadvisor: '⭐',
  airbnb: '🏠',
  booking: '🛏️',
};

export function mapTipsResponse(
  raw: BackendTipsResponse,
  defaultTips: string[],
): MappedTips {
  const tips = (raw.tips ?? [])
    .sort((a, b) => (a.orderNo ?? 0) - (b.orderNo ?? 0))
    .map((t) => t.text ?? '')
    .filter(Boolean);

  const resolvedTips = tips.length > 0 ? tips : defaultTips;

  const essentialApps = (raw.essentialApps ?? []).map((app) => {
    const name = app.name ?? '';
    const icon = APP_ICON_MAP[name.toLowerCase()] ?? '📱';
    return {
      icon,
      name,
      descKey: '',
      subtitle: app.subtitle ?? '',
    };
  });

  return { tips: resolvedTips, essentialApps };
}

// ── Hotel card item from destinations/:id/hotels endpoint ────────────────────
// The shape differs from hotels/:id list items — it uses `nightlyPrice` not
// `nightlyFromPrice` and has no destinationLabel field.

interface BackendHotelCardItem {
  id: number;
  slug?: string;
  name: string;
  coverImage?: string | null;
  rating?: number;
  reviewCount?: number;
  nightlyPrice?: number | null;
  currency?: string;
  badges?: string[];
}

import { Hotel } from '../../types/hotel.types';

export function mapDestinationHotelCard(raw: BackendHotelCardItem): Hotel {
  const imageUrl = resolveAssetUrl(raw.coverImage);
  return {
    id: String(raw.id),
    name: raw.name,
    nameKo: raw.name,
    destinationId: '',
    city: '',
    address: '',
    imageUrl,
    images: imageUrl ? [imageUrl] : [],
    rating: raw.rating ?? 0,
    reviewCount: raw.reviewCount ?? 0,
    starRating: 3,
    category: 'boutique',
    amenities: [],
    tags: raw.badges ?? [],
    description: '',
    pricePerNight: raw.nightlyPrice ?? 0,
    currency: raw.currency ?? 'KRW',
    latitude: 0,
    longitude: 0,
    rooms: [],
    policies: {
      checkIn: '14:00',
      checkOut: '12:00',
      cancellation: '체크인 48시간 전 무료 취소',
      pets: false,
      smoking: false,
    },
    isRecommended: true,
  };
}
