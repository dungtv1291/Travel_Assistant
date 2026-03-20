import { Module } from '@nestjs/common';
import { HotelsModule } from '../hotels/hotels.module';
import { HotelBookingsController } from './hotel-bookings.controller';
import { HotelBookingsRepository } from './repositories/hotel-bookings.repository';
import { HotelBookingsService } from './hotel-bookings.service';

@Module({
  imports: [HotelsModule],
  controllers: [HotelBookingsController],
  providers: [HotelBookingsRepository, HotelBookingsService],
})
export class HotelBookingsModule {}
