import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

/** Shared lang param used across all destination endpoints. */
export class LangQueryDto {
  @IsOptional()
  @IsIn(['ko', 'en', 'vi'])
  lang?: string;
}

/** Query parameters for GET /destinations */
export class DestinationsQueryDto extends LangQueryDto {
  /**
   * Free-text search against destination names (ko / en / vi).
   * Trimmed and capped at 100 chars to prevent overly wide ILIKE scans.
   */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : undefined,
  )
  search?: string;

  /** Filter by category badge label, e.g. "해변", "도시", "산". */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : undefined,
  )
  category?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  /** Column to sort by. Only whitelisted values are accepted. */
  @IsOptional()
  @IsIn(['sort_order', 'rating', 'review_count'])
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc', 'ASC', 'DESC'])
  sortOrder?: string;
}
