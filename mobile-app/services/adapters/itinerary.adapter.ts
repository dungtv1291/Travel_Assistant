import {
  Trip,
  DayItinerary,
  ItineraryActivity,
  ActivityType,
  TravelStyle,
  TravelerType,
} from '../../types/trip.types';
import { resolveAssetUrl } from '../config/api.config';

// ── Type maps ─────────────────────────────────────────────────────────────────

const ACTIVITY_TYPE_MAP: Record<string, ActivityType> = {
  food: 'food',
  transport: 'transport',
  beach: 'attraction',
  attraction: 'attraction',
  shopping: 'shopping',
  hotel: 'hotel',
  cafe: 'food',
  nightlife: 'attraction',
  wellness: 'free_time',
  photo: 'attraction',
};

const TRAVEL_STYLE_MAP: Record<string, TravelStyle> = {
  culture: 'cultural',
  beach: 'relaxed',
  activity: 'adventure',
  food: 'foodie',
  shopping: 'cultural',
  healing: 'relaxed',
};

// ── Backend schema types (mirroring itinerary-schema.json) ────────────────────

interface BackendMoney {
  currency: string;
  amount: number;
  display?: string;
}

interface BackendLocation {
  name: string;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
}

interface BackendTimelineItem {
  id: string;
  type: string;
  startTime: string;
  durationMinutes: number;
  durationLabel: string;
  title: string;
  description: string;
  location: BackendLocation;
  estimatedCost?: BackendMoney | null;
  tipText?: string | null;
  bookingRequired?: boolean;
  imageUrl?: string | null;
}

interface BackendDay {
  dayNumber: number;
  date: string;
  title: string;
  weather: {
    conditionLabel: string;
    temperatureC: number;
    note: string;
  };
  estimatedCost: BackendMoney;
  items: BackendTimelineItem[];
  smartTips?: Array<{ orderNo: number; text: string }>;
}

interface BackendItinerary {
  id: string;
  title: string;
  destination: {
    id: number;
    slug: string;
    name: string;
    code?: string;
    heroImage?: string | null;
  };
  summary: {
    nights: number;
    days: number;
    totalActivities: number;
    estimatedCost: BackendMoney;
    generatedBy?: string;
  };
  days: BackendDay[];
  meta: {
    language: string;
    currency: string;
    travelerType: string;
    pace: string;
    budgetLevel: string;
    travelStyles: string[];
    interests: string[];
    saved: boolean;
    createdAt?: string | null;
  };
}

// ── Mapping functions ─────────────────────────────────────────────────────────

function mapTimelineItem(raw: BackendTimelineItem, currency: string): ItineraryActivity {
  return {
    id: raw.id,
    time: raw.startTime,
    duration: raw.durationLabel,
    type: ACTIVITY_TYPE_MAP[raw.type] ?? 'attraction',
    title: raw.title,
    location: raw.location.name,
    description: raw.description,
    imageUrl: resolveAssetUrl(raw.imageUrl) || undefined,
    estimatedCost: raw.estimatedCost?.amount ?? 0,
    currency: raw.estimatedCost?.currency ?? currency,
    tips: raw.tipText ?? undefined,
    bookingRequired: raw.bookingRequired ?? false,
  };
}

function mapDay(raw: BackendDay, currency: string): DayItinerary {
  return {
    day: raw.dayNumber,
    date: raw.date,
    title: raw.title,
    weatherNote: `${raw.weather.conditionLabel} ${raw.weather.temperatureC}°C — ${raw.weather.note}`,
    activities: raw.items.map((item) => mapTimelineItem(item, currency)),
    estimatedCost: raw.estimatedCost.amount,
  };
}

/**
 * Converts a backend itinerary response (matching itinerary-schema.json) to
 * the frontend `Trip` model consumed by screens and the trips store.
 */
export function mapItinerary(raw: BackendItinerary): Trip {
  // [TEMP_FALLBACK] guard: callers have try/catch that returns null when this throws
  if (!raw || typeof raw !== 'object') throw new Error('null itinerary response');
  const { meta, summary, days } = raw;
  const currency = meta.currency;
  const coverImage = resolveAssetUrl(raw.destination.heroImage) || '';
  const startDate = days[0]?.date ?? '';
  const lastDay = days[days.length - 1];
  const endDate = lastDay?.date ?? '';
  const primaryStyle = meta.travelStyles[0];
  const travelStyle: TravelStyle = TRAVEL_STYLE_MAP[primaryStyle] ?? 'cultural';

  // Collect global AI insights from the first day's smart tips
  const aiInsights = days[0]?.smartTips?.map((t) => t.text) ?? [];

  return {
    id: raw.id,
    title: raw.title,
    destination: raw.destination.name,
    startDate,
    endDate,
    duration: summary.days,
    coverImage,
    status: meta.saved ? 'planned' : 'draft',
    itinerary: days.map((d) => mapDay(d, currency)),
    totalEstimatedCost: summary.estimatedCost.amount,
    currency,
    travelStyle,
    travelers: (meta.travelerType as TravelerType) ?? 'couple',
    createdAt: meta.createdAt ?? new Date().toISOString(),
    isAIGenerated: summary.generatedBy === 'ai',
    aiInsights: aiInsights.length > 0 ? aiInsights : undefined,
  };
}
// ── Itinerary list item (GET /itineraries) ──────────────────────────────────────────────

