import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { withTransaction } from '../../../database/transaction';

// ---------------------------------------------------------------------------
// Row types
// ---------------------------------------------------------------------------

export interface BookingRow {
  id: number;
  booking_code: string;
  user_id: number;
  booking_type: string;
  status: string;
  title: string;
  subtitle: string | null;
  start_date: string | null;
  end_date: string | null;
  nights_or_usage_label: string | null;
  guest_info_label: string | null;
  total_amount: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface HotelBookingDetailRow {
  id: number;
  booking_id: number;
  hotel_id: number;
  room_type_id: number;
  guest_full_name: string;
  guest_email: string;
  adults: number;
  children: number;
  special_request: string | null;
  room_price: number;
  tax_amount: number;
  check_in_date: string;
  check_out_date: string;
  nights: number;
}

export interface InsertHotelBookingParams {
  bookingCode: string;
  userId: number;
  hotelId: number;
  roomTypeId: number;
  hotelName: string;
  roomName: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  adults: number;
  children: number;
  guestFullName: string;
  guestEmail: string;
  specialRequest: string | null;
  roomPrice: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

@Injectable()
export class HotelBookingsRepository {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Inserts `bookings` master row + `hotel_booking_details` row in one
   * transaction, returns the new booking id and code.
   */
  async insertHotelBooking(
    params: InsertHotelBookingParams,
  ): Promise<{ id: number; bookingCode: string }> {
    let bookingId!: number;

    await withTransaction(this.db, async (client) => {
      const guestInfoLabel =
        params.children > 0
          ? `성인 ${params.adults}명, 아동 ${params.children}명`
          : `성인 ${params.adults}명`;

      const nightsLabel =
        params.nights === 1 ? '1박' : `${params.nights}박`;

      const bookingResult = await client.query<{ id: number }>(
        `INSERT INTO bookings (
           booking_code, user_id, booking_type, status,
           title, subtitle,
           start_date, end_date,
           nights_or_usage_label, guest_info_label,
           total_amount, currency
         ) VALUES ($1,$2,'hotel','confirmed',$3,$4,$5,$6,$7,$8,$9,$10)
         RETURNING id`,
        [
          params.bookingCode,
          params.userId,
          params.hotelName,
          params.roomName,
          params.checkInDate,
          params.checkOutDate,
          nightsLabel,
          guestInfoLabel,
          params.totalAmount,
          params.currency,
        ],
      );

      bookingId = bookingResult.rows[0].id;

      await client.query(
        `INSERT INTO hotel_booking_details (
           booking_id, hotel_id, room_type_id,
           guest_full_name, guest_email,
           adults, children, special_request,
           room_price, tax_amount,
           check_in_date, check_out_date, nights
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [
          bookingId,
          params.hotelId,
          params.roomTypeId,
          params.guestFullName,
          params.guestEmail,
          params.adults,
          params.children,
          params.specialRequest,
          params.roomPrice,
          params.taxAmount,
          params.checkInDate,
          params.checkOutDate,
          params.nights,
        ],
      );
    });

    return { id: bookingId, bookingCode: params.bookingCode };
  }

  async findByIdAndUserId(id: number, userId: number): Promise<{
    booking: BookingRow;
    detail: HotelBookingDetailRow;
  } | null> {
    const [booking, detail] = await Promise.all([
      this.db.queryOne<BookingRow>(
        `SELECT id, booking_code, user_id, booking_type, status,
                title, subtitle, start_date, end_date,
                nights_or_usage_label, guest_info_label,
                total_amount, currency, created_at, updated_at
         FROM bookings
         WHERE id = $1 AND user_id = $2 AND booking_type = 'hotel'`,
        [id, userId],
      ),
      this.db.queryOne<HotelBookingDetailRow>(
        `SELECT d.id, d.booking_id, d.hotel_id, d.room_type_id,
                d.guest_full_name, d.guest_email, d.adults, d.children,
                d.special_request, d.room_price, d.tax_amount,
                d.check_in_date, d.check_out_date, d.nights
         FROM hotel_booking_details d
         JOIN bookings b ON b.id = d.booking_id
         WHERE d.booking_id = $1 AND b.user_id = $2`,
        [id, userId],
      ),
    ]);

    if (!booking || !detail) return null;
    return { booking, detail };
  }
}
