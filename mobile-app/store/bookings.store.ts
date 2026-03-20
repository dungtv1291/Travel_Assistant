import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HotelBooking } from '../types/hotel.types';
import { TransportBooking } from '../types/transport.types';
import { FlightBooking } from '../types/flight.types';

interface BookingsStore {
  hotelBookings: HotelBooking[];
  transportBookings: TransportBooking[];
  flightWatchlist: FlightBooking[];

  addHotelBooking: (booking: HotelBooking) => void;
  addTransportBooking: (booking: TransportBooking) => void;
  addToFlightWatchlist: (booking: FlightBooking) => void;
  removeFromWatchlist: (id: string) => void;
  cancelHotelBooking: (id: string) => void;
  cancelTransportBooking: (id: string) => void;
}

export const useBookingsStore = create<BookingsStore>()(
  persist(
    (set) => ({
  hotelBookings: [
    {
      id: 'hbooking-sample-1',
      hotelId: 'hotel-1',
      hotelName: 'The Nam Hai Resort',
      hotelImage: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
      roomId: 'room-1-1',
      roomName: '가든 풀 빌라',
      checkIn: '2026-04-15',
      checkOut: '2026-04-18',
      nights: 3,
      guests: 2,
      pricePerNight: 350,
      totalPrice: 1050,
      currency: 'USD',
      status: 'confirmed',
      bookedAt: '2026-03-10T09:00:00Z',
      confirmationCode: 'VTHABC123',
      guestName: 'Kim Minji',
      guestEmail: 'kim.travel@gmail.com',
    },
  ],
  transportBookings: [
    {
      id: 'tbooking-sample-1',
      vehicleId: 'trans-1',
      vehicleName: '공항 픽업 (세단)',
      vehicleImage: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
      type: 'airport_pickup',
      pickupLocation: '다낭국제공항',
      dropoffLocation: '퓨전 마이아 다낭',
      pickupDate: '2026-04-15',
      passengerCount: 2,
      totalPrice: 350000,
      currency: 'VND',
      status: 'confirmed',
      bookedAt: '2026-03-10T09:05:00Z',
      confirmationCode: 'VTTXYZ789',
      driverName: 'Nguyen Van An',
      driverPhone: '+84-012-345-678',
    },
  ],
  flightWatchlist: [],

  addHotelBooking: (booking) =>
    set(state => ({ hotelBookings: [...state.hotelBookings, booking] })),

  addTransportBooking: (booking) =>
    set(state => ({ transportBookings: [...state.transportBookings, booking] })),

  addToFlightWatchlist: (booking) =>
    set(state => ({ flightWatchlist: [...state.flightWatchlist, booking] })),

  removeFromWatchlist: (id) =>
    set(state => ({ flightWatchlist: state.flightWatchlist.filter(f => f.id !== id) })),

  cancelHotelBooking: (id) =>
    set(state => ({
      hotelBookings: state.hotelBookings.map(b =>
        b.id === id ? { ...b, status: 'cancelled' } : b
      ),
    })),

  cancelTransportBooking: (id) =>
    set(state => ({
      transportBookings: state.transportBookings.map(b =>
        b.id === id ? { ...b, status: 'cancelled' } : b
      ),
    })),
    }),
    {
      name: '@vt_bookings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hotelBookings: state.hotelBookings,
        transportBookings: state.transportBookings,
        flightWatchlist: state.flightWatchlist,
      }),
    }
  )
);
