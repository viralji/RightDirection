import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';

@Injectable()
export class MarketplaceService {
  constructor(private prisma: PrismaService) {}

  async listLeads(tenantId: string, filters: {
    intent?: string; destination?: string; page?: number; pageSize?: number;
  }) {
    await this.prisma.setTenantContext(tenantId);
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: any = {
      isPublished: true,
      expiresAt: { gt: new Date() },
    };
    if (filters.intent) where.intent = filters.intent;
    if (filters.destination) {
      where.preferredDestinations = { has: filters.destination };
    }

    const [total, leads] = await Promise.all([
      this.prisma.marketplaceLead.count({ where }),
      this.prisma.marketplaceLead.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: [{ intent: 'asc' }, { profileScore: 'desc' }],
        include: {
          unlockedBy: { where: { agentId: tenantId }, select: { id: true } },
        },
      }),
    ]);

    const items = leads.map((lead) => {
      const isUnlocked = lead.unlockedBy.length > 0;
      return {
        id: lead.id,
        intent: lead.intent,
        city: lead.city,
        state: lead.state,
        fieldOfStudy: lead.fieldOfStudy,
        budgetRange: lead.budgetRange,
        targetIntake: lead.targetIntake,
        preferredDestinations: lead.preferredDestinations,
        profileScore: lead.profileScore,
        unlockPrice: lead.unlockPrice,
        createdAt: lead.createdAt,
        isUnlocked,
        maskedName: lead.maskedName,
        // Only reveal PII if unlocked
        ...(isUnlocked ? { name: lead.name, phone: lead.phone, email: lead.email } : {}),
      };
    });

    return { items, total, page, pageSize };
  }

  async unlockLead(tenantId: string, leadId: string) {
    await this.prisma.setTenantContext(tenantId);

    const lead = await this.prisma.marketplaceLead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundException('Lead not found');

    const alreadyUnlocked = await this.prisma.leadUnlock.findFirst({
      where: { leadId, agentId: tenantId },
    });
    if (alreadyUnlocked) return { message: 'Already unlocked' };

    // Deduct from wallet and create unlock record in a transaction
    const agent = await this.prisma.agent.findUnique({ where: { tenantId } });
    if (!agent) throw new ForbiddenException('Agent record not found');
    if (Number(agent.walletBalance) < lead.unlockPrice) {
      throw new ForbiddenException('Insufficient wallet balance');
    }

    await this.prisma.$transaction([
      this.prisma.agent.update({
        where: { tenantId },
        data: { walletBalance: { decrement: lead.unlockPrice } },
      }),
      this.prisma.leadUnlock.create({
        data: { leadId, agentId: tenantId, pricePaid: lead.unlockPrice },
      }),
    ]);

    return { message: 'Lead unlocked successfully', leadId };
  }

  async getMyUnlockedLeads(tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    const unlocks = await this.prisma.leadUnlock.findMany({
      where: { agentId: tenantId },
      include: { lead: true },
      orderBy: { createdAt: 'desc' },
    });
    return unlocks.map((u) => ({ ...u.lead, pricePaid: u.pricePaid, unlockedAt: u.createdAt }));
  }

  async publishLead(data: {
    name: string; phone: string; email: string; city: string; state: string;
    fieldOfStudy?: string; budgetRange?: string; targetIntake?: string;
    preferredDestinations: string[]; intent: string; profileScore?: number;
    unlockPrice?: number;
  }) {
    const maskedName = data.name.split(' ')
      .map((p) => p[0] + '*'.repeat(p.length - 1)).join(' ');

    return this.prisma.marketplaceLead.create({
      data: {
        ...data,
        maskedName,
        isPublished: true,
        unlockPrice: data.unlockPrice ?? 999,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });
  }
}
