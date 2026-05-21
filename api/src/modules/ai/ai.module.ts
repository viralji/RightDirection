import { Module } from '@nestjs/common';
import { AiGateway } from './ai.gateway';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { PrismaService } from '../../lib/prisma.service';
import { RedisService } from '../../lib/redis.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [AiController],
  providers: [AiGateway, AiService, PrismaService, RedisService],
  exports: [AiService, AiGateway],
})
export class AiModule {}
