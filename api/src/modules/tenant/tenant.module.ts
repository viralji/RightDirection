import { Module } from '@nestjs/common';
import { TenantController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { PrismaService } from '../../lib/prisma.service';
import { RedisService } from '../../lib/redis.service';
import { S3Service } from '../../lib/s3.service';

@Module({
  controllers: [TenantController],
  providers: [TenantService, PrismaService, RedisService, S3Service],
  exports: [TenantService],
})
export class TenantModule {}
