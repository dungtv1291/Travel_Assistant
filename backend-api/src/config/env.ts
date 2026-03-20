/**
 * Canonical list of all environment variable names consumed by the application.
 * Use this as a reference when setting up .env files or Docker secrets.
 * All values are read via src/config/app.config.ts.
 */
export const ENV = {
  // App
  NODE_ENV: 'NODE_ENV',
  PORT: 'PORT',
  API_PREFIX: 'API_PREFIX',
  CORS_ORIGIN: 'CORS_ORIGIN',

  // Database (PostgreSQL)
  DB_HOST: 'DB_HOST',
  DB_PORT: 'DB_PORT',
  DB_NAME: 'DB_NAME',
  DB_USER: 'DB_USER',
  DB_PASSWORD: 'DB_PASSWORD',
  DB_POOL_MIN: 'DB_POOL_MIN',
  DB_POOL_MAX: 'DB_POOL_MAX',

  // Redis
  REDIS_HOST: 'REDIS_HOST',
  REDIS_PORT: 'REDIS_PORT',
  REDIS_PASSWORD: 'REDIS_PASSWORD',

  // JWT
  JWT_ACCESS_SECRET: 'JWT_ACCESS_SECRET',
  JWT_ACCESS_EXPIRES_IN: 'JWT_ACCESS_EXPIRES_IN',
  JWT_REFRESH_SECRET: 'JWT_REFRESH_SECRET',
  JWT_REFRESH_EXPIRES_IN: 'JWT_REFRESH_EXPIRES_IN',

  // External: WeatherAPI
  WEATHER_API_KEY: 'WEATHER_API_KEY',
  WEATHER_API_BASE_URL: 'WEATHER_API_BASE_URL',

  // External: Travelpayouts
  TRAVELPAYOUTS_API_TOKEN: 'TRAVELPAYOUTS_API_TOKEN',
  TRAVELPAYOUTS_MARKER: 'TRAVELPAYOUTS_MARKER',

  // External: OpenAI
  OPENAI_API_KEY: 'OPENAI_API_KEY',
  OPENAI_MODEL: 'OPENAI_MODEL',
} as const;

export type EnvKey = (typeof ENV)[keyof typeof ENV];
