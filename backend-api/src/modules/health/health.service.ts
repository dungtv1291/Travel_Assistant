import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../database/database.service';
import Redis from 'ioredis';

@Injectable()
export class HealthService {
  private redis: Redis;

  constructor(
    private readonly db: DatabaseService,
    private readonly config: ConfigService,
  ) {
    this.redis = new Redis({
      host: this.config.get<string>('redis.host'),
      port: this.config.get<number>('redis.port'),
      password: this.config.get<string>('redis.password') || undefined,
      lazyConnect: true,
      enableReadyCheck: false,
    });
  }

  async check(): Promise<{
    status: 'ok' | 'degraded';
    timestamp: string;
  }> {
    const [dbStatus, redisStatus] = await Promise.all([
      this.checkDb(),
      this.checkRedis(),
    ]);

    return {
      status: dbStatus === 'ok' && redisStatus === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDb(): Promise<'ok' | 'error'> {
    try {
      await this.db.ping();
      return 'ok';
    } catch {
      return 'error';
    }
  }

  private async checkRedis(): Promise<'ok' | 'error'> {
    try {
      const pong = await this.redis.ping();
      return pong === 'PONG' ? 'ok' : 'error';
    } catch {
      return 'error';
    }
  }
}
