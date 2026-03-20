import { HotelBooking } from '../../types/hotel.types';
import { TransportBooking } from '../../types/transport.types';
import { FlightBooking } from '../../types/flight.types';
import { httpClient } from '../http/http.client';
import { mapBackendBookingToHotel, mapBackendBookingToTransport } from '../adapters/booking.adapter';
import { mockHotelBookings, mockTransportBookings, mockFlightWatchlist } from '../../mock/bookings';

// ── Real implementation mirroring mock/bookings.service.ts ───────────────────
//
// NOTE: GET /bookings endpoints are not yet implemented in the backend.
//       Read operations fall back to mock data and will be replaced once the
//       bookings read module ships.

export const realBookingsService = {
  getHotelBookings: async (): Promise<HotelBooking[]> => {
    try {
      const data = await httpClient.get<{ items?: Record<string, unknown>[] }>(
        '/bookings?type=hotel',
      );
      const items = data.items ?? [];
      if (items.length > 0) {
        return items.map((item) => mapBackendBookingToHotel(item as any));
      }
    } catch {
      // Backend endpoint not yet available — fall through to mock
    }
    return mockHotelBookings;
  },

  getTransportBookings: async (): Promise<TransportBooking[]> => {
    try {
      const data = await httpClient.get<{ items?: Record<string, unknown>[] }>(
        '/bookings?type=transport',
      );
      const items = data.items ?? [];
      if (items.length > 0) {
        return items.map((item) => mapBackendBookingToTransport(item as any));
      }
    } catch {
      // Backend endpoint not yet available — fall through to mock
    }
    return mockTransportBookings;
  },

  getFlightWatchlist: async (): Promise<FlightBooking[]> => {
    // No backend flight watchlist endpoint — use mock data
    return mockFlightWatchlist;
  },

  cancelHotelBooking: async (id: string): Promise<void> => {
    try {
      await httpClient.patch(`/bookings/${id}`, { status: 'cancelled' });
    } catch {
      // Graceful: mutate mock in-memory as fallback
      const booking = mockHotelBookings.find((b) => b.id === id);
      if (booking) booking.status = 'cancelled';
    }
  },

  cancelTransportBooking: async (id: string): Promise<void> => {
    try {
      await httpClient.patch(`/bookings/${id}`, { status: 'cancelled' });
    } catch {
      const booking = mockTransportBookings.find((b) => b.id === id);
      if (booking) booking.status = 'cancelled';
    }
  },

  getBookingById: async (id: string): Promise<HotelBooking | TransportBooking | null> => {
    try {
      const data = await httpClient.get<Record<string, unknown>>(`/bookings/${id}`);
      const bookingType = (data as any).bookingType as string;
      if (bookingType === 'hotel') return mapBackendBookingToHotel(data as any);
      if (bookingType === 'transport') return mapBackendBookingToTransport(data as any);
    } catch {
      // Fall through to mock
    }
    return (
      mockHotelBookings.find((b) => b.id === id) ??
      mockTransportBookings.find((b) => b.id === id) ??
      null
    );
  },
};
