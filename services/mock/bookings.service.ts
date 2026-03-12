import { delay } from '../api.client';
import { mockHotelBookings, mockTransportBookings, mockFlightWatchlist } from '../../mock/bookings';
import type { HotelBooking } from '../../types/hotel.types';
import type { TransportBooking } from '../../types/transport.types';
import type { FlightBooking } from '../../types/flight.types';

export const bookingsService = {
  getHotelBookings: async (): Promise<HotelBooking[]> => {
    await delay(500);
    return mockHotelBookings;
  },

  getTransportBookings: async (): Promise<TransportBooking[]> => {
    await delay(400);
    return mockTransportBookings;
  },

  getFlightWatchlist: async (): Promise<FlightBooking[]> => {
    await delay(300);
    return mockFlightWatchlist;
  },

  cancelHotelBooking: async (id: string): Promise<void> => {
    await delay(800);
    const booking = mockHotelBookings.find(b => b.id === id);
    if (!booking) throw new Error('예약을 찾을 수 없습니다.');
    if (booking.status === 'cancelled') throw new Error('이미 취소된 예약입니다.');
    booking.status = 'cancelled';
  },

  cancelTransportBooking: async (id: string): Promise<void> => {
    await delay(800);
    const booking = mockTransportBookings.find(b => b.id === id);
    if (!booking) throw new Error('예약을 찾을 수 없습니다.');
    if (booking.status === 'cancelled') throw new Error('이미 취소된 예약입니다.');
    booking.status = 'cancelled';
  },

  getBookingById: async (id: string): Promise<HotelBooking | TransportBooking | null> => {
    await delay(200);
    return (
      mockHotelBookings.find(b => b.id === id) ??
      mockTransportBookings.find(b => b.id === id) ??
      null
    );
  },
};
