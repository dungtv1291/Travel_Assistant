import { Trip, AIItineraryRequest } from '../../types/trip.types';
import { httpClient } from '../http/http.client';
import { withListFallback, safeMapList } from '../utils/fallback';
import { getMockItineraries } from '../../mock/itineraries';
import {
  mapItinerary,
  buildGenerateItineraryDto,
  mapItineraryListItemToTrip,
} from '../adapters/itinerary.adapter';
import { useLanguageStore } from '../../store/language.store';
import { httpClient as _httpForDestSearch } from '../http/http.client';

// ── Real implementation mirroring mock/ai-planner.service.ts interface ─────────

export const realItinerariesService = {
  generateItinerary: async (request: AIItineraryRequest): Promise<Trip> => {
    const locale = useLanguageStore.getState().locale;
    const currency = 'KRW';

    // Resolve destination name → numeric ID via /destinations?search=
    const destinationId = await resolveDestinationId(request.destination);

    const dto = buildGenerateItineraryDto(request, destinationId, locale, currency);
    const res = await httpClient.post<Record<string, unknown>>('/itineraries/generate', dto);
    return mapItinerary(res as any);
  },

  regenerateItinerary: async (request: AIItineraryRequest): Promise<Trip> => {
    // Regenerate creates a brand-new itinerary — same flow as generate
    return realItinerariesService.generateItinerary(request);
  },

  getSavedTrips: async (): Promise<Trip[]> => {
    // GET /itineraries returns ItineraryListItem[] (not full ItineraryResponse)
    // [TEMP_FALLBACK] falls back to mock itineraries when backend is unavailable
    const locale = useLanguageStore.getState().locale;
    return withListFallback(
      async () => {
        const data = await httpClient.get<{ items?: Record<string, unknown>[] }>(
          '/itineraries?savedOnly=true',
        );
        return safeMapList(data.items ?? [], (item) => mapItineraryListItemToTrip(item as any));
      },
      getMockItineraries(locale),
    );
  },

  getTripById: async (id: string): Promise<Trip | null> => {
    try {
      const data = await httpClient.get<Record<string, unknown>>(`/itineraries/${id}`);
      return mapItinerary(data as any);
    } catch {
      return null;
    }
  },

  saveTrip: async (id: string): Promise<void> => {
    await httpClient.post(`/itineraries/${id}/save`);
  },

  regenerateTripById: async (id: string, scope?: string): Promise<Trip> => {
    const locale = useLanguageStore.getState().locale;
    const res = await httpClient.post<Record<string, unknown>>(`/itineraries/${id}/regenerate`, {
      regenerateScope: scope ?? 'full',
      language: locale,
      currency: 'KRW',
    });
    return mapItinerary(res as any);
  },
};

// ── Helper: resolve destination name to numeric ID ────────────────────────────

async function resolveDestinationId(destinationName: string): Promise<number> {
  try {
    const encoded = encodeURIComponent(destinationName);
    const res = await _httpForDestSearch.get<{ items?: Array<{ id: number }> }>(
      `/destinations?search=${encoded}&limit=1`,
    );
    const firstId = res.items?.[0]?.id;
    if (firstId) return firstId;
  } catch {
    // ignore
  }
  // Fallback: use 0 — backend will handle the validation error
  return 0;
}
