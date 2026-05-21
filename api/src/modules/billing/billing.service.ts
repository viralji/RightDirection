import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';
import { EmailService } from '../../lib/email.service';
import { env } from '../../lib/config/env.config';
import * as crypto from 'crypto';

const PLAN_LIMITS = {
  TRIAL: { students: 10, teamMembers: 1, aiCredits: 5 },
  STARTER: { students: 50, teamMembers: 3, aiCredits: 30 },
  PRO: { students: 200, teamMembers: 10, aiCredits: 100 },
  ENTERPRISE: { students: -1, teamMembers: -1, aiCredits: 500 },
};

const PLAN_AMOUNTS = {
  STARTER: 299900,   // ₹2,999 in paise
  PRO: 599900,       // ₹5,999
  ENTERPRISE: 999900 // ₹9,999
};

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private prisma: PrismaService,
    private email: EmailService,
  ) {}

  async createSubscriptionOrder(tenantId: string, plan: string) {
    await this.prisma.setTenantContext(tenantId);

    const amount = PLAN_AMOUNTS[plan as keyof typeof PLAN_AMOUNTS];
    if (!amount) throw new BadRequestException(`Invalid plan: ${plan}`);

    // Create Razorpay order via REST API
    const credentials = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64');
    const res = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: `plan_${plan.toLowerCase()}`,
        total_count: 12,
        quantity: 1,
        customer_notify: 1,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new BadRequestException(`Razorpay error: ${err}`);
    }

    const subscription = await res.json();
    return {
      subscriptionId: subscription.id,
      shortUrl: subscription.short_url,
      plan,
      amount,
    };
  }

  async handleWebhook(rawBody: string, signature: string) {
    const expectedSig = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(rawBody)
      .digest('hex');

    if (expectedSig !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event as string;

    this.logger.log(`Razorpay webhook: ${event}`);

    switch (event) {
      case 'subscription.activated':
        await this.onSubscriptionActivated(payload.payload.subscription.entity);
        break;
      case 'subscription.charged':
        await this.onSubscriptionCharged(payload.payload.subscription.entity, payload.payload.payment.entity);
        break;
      case 'subscription.cancelled':
        await this.onSubscriptionCancelled(payload.payload.subscription.entity);
        break;
      case 'subscription.completed':
        await this.onSubscriptionCompleted(payload.payload.subscription.entity);
        break;
      default:
        this.logger.log(`Unhandled event: ${event}`);
    }

    return { received: true };
  }

  private async onSubscriptionActivated(subscription: any) {
    const tenantId = subscription.notes?.tenantId;
    if (!tenantId) return;

    const plan = this.parsePlanFromId(subscription.plan_id);
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        subscriptionPlan: plan,
        subscriptionStatus: 'ACTIVE',
        subscriptionId: subscription.id,
        subscriptionExpiresAt: new Date(subscription.current_end * 1000),
      },
    });
    this.logger.log(`Tenant ${tenantId} activated plan ${plan}`);
  }

  private async onSubscriptionCharged(subscription: any, payment: any) {
    const tenantId = subscription.notes?.tenantId;
    if (!tenantId) return;

    await this.prisma.billingHistory.create({
      data: {
        tenantId,
        razorpayPaymentId: payment.id,
        razorpaySubscriptionId: subscription.id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: 'PAID',
        description: `Subscription renewal — ${this.parsePlanFromId(subscription.plan_id)}`,
      },
    });

    // Extend subscription
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        subscriptionExpiresAt: new Date(subscription.current_end * 1000),
      },
    });
  }

  private async onSubscriptionCancelled(subscription: any) {
    const tenantId = subscription.notes?.tenantId;
    if (!tenantId) return;

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { subscriptionStatus: 'CANCELLED' },
    });
  }

  private async onSubscriptionCompleted(subscription: any) {
    const tenantId = subscription.notes?.tenantId;
    if (!tenantId) return;

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { subscriptionPlan: 'TRIAL', subscriptionStatus: 'EXPIRED' },
    });
  }

  async getBillingHistory(tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    return this.prisma.billingHistory.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 24,
    });
  }

  async getCurrentPlan(tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: {
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
      },
    });
    const plan = tenant?.subscriptionPlan ?? 'TRIAL';
    return {
      plan,
      status: tenant?.subscriptionStatus ?? 'ACTIVE',
      expiresAt: tenant?.subscriptionExpiresAt,
      limits: PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] ?? PLAN_LIMITS.TRIAL,
    };
  }

  private parsePlanFromId(planId: string): string {
    if (planId.includes('enterprise')) return 'ENTERPRISE';
    if (planId.includes('pro')) return 'PRO';
    if (planId.includes('starter')) return 'STARTER';
    return 'TRIAL';
  }
}
