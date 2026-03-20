import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class SearchFlightsDto {
  @IsIn(['one_way', 'round_trip'])
  tripType: 'one_way' | 'round_trip';

  /** IATA airport or city code, e.g. "ICN". */
  @IsString()
  originCode: string;

  /** IATA airport or city code, e.g. "DAD". */
  @IsString()
  destinationCode: string;

  @IsDateString()
  departureDate: string;

  /** Required for round_trip. */
  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @IsIn(['economy', 'premium_economy', 'business', 'first'])
  seatClass: 'economy' | 'premium_economy' | 'business' | 'first';

  @IsInt()
  @Min(1)
  @Max(9)
  passengerCount: number;

  /** ±n days around departureDate. 0 = exact date only. */
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(7)
  flexibleDays?: number;

  @IsOptional()
  @IsIn(['ko', 'en', 'vi'])
  language?: string;

  @IsOptional()
  @IsIn(['KRW', 'VND', 'USD'])
  currency?: string;
}
