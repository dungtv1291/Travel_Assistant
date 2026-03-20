import { Module } from '@nestjs/common';
import { WeatherApiService } from './weatherapi.service';
import { WEATHER_API_SERVICE } from './interfaces/weather.interface';

/**
 * WeatherApiModule — provides the WeatherAPI.com HTTP client under the
 * WEATHER_API_SERVICE injection token.
 *
 * Import this module wherever live weather data is needed.
 * WEATHER_API_KEY must be set in .env (see .env.example).
 *
 * ConfigModule is @Global() in AppModule, so no explicit import is required here.
 */
@Module({
  providers: [
    WeatherApiService,
    {
      provide: WEATHER_API_SERVICE,
      useExisting: WeatherApiService,
    },
  ],
  exports: [WEATHER_API_SERVICE],
})
export class WeatherApiModule {}
