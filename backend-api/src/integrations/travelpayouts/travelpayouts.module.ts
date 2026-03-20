import { Module } from '@nestjs/common';
import { TravelpayoutsService } from './travelpayouts.service';
import { FLIGHT_PROVIDER_SERVICE } from './interfaces/flight-provider.interface';

/**
 * TravelpayoutsModule — provides the real Travelpayouts HTTP client under the
 * FLIGHT_PROVIDER_SERVICE token.
 *
 * TRAVELPAYOUTS_API_TOKEN must be set in .env (see .env.example).
 * When the token is absent the service logs a warning and returns an empty
 * result set — no crash, no secret leakage.
 *
 * To use the mock provider during development (no credentials needed):
 *   1. Import MockFlightProviderService from ./mock-flight-provider.service
 *   2. Replace `useClass: TravelpayoutsService` with MockFlightProviderService below.
 *   No other files need to change.
 *
 * ConfigModule is @Global() in AppModule, so no explicit import is required here.
 */
@Module({
  providers: [
    TravelpayoutsService,
    {
      provide: FLIGHT_PROVIDER_SERVICE,
      useClass: TravelpayoutsService,
    },
  ],
  exports: [FLIGHT_PROVIDER_SERVICE],
})
export class TravelpayoutsModule {}
