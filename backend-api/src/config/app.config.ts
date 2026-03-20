export default () => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),
    apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  },
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    name: process.env.DB_NAME ?? 'travel_assistant',
    user: process.env.DB_USER ?? 'travel_user',
    password: process.env.DB_PASSWORD ?? '',
    poolMin: parseInt(process.env.DB_POOL_MIN ?? '2', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX ?? '10', 10),
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD ?? '',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  },
  weather: {
    apiKey: process.env.WEATHER_API_KEY ?? '',
    baseUrl:
      process.env.WEATHER_API_BASE_URL ?? 'https://api.weatherapi.com/v1',
  },
  travelpayouts: {
    token: process.env.TRAVELPAYOUTS_API_TOKEN ?? '',
    marker: process.env.TRAVELPAYOUTS_MARKER ?? '',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? '',
    model: process.env.OPENAI_MODEL ?? 'gpt-4o',
  },
});
