// ─── Bookings service ─────────────────────────────────────────────────────
// Admin operations for viewing and managing hotel/transport bookings.

import { api, createResourceService } from '@/lib/api';
import type { Booking } from '@/types';

const BASE = '/admin/bookings';

// ─── Core listing and detail ───────────────────────────────────────────────

export const bookingsService = createResourceService<Booking>(BASE);

// ─── Status update operations ──────────────────────────────────────────────
// Quick actions for changing booking status (if backend supports it)

export async function confirmBooking(bookingId: number): Promise<Booking> {
  return api.patch<Booking>(`${BASE}/${bookingId}/confirm`, {});
}

export async function cancelBooking(bookingId: number): Promise<Booking> {
  return api.patch<Booking>(`${BASE}/${bookingId}/cancel`, {});
}

export async function updateBookingStatus(
  bookingId: number,
  status: 'pending' | 'confirmed' | 'cancelled',
): Promise<Booking> {
  return api.patch<Booking>(`${BASE}/${bookingId}/status`, { status });
}

// ─── Extended list params with booking-specific filters ────────────────────

export interface BookingListParams {
  page?: number;
  limit?: number;
  search?: string;
  booking_type?: 'hotel' | 'transport';
  status?: 'pending' | 'confirmed' | 'cancelled';
  sort_by?: 'created_at' | 'start_date' | 'total_amount';
  sort_order?: 'asc' | 'desc';
}