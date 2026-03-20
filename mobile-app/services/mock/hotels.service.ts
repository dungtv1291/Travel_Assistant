import { delay } from '../api.client';
import { mockHotels, mockRooms } from '../../mock/hotels';
import { Hotel, HotelBooking, HotelReview, RoomType } from '../../types/hotel.types';
import { USE_REAL_API } from '../config/api.config';
import { realHotelsService } from '../real/hotels.service';

const _mock = {
  getRecommended: async (): Promise<Hotel[]> => {
    await delay(700);
    return mockHotels.filter(h => h.isRecommended);
  },

  getAll: async (): Promise<Hotel[]> => {
    await delay(600);
    return mockHotels;
  },

  getById: async (id: string): Promise<Hotel | null> => {
    await delay(400);
    return mockHotels.find(h => h.id === id) ?? null;
  },

  getByDestination: async (destinationId: string): Promise<Hotel[]> => {
    await delay(600);
    return mockHotels.filter(h => h.destinationId === destinationId);
  },

  getRooms: async (hotelId: string): Promise<RoomType[]> => {
    await delay(400);
    return mockRooms.filter(r => r.hotelId === hotelId);
  },

  getReviews: async (hotelId: string): Promise<HotelReview[]> => {
    await delay(400);
    return mockHotels.find(h => h.id === hotelId)?.reviews ?? [];
  },

  search: async (query: string): Promise<Hotel[]> => {
    await delay(500);
    const q = query.toLowerCase();
    return mockHotels.filter(
      h =>
        h.name.toLowerCase().includes(q) ||
        h.nameKo.includes(q) ||
        h.city.includes(q)
    );
  },

  createBooking: async (bookingData: Omit<HotelBooking, 'id' | 'bookedAt' | 'confirmationCode'>): Promise<HotelBooking> => {
    await delay(1500);
    return {
      ...bookingData,
      id: `hbooking-${Date.now()}`,
      bookedAt: new Date().toISOString(),
      confirmationCode: `VTH${Math.random().toString(36).toUpperCase().slice(2, 8)}`,
    };
  },
};

export const hotelsService = USE_REAL_API ? realHotelsService : _mock;