interface BackendItineraryListItem {
  id: string;
  title: string;
  destinationName: string;
  coverImage?: string | null;
  startDate?: string | null;
  nights: number;
  days: number;
  totalActivities: number;
  estimatedCostAmount: number;
  currency: string;
  badges?: string[];
}

/**
 * Maps an ItineraryListItem (from GET /itineraries) to a minimal Trip stub.
 * The itinerary array contains one fake day whose activities[] length equals
 * totalActivities, so the trips-screen reduce() count displays correctly.
 * Full data is loaded separately when the user taps a card (getTripById).
 */
export function mapItineraryListItemToTrip(raw: BackendItineraryListItem): Trip {
  // [TEMP_FALLBACK] guard: safeMapList in getSavedTrips catches this throw and skips the item
  if (!raw) throw new Error('null itinerary list item');
  const currency = raw.currency ?? 'KRW';
  const stubActivity: ItineraryActivity = {
    id: '_stub',
    time: '09:00',
    duration: '-',
    type: 'attraction',
    title: '',
    location: '',
    description: '',
    estimatedCost: 0,
    currency,
    bookingRequired: false,
  };
  return {
    id: raw.id,
    title: raw.title,
    destination: raw.destinationName,
    startDate: raw.startDate ?? '',
    endDate: '',
    duration: raw.days,
    coverImage: resolveAssetUrl(raw.coverImage) || '',
    status: 'planned',
    itinerary: [{
      day: 1,
      date: raw.startDate ?? '',
      title: '',
      activities: Array.from({ length: raw.totalActivities }, (_, i) => ({
        ...stubActivity,
        id: `_stub_${i}`,
      })),
      estimatedCost: raw.estimatedCostAmount,
    }],
    totalEstimatedCost: raw.estimatedCostAmount,
    currency,
    travelStyle: 'cultural',
    travelers: 'couple',
    createdAt: '',
    isAIGenerated: (raw.badges ?? []).some(b => b.toLowerCase().includes('ai')),
    aiInsights: undefined,
  };
}
// ── AIItineraryRequest → backend GenerateItineraryDto ─────────────────────────

import { AIItineraryRequest, TravelerType as TT } from '../../types/trip.types';

const PACE_MAP: Record<string, string> = {
  relaxed: 'relaxed',
  moderate: 'balanced',
  intensive: 'active',
};

const BUDGET_LEVEL_MAP: Record<string, string> = {
  adventure: 'medium',
  cultural: 'medium',
  relaxed: 'medium',
  foodie: 'medium',
  luxury: 'luxury',
  budget: 'budget',
};

// Maps frontend interest IDs to backend-validated interest keys
const INTEREST_MAP: Record<string, string> = {
  local: 'local_food',
};

const STYLE_MAP: Record<string, string> = {
  adventure: 'activity',
  cultural:  'culture',
  culture:   'culture',
  relaxed:   'healing',
  relaxation:'healing',
  foodie:    'food',
  food:      'food',
  shopping:  'shopping',
  beach:     'beach',
  luxury:    'culture',
  budget:    'culture',
};

/**
 * Builds the backend GenerateItineraryDto from the frontend AIItineraryRequest.
 * @param destinationId Numeric ID resolved by the destinations service
 * @param language Current UI language
 * @param currency Current user currency
 */
export function buildGenerateItineraryDto(
  request: AIItineraryRequest,
  destinationId: number,
  language: string,
  currency: string,
): Record<string, unknown> {
  // Derive budget level from numeric amount (planner sends 500k / 1.5M / 3M KRW)
  const budgetLevel =
    request.budget >= 2000000 ? 'luxury' : request.budget >= 1000000 ? 'medium' : 'budget';

  // Handle comma-separated style keys from planner input (e.g. 'cultural,beach,food')
  const styleKeys = (request.travelStyle as string).split(',').filter(Boolean).map(s => s.trim());
  const travelStyles = [...new Set(styleKeys.map(s => STYLE_MAP[s] ?? 'culture'))];

  // Normalize interest IDs to backend-valid keys
  const normalizedInterests = (request.interests ?? []).map(i => INTEREST_MAP[i] ?? i);

  return {
    destinationId,
    startDate: request.startDate || undefined,
    nights: Math.max(1, request.duration - 1),
    days: request.duration,
    travelerType: request.travelers,
    budgetLevel,
    pace: PACE_MAP[request.pace] ?? 'balanced',
    travelStyles: travelStyles.length > 0 ? travelStyles : ['culture'],
    interests: normalizedInterests,
    language,
    currency,
  };
}
