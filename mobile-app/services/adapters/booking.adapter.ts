import { HotelBooking } from '../../types/hotel.types';
import { TransportBooking } from '../../types/transport.types';

// ── Unified backend booking item (GET /bookings items[]) ─────────────────────
//
// NOTE: The /bookings read endpoint is not yet implemented in the backend.
//       This adapter is defined in advance so it is ready when the module
//       ships.  Until then, bookings.service.ts falls back to mock data.

interface BackendBookingItem {
  id: number | string;
  bookingType: 'hotel' | 'transport';
  title?: string;
  subtitle?: string;
  startDate?: string;
  endDate?: string;
  nightsOrUsage?: number;
  guestInfoLabel?: string;
  totalAmount?: number;
  currency?: string;
  confirmationCode?: string;
  status?: string;
  coverImage?: string | null;
}

// ── Adapter: backend item → HotelBooking ─────────────────────────────────────

export function mapBackendBookingToHotel(raw: BackendBookingItem): HotelBooking {
  // [TEMP_FALLBACK] guard: service callers wrap in safeMapList or try/catch
  if (!raw) throw new Error('null booking item');
  return {
    id: String(raw.id),
    hotelId: '',
    hotelName: raw.title ?? '',
    hotelImage: raw.coverImage ?? '',
    roomId: '',
    roomName: raw.subtitle ?? '',
    checkIn: raw.startDate ?? '',
    checkOut: raw.endDate ?? '',
    nights: raw.nightsOrUsage ?? 0,
    guests: 1,
    pricePerNight: raw.nightsOrUsage && raw.totalAmount
      ? Math.round(raw.totalAmount / raw.nightsOrUsage)
      : 0,
    totalPrice: raw.totalAmount ?? 0,
    currency: raw.currency ?? 'KRW',
    status: (raw.status as HotelBooking['status']) ?? 'confirmed',
    bookedAt: raw.startDate ?? new Date().toISOString(),
    confirmationCode: raw.confirmationCode ?? '',
    guestName: raw.guestInfoLabel ?? '',
    guestEmail: '',
  };
}

// ── Adapter: backend item → TransportBooking ──────────────────────────────────

export function mapBackendBookingToTransport(raw: BackendBookingItem): TransportBooking {
  // [TEMP_FALLBACK] guard: service callers wrap in safeMapList or try/catch
  if (!raw) throw new Error('null booking item');
  return {
    id: String(raw.id),
    vehicleId: '',
    vehicleName: raw.title ?? '',
    vehicleImage: raw.coverImage ?? '',
    type: 'airport_pickup',
    pickupLocation: raw.subtitle ?? '',
    pickupDate: raw.startDate ?? '',
    passengerCount: 1,
    totalPrice: raw.totalAmount ?? 0,
    currency: raw.currency ?? 'KRW',
    status: (raw.status as TransportBooking['status']) ?? 'confirmed',
    bookedAt: raw.startDate ?? new Date().toISOString(),
    confirmationCode: raw.confirmationCode ?? '',
  };
}
