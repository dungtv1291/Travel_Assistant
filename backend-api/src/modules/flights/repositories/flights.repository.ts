import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/database.service';
import { NormalizedFlight } from '../../../integrations/travelpayouts/interfaces/flight-provider.interface';
import { SearchFlightsDto } from '../dto/search-flights.dto';

// ---------------------------------------------------------------------------
// Row types
// ---------------------------------------------------------------------------

export interface FlightCacheRow {
  id: number;
  cache_key: string;
  search_id: string;
  request_payload: SearchFlightsDto;
  response_payload: { results: NormalizedFlight[] };
  expires_at: string;
  created_at: string;
}

export interface FlightSearchLogRow {
  id: number;
  user_id: number | null;
  search_id: string;
  trip_type: string;
  origin_code: string;
  destination_code: string;
  departure_date: string;
  return_date: string | null;
  seat_class: string;
  passenger_count: number;
  flexible_days: number;
  provider_name: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

@Injectable()
export class FlightsRepository {
  constructor(private readonly db: DatabaseService) {}

  // -------------------------------------------------------------------------
  // Cache — read
  // -------------------------------------------------------------------------

  async findCache(cacheKey: string): Promise<FlightCacheRow | null> {
    return this.db.queryOne<FlightCacheRow>(
      `SELECT id, cache_key, search_id, request_payload, response_payload,
              expires_at, created_at
       FROM flight_search_cache
       WHERE cache_key = $1 AND expires_at > now()`,
      [cacheKey],
    );
  }

  // -------------------------------------------------------------------------
  // Cache — write (upsert on cache_key)
  // -------------------------------------------------------------------------

  async upsertCache(params: {
    cacheKey: string;
    searchId: string;
    requestPayload: SearchFlightsDto;
    responsePayload: { results: NormalizedFlight[] };
    ttlSeconds: number;
  }): Promise<void> {
    await this.db.execute(
      `INSERT INTO flight_search_cache
         (cache_key, search_id, request_payload, response_payload, expires_at)
       VALUES ($1, $2, $3, $4, now() + ($5 || ' seconds')::interval)
       ON CONFLICT (cache_key) DO UPDATE SET
         search_id        = EXCLUDED.search_id,
         request_payload  = EXCLUDED.request_payload,
         response_payload = EXCLUDED.response_payload,
         expires_at       = EXCLUDED.expires_at,
         created_at       = now()`,
      [
        params.cacheKey,
        params.searchId,
        JSON.stringify(params.requestPayload),
        JSON.stringify(params.responsePayload),
        String(params.ttlSeconds),
      ],
    );
  }

  // -------------------------------------------------------------------------
  // Search by searchId (for recommend endpoint — fetches cached results)
  // -------------------------------------------------------------------------

  async findCacheBySearchId(searchId: string): Promise<FlightCacheRow | null> {
    return this.db.queryOne<FlightCacheRow>(
      `SELECT id, cache_key, search_id, request_payload, response_payload,
              expires_at, created_at
       FROM flight_search_cache
       WHERE search_id = $1 AND expires_at > now()
       ORDER BY created_at DESC
       LIMIT 1`,
      [searchId],
    );
  }

  // -------------------------------------------------------------------------
  // Search log — insert
  // -------------------------------------------------------------------------

  async insertSearchLog(params: {
    userId: number | null;
    searchId: string;
    dto: SearchFlightsDto;
    providerName: string;
  }): Promise<void> {
    await this.db.execute(
      `INSERT INTO flight_search_logs
         (user_id, search_id, trip_type, origin_code, destination_code,
          departure_date, return_date, seat_class, passenger_count,
          flexible_days, provider_name)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        params.userId,
        params.searchId,
        params.dto.tripType,
        params.dto.originCode,
        params.dto.destinationCode,
        params.dto.departureDate,
        params.dto.returnDate ?? null,
        params.dto.seatClass,
        params.dto.passengerCount,
        params.dto.flexibleDays ?? 0,
        params.providerName,
      ],
    );
  }

  // -------------------------------------------------------------------------
  // Stale cache cleanup (call periodically, e.g. from a scheduled task)
  // -------------------------------------------------------------------------

  async deleteExpiredCache(): Promise<void> {
    await this.db.execute(
      `DELETE FROM flight_search_cache WHERE expires_at <= now()`
    );
  }
}
