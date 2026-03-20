import { Flight, Airport, AIFlightAnalysis, FlightTag } from '../../types/flight.types';
import { resolveAssetUrl } from '../config/api.config';

// ── Airport code → partial Airport info lookup ────────────────────────────────
// Covers routes served by the Vietnam travel app.

const AIRPORT_INFO: Record<string, Omit<Airport, 'code'>> = {
  ICN: { name: '인천국제공항', city: '서울', cityKo: '서울', country: '대한민국' },
  GMP: { name: '김포국제공항', city: '서울', cityKo: '서울', country: '대한민국' },
  PUS: { name: '김해국제공항', city: '부산', cityKo: '부산', country: '대한민국' },
  HAN: { name: '노이바이국제공항', city: '하노이', cityKo: '하노이', country: '베트남' },
  DAD: { name: '다낭국제공항', city: '다낭', cityKo: '다낭', country: '베트남' },
  SGN: { name: '탄손녓국제공항', city: '호치민시', cityKo: '호치민시', country: '베트남' },
  PQC: { name: '푸꾸옥국제공항', city: '푸꾸옥', cityKo: '푸꾸옥', country: '베트남' },
  CXR: { name: '캄란국제공항', city: '나트랑', cityKo: '나트랑', country: '베트남' },
  HUI: { name: '푸바이국제공항', city: '후에', cityKo: '후에', country: '베트남' },
};

function buildAirport(code: string): Airport {
  const info = AIRPORT_INFO[code];
  if (info) return { code, ...info };
  return { code, name: code, city: code, country: '' };
}

// ── Duration conversion ───────────────────────────────────────────────────────

export function minutesToDurationLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
}

// ── Flight deal / search result (GET /flights/deals, POST /flights/search) ────

interface BackendFlightItem {
  id: string | number;
  airlineName?: string;
  airlineCode?: string;
  airlineLogo?: string | null;
  flightNumber?: string;
  originCode?: string;
  destinationCode?: string;
  originLabel?: string;
  destinationLabel?: string;
  departureTime?: string;
  arrivalTime?: string;
  durationMinutes?: number;
  duration?: string;
  stops?: number;
  priceAmount?: number;
  price?: number;
  currency?: string;
  tags?: string[];
  dealTag?: string;
  seatsLeft?: number;
}

export function mapFlightItem(raw: BackendFlightItem): Flight {
  // [TEMP_FALLBACK] guard: safeMapList in the calling service catches this throw and skips the item
  if (!raw) throw new Error('null flight item');
  const durationMinutes = raw.durationMinutes ?? 0;
  const durationLabel = raw.duration ?? minutesToDurationLabel(durationMinutes);
  const tags: FlightTag[] = ((raw.tags ?? (raw.dealTag ? [raw.dealTag] : [])) as string[]).filter(
    (t): t is FlightTag => ['cheapest', 'fastest', 'best_value', 'popular'].includes(t),
  );

  return {
    id: String(raw.id),
    airline: raw.airlineName ?? raw.airlineCode ?? '',
    airlineCode: raw.airlineCode ?? '',
    airlineLogo: resolveAssetUrl(raw.airlineLogo) || `https://logo.clearbit.com/${raw.airlineCode?.toLowerCase()}.com`,
    flightNumber: raw.flightNumber ?? '',
    origin: buildAirport(raw.originCode ?? ''),
    destination: buildAirport(raw.destinationCode ?? ''),
    departureTime: raw.departureTime ?? '',
    arrivalTime: raw.arrivalTime ?? '',
    duration: durationLabel,
    stops: raw.stops ?? 0,
    price: raw.priceAmount ?? raw.price ?? 0,
    currency: raw.currency ?? 'KRW',
    class: 'economy',
    seatsLeft: raw.seatsLeft ?? 0,
    baggage: { cabin: '7kg', checked: '없음' },
    tags,
  };
}

// ── AI flight recommendation (POST /flights/recommend) ────────────────────────

interface BackendFlightRecommendation {
  bestOption?: BackendFlightItem | null;
  cheapestOption?: BackendFlightItem | null;
  fastestOption?: BackendFlightItem | null;
  reasoningSummary?: string;
  insights?: string[];
  priceChangePercent?: number;
  currentPriceLevel?: string;
  bestBookingTime?: string;
}

export function mapFlightRecommendation(
  raw: BackendFlightRecommendation,
  fallbackFlights: Flight[],
): AIFlightAnalysis {
  const sorted = [...fallbackFlights].sort((a, b) => a.price - b.price);
  const cheapest = raw.cheapestOption
    ? mapFlightItem(raw.cheapestOption)
    : sorted[0] ?? fallbackFlights[0];
  const fastest = raw.fastestOption
    ? mapFlightItem(raw.fastestOption)
    : fallbackFlights.find((f) => f.tags.includes('fastest')) ?? fallbackFlights[0];
  const bestValue = raw.bestOption
    ? mapFlightItem(raw.bestOption)
    : fallbackFlights.find((f) => f.tags.includes('best_value')) ?? fallbackFlights[0];

  return {
    cheapest,
    fastest,
    bestValue,
    summary: raw.reasoningSummary ?? '',
    recommendation: raw.reasoningSummary ?? '',
    insights: raw.insights ?? [],
    currentPriceLevel: raw.currentPriceLevel,
    priceChangePercent: raw.priceChangePercent,
    details: raw.insights,
    bestBookingTime: raw.bestBookingTime,
  };
}
