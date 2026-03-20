import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { validateEnv } from './config/validate-env';

async function bootstrap() {
  // Fail fast before any module initialisation if required env vars are absent.
  validateEnv();

  const app = await NestFactory.create(AppModule);

  // Global prefix for all routes: /api/v1
  app.setGlobalPrefix('api/v1');

  // Standard error envelope: { success: false, error: { code, message, details } }
  // Must be registered before the interceptor.
  app.useGlobalFilters(new AllExceptionsFilter());

  // Standard success envelope: { success: true, data: <response> }
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global validation pipe — strips unknown properties, transforms payloads
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // CORS — allow mobile app and dev tools
  app.enableCors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port);

  console.log(`[bootstrap] Server running on http://0.0.0.0:${port}/api/v1`);
  console.log(`[bootstrap] Health: http://0.0.0.0:${port}/api/v1/health`);
}

bootstrap();
