import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';

import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { StudentModule } from './modules/student/student.module';
import { UniversityModule } from './modules/university/university.module';
import { ApplicationModule } from './modules/application/application.module';
import { DocumentModule } from './modules/document/document.module';
import { NotificationModule } from './modules/notification/notification.module';
import { HealthModule } from './modules/health/health.module';
import { CommissionModule } from './modules/commission/commission.module';
import { ProposalModule } from './modules/proposal/proposal.module';
import { AgentModule } from './modules/agent/agent.module';
import { AdminModule } from './modules/admin/admin.module';
import { AiModule } from './modules/ai/ai.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { BillingModule } from './modules/billing/billing.module';

import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RedisService } from './lib/redis.service';
import { env } from './lib/config/env.config';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    JwtModule.register({ secret: env.JWT_ACCESS_SECRET, signOptions: { expiresIn: '15m' } }),
    AuthModule,
    TenantModule,
    StudentModule,
    UniversityModule,
    ApplicationModule,
    DocumentModule,
    NotificationModule,
    CommissionModule,
    ProposalModule,
    AgentModule,
    AdminModule,
    AiModule,
    MarketplaceModule,
    BillingModule,
    HealthModule,
  ],
  providers: [
    RedisService,
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
