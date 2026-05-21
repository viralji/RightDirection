import { Controller, Post, Get, Body, Headers, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Public } from '../../common/decorators';
import { Tenant } from '../../common/decorators';
import { Roles } from '../../common/decorators';
import { UserRole } from '@prisma/client';

@Controller('billing')
export class BillingController {
  constructor(private billing: BillingService) {}

  @Post('webhook/razorpay')
  @Public()
  async razorpayWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const rawBody = req.rawBody?.toString('utf-8') ?? JSON.stringify(req.body);
    return this.billing.handleWebhook(rawBody, signature);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Get('plan')
  getCurrentPlan(@Tenant() tenantId: string) {
    return this.billing.getCurrentPlan(tenantId);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Get('history')
  getBillingHistory(@Tenant() tenantId: string) {
    return this.billing.getBillingHistory(tenantId);
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Post('subscribe')
  @Roles(UserRole.AGENT_OWNER)
  createSubscription(@Tenant() tenantId: string, @Body('plan') plan: string) {
    return this.billing.createSubscriptionOrder(tenantId, plan);
  }
}
