import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PrismaService } from '../../lib/prisma.service';
import { RedisService } from '../../lib/redis.service';
import { TwilioService } from '../../lib/twilio.service';
import { env } from '../../lib/config/env.config';

@Module({
  imports: [
    JwtModule.register({
      secret: env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: env.JWT_ACCESS_EXPIRES_IN },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, RedisService, TwilioService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
