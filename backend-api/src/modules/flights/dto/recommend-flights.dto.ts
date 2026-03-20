import { IsIn, IsOptional, IsString } from 'class-validator';

export class RecommendFlightsDto {
  /** Returned by POST /flights/search. */
  @IsString()
  searchId: string;

  @IsOptional()
  @IsIn(['best_value', 'cheapest', 'fastest'])
  preference?: 'best_value' | 'cheapest' | 'fastest';

  @IsOptional()
  @IsIn(['ko', 'en', 'vi'])
  language?: string;
}
