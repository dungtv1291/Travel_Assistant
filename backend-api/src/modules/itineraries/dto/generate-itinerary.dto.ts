import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

const TRAVEL_STYLES = ['culture', 'beach', 'activity', 'food', 'shopping', 'healing'] as const;
const INTERESTS = [
  'history', 'nature', 'nightlife', 'art', 'sports', 'wellness', 'photography', 'local_food',
] as const;
const TRAVELER_TYPES = ['solo', 'couple', 'family', 'friends'] as const;
const BUDGET_LEVELS = ['budget', 'medium', 'luxury'] as const;
const PACES = ['relaxed', 'balanced', 'active'] as const;
const LANGUAGES = ['ko', 'en', 'vi'] as const;
const CURRENCIES = ['KRW', 'VND', 'USD'] as const;

/**
 * POST /itineraries/generate
 * Matches api-contract.md §13.1
 */
export class GenerateItineraryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  destinationId!: number;

  /** Optional trip start date in ISO 8601 format (YYYY-MM-DD). */
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  nights!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(31)
  days!: number;

  @IsIn(TRAVELER_TYPES)
  travelerType!: string;

  @IsIn(BUDGET_LEVELS)
  budgetLevel!: string;

  @IsIn(PACES)
  pace!: string;

  @IsArray()
  @ArrayMaxSize(6)
  @IsIn(TRAVEL_STYLES, { each: true })
  travelStyles!: string[];

  @IsArray()
  @ArrayMaxSize(8)
  @IsIn(INTERESTS, { each: true })
  interests!: string[];

  @IsIn(LANGUAGES)
  language!: string;

  @IsIn(CURRENCIES)
  currency!: string;
}
