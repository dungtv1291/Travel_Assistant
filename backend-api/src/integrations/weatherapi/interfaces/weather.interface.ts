/**
 * Normalized WeatherAPI.com response shapes.
 *
 * Never include the raw API key in any of these types or in log calls.
 * Consumers depend on IWeatherApiService + WEATHER_API_SERVICE token only.
 */

// ---------------------------------------------------------------------------
// Normalized shapes
// ---------------------------------------------------------------------------

export interface CurrentWeather {
  tempC: number;
  feelsLikeC: number;
  /** Localized condition label (language driven by the request). */
  conditionText: string;
  /** WeatherAPI condition code — useful for mapping to custom icons. */
  conditionCode: number;
  /** Full HTTPS URL to the WeatherAPI CDN condition icon. */
  conditionIconUrl: string;
  /** Relative humidity percent. */
  humidity: number;
  windKph: number;
  uvIndex: number;
  isDay: boolean;
  /** Local observation time as "YYYY-MM-DD HH:MM" (from WeatherAPI localtime). */
  observedAt: string;
}

export interface ForecastDay {
  /** ISO date string, e.g. "2026-03-19". */
  date: string;
  maxTempC: number;
  minTempC: number;
  avgTempC: number;
  conditionText: string;
  conditionCode: number;
  conditionIconUrl: string;
  /** Percentage chance of rain for the day. */
  chanceOfRain: number;
  /** Average humidity percent for the day. */
  humidity: number;
  uvIndex: number;
}

export interface WeatherForecast {
  locationName: string;
  locationCountry: string;
  /** IANA timezone identifier, e.g. "Asia/Ho_Chi_Minh". */
  timezone: string;
  current: CurrentWeather;
  forecast: ForecastDay[];
}

// ---------------------------------------------------------------------------
// Injection token + interface
// ---------------------------------------------------------------------------

export const WEATHER_API_SERVICE = 'WEATHER_API_SERVICE';

export interface IWeatherApiService {
  /**
   * Fetch only current conditions for a location.
   * @param query  City name, "lat,lng", or IATA airport code.
   * @param lang   BCP-47 language code (ko, en, vi, ...). Defaults to "en".
   */
  getCurrentWeather(query: string, lang?: string): Promise<CurrentWeather>;

  /**
   * Fetch current conditions plus a multi-day forecast.
   * @param query  City name, "lat,lng", or IATA airport code.
   * @param days   Number of forecast days (1–14). Defaults to 7.
   * @param lang   BCP-47 language code (ko, en, vi, ...). Defaults to "en".
   */
  getForecast(query: string, days?: number, lang?: string): Promise<WeatherForecast>;
}
