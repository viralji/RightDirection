import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../../lib/prisma.service';
import { RedisService } from '../../lib/redis.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, PrismaService, RedisService],
  exports: [AdminService],
})
export class AdminModule {}
