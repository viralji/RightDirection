import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { PrismaService } from '../../lib/prisma.service';
import { S3Service } from '../../lib/s3.service';
import { RedisService } from '../../lib/redis.service';

@Module({
  controllers: [AgentController],
  providers: [AgentService, PrismaService, S3Service, RedisService],
  exports: [AgentService],
})
export class AgentModule {}
