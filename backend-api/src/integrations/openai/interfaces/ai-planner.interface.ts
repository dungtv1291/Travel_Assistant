/**
 * AI Planner abstraction — all types shared between the interface,
 * concrete provider implementations, and the itinerary service.
 *
 * Design intent:
 * - The consumer (ItinerariesService) only depends on IAiPlannerService.
 * - The provider token AI_PLANNER_SERVICE is injected in the module.
 * - Swap MockAiPlannerService → OpenAiPlannerService in the module providers
 *   without touching any calling code.
 */

// ---------------------------------------------------------------------------
// Money / cost helper
// ---------------------------------------------------------------------------

export interface MoneyAmount {
  currency: string;
  /** Raw integer amount (no decimals for KRW/VND, cents divisor for USD). */
  amount: number;
  /** Pre-formatted display string, e.g. "600K đ", "₩1,200,000", "$30". */
  display: string;
}

// ---------------------------------------------------------------------------
// Weather per day
// ---------------------------------------------------------------------------

export interface WeatherData {
  conditionCode:
    | 'sunny'
    | 'cloudy'
    | 'partly_cloudy'
    | 'rain'
    | 'storm'
    | 'windy';
  conditionLabel: string;
  temperatureC: number;
  note: string;
  iconKey?: string | null;
}

// ---------------------------------------------------------------------------
// Timeline item
// ---------------------------------------------------------------------------

export interface TimelineItemData {
  /**
   * Stable short ID used as the `id` in the response.
   * Pattern: item_d{dayNumber}_{twoDigitIndex}, e.g. "item_d1_01".
   */
  itemPublicId: string;
  type:
    | 'food'
    | 'transport'
    | 'beach'
    | 'attraction'
    | 'shopping'
    | 'hotel'
    | 'cafe'
    | 'nightlife'
    | 'wellness'
    | 'photo';
  startTime: string; // HH:MM
  durationMinutes: number;
  durationLabel: string;
  title: string;
  description: string;
  location: {
    name: string;
    address?: string | null;
    lat?: number | null;
    lng?: number | null;
  };
  estimatedCost?: MoneyAmount | null;
  tipText?: string | null;
  bookingRequired?: boolean;
  bookingUrl?: string | null;
  accentColor: 'orange' | 'blue' | 'cyan' | 'green' | 'purple' | 'gray';
  iconKey:
    | 'meal'
    | 'car'
    | 'beach'
    | 'camera'
    | 'shopping'
    | 'bed'
    | 'coffee'
    | 'moon'
    | 'leaf'
    | 'pin';
  imageUrl?: string | null;
  tags?: string[];
}

// ---------------------------------------------------------------------------
// Warnings and tips
// ---------------------------------------------------------------------------

export interface WarningData {
  type:
    | 'weather'
    | 'booking_required'
    | 'crowded'
    | 'timing'
    | 'transport'
    | 'general';
  title?: string | null;
  text: string;
  count?: number | null;
}

export interface TipData {
  orderNo: number;
  text: string;
  iconKey?: string | null;
}

// ---------------------------------------------------------------------------
// Day
// ---------------------------------------------------------------------------

export interface DayData {
  dayNumber: number;
  /** ISO date string, e.g. "2026-03-18". Null if no fixed start date. */
  date: string | null;
  /** Compact UI tab label, e.g. "3.18". Null if no date. */
  dateLabel: string | null;
  /** Localized day label, e.g. "DAY 1" / "NGÀY 1". */
  dayLabel: string;
  /** Day title shown below tab, e.g. "도착 & 해변 탐방". */
  title: string;
  weather: WeatherData;
  estimatedCost: MoneyAmount;
  items: TimelineItemData[];
  warnings: WarningData[];
  /** Labels for the booking-needed box items. */
  bookingNeededItems: string[];
  smartTips: TipData[];
}

// ---------------------------------------------------------------------------
// Planner input / output
// ---------------------------------------------------------------------------

export interface PlannerInput {
  destination: {
    id: number;
    slug: string;
    /** Short code, e.g. DAD, HAN — may be null for some destinations. */
    code: string | null;
    /** Resolved localized name based on input language. */
    name: string;
    heroImageUrl: string | null;
  };
  /** ISO date string, e.g. "2026-03-18".  Null if the traveller has not set a start date. */
  startDate: string | null;
  nights: number;
  days: number;
  travelerType: 'solo' | 'couple' | 'family' | 'friends';
  budgetLevel: 'budget' | 'medium' | 'luxury';
  pace: 'relaxed' | 'balanced' | 'active';
  travelStyles: string[];
  interests: string[];
  language: 'ko' | 'en' | 'vi';
  currency: 'KRW' | 'VND' | 'USD';
}

export interface PlannerOutput {
  title: string;
  budgetLabel: string;
  totalCost: MoneyAmount;
  days: DayData[];
}

// ---------------------------------------------------------------------------
// Injection token + interface
// ---------------------------------------------------------------------------

export const AI_PLANNER_SERVICE = 'AI_PLANNER_SERVICE';

export interface IAiPlannerService {
  /**
   * Generate a full itinerary plan based on the given input parameters.
   * Throws on unrecoverable error so the service can catch and log.
   */
  generate(input: PlannerInput): Promise<PlannerOutput>;

  /**
   * Optional metadata about the last call — used for AI generation logs.
   * Should be populated after generate() completes.
   */
  lastCallMeta?: {
    providerName: string;
    modelName: string | null;
    tokensUsed: number | null;
  };
}
