import { IsIn, IsOptional } from 'class-validator';

const LANGUAGES = ['ko', 'en', 'vi'] as const;
const CURRENCIES = ['KRW', 'VND', 'USD'] as const;
const SCOPES = ['full'] as const;

/**
 * POST /itineraries/:id/regenerate
 * Matches api-contract.md §13.5
 */
export class RegenerateItineraryDto {
  @IsOptional()
  @IsIn(SCOPES)
  regenerateScope?: string;

  @IsOptional()
  @IsIn(LANGUAGES)
  language?: string;

  @IsOptional()
  @IsIn(CURRENCIES)
  currency?: string;
}
