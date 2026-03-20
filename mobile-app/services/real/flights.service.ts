import { Flight, FlightSearchParams, AIFlightAnalysis } from '../../types/flight.types';
import { httpClient } from '../http/http.client';
import { withListFallback, safeMapList } from '../utils/fallback';
import { mapFlightItem, mapFlightRecommendation } from '../adapters/flight.adapter';
import { mockFlights } from '../../mock/flights';

interface ListResponse<T> {
  items?: T[];
}

// ── Search ID cache ───────────────────────────────────────────────────────────
// After /flights/search we receive a searchId used by /flights/recommend.
// We store it per-request so getAIAnalysis can call recommend in sequence.

let _lastSearchId: string | null = null;
let _lastSearchResults: Flight[] = [];

// ── Real implementation mirroring mock/flights.service.ts interface ───────────

export const realFlightsService = {
  getDeals: async (): Promise<Flight[]> => {
    // [TEMP_FALLBACK] falls back to mock flight deals on any error
    return withListFallback(
      async () => {
        const data = await httpClient.get<ListResponse<Record<string, unknown>>>('/flights/deals');
        const items: Record<string, unknown>[] = data.items ?? (data as any) ?? [];
        return safeMapList(items, (item) => mapFlightItem(item as any));
      },
      mockFlights.slice(0, 3),
    );
  },

  search: async (params: FlightSearchParams): Promise<Flight[]> => {
    const payload = {
      tripType: params.returnDate ? 'round_trip' : 'one_way',
      originCode: params.origin,
      destinationCode: params.destination,
      departureDate: params.departureDate,
      returnDate: params.returnDate ?? null,
      seatClass: params.class,
      passengerCount: params.passengers,
      flexibleDays: params.isFlexible ? 3 : 0,
      language: 'ko',
      currency: 'KRW',
    };
    const res = await httpClient.post<{ searchId?: string; results?: Record<string, unknown>[] }>(
      '/flights/search',
      payload,
    );
    _lastSearchId = res.searchId ?? null;
    // [TEMP_FALLBACK] safeMapList skips individual malformed flight items from the response
    const flights = safeMapList(res.results ?? [], (item) => mapFlightItem(item as any));
    _lastSearchResults = flights;
    return flights;
  },

  getAIAnalysis: async (params: FlightSearchParams): Promise<AIFlightAnalysis> => {
    // Ensure a search has been run first
    let flights = _lastSearchResults;
    if (flights.length === 0) {
      flights = await realFlightsService.search(params);
    }

    if (!_lastSearchId) {
      // No searchId available — return a simple synthetic analysis from flight data
      return buildFallbackAnalysis(flights);
    }

    try {
      const rec = await httpClient.post<Record<string, unknown>>('/flights/recommend', {
        searchId: _lastSearchId,
        preference: 'best_value',
        language: 'ko',
      });
      return mapFlightRecommendation(rec as any, flights);
    } catch {
      return buildFallbackAnalysis(flights);
    }
  },

  getById: async (id: string): Promise<Flight | null> => {
    // No dedicated backend endpoint — use in-memory cache then mock fallback
    const cached = _lastSearchResults.find((f) => f.id === id);
    if (cached) return cached;
    return mockFlights.find((f) => f.id === id) ?? null;
  },
};

// ── Internal helpers ──────────────────────────────────────────────────────────

function buildFallbackAnalysis(flights: Flight[]): AIFlightAnalysis {
  const sorted = [...flights].sort((a, b) => a.price - b.price);
  const cheapest = sorted[0] ?? flights[0];
  const fastest = flights.find((f) => f.tags.includes('fastest')) ?? flights[0];
  const bestValue = flights.find((f) => f.tags.includes('best_value')) ?? sorted[0] ?? flights[0];
  return {
    cheapest,
    fastest,
    bestValue,
    summary: '',
    recommendation: '',
    insights: [],
  };
}
