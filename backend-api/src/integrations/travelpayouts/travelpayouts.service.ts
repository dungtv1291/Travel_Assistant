import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getTravelpayoutsConfig } from '../../config/integration-configs';
import {
  FlightSearchRequest,
  IFlightProvider,
  NormalizedDeal,
  NormalizedFlight,
} from './interfaces/flight-provider.interface';

// ---------------------------------------------------------------------------
// Raw Aviasales / Travelpayouts API shapes (v2 prices endpoint)
// Only the fields we actually use are typed; extras are ignored.
// ---------------------------------------------------------------------------

interface TpSearchTicket {
  airline: string;       // IATA airline code
  flight_number: number;
  origin: string;
  destination: string;
  depart_date: string;   // YYYY-MM-DD  (or ISO timestamp)
  return_date?: string;
  found_at: string;      // ISO timestamp
  duration: number;      // outbound duration in minutes
  duration_back?: number;
  stops: number;
  price: number;         // in request currency
  trip_class: number;    // 0=economy, 1=business, 2=first
  link?: string;
}

interface TpSearchResponse {
  success: boolean;
  data?: Record<string, TpSearchTicket>;
  error?: string;
}

// ---------------------------------------------------------------------------
// Helper: build a stable flight id from core ticket properties
// ---------------------------------------------------------------------------
function buildFlightId(ticket: TpSearchTicket, idx: number): string {
  return `flt_${ticket.airline}${ticket.flight_number}_${ticket.depart_date}_${idx}`;
}

// ---------------------------------------------------------------------------
// Helper: format HH:MM from ISO datetime or date string
// ---------------------------------------------------------------------------
function extractTime(isoOrDate: string): string {
  // "2026-04-10T09:30:00+07:00" → "09:30"
  // "2026-04-10" → "00:00" (fallback when time is unknown)
  const match = isoOrDate.match(/T(\d{2}:\d{2})/);
  return match ? match[1] : '00:00';
}

