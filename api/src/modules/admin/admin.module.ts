import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../../lib/prisma.service';
import { RedisService } from '../../lib/redis.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [AdminService, PrismaService, RedisService],
  exports: [AdminService],
})
export class AdminModule {}
