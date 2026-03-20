/**
 * Typed config accessor helpers for external integration services.
 *
 * Usage:
 *   import { getTravelpayoutsConfig } from '../config/integration-configs';
 *   const { token, marker } = getTravelpayoutsConfig(this.configService);
 *
 * Design rules:
 *  - Never include secret values in returned error messages or log calls.
 *  - Return empty strings (never undefined/null) so callers do not need nullish guards.
 *  - Interfaces are exported so services can type-annotate private fields.
 */

import { ConfigService } from '@nestjs/config';

// ─── OpenAI ──────────────────────────────────────────────────────────────────

export interface OpenAiConfig {
  apiKey: string;
  model: string;
}

export function getOpenAiConfig(config: ConfigService): OpenAiConfig {
  return {
    apiKey: config.get<string>('openai.apiKey') ?? '',
    model:  config.get<string>('openai.model')  ?? 'gpt-4o',
  };
}

// ─── WeatherAPI ──────────────────────────────────────────────────────────────

export interface WeatherConfig {
  apiKey:  string;
  baseUrl: string;
}

export function getWeatherConfig(config: ConfigService): WeatherConfig {
  return {
    apiKey:  config.get<string>('weather.apiKey')  ?? '',
    baseUrl: config.get<string>('weather.baseUrl') ?? 'https://api.weatherapi.com/v1',
  };
}

// ─── Travelpayouts ────────────────────────────────────────────────────────────

export interface TravelpayoutsConfig {
  token:  string;
  marker: string;
}

export function getTravelpayoutsConfig(config: ConfigService): TravelpayoutsConfig {
  return {
    token:  config.get<string>('travelpayouts.token')  ?? '',
    marker: config.get<string>('travelpayouts.marker') ?? '',
  };
}
