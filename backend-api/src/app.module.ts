import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DestinationsModule } from './modules/destinations/destinations.module';
import { ItinerariesModule } from './modules/itineraries/itineraries.module';
import { HotelsModule } from './modules/hotels/hotels.module';
import { HotelBookingsModule } from './modules/hotel-bookings/hotel-bookings.module';
import { FlightsModule } from './modules/flights/flights.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: '.env',
    }),
    DatabaseModule,
    HealthModule,
    AuthModule,
    UsersModule,
    DestinationsModule,
    ItinerariesModule,
    HotelsModule,
    HotelBookingsModule,
    FlightsModule,
  ],
})
export class AppModule {}
