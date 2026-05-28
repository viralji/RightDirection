import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from '../../lib/prisma.service';
import { RedisService } from '../../lib/redis.service';

@Module({
  controllers: [HealthController],
  providers: [PrismaService, RedisService],
})
export class HealthModule {}
