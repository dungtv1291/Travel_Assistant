import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { randomBytes } from 'crypto';
import {
  FLIGHT_PROVIDER_SERVICE,
  IFlightProvider,
  NormalizedDeal,
  NormalizedFlight,
} from '../../integrations/travelpayouts/interfaces/flight-provider.interface';
import {
  FLIGHT_AI_SERVICE,
  IFlightAiService,
} from '../../integrations/openai/interfaces/flight-ai.interface';
import { RedisService } from '../../common/services/redis.service';
import { FlightsRepository } from './repositories/flights.repository';
import { SearchFlightsDto } from './dto/search-flights.dto';
import { RecommendFlightsDto } from './dto/recommend-flights.dto';
import { FlightRecommendResult } from '../../integrations/openai/interfaces/flight-ai.interface';

// ---------------------------------------------------------------------------
// Cache TTL  (seconds)
// ---------------------------------------------------------------------------
const REDIS_DEALS_TTL = 30 * 60;       // 30 min
const REDIS_SEARCH_TTL = 30 * 60;      // 30 min
const DB_SEARCH_TTL = 60 * 60;         // 1 hour (DB cache is slightly longer)

// ---------------------------------------------------------------------------
// Response shapes
// ---------------------------------------------------------------------------

export interface FlightSearchResponse {
  searchId: string;
  results: NormalizedFlight[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateSearchId(): string {
  return `fsr_${randomBytes(6).toString('hex')}`;
}

/**
 * Deterministic cache key for a search request.
 * All fields that affect results are included; order is normalized.
 */
function buildCacheKey(dto: SearchFlightsDto): string {
  const canonical = [
    dto.tripType,
    dto.originCode.toUpperCase(),
    dto.destinationCode.toUpperCase(),
    dto.departureDate,
    dto.returnDate ?? '',
    dto.seatClass,
    String(dto.passengerCount),
    String(dto.flexibleDays ?? 0),
    dto.currency ?? 'KRW',
  ].join('|');
  return `flight:search:${createHash('sha256').update(canonical).digest('hex').slice(0, 32)}`;
}

function dealsRedisKey(): string {
  return 'flight:deals:global';
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class FlightsService {
  private readonly logger = new Logger(FlightsService.name);

  constructor(
    @Inject(FLIGHT_PROVIDER_SERVICE)
    private readonly provider: IFlightProvider,
    @Inject(FLIGHT_AI_SERVICE)
    private readonly aiService: IFlightAiService,
    private readonly redis: RedisService,
    private readonly repo: FlightsRepository,
  ) {}

  // -------------------------------------------------------------------------
  // GET /flights/deals
  // -------------------------------------------------------------------------

  async getDeals(): Promise<{ items: NormalizedDeal[] }> {
    // 1. Redis L1 cache
    const cached = await this.redis.getJson<NormalizedDeal[]>(dealsRedisKey());
    if (cached) return { items: cached };

    // 2. Provider
    const deals = await this.provider.getDeals();

    // 3. Populate Redis
    if (deals.length > 0) {
      await this.redis.setJson(dealsRedisKey(), deals, REDIS_DEALS_TTL);
    }

    return { items: deals };
  }

  // -------------------------------------------------------------------------
  // POST /flights/search
  // -------------------------------------------------------------------------

  async searchFlights(
    dto: SearchFlightsDto,
    userId?: number,
  ): Promise<FlightSearchResponse> {
    // Validate round-trip has return date
    if (dto.tripType === 'round_trip' && !dto.returnDate) {
      throw new BadRequestException('returnDate is required for round_trip');
    }
    if (
      dto.returnDate &&
      new Date(dto.returnDate) <= new Date(dto.departureDate)
    ) {
      throw new BadRequestException('returnDate must be after departureDate');
    }

    const cacheKey = buildCacheKey(dto);

    // -- L1: Redis
    const redisCached = await this.redis.getJson<FlightSearchResponse>(cacheKey);
    if (redisCached) {
      this.logger.debug(`Cache HIT (Redis): ${cacheKey}`);
      return redisCached;
    }

    // -- L2: DB cache
    const dbCached = await this.repo.findCache(cacheKey);
    if (dbCached) {
      this.logger.debug(`Cache HIT (DB): ${cacheKey}`);
      const payload: FlightSearchResponse = {
        searchId: dbCached.search_id,
        results: (dbCached.response_payload as any).results ?? [],
      };
      // Repopulate Redis from DB
      await this.redis.setJson(cacheKey, payload, REDIS_SEARCH_TTL);
      return payload;
    }

    // -- Cache MISS → call provider
    this.logger.debug(`Cache MISS → provider call: ${cacheKey}`);

    const flights = await this.provider.searchFlights({
      tripType: dto.tripType,
      originCode: dto.originCode,
      destinationCode: dto.destinationCode,
      departureDate: dto.departureDate,
      returnDate: dto.returnDate,
      seatClass: dto.seatClass,
      passengerCount: dto.passengerCount,
      flexibleDays: dto.flexibleDays ?? 0,
      currency: dto.currency ?? 'KRW',
      language: dto.language ?? 'ko',
    });

    const searchId = generateSearchId();
    const response: FlightSearchResponse = { searchId, results: flights };

    // -- Persist cache (both Redis and DB) + search log — fire-and-forget
    this.redis
      .setJson(cacheKey, response, REDIS_SEARCH_TTL)
      .catch(() => void 0);

    this.repo
      .upsertCache({
        cacheKey,
        searchId,
        requestPayload: dto,
        responsePayload: { results: flights },
        ttlSeconds: DB_SEARCH_TTL,
      })
      .catch(() => void 0);

    this.repo
      .insertSearchLog({
        userId: userId ?? null,
        searchId,
        dto,
        providerName: 'travelpayouts',
      })
      .catch(() => void 0);

    return response;
  }

  // -------------------------------------------------------------------------
  // POST /flights/recommend
  // -------------------------------------------------------------------------

  async recommendFlights(
    dto: RecommendFlightsDto,
  ): Promise<FlightRecommendResult> {
    // Retrieve cached search results by searchId
    const cached = await this.repo.findCacheBySearchId(dto.searchId);
    if (!cached) {
      throw new NotFoundException(
        'Search results not found or expired. Please search again.',
      );
    }

    const flights: NormalizedFlight[] =
      (cached.response_payload as any).results ?? [];

    return this.aiService.recommend({
      flights,
      preference: dto.preference ?? 'best_value',
      language: dto.language ?? 'ko',
    });
  }
}
