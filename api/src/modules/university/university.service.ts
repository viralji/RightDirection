import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';

@Injectable()
export class UniversityService {
  constructor(private prisma: PrismaService) {}

  async list(filters: {
    search?: string;
    country?: string;
    field?: string;
    minBudgetUsd?: number;
    maxBudgetUsd?: number;
    intake?: string;
    isPartner?: boolean;
    page?: number;
    pageSize?: number;
  }) {
    const page = Math.max(1, Number(filters.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(filters.pageSize) || 20));
    const { search, country, isPartner } = filters;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (country) where.country = country;
    if (isPartner !== undefined) where.isPartner = isPartner;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [universities, total] = await Promise.all([
      this.prisma.university.findMany({
        where,
        include: { courses: { where: { isActive: true }, take: 5 } },
        skip,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
      this.prisma.university.count({ where }),
    ]);

    return { data: universities, meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
  }

  async findOne(id: string) {
    const university = await this.prisma.university.findUnique({
      where: { id },
      include: { courses: { where: { isActive: true } } },
    });
    if (!university) throw new NotFoundException('University not found');
    return university;
  }

  async create(dto: any) {
    return this.prisma.university.create({ data: dto });
  }

  async update(id: string, dto: any) {
    return this.prisma.university.update({ where: { id }, data: dto });
  }

  async createCourse(universityId: string, dto: any) {
    await this.findOne(universityId);
    return this.prisma.course.create({ data: { ...dto, universityId } });
  }

  async updateCourse(courseId: string, dto: any) {
    return this.prisma.course.update({ where: { id: courseId }, data: dto });
  }

  async listCourses(universityId: string) {
    return this.prisma.course.findMany({
      where: { universityId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  // ── UNIVERSITY PORTAL ANALYTICS ───────────────────────────────────────────
  async getUniversityAnalytics(universityId: string) {
    const [totalApps, enrolledApps, allApps, courses] = await Promise.all([
      this.prisma.application.count({ where: { universityId } }),
      this.prisma.application.count({ where: { universityId, stage: 'ENROLLED' } }),
      this.prisma.application.findMany({
        where: { universityId },
        select: { stage: true, createdAt: true, updatedAt: true, course: true, tenantId: true },
      }),
      this.prisma.course.findMany({
        where: { universityId },
        include: { _count: { select: { applications: true } } },
        orderBy: { name: 'asc' },
      }),
    ]);

    // Stage breakdown
    const stageBreakdown: Record<string, number> = {};
    for (const app of allApps) {
      stageBreakdown[app.stage] = (stageBreakdown[app.stage] ?? 0) + 1;
    }

    // Acceptance rate
    const reviewedCount = allApps.filter((a) =>
      ['ENROLLED', 'REJECTED', 'OFFER_RECEIVED', 'VISA_PROCESSING', 'FEES_PAID'].includes(a.stage)
    ).length;
    const acceptanceRate = reviewedCount > 0
      ? Math.round((enrolledApps / reviewedCount) * 100)
      : 0;

    // Avg processing days (enrolled apps)
    const enrolledWithDates = allApps.filter((a) => a.stage === 'ENROLLED');
    const avgProcessingDays = enrolledWithDates.length > 0
      ? Math.round(
          enrolledWithDates.reduce((sum, a) => {
            return sum + (a.updatedAt.getTime() - a.createdAt.getTime()) / (1000 * 86400);
          }, 0) / enrolledWithDates.length,
        )
      : 0;

    // Top courses
    const topCourses = [...courses]
      .sort((a, b) => (b._count?.applications ?? 0) - (a._count?.applications ?? 0))
      .slice(0, 5);

    // Top agent sources
    const agentCounts: Record<string, number> = {};
    for (const app of allApps) {
      if (app.tenantId) agentCounts[app.tenantId] = (agentCounts[app.tenantId] ?? 0) + 1;
    }
    const topAgents = Object.entries(agentCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tenantId, count]) => ({ tenantId, count }));

    return {
      totalApplications: totalApps,
      enrolled: enrolledApps,
      acceptanceRate,
      avgProcessingDays,
      stageBreakdown,
      topCourses,
      topAgents,
    };
  }

  async getPartnerAgents(universityId: string) {
    // Get unique tenant IDs from applications for this university
    const apps = await this.prisma.application.findMany({
      where: { universityId },
      select: { tenantId: true },
      distinct: ['tenantId'],
    });
    const tenantIds = apps.map((a) => a.tenantId).filter(Boolean) as string[];

    if (!tenantIds.length) return [];

    return this.prisma.agent.findMany({
      where: { tenantId: { in: tenantIds } },
      include: {
        tenant: { select: { name: true, subdomain: true, subscriptionPlan: true } },
        _count: { select: { students: true } },
      },
    });
  }

  // For AI proposal: get all eligible courses matching student profile
  async getEligibleCourses(filters: {
    minGrade?: number;
    minIelts?: number;
    maxBudgetUsd?: number;
    countries?: string[];
    field?: string;
    intake?: string;
  }) {
    const where: any = { isActive: true };
    if (filters.minGrade) where.minGradePercent = { lte: filters.minGrade };
    if (filters.minIelts) where.minIelts = { lte: filters.minIelts };
    if (filters.maxBudgetUsd) where.tuitionFeeUsd = { lte: filters.maxBudgetUsd };
    if (filters.countries?.length) where.university = { country: { in: filters.countries } };
    if (filters.field) where.field = { contains: filters.field, mode: 'insensitive' };

    return this.prisma.course.findMany({
      where,
      include: { university: true },
      take: 50,
    });
  }
}
