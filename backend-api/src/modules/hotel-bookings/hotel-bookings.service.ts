import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { HotelsRepository } from '../hotels/repositories/hotels.repository';
import { CreateHotelBookingDto } from './dto/create-hotel-booking.dto';
import { HotelBookingsRepository } from './repositories/hotel-bookings.repository';

// ---------------------------------------------------------------------------
// Response shape
// ---------------------------------------------------------------------------

export interface BookingConfirmResponse {
  bookingId: number;
  bookingCode: string;
  status: string;
  hotelName: string;
  roomName: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guestCountLabel: string;
  priceBreakdown: {
    roomPrice: number;
    taxAmount: number;
    totalAmount: number;
    currency: string;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateBookingCode(): string {
  return randomBytes(5).toString('hex').toUpperCase().slice(0, 9);
}

function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  return Math.round((b - a) / 86_400_000);
}

function pickName(
  row: Record<string, unknown>,
  field: string,
): string {
  // try localized ko first (used for room_types), then plain field (hotels)
  const ko = row[`${field}_ko`] ?? row[field];
  return typeof ko === 'string' && ko.length > 0 ? ko : '';
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class HotelBookingsService {
  constructor(
    private readonly bookingsRepo: HotelBookingsRepository,
    private readonly hotelsRepo: HotelsRepository,
  ) {}

  async createBooking(
    dto: CreateHotelBookingDto,
    userId: number,
  ): Promise<BookingConfirmResponse> {
    // 1. Validate hotel exists
    const hotel = await this.hotelsRepo.findDetailById(dto.hotelId);
    if (!hotel) throw new NotFoundException('Hotel not found');

    // 2. Validate room belongs to this hotel
    const room = await this.hotelsRepo.findRoomById(dto.roomId, dto.hotelId);
    if (!room) throw new NotFoundException('Room not found in the specified hotel');

    // 3. Compute nights
    const nights = nightsBetween(dto.checkInDate, dto.checkOutDate);
    if (nights < 1) {
      throw new BadRequestException('Check-out date must be after check-in date');
    }

    // 4. Pricing (10% tax)
    const roomPrice = room.nightly_price * nights;
    const taxAmount = Math.round(roomPrice * 0.1);
    const totalAmount = roomPrice + taxAmount;
    const currency = dto.currency;

    // 5. Guest count label
    const children = dto.children ?? 0;
    const guestCountLabel =
      children > 0
        ? `성인 ${dto.adults}명, 아동 ${children}명`
        : `성인 ${dto.adults}명`;

    // 6. Names (stored as Korean label in bookings table)
    const hotelRow = hotel as unknown as Record<string, unknown>;
    const roomRow = room as unknown as Record<string, unknown>;
    const hotelName = pickName(hotelRow, 'name') || hotel.slug;
    const roomName = pickName(roomRow, 'name') || `Room ${room.id}`;

    // 7. Insert
    const bookingCode = generateBookingCode();
    const { id: bookingId } = await this.bookingsRepo.insertHotelBooking({
      bookingCode,
      userId,
      hotelId: dto.hotelId,
      roomTypeId: dto.roomId,
      hotelName,
      roomName,
      checkInDate: dto.checkInDate,
      checkOutDate: dto.checkOutDate,
      nights,
      adults: dto.adults,
      children,
      guestFullName: dto.guestFullName,
      guestEmail: dto.guestEmail,
      specialRequest: dto.specialRequest ?? null,
      roomPrice,
      taxAmount,
      totalAmount,
      currency,
    });

    return {
      bookingId,
      bookingCode,
      status: 'confirmed',
      hotelName,
      roomName,
      checkInDate: dto.checkInDate,
      checkOutDate: dto.checkOutDate,
      nights,
      guestCountLabel,
      priceBreakdown: { roomPrice, taxAmount, totalAmount, currency },
    };
  }
}
