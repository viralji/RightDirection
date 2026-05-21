import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';
import { S3Service } from '../../lib/s3.service';
import { RedisService } from '../../lib/redis.service';
import { KYCStatus } from '@prisma/client';

@Injectable()
export class AgentService {
  constructor(
    private prisma: PrismaService,
    private s3: S3Service,
    private redis: RedisService,
  ) {}

  async getProfile(tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    const agent = await this.prisma.agent.findUnique({
      where: { tenantId },
      include: {
        tenant: { select: { name: true, subdomain: true, logoUrl: true, primaryColor: true, subscriptionPlan: true, subscriptionExpiresAt: true } },
        subAgents: { include: { tenant: { select: { name: true } } } },
      },
    });
    if (!agent) throw new NotFoundException('Agent not found');
    return agent;
  }

  async update(tenantId: string, dto: { businessName?: string; city?: string; state?: string; pincode?: string; gstNumber?: string; panNumber?: string }) {
    await this.prisma.setTenantContext(tenantId);
    return this.prisma.agent.update({ where: { tenantId }, data: dto });
  }

  async listTeamMembers(tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    return this.prisma.user.findMany({
      where: { tenantId, isActive: true, role: { not: 'STUDENT' } },
      select: { id: true, name: true, email: true, phone: true, role: true, lastLoginAt: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getKycUploadUrl(tenantId: string, docType: string) {
    const { v4: uuidv4 } = await import('uuid');
    const key = this.s3.buildKycKey(tenantId, docType, uuidv4());
    return this.s3.getPresignedUploadUrl(key, 'application/pdf');
  }

  async submitKyc(tenantId: string, s3Key: string, docType: string) {
    await this.prisma.setTenantContext(tenantId);
    const agent = await this.prisma.agent.findUnique({ where: { tenantId } });
    if (!agent) throw new NotFoundException('Agent not found');

    const user = await this.prisma.user.findFirst({ where: { tenantId } });

    await this.prisma.document.create({
      data: {
        userId: user!.id,
        tenantId,
        category: 'KYC',
        fileName: docType,
        fileSize: 0,
        mimeType: 'application/pdf',
        s3Key,
        agentKycId: agent.id,
        status: 'UPLOADED',
      },
    });

    await this.prisma.agent.update({
      where: { tenantId },
      data: { kycStatus: KYCStatus.UNDER_REVIEW },
    });

    return { message: 'KYC documents submitted for review' };
  }

  async getStats(tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    const [totalStudents, applications, enrolled] = await Promise.all([
      this.prisma.student.count({ where: { tenantId } }),
      this.prisma.application.groupBy({
        by: ['stage'],
        where: { tenantId },
        _count: { stage: true },
      }),
      this.prisma.application.count({ where: { tenantId, stage: 'ENROLLED' } }),
    ]);

    const stageMap: Record<string, number> = {};
    applications.forEach((a) => { stageMap[a.stage] = a._count.stage; });

    return { totalStudents, enrolled, stageBreakdown: stageMap };
  }
}