// ---------------------------------------------------------------------------
// Helper: compute arrival time from depart_time + duration
// ---------------------------------------------------------------------------
function addMinutesToTime(time: string, minutes: number): string {
  const [hStr, mStr] = time.split(':');
  const total = parseInt(hStr, 10) * 60 + parseInt(mStr, 10) + minutes;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Helper: tag computation (cheapest, fastest, best_value)
// ---------------------------------------------------------------------------
function computeTags(
  ticket: TpSearchTicket,
  allTickets: TpSearchTicket[],
): string[] {
  const tags: string[] = [];
  const minPrice = Math.min(...allTickets.map((t) => t.price));
  const minDur = Math.min(...allTickets.map((t) => t.duration));
  if (ticket.price === minPrice) tags.push('cheapest');
  if (ticket.duration === minDur) tags.push('fastest');
  // "best value" = not cheapest-and-slowest, not expensive-and-fast
  const avgPrice = allTickets.reduce((s, t) => s + t.price, 0) / allTickets.length;
  const avgDur = allTickets.reduce((s, t) => s + t.duration, 0) / allTickets.length;
  if (!tags.includes('cheapest') && !tags.includes('fastest')) {
    if (ticket.price <= avgPrice && ticket.duration <= avgDur) {
      tags.push('best_value');
    }
  }
  return tags;
}

// ---------------------------------------------------------------------------
// Airline name lookup (IATA → display name)
// Expand this map as needed.
// ---------------------------------------------------------------------------
const AIRLINE_NAMES: Record<string, string> = {
  KE: '대한항공',
  OZ: '아시아나항공',
  BX: '에어부산',
  '7C': '제주항공',
  TW: '티웨이항공',
  LJ: '진에어',
  RS: '에어서울',
  ZE: '이스타항공',
  VJ: 'VietJet Air',
  VN: '베트남항공',
  QH: 'Bamboo Airways',
  VZ: 'Thai VietJet Air',
  SQ: '싱가포르항공',
  TG: '태국항공',
};

function airlineName(code: string): string {
  return AIRLINE_NAMES[code] ?? code;
}

// ---------------------------------------------------------------------------
// Travelpayouts provider service
// ---------------------------------------------------------------------------

@Injectable()
export class TravelpayoutsService implements IFlightProvider {
  private readonly logger = new Logger(TravelpayoutsService.name);

  /** Base URL for the Aviasales v3 prices API. */
  private readonly baseUrl = 'https://api.travelpayouts.com/aviasales/v3';

  private readonly token: string;
  private readonly marker: string;

  constructor(private readonly config: ConfigService) {
    const cfg = getTravelpayoutsConfig(config);
    this.token = cfg.token;
    this.marker = cfg.marker;
  }

  /**
   * Strips the token value from a URL before passing it to the logger.
   * The token must never appear in log output.
   */
  private sanitizeUrl(url: string): string {
    return url.replace(/([?&])token=[^&]*/g, '$1token=***');
  }

  // -------------------------------------------------------------------------
  // Search flights via "prices_for_dates" endpoint
  // https://support.travelpayouts.com/hc/en-us/articles/203956163
  // -------------------------------------------------------------------------
  async searchFlights(req: FlightSearchRequest): Promise<NormalizedFlight[]> {
    if (!this.token) {
      this.logger.warn(
        '[travelpayouts] TRAVELPAYOUTS_API_TOKEN is not set — returning empty results',
      );
      return [];
    }

    try {
      const params = new URLSearchParams({
        origin: req.originCode,
        destination: req.destinationCode,
        departure_at: req.departureDate,
        ...(req.returnDate ? { return_at: req.returnDate } : {}),
        one_way: req.tripType === 'one_way' ? 'true' : 'false',
        currency: req.currency.toLowerCase(),
        sorting: 'price',
        limit: '20',
        token: this.token,
      });

      const url = `${this.baseUrl}/prices_for_dates?${params.toString()}`;
      const response = await fetch(url, {
        // Token is also accepted via header — belt-and-suspenders with the param above.
        headers: { 'X-Access-Token': this.token },
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) {
        this.logger.warn(
          `[travelpayouts] search HTTP ${response.status}: ${req.originCode}→${req.destinationCode} (${this.sanitizeUrl(url)})`,
        );
        return [];
      }

      const json = (await response.json()) as TpSearchResponse;
      if (!json.success || !json.data) {
        this.logger.warn(
          `[travelpayouts] search returned no data: ${json.error ?? 'unknown'}`,
        );
        return [];
      }

      const tickets = Object.values(json.data);
      return tickets.map((ticket, idx) =>
        this.normalizeTicket(ticket, idx, req.currency, tickets),
      );
    } catch (err) {
      this.logger.error(
        `[travelpayouts] searchFlights failed: ${(err as Error).message}`,
      );
      return [];
    }
  }

  // -------------------------------------------------------------------------
  // Deals — uses "prices_for_dates" on a curated route for the home screen.
  // Falls back to a static list when the API is unreachable or token is absent.
  // -------------------------------------------------------------------------
  async getDeals(): Promise<NormalizedDeal[]> {
    if (!this.token) {
      this.logger.debug(
        '[travelpayouts] TRAVELPAYOUTS_API_TOKEN not set — using static fallback deals',
      );
      return staticFallbackDeals();
    }

    try {
      const params = new URLSearchParams({
        origin: 'ICN',
        destination: 'DAD',
        currency: 'krw',
        limit: '5',
        token: this.token,
      });
      const url = `${this.baseUrl}/prices_for_dates?${params.toString()}`;
      const response = await fetch(url, {
        headers: { 'X-Access-Token': this.token },
        signal: AbortSignal.timeout(8_000),
      });

      if (response.ok) {
        const json = (await response.json()) as TpSearchResponse;
        if (json.success && json.data) {
          const tickets = Object.values(json.data).slice(0, 5);
          return tickets.map((t, idx) =>
            this.normalizeDeal(t, idx, 'ICN', 'DAD', '서울', '다낭', 'KRW'),
          );
        }
      } else {
        this.logger.warn(
          `[travelpayouts] getDeals HTTP ${response.status} (${this.sanitizeUrl(url)})`,
        );
      }
    } catch (err) {
      this.logger.warn(
        `[travelpayouts] getDeals failed: ${(err as Error).message} — using static fallback`,
      );
    }

    return staticFallbackDeals();
  }

  // -------------------------------------------------------------------------
  // Private normalizers
  // -------------------------------------------------------------------------

  private normalizeTicket(
    ticket: TpSearchTicket,
    idx: number,
    currency: string,
    allTickets: TpSearchTicket[],
  ): NormalizedFlight {
    const departureTime = extractTime(ticket.depart_date);
    const arrivalTime = addMinutesToTime(departureTime, ticket.duration);
    return {
      id: buildFlightId(ticket, idx),
      airlineName: airlineName(ticket.airline),
      airlineCode: ticket.airline,
      originCode: ticket.origin,
      destinationCode: ticket.destination,
      departureTime,
      arrivalTime,
      durationMinutes: ticket.duration,
      stops: ticket.stops,
      priceAmount: ticket.price,
      currency,
      tags: computeTags(ticket, allTickets),
      bookingUrl: ticket.link
        ? `https://www.travelpayouts.com${ticket.link}${this.marker ? `?marker=${this.marker}` : ''}`
        : null,
    };
  }

  private normalizeDeal(
    t: TpSearchTicket,
    idx: number,
    originCode: string,
    destinationCode: string,
    originLabel: string,
    destinationLabel: string,
    currency: string,
  ): NormalizedDeal {
    const departureTime = extractTime(t.depart_date);
    return {
      id: `deal_${t.airline}${t.flight_number}_${idx}`,
      airlineName: airlineName(t.airline),
      airlineCode: t.airline,
      originCode,
      destinationCode,
      originLabel,
      destinationLabel,
      departureTime,
      arrivalTime: addMinutesToTime(departureTime, t.duration),
      durationMinutes: t.duration,
      priceAmount: t.price,
      currency,
      dealTag: t.stops === 0 ? '직항' : `${t.stops}회 경유`,
    };
  }
}

// ---------------------------------------------------------------------------
// Static fallback deals (always shown in dev / when API is unavailable)
// ---------------------------------------------------------------------------
function staticFallbackDeals(): NormalizedDeal[] {
  return [
    {
      id: 'deal_KE_ICN_DAD_001',
      airlineName: '대한항공',
      airlineCode: 'KE',
      originCode: 'ICN',
      destinationCode: 'DAD',
      originLabel: '서울',
      destinationLabel: '다낭',
      departureTime: '09:30',
      arrivalTime: '13:00',
      durationMinutes: 270,
      priceAmount: 285000,
      currency: 'KRW',
      dealTag: '최단시간',
    },
    {
      id: 'deal_OZ_ICN_DAD_002',
      airlineName: '아시아나항공',
      airlineCode: 'OZ',
      originCode: 'ICN',
      destinationCode: 'DAD',
      originLabel: '서울',
      destinationLabel: '다낭',
      departureTime: '07:00',
      arrivalTime: '10:30',
      durationMinutes: 270,
      priceAmount: 270000,
      currency: 'KRW',
      dealTag: '최저가',
    },
    {
      id: 'deal_7C_ICN_DAD_003',
      airlineName: '제주항공',
      airlineCode: '7C',
      originCode: 'ICN',
      destinationCode: 'DAD',
      originLabel: '서울',
      destinationLabel: '다낭',
      departureTime: '14:00',
      arrivalTime: '17:40',
      durationMinutes: 280,
      priceAmount: 249000,
      currency: 'KRW',
      dealTag: '인기',
    },
  ];
}
