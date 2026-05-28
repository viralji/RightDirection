import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';
import { ApplicationStage } from '@prisma/client';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  async list(tenantId: string, filters: { studentId?: string; stage?: ApplicationStage; page?: number | string; pageSize?: number | string }) {
    await this.prisma.setTenantContext(tenantId);
    const page = Math.max(1, Number(filters.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(filters.pageSize) || 50));
    const { studentId, stage } = filters;
    const skip = (page - 1) * pageSize;

    const where: any = { tenantId };
    if (studentId) where.studentId = studentId;
    if (stage) where.stage = stage;

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          student: { include: { user: { select: { name: true, email: true } } } },
          course: { select: { name: true, level: true, field: true } },
          university: { select: { name: true, country: true, logoUrl: true } },
        },
        skip,
        take: pageSize,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.application.count({ where }),
    ]);

    return { data: applications, meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
  }

  // Group by stage — for Kanban board
  async getKanban(tenantId: string) {
    await this.prisma.setTenantContext(tenantId);
    const applications = await this.prisma.application.findMany({
      where: { tenantId },
      include: {
        student: { include: { user: { select: { name: true } } } },
        university: { select: { name: true, country: true, logoUrl: true } },
        course: { select: { name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const stages = Object.values(ApplicationStage);
    const kanban: Record<string, any[]> = {};
    stages.forEach((s) => (kanban[s] = []));
    applications.forEach((app) => kanban[app.stage].push(app));
    return kanban;
  }

  async findOne(tenantId: string, id: string) {
    await this.prisma.setTenantContext(tenantId);
    const app = await this.prisma.application.findFirst({
      where: { id, tenantId },
      include: {
        student: { include: { user: true } },
        course: true,
        university: true,
        documents: true,
        stageHistory: { orderBy: { createdAt: 'desc' } },
        commission: true,
      },
    });
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  async create(tenantId: string, agentId: string, userId: string, dto: any) {
    await this.prisma.setTenantContext(tenantId);
    return this.prisma.application.create({
      data: {
        studentId: dto.studentId,
        courseId: dto.courseId,
        universityId: dto.universityId,
        agentId,
        tenantId,
        intake: dto.intake,
        stage: ApplicationStage.LEAD,
        stageHistory: {
          create: { toStage: ApplicationStage.LEAD, changedById: userId },
        },
      },
    });
  }

  async changeStage(tenantId: string, id: string, userId: string, stage: ApplicationStage, note?: string) {
    await this.prisma.setTenantContext(tenantId);
    const app = await this.prisma.application.findFirst({ where: { id, tenantId } });
    if (!app) throw new NotFoundException('Application not found');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id },
        data: { stage },
      });
      await tx.applicationStageHistory.create({
        data: { applicationId: id, fromStage: app.stage, toStage: stage, changedById: userId, note },
      });
      return updated;
    });
  }

  async update(tenantId: string, id: string, dto: any) {
    await this.prisma.setTenantContext(tenantId);
    // Strip immutable/privileged fields to prevent mass-assignment
    const { id: _id, tenantId: _t, agentId: _a, studentId: _s, ...safe } = dto;
    return this.prisma.application.update({ where: { id, tenantId }, data: safe });
  }
}
