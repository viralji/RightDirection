import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { PrismaService } from '../../lib/prisma.service';
import { RedisService } from '../../lib/redis.service';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, PrismaService, RedisService],
  exports: [NotificationService],
})
export class NotificationModule {}
