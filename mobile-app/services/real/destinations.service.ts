import { Destination, Attraction } from '../../types/destination.types';
import { httpClient } from '../http/http.client';
import { withFallback, withListFallback, safeMapList } from '../utils/fallback';
import {
  mapFeaturedDestination,
  mapDestinationListItem,
  mapDestinationDetail,
  mapPlace,
  mapWeatherResponse,
  mapTipsResponse,
  mapDestinationHotelCard,
  type MappedWeather,
  type MappedTips,
} from '../adapters/destination.adapter';
import { Hotel } from '../../types/hotel.types';
import { mockDestinations, mockAttractions } from '../../mock/destinations';

// ── Paginated list helper ─────────────────────────────────────────────────────

interface ListResponse<T> {
  items: T[];
  pagination?: { page: number; limit: number; totalItems: number; totalPages: number };
}

// ── Real implementation mirroring mock/destinations.service.ts interface ──────

export const realDestinationsService = {
  getFeatured: async (): Promise<Destination[]> => {
    // [TEMP_FALLBACK] falls back to featured mock destinations on any network or mapping error
    return withListFallback(
      async () => {
        const data = await httpClient.get<ListResponse<Record<string, unknown>>>('/destinations/featured');
        return safeMapList(data.items ?? [], (item) => mapFeaturedDestination(item as any));
      },
      mockDestinations.filter((d) => d.isFeatured),
    );
  },

  getAll: async (): Promise<Destination[]> => {
    // [TEMP_FALLBACK] falls back to full mock destination list on any error
    return withListFallback(
      async () => {
        const data = await httpClient.get<ListResponse<Record<string, unknown>>>('/destinations?limit=50');
        return safeMapList(data.items ?? [], (item) => mapDestinationListItem(item as any));
      },
      mockDestinations,
    );
  },

  getById: async (id: string): Promise<Destination | null> => {
    // Accept both slug strings (e.g. 'hoi-an') and numeric string IDs (e.g. '1')
    try {
      const data = await httpClient.get<Record<string, unknown>>(`/destinations/${id}`);
      return mapDestinationDetail(data as any);
    } catch {
      return null;
    }
  },

  search: async (query: string): Promise<Destination[]> => {
    // [TEMP_FALLBACK] client-side mock search when backend search is unavailable
    const q = query.toLowerCase();
    return withFallback(
      async () => {
        const encoded = encodeURIComponent(query);
        const data = await httpClient.get<ListResponse<Record<string, unknown>>>(
          `/destinations?search=${encoded}&limit=50`,
        );
        return safeMapList(data.items ?? [], (item) => mapDestinationListItem(item as any));
      },
      mockDestinations.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.nameKo.includes(q) ||
          d.tags.some((t) => t.includes(q)),
      ),
    );
  },

  getByCategory: async (category: string): Promise<Destination[]> => {
    // [TEMP_FALLBACK] falls back to mock category filter when backend is unavailable
    return withListFallback(
      async () => {
        const encoded = encodeURIComponent(category);
        const data = await httpClient.get<ListResponse<Record<string, unknown>>>(
          `/destinations?category=${encoded}&limit=50`,
        );
        return safeMapList(data.items ?? [], (item) => mapDestinationListItem(item as any));
      },
      mockDestinations.filter((d) => d.category === category),
    );
  },

  getAttractionsByDestination: async (destinationId: string): Promise<Attraction[]> => {
    try {
      const numericId = parseInt(destinationId, 10);
      if (isNaN(numericId)) {
        // ID is a slug string — fall through to mock fallback below
        throw new Error('non-numeric id');
      }
      const data = await httpClient.get<ListResponse<Record<string, unknown>>>(
        `/destinations/${numericId}/places`,
      );
      return (data.items ?? []).map((item) => mapPlace(item as any, destinationId));
    } catch {
      // Graceful fallback: return attractions from mock data that match the id
      return mockAttractions.filter((a) => a.destinationId === destinationId);
    }
  },

  /** No dedicated backend endpoint — uses mock data sorted by isPopularWithKoreans. */
  getPopularWithKoreans: async (): Promise<Attraction[]> => {
    return mockAttractions.filter((a) => a.isPopularWithKoreans);
  },

  getAttractionById: async (id: string): Promise<Attraction | null> => {
    // No backend endpoint yet — use local mock
    return mockAttractions.find((a) => a.id === id) ?? null;
  },

  /**
   * GET /destinations/:id/weather
   * Returns live weather + season blocks + packing list.
   * Falls back to adapter-level defaults when the endpoint is unavailable.
   */
  getWeatherData: async (destinationId: string, fallbackBestSeason = ''): Promise<MappedWeather> => {
    try {
      const numericId = parseInt(destinationId, 10);
      if (isNaN(numericId)) throw new Error('non-numeric id');
      const data = await httpClient.get<Record<string, unknown>>(
        `/destinations/${numericId}/weather`,
      );
      return mapWeatherResponse(data as any, fallbackBestSeason);
    } catch {
      // Return sensible defaults so the weather tab always renders
      return mapWeatherResponse({}, fallbackBestSeason);
    }
  },

  /**
   * GET /destinations/:id/tips
   * Returns travel tips list + essential apps.
   * Falls back to the provided default tip strings when the endpoint is unavailable.
   */
  getTipsData: async (destinationId: string, defaultTips: string[] = []): Promise<MappedTips> => {
    try {
      const numericId = parseInt(destinationId, 10);
      if (isNaN(numericId)) throw new Error('non-numeric id');
      const data = await httpClient.get<Record<string, unknown>>(
        `/destinations/${numericId}/tips`,
      );
      return mapTipsResponse(data as any, defaultTips);
    } catch {
      return mapTipsResponse({}, defaultTips);
    }
  },

  /**
   * GET /destinations/:id/hotels  (destination-scoped list)
   * Returns the lightweight hotel cards scoped to this destination.
   * Falls back to an empty list when numeric id is unavailable.
   */
  getHotelsByDestination: async (destinationId: string): Promise<Hotel[]> => {
    try {
      const numericId = parseInt(destinationId, 10);
      if (isNaN(numericId)) return [];
      const data = await httpClient.get<{ items?: Record<string, unknown>[] }>(
        `/destinations/${numericId}/hotels`,
      );
      return (data.items ?? []).map((item) => mapDestinationHotelCard(item as any));
    } catch {
      return [];
    }
  },
};
