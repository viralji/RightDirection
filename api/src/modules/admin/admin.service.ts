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
    // All aggregations run in the DB — no full table scan into memory
    const [summary, byAgentRaw, byMonthRaw, byUniversityRaw, byStatusRaw] = await Promise.all([
      this.prisma.$queryRaw<Array<{
        total_gross: string; total_net: string;
        total_pending: string; total_paid: string; total_transactions: bigint;
      }>>`
        SELECT
          COALESCE(SUM(gross_amount_inr), 0)::text                                                       AS total_gross,
          COALESCE(SUM(net_payable_inr), 0)::text                                                        AS total_net,
          COALESCE(SUM(CASE WHEN status IN ('PENDING','UNIVERSITY_PAID','APPROVED') THEN net_payable_inr ELSE 0 END), 0)::text AS total_pending,
          COALESCE(SUM(CASE WHEN status = 'PAID_TO_AGENT' THEN net_payable_inr ELSE 0 END), 0)::text    AS total_paid,
          COUNT(*)                                                                                         AS total_transactions
        FROM commission_ledger
      `,

      this.prisma.$queryRaw<Array<{ agent_name: string; total: string; count: bigint }>>`
        SELECT t.name AS agent_name,
               COALESCE(SUM(cl.net_payable_inr), 0)::text AS total,
               COUNT(cl.id)                                 AS count
        FROM commission_ledger cl
        JOIN agents a  ON a.id         = cl.agent_id
        JOIN tenants t ON t.id         = a.tenant_id
        GROUP BY t.name
        ORDER BY SUM(cl.net_payable_inr) DESC
        LIMIT 10
      `,

      this.prisma.$queryRaw<Array<{ month: string; value: string }>>`
        SELECT TO_CHAR(created_at, 'YYYY-MM')      AS month,
               COALESCE(SUM(net_payable_inr), 0)::text AS value
        FROM commission_ledger
        WHERE created_at >= date_trunc('month', NOW()) - INTERVAL '11 months'
        GROUP BY month
        ORDER BY month ASC
      `,

      this.prisma.$queryRaw<Array<{ name: string; value: string }>>`
        SELECT u.name,
               COALESCE(SUM(cl.net_payable_inr), 0)::text AS value
        FROM commission_ledger cl
        JOIN universities u ON u.id = cl.university_id
        GROUP BY u.name
        ORDER BY SUM(cl.net_payable_inr) DESC
        LIMIT 8
      `,

      this.prisma.$queryRaw<Array<{ status: string; count: bigint }>>`
        SELECT status, COUNT(*) AS count
        FROM commission_ledger
        GROUP BY status
      `,
    ]);

    const s = summary[0];

    return {
      summary: {
        totalGross:        Math.round(Number(s?.total_gross ?? 0)),
        totalNet:          Math.round(Number(s?.total_net ?? 0)),
        totalPending:      Math.round(Number(s?.total_pending ?? 0)),
        totalPaid:         Math.round(Number(s?.total_paid ?? 0)),
        totalTransactions: Number(s?.total_transactions ?? 0),
      },
      byAgent:      byAgentRaw.map(r => ({ name: r.agent_name, value: Math.round(Number(r.total)), count: Number(r.count) })),
      byMonth:      byMonthRaw.map(r => ({ month: r.month, value: Math.round(Number(r.value)) })),
      byUniversity: byUniversityRaw.map(r => ({ name: r.name, value: Math.round(Number(r.value)) })),
      byStatus:     byStatusRaw.map(r => ({ status: r.status, count: Number(r.count) })),
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
