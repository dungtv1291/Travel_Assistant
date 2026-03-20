import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * GET /itineraries
 * Query params for the itinerary list endpoint.
 */
export class ItineraryQueryDto {
  /**
   * When true, return only saved itineraries.
   * Accepts ?savedOnly=true / ?savedOnly=1.
   */
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true' || value === '1' || value === true) return true;
    if (value === 'false' || value === '0' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  savedOnly?: boolean;
}
