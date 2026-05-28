import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';
import { CommissionStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const PLATFORM_SHARE = 0.30;
const AGENT_SHARE = 0.70;
const TDS_RATE = 0.10; // Section 194H

@Injectable()
export class CommissionService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: {
    applicationId: string;
    universityId: string;
    agentId: string;
    grossAmountInr: number;
  }) {
    await this.prisma.setTenantContext(tenantId);

    const existing = await this.prisma.commissionLedger.findUnique({
      where: { applicationId: dto.applicationId },
    });
    if (existing) throw new BadRequestException('Commission already exists for this application');

    const gross = dto.grossAmountInr;
    const platform = gross * PLATFORM_SHARE;
    const agentGross = gross * AGENT_SHARE;
    const tds = agentGross * TDS_RATE;
    const netPayable = agentGross - tds;

    return this.prisma.commissionLedger.create({
      data: {
        applicationId: dto.applicationId,
        universityId: dto.universityId,
        agentId: dto.agentId,
        tenantId,
        grossAmountInr: new Decimal(gross),
        platformShare: new Decimal(platform),
        agentShare: new Decimal(agentGross),
        tdsAmount: new Decimal(tds),
        netPayableInr: new Decimal(netPayable),
        status: CommissionStatus.PENDING,
      },
    });
  }

  async list(tenantId: string, filters: { status?: CommissionStatus; page?: number | string; pageSize?: number | string }) {
    await this.prisma.setTenantContext(tenantId);
    const page = Math.max(1, Number(filters.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(filters.pageSize) || 20));
    const { status } = filters;
    const skip = (page - 1) * pageSize;

    const where: any = { tenantId };
    if (status) where.status = status;

    const [commissions, total] = await Promise.all([
      this.prisma.commissionLedger.findMany({
        where,
        include: {
          application: { include: { student: { include: { user: { select: { name: true } } } } } },
          university: { select: { name: true, country: true } },
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.commissionLedger.count({ where }),
    ]);

    return { data: commissions, meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
  }

  async walletSummary(tenantId: string, agentId: string) {
    await this.prisma.setTenantContext(tenantId);
    const [agent, pending, approved] = await Promise.all([
      this.prisma.agent.findUnique({ where: { tenantId } }),
      this.prisma.commissionLedger.aggregate({
        where: { tenantId, status: { in: [CommissionStatus.PENDING, CommissionStatus.UNIVERSITY_PAID] } },
        _sum: { netPayableInr: true },
      }),
      this.prisma.commissionLedger.aggregate({
        where: { tenantId, status: CommissionStatus.APPROVED },
        _sum: { netPayableInr: true },
      }),
    ]);

    return {
      walletBalance: agent?.walletBalance ?? 0,
      totalEarned: agent?.totalEarned ?? 0,
      pendingCommission: pending._sum.netPayableInr ?? 0,
      approvedAndPayable: approved._sum.netPayableInr ?? 0,
    };
  }

  async agentAnalytics(tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    const all = await this.prisma.commissionLedger.findMany({
      where: { tenantId },
      include: { university: { select: { name: true } } },
      orderBy: { createdAt: 'asc' },
    });

    const monthMap: Record<string, number> = {};
    const uniMap: Record<string, { name: string; total: number }> = {};

    for (const c of all) {
      const net = Number(c.netPayableInr);
      const month = c.createdAt.toISOString().slice(0, 7);
      monthMap[month] = (monthMap[month] ?? 0) + net;
      const uniName = c.university?.name ?? 'Unknown';
      if (!uniMap[uniName]) uniMap[uniName] = { name: uniName, total: 0 };
      uniMap[uniName].total += net;
    }

    const byMonth = Object.keys(monthMap).sort().slice(-12).map(m => ({ month: m, value: Math.round(monthMap[m]) }));
    const byUniversity = Object.values(uniMap).sort((a, b) => b.total - a.total).slice(0, 8).map(u => ({ name: u.name, value: Math.round(u.total) }));

    return { byMonth, byUniversity };
  }

  async updateStatus(id: string, status: CommissionStatus, payoutRef?: string) {
    const commission = await this.prisma.commissionLedger.findUnique({ where: { id } });
    if (!commission) throw new NotFoundException('Commission not found');
    await this.prisma.setTenantContext(commission.tenantId);

    const updated = await this.prisma.commissionLedger.update({
      where: { id },
      data: {
        status,
        payoutRef,
        payoutDate: status === CommissionStatus.PAID_TO_AGENT ? new Date() : undefined,
      },
    });

    // Credit wallet when paid to agent
    if (status === CommissionStatus.PAID_TO_AGENT) {
      await this.prisma.agent.update({
        where: { id: commission.agentId },
        data: {
          walletBalance: { increment: commission.netPayableInr },
          totalEarned: { increment: commission.netPayableInr },
        },
      });
    }

    return updated;
  }
}
