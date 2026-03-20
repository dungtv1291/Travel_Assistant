import {
  IsDateString,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateHotelBookingDto {
  @IsInt()
  @Min(1)
  hotelId: number;

  @IsInt()
  @Min(1)
  roomId: number;

  /** ISO date string, e.g. "2026-04-10". */
  @IsDateString()
  checkInDate: string;

  /** ISO date string, e.g. "2026-04-12". */
  @IsDateString()
  checkOutDate: string;

  @IsInt()
  @Min(1)
  @Max(10)
  adults: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  children?: number;

  @IsString()
  @MaxLength(255)
  guestFullName: string;

  @IsEmail()
  guestEmail: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  specialRequest?: string;

  @IsIn(['KRW', 'VND', 'USD'])
  currency: string;
}
