import { Module } from '@nestjs/common';
import { WeatherApiModule } from '../../integrations/weatherapi/weatherapi.module';
import { DestinationsRepository } from './repositories/destinations.repository';
import { DestinationsService } from './destinations.service';
import { DestinationsController } from './destinations.controller';

/**
 * Destinations module — handles all destination-domain endpoints.
 *
 * DatabaseModule is @Global() so no explicit import is needed.
 * The JwtStrategy registered via AuthModule (in AppModule) is available
 * globally, so OptionalJwtAuthGuard works without importing AuthModule here.
 */
@Module({
  imports: [WeatherApiModule],
  controllers: [DestinationsController],
  providers: [DestinationsRepository, DestinationsService],
  exports: [DestinationsRepository, DestinationsService],
})
export class DestinationsModule {}
