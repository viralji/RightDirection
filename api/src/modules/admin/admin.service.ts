import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';
import { RedisService } from '../../lib/redis.service';
import { KYCStatus, SubscriptionPlan } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService, private redis: RedisService) {}

  // ── PLATFORM STATS ─────────────────────────────────────────────────────────
  async platformStats() {
    const [
      totalTenants,
      totalStudents,
      totalApplications,
      enrolled,
      pendingKyc,
      totalUniversities,
    ] = await Promise.all([
      this.prisma.tenant.count({ where: { type: 'AGENT' } }),
      this.prisma.student.count(),
      this.prisma.application.count(),
      this.prisma.application.count({ where: { stage: 'ENROLLED' } }),
      this.prisma.agent.count({ where: { kycStatus: KYCStatus.UNDER_REVIEW } }),
      this.prisma.university.count(),
    ]);

    return { totalTenants, totalStudents, totalApplications, enrolled, pendingKyc, totalUniversities };
  }

  // ── AGENT MANAGEMENT ───────────────────────────────────────────────────────
  async listAgents(filters: { kycStatus?: KYCStatus; plan?: SubscriptionPlan; page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 20, kycStatus, plan } = filters;
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (kycStatus) where.kycStatus = kycStatus;
    if (plan) where.tenant = { subscriptionPlan: plan };

    const [agents, total] = await Promise.all([
      this.prisma.agent.findMany({
        where,
        include: {
          tenant: { select: { name: true, subdomain: true, email: true, subscriptionPlan: true, status: true, createdAt: true } },
          _count: { select: { students: true } },
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.agent.count({ where }),
    ]);

    return { data: agents, meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
  }

  async reviewKyc(tenantId: string, status: KYCStatus, reason?: string) {
    const agent = await this.prisma.agent.findUnique({ where: { tenantId } });
    if (!agent) throw new NotFoundException('Agent not found');

    await this.prisma.agent.update({
      where: { tenantId },
      data: { kycStatus: status, kycRejectedReason: reason },
    });

    // Clear Redis tenant cache
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (tenant) await this.redis.invalidateTenantBranding(tenant.subdomain);

    return { message: `KYC ${status.toLowerCase()}` };
  }

  async suspendAgent(tenantId: string) {
    await this.prisma.tenant.update({ where: { id: tenantId }, data: { status: 'SUSPENDED' } });
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (tenant) await this.redis.invalidateTenantBranding(tenant.subdomain);
    return { message: 'Agent suspended' };
  }

  async updateAgentPlan(tenantId: string, plan: SubscriptionPlan, expiresAt?: Date) {
    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { subscriptionPlan: plan, subscriptionExpiresAt: expiresAt },
    });
    await this.redis.invalidateTenantBranding(tenant.subdomain);
    return tenant;
  }

  // ── UNIVERSITY MANAGEMENT ──────────────────────────────────────────────────
  async listUniversitiesAdmin(filters: { isPartner?: boolean; page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 20, isPartner } = filters;
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (isPartner !== undefined) where.isPartner = isPartner;

    const [universities, total] = await Promise.all([
      this.prisma.university.findMany({
        where,
        include: { _count: { select: { courses: true, applications: true } } },
        skip,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
      this.prisma.university.count({ where }),
    ]);

    return { data: universities, meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
  }

  // ── COMMISSION MANAGEMENT ──────────────────────────────────────────────────
  async pendingCommissions() {
    return this.prisma.commissionLedger.findMany({
      where: { status: { in: ['PENDING', 'UNIVERSITY_PAID', 'APPROVED'] } },
      include: {
        agent: { include: { tenant: { select: { name: true } } } },
        university: { select: { name: true } },
        application: { include: { student: { include: { user: { select: { name: true } } } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // ── FRAUD MONITORING ───────────────────────────────────────────────────────
  async highRiskDocuments() {
    return this.prisma.document.findMany({
      where: { riskLevel: 'HIGH' },
      include: {
        student: { include: { user: { select: { name: true } } } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  // ── PLATFORM CONFIG ────────────────────────────────────────────────────────
  async getPlatformConfig() {
    const cfg = await this.prisma.platformConfig.findFirst();
    return cfg ?? {
      platformSharePct: 30,
      tdsRatePct: 10,
      minPayoutThreshold: 5000,
      payoutCycleDays: 30,
      defaultLeadPrice: 999,
      leadExpiryDays: 30,
      marketplaceEnabled: true,
      trialAiCredits: 5,
      fraudAlertThreshold: 0.6,
      autoFraudFlagEnabled: true,
      planSTARTERPrice: 2999,
      planPROPrice: 5999,
      planENTERPRISEPrice: 9999,
    };
  }

  async updatePlatformConfig(data: Record<string, any>) {
    const existing = await this.prisma.platformConfig.findFirst();
    if (existing) {
      return this.prisma.platformConfig.update({ where: { id: existing.id }, data });
    }
    return this.prisma.platformConfig.create({ data });
  }

  // ── ACTIVITY LOG ──────────────────────────────────────────────────────────
  async getActivityLog(filters: { page?: number; pageSize?: number; tenantId?: string }) {
    const { page = 1, pageSize = 50, tenantId } = filters;
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (tenantId) where.tenantId = tenantId;

    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          tenant: { select: { name: true, subdomain: true } },
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return { data: logs, meta: { total, page, pageSize } };
  }
}
