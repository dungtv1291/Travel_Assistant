import { Module } from '@nestjs/common';
import { RedisModule } from '../../common/services/redis.module';
import { TravelpayoutsModule } from '../../integrations/travelpayouts/travelpayouts.module';
import { openAiClientProvider } from '../../integrations/openai/openai-client.provider';
import { OpenAiFlightAiService } from '../../integrations/openai/openai-flight-ai.service';
import { FLIGHT_AI_SERVICE } from '../../integrations/openai/interfaces/flight-ai.interface';
import { FlightsController } from './flights.controller';
import { FlightsRepository } from './repositories/flights.repository';
import { FlightsService } from './flights.service';

/**
 * FlightsModule
 *
 * Wires together:
 *   - TravelpayoutsModule  → provides FLIGHT_PROVIDER_SERVICE token
 *   - RedisModule          → provides RedisService for L1 cache
 *   - FlightsRepository    → DB cache + search log (raw SQL, no ORM)
 *   - FlightsService       → orchestrates provider → cache → AI
 *   - FlightsController    → exposes /flights/deals, /flights/search, /flights/recommend
 *
 * AI recommendation is provided via FLIGHT_AI_SERVICE token.
 * Swap MockFlightAiService → OpenAiFlightService without touching the service layer.
 */
@Module({
  imports: [TravelpayoutsModule, RedisModule],
  controllers: [FlightsController],
  providers: [
    FlightsRepository,
    FlightsService,
    openAiClientProvider,
    {
      provide: FLIGHT_AI_SERVICE,
      useClass: OpenAiFlightAiService,
    },
  ],
})
export class FlightsModule {}
