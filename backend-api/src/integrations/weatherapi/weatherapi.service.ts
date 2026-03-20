import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getWeatherConfig } from '../../config/integration-configs';
import type {
  CurrentWeather,
  ForecastDay,
  IWeatherApiService,
  WeatherForecast,
} from './interfaces/weather.interface';

// ---------------------------------------------------------------------------
// Raw WeatherAPI.com response shapes (only fields we consume are typed).
// ---------------------------------------------------------------------------

interface WaCondition {
  text: string;
  /** Protocol-relative URL, e.g. "//cdn.weatherapi.com/..." */
  icon: string;
  code: number;
}

interface WaLocation {
  name: string;
  country: string;
  tz_id: string;
  /** Local time as "YYYY-MM-DD HH:MM" */
  localtime: string;
}

interface WaCurrentData {
  temp_c: number;
  feelslike_c: number;
  condition: WaCondition;
  humidity: number;
  wind_kph: number;
  uv: number;
  is_day: 0 | 1;
}

interface WaCurrentResponse {
  location: WaLocation;
  current: WaCurrentData;
}

interface WaForecastDayData {
  maxtemp_c: number;
  mintemp_c: number;
  avgtemp_c: number;
  condition: WaCondition;
  daily_chance_of_rain: number;
  avghumidity: number;
  uv: number;
}

interface WaForecastDayEntry {
  date: string;
  day: WaForecastDayData;
}

interface WaForecastResponse extends WaCurrentResponse {
  forecast: {
    forecastday: WaForecastDayEntry[];
  };
}

// ---------------------------------------------------------------------------
// Normalizers
// ---------------------------------------------------------------------------

/** WeatherAPI returns icon as "//cdn.weatherapi.com/..." — prefix with https: */
function normalizeIconUrl(rawIcon: string): string {
  return rawIcon.startsWith('//') ? `https:${rawIcon}` : rawIcon;
}

function toCurrentWeather(raw: WaCurrentResponse): CurrentWeather {
  return {
    tempC:            raw.current.temp_c,
    feelsLikeC:       raw.current.feelslike_c,
    conditionText:    raw.current.condition.text,
    conditionCode:    raw.current.condition.code,
    conditionIconUrl: normalizeIconUrl(raw.current.condition.icon),
    humidity:         raw.current.humidity,
    windKph:          raw.current.wind_kph,
    uvIndex:          raw.current.uv,
    isDay:            raw.current.is_day === 1,
    observedAt:       raw.location.localtime,
  };
}

function toForecastDay(raw: WaForecastDayEntry): ForecastDay {
  return {
    date:             raw.date,
    maxTempC:         raw.day.maxtemp_c,
    minTempC:         raw.day.mintemp_c,
    avgTempC:         raw.day.avgtemp_c,
    conditionText:    raw.day.condition.text,
    conditionCode:    raw.day.condition.code,
    conditionIconUrl: normalizeIconUrl(raw.day.condition.icon),
    chanceOfRain:     raw.day.daily_chance_of_rain,
    humidity:         raw.day.avghumidity,
    uvIndex:          raw.day.uv,
  };
}

// ---------------------------------------------------------------------------
// Language normalizer — map our app lang codes to WeatherAPI lang codes.
// Full list: https://www.weatherapi.com/docs/#intro-request (lang parameter)
// ---------------------------------------------------------------------------

const WA_LANG_MAP: Record<string, string> = {
  ko: 'ko',
  en: 'en',
  vi: 'vi',
};

function toWeatherApiLang(lang?: string): string {
  if (!lang) return 'en';
  return WA_LANG_MAP[lang.toLowerCase()] ?? 'en';
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class WeatherApiService implements IWeatherApiService {
  private readonly logger = new Logger(WeatherApiService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    const cfg = getWeatherConfig(config);
    this.apiKey = cfg.apiKey;
    this.baseUrl = cfg.baseUrl;
  }

  async getCurrentWeather(query: string, lang?: string): Promise<CurrentWeather> {
    this.assertApiKey();
    const url = this.buildUrl('current.json', query, { lang: toWeatherApiLang(lang) });
    const raw = await this.fetchJson<WaCurrentResponse>(url);
    return toCurrentWeather(raw);
  }

  async getForecast(
    query: string,
    days = 7,
    lang?: string,
  ): Promise<WeatherForecast> {
    this.assertApiKey();
    const safeDays = Math.min(14, Math.max(1, days));
    const url = this.buildUrl('forecast.json', query, {
      days: String(safeDays),
      lang: toWeatherApiLang(lang),
    });
    const raw = await this.fetchJson<WaForecastResponse>(url);
    return {
      locationName:    raw.location.name,
      locationCountry: raw.location.country,
      timezone:        raw.location.tz_id,
      current:         toCurrentWeather(raw),
      forecast:        raw.forecast.forecastday.map(toForecastDay),
    };
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  private assertApiKey(): void {
    if (!this.apiKey) {
      throw new Error(
        'WEATHER_API_KEY is not configured. Add it to your .env file (see .env.example).',
      );
    }
  }

  /**
   * Builds a request URL.
   * The API key is passed as a query param named "key" — this is the only
   * location the key appears; it is never logged.
   */
  private buildUrl(
    endpoint: string,
    query: string,
    extra: Record<string, string> = {},
  ): string {
    const params = new URLSearchParams({
      key: this.apiKey,
      q: query,
      ...extra,
    });
    return `${this.baseUrl}/${endpoint}?${params.toString()}`;
  }

  private async fetchJson<T>(url: string): Promise<T> {
    // Strip the API key before logging to prevent secret leakage
    const safeUrl = url.replace(/([?&])key=[^&]*/g, '$1key=***');
    this.logger.debug(`[weatherapi] GET ${safeUrl}`);

    const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      this.logger.warn(
        `[weatherapi] HTTP ${res.status} for ${safeUrl}: ${body.slice(0, 200)}`,
      );
      throw new Error(`WeatherAPI responded with HTTP ${res.status}`);
    }

    return res.json() as Promise<T>;
  }
}
