import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { Public } from '../../common/decorators';
import { PrismaService } from '../../lib/prisma.service';
import { RedisService } from '../../lib/redis.service';

@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async check() {
    const checks: Record<string, 'ok' | 'error'> = {};
    let status: 'ok' | 'degraded' = 'ok';

    // Database
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = 'ok';
    } catch {
      checks.database = 'error';
      status = 'degraded';
    }

    // Redis
    try {
      await this.redis.ping();
      checks.redis = 'ok';
    } catch {
      checks.redis = 'error';
      status = 'degraded';
    }

    return { data: { status, checks, timestamp: new Date().toISOString() } };
  }
}
