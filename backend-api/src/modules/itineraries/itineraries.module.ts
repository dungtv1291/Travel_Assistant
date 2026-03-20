import { Module } from '@nestjs/common';
import { AiPlannerModule } from '../../integrations/openai/ai-planner.module';
import { DestinationsRepository } from '../destinations/repositories/destinations.repository';
import { ItinerariesController } from './itineraries.controller';
import { ItinerariesService } from './itineraries.service';
import { ItinerariesRepository } from './repositories/itineraries.repository';

@Module({
  imports: [AiPlannerModule],
  controllers: [ItinerariesController],
  providers: [
    ItinerariesRepository,
    ItinerariesService,
    // DestinationsRepository needs only DatabaseService which is @Global,
    // so we declare it here directly rather than importing DestinationsModule.
    DestinationsRepository,
  ],
  exports: [ItinerariesService],
})
export class ItinerariesModule {}
