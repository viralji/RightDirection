import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';
import { RedisService } from '../../lib/redis.service';
import { AuthService } from '../auth/auth.service';
import { KYCStatus, SubscriptionPlan } from '@prisma/client';
import { DEMO_PERSONAS, findDemoPersona } from './demo-personas';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private auth: AuthService,
  ) {}

  listDemoPersonas() {
    return DEMO_PERSONAS;
  }

  async impersonate(email: string) {
    const persona = findDemoPersona(email);
    if (!persona) throw new BadRequestException('Invalid demo persona');

    const target = await this.prisma.user.findFirst({
      where: { email: persona.email, isActive: true },
    });
    if (!target) throw new NotFoundException(`Demo user not found: ${persona.email}`);
    if (target.role !== persona.role) {
      throw new BadRequestException('Demo persona role mismatch — re-run db:seed');
    }

    const session = await this.auth.createSessionForUser(target.id);
    return {
      ...session,
      redirectPath: persona.redirectPath,
      personaLabel: persona.label,
    };
  }

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
  async listAgents(filters: { kycStatus?: KYCStatus; plan?: SubscriptionPlan; page?: number | string; pageSize?: number | string }) {
    const page = Math.max(1, Number(filters.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(filters.pageSize) || 20));
    const { kycStatus, plan } = filters;
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
  async listUniversitiesAdmin(filters: { isPartner?: boolean; page?: number | string; pageSize?: number | string }) {
    const page = Math.max(1, Number(filters.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(filters.pageSize) || 20));
    const { isPartner } = filters;
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

  async getCommissionAnalytics() {
    const all = await this.prisma.commissionLedger.findMany({
      include: {
        agent: { include: { tenant: { select: { name: true } } } },
        university: { select: { name: true } },
      },
    });

    // By agent
    const agentMap: Record<string, { name: string; total: number; count: number }> = {};
    // By month (last 12)
    const monthMap: Record<string, number> = {};
    // By university
    const uniMap: Record<string, { name: string; total: number }> = {};
    // By status
    const statusMap: Record<string, number> = {};
    let totalGross = 0;
    let totalNet = 0;
    let totalPending = 0;
    let totalPaid = 0;

    for (const c of all) {
      const net = Number(c.netPayableInr);
      const gross = Number(c.grossAmountInr);
      totalGross += gross;
      totalNet += net;
      if (['PENDING', 'UNIVERSITY_PAID', 'APPROVED'].includes(c.status)) totalPending += net;
      if (c.status === 'PAID_TO_AGENT') totalPaid += net;

      // Agent aggregation
      const agentName = c.agent?.tenant?.name ?? 'Unknown';
      const agentKey = c.agentId;
      if (!agentMap[agentKey]) agentMap[agentKey] = { name: agentName, total: 0, count: 0 };
      agentMap[agentKey].total += net;
      agentMap[agentKey].count += 1;

      // Month aggregation
      const month = c.createdAt.toISOString().slice(0, 7); // YYYY-MM
      monthMap[month] = (monthMap[month] ?? 0) + net;

      // University aggregation
      const uniName = c.university?.name ?? 'Unknown';
      const uniKey = c.universityId ?? 'unknown';
      if (!uniMap[uniKey]) uniMap[uniKey] = { name: uniName, total: 0 };
      uniMap[uniKey].total += net;

      // Status aggregation
      statusMap[c.status] = (statusMap[c.status] ?? 0) + 1;
    }

    // Build sorted arrays
    const byAgent = Object.values(agentMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map(a => ({ name: a.name, value: Math.round(a.total), count: a.count }));

    // Last 12 months sorted
    const allMonths = Object.keys(monthMap).sort();
    const last12 = allMonths.slice(-12);
    const byMonth = last12.map(m => ({ month: m, value: Math.round(monthMap[m]) }));

    const byUniversity = Object.values(uniMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)
      .map(u => ({ name: u.name, value: Math.round(u.total) }));

    return {
      summary: {
        totalGross: Math.round(totalGross),
        totalNet: Math.round(totalNet),
        totalPending: Math.round(totalPending),
        totalPaid: Math.round(totalPaid),
        totalTransactions: all.length,
      },
      byAgent,
      byMonth,
      byUniversity,
      byStatus: Object.entries(statusMap).map(([status, count]) => ({ status, count })),
    };
  }

  async getAgentDetail(agentId: string) {
    const agent = await this.prisma.agent.findUnique({
      where: { id: agentId },
      include: {
        tenant: true,
        _count: { select: { students: true, commissions: true } },
        kycDocuments: {
          select: { id: true, fileName: true, status: true, createdAt: true, s3Key: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!agent) return null;

    // Application stats
    const [appStats, commissionStats] = await Promise.all([
      this.prisma.application.groupBy({
        by: ['stage'],
        where: { tenantId: agent.tenantId },
        _count: { stage: true },
      }),
      this.prisma.commissionLedger.aggregate({
        where: { agentId: agent.id },
        _sum: { grossAmountInr: true, netPayableInr: true },
        _count: { id: true },
      }),
    ]);

    const stageMap: Record<string, number> = {};
    appStats.forEach(a => { stageMap[a.stage] = a._count.stage; });

    return {
      ...agent,
      appStats: stageMap,
      commissionStats: {
        totalGross: Number(commissionStats._sum.grossAmountInr ?? 0),
        totalNet: Number(commissionStats._sum.netPayableInr ?? 0),
        count: commissionStats._count.id,
      },
    };
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
  async getActivityLog(filters: { page?: number | string; pageSize?: number | string; tenantId?: string }) {
    const page = Math.max(1, Number(filters.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(filters.pageSize) || 50));
    const { tenantId } = filters;
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
