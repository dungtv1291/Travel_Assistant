import { Hotel, HotelBooking, HotelReview, RoomType } from '../../types/hotel.types';
import { httpClient } from '../http/http.client';
import { withFallback, withListFallback, safeMapList } from '../utils/fallback';
import { mockHotels } from '../../mock/hotels';
import {
  mapHotelListItem,
  mapHotelDetail,
  mapRoom,
  mapHotelPolicies,
  mapHotelBookingResponse,
  mapAmenitiesResponse,
  mapHotelReviewsResponse,
} from '../adapters/hotel.adapter';

// ── Paginated list helper ─────────────────────────────────────────────────────

interface ListResponse<T> {
  items: T[];
}

// ── Real implementation mirroring mock/hotels.service.ts interface ────────────

export const realHotelsService = {
  getRecommended: async (): Promise<Hotel[]> => {
    // [TEMP_FALLBACK] falls back to mock recommended hotels on any error
    return withListFallback(
      async () => {
        const data = await httpClient.get<ListResponse<Record<string, unknown>>>('/hotels/recommended');
        return safeMapList(data.items ?? [], (item) => mapHotelListItem(item as any));
      },
      mockHotels.filter((h) => h.isRecommended),
    );
  },

  getAll: async (): Promise<Hotel[]> => {
    // [TEMP_FALLBACK] falls back to full mock hotel list on any error
    return withListFallback(
      async () => {
        const data = await httpClient.get<ListResponse<Record<string, unknown>>>('/hotels?limit=50');
        return safeMapList(data.items ?? [], (item) => mapHotelListItem(item as any));
      },
      mockHotels,
    );
  },

  getById: async (id: string): Promise<Hotel | null> => {
    try {
      const [detail, policiesData, amenitiesData] = await Promise.all([
        httpClient.get<Record<string, unknown>>(`/hotels/${id}`),
        httpClient.get<Record<string, unknown>>(`/hotels/${id}/policies`).catch(() => ({})),
        httpClient.get<Record<string, unknown>>(`/hotels/${id}/amenities`).catch(() => ({ amenities: [] })),
      ]);
      const base = mapHotelDetail(detail as any);
      const policies = mapHotelPolicies(policiesData as any);
      const { amenities, descriptionKo } = mapAmenitiesResponse(amenitiesData as any);
      return {
        ...base,
        amenities,
        descriptionKo: descriptionKo ?? base.descriptionKo,
        policies,
        rooms: [],
      } as Hotel;
    } catch {
      return null;
    }
  },

  getByDestination: async (destinationId: string): Promise<Hotel[]> => {
    try {
      const numericId = parseInt(destinationId, 10);
      if (isNaN(numericId)) return [];
      const data = await httpClient.get<ListResponse<Record<string, unknown>>>(
        `/destinations/${numericId}/hotels`,
      );
      return (data.items ?? []).map((item) => mapHotelListItem(item as any));
    } catch {
      return [];
    }
  },

  getRooms: async (hotelId: string): Promise<RoomType[]> => {
    try {
      const data = await httpClient.get<Record<string, unknown>>(`/hotels/${hotelId}/rooms`);
      // backend returns { rooms: [...] } not { items: [...] }
      const roomsArr = (data as any).rooms ?? (data as any).items ?? [];
      return (roomsArr as Record<string, unknown>[]).map((r) => mapRoom(r as any, hotelId));
    } catch {
      return [];
    }
  },

  getReviews: async (hotelId: string): Promise<HotelReview[]> => {
    try {
      const data = await httpClient.get<Record<string, unknown>>(`/hotels/${hotelId}/reviews`);
      return mapHotelReviewsResponse(data as any);
    } catch {
      return [];
    }
  },

  search: async (query: string): Promise<Hotel[]> => {
    // [TEMP_FALLBACK] client-side mock search when backend search is unavailable
    const q = query.toLowerCase();
    return withFallback(
      async () => {
        const encoded = encodeURIComponent(query);
        const data = await httpClient.get<ListResponse<Record<string, unknown>>>(
          `/hotels?search=${encoded}&limit=50`,
        );
        return safeMapList(data.items ?? [], (item) => mapHotelListItem(item as any));
      },
      mockHotels.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.nameKo.includes(q) ||
          h.city.includes(q),
      ),
    );
  },

  createBooking: async (
    bookingData: Omit<HotelBooking, 'id' | 'bookedAt' | 'confirmationCode'>,
  ): Promise<HotelBooking> => {
    const payload = {
      hotelId: parseInt(bookingData.hotelId, 10) || bookingData.hotelId,
      roomId: parseInt(bookingData.roomId, 10) || bookingData.roomId,
      checkInDate: bookingData.checkIn,
      checkOutDate: bookingData.checkOut,
      adults: bookingData.guests,
      children: 0,
      guestFullName: bookingData.guestName,
      guestEmail: bookingData.guestEmail,
      currency: bookingData.currency,
    };
    const res = await httpClient.post<Record<string, unknown>>('/hotel-bookings', payload);
    return mapHotelBookingResponse(
      res as any,
      bookingData.hotelId,
      bookingData.roomId,
      bookingData.hotelImage,
      bookingData.guestName ?? '',
      bookingData.guestEmail ?? '',
      bookingData.guests,
    );
  },
};
