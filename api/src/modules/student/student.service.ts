import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const JOURNEY_TYPE_ICONS: Record<string, string> = {
  lead: 'user-plus',
  call: 'phone',
  meeting: 'users',
  profile: 'clipboard',
  document: 'file-text',
  application: 'send',
  stage: 'git-branch',
  proposal: 'sparkles',
  offer: 'award',
  visa: 'plane',
  payment: 'wallet',
  enrolled: 'graduation-cap',
  ai: 'cpu',
  note: 'sticky-note',
};

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  async list(tenantId: string, filters: { search?: string; country?: string; status?: string; page?: number | string; pageSize?: number | string }) {
    await this.prisma.setTenantContext(tenantId);
    const page = Math.max(1, Number(filters.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(filters.pageSize) || 20));
    const { search, country } = filters;
    const skip = (page - 1) * pageSize;

    const where: any = { tenantId };
    if (search) {
      where.user = { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] };
    }
    if (country) where.preferredCountries = { has: country };

    const [students, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        include: { user: { select: { name: true, email: true, phone: true } } },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.student.count({ where }),
    ]);

    return { data: students, meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) } };
  }

  private studentInclude() {
    return {
      user: { select: { name: true, email: true, phone: true, avatarUrl: true, createdAt: true } },
      agent: { select: { businessName: true, city: true } },
      applications: {
        include: {
          course: { select: { name: true, level: true, field: true } },
          university: { select: { name: true, country: true, logoUrl: true } },
          stageHistory: { orderBy: { createdAt: 'asc' as const } },
          commission: { select: { status: true, netPayableInr: true } },
        },
        orderBy: { updatedAt: 'desc' as const },
      },
      proposals: { orderBy: { createdAt: 'desc' as const } },
      documents: { orderBy: { createdAt: 'desc' as const } },
      trustScore: true,
      journeyEvents: { orderBy: { occurredAt: 'desc' as const }, take: 20 },
    };
  }

  async findOne(tenantId: string, id: string) {
    await this.prisma.setTenantContext(tenantId);
    const student = await this.prisma.student.findFirst({
      where: { id, tenantId },
      include: this.studentInclude(),
    });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async findByUserId(userId: string) {
    const student = await this.prisma.student.findFirst({
      where: { userId },
      include: this.studentInclude(),
    });
    if (!student) throw new NotFoundException('Student profile not found');
    return student;
  }

  async getJourney(tenantId: string, studentId: string) {
    await this.prisma.setTenantContext(tenantId);
    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
      include: {
        user: { select: { name: true, email: true } },
        journeyEvents: { orderBy: { occurredAt: 'desc' } },
        applications: {
          include: {
            university: { select: { name: true } },
            course: { select: { name: true } },
            stageHistory: { orderBy: { createdAt: 'asc' } },
          },
        },
      },
    });
    if (!student) throw new NotFoundException('Student not found');

    const events = student.journeyEvents.map((e) => ({
      id: e.id,
      type: e.type,
      icon: JOURNEY_TYPE_ICONS[e.type] ?? 'circle',
      title: e.title,
      description: e.description,
      occurredAt: e.occurredAt,
      applicationId: e.applicationId,
      actorName: e.actorName,
      metadata: e.metadata,
    }));

    const stats = {
      totalEvents: events.length,
      applications: student.applications.length,
      activeStage: student.applications[0]?.stage ?? null,
      daysWithAgency: Math.floor(
        (Date.now() - new Date(student.createdAt).getTime()) / (1000 * 60 * 60 * 24),
      ),
    };

    return {
      student: { id: student.id, name: student.user.name, email: student.user.email },
      stats,
      events,
      applications: student.applications,
    };
  }

  async getMyJourney(userId: string) {
    const student = await this.findByUserId(userId);
    return this.getJourney(student.tenantId, student.id);
  }

  async getMyDashboard(userId: string) {
    const student = await this.findByUserId(userId);
    const unreadNotifications = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    return {
      student,
      summary: {
        profileScore: student.profileScore ?? 0,
        applicationsCount: student.applications.length,
        documentsCount: student.documents.length,
        proposalsCount: student.proposals.length,
        trustOverall: student.trustScore?.overallScore ?? null,
        unreadNotifications,
        preferredCountries: student.preferredCountries,
        preferredIntake: student.preferredIntake,
      },
    };
  }

  async create(tenantId: string, agentId: string, dto: any) {
    await this.prisma.setTenantContext(tenantId);
    const passwordHash = await bcrypt.hash(uuidv4(), 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          tenantId,
          email: dto.email,
          phone: dto.phone,
          passwordHash,
          role: UserRole.STUDENT,
          name: dto.name,
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          agentId,
          tenantId,
          educationLevel: dto.educationLevel,
          aggregatePct: dto.aggregatePct,
          stream: dto.stream,
          preferredField: dto.preferredField ?? [],
          ieltsScore: dto.ieltsScore,
          pteScore: dto.pteScore,
          annualBudgetInr: dto.annualBudgetInr,
          preferredCountries: dto.preferredCountries ?? [],
          preferredIntake: dto.preferredIntake,
          leadSource: dto.leadSource,
        },
      });

      return { ...student, user };
    });
  }

  async update(tenantId: string, id: string, dto: any) {
    await this.prisma.setTenantContext(tenantId);
    return this.prisma.student.update({
      where: { id },
      data: dto,
    });
  }

  async updateProfileScore(id: string) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) return;

    let score = 0;
    if (student.educationLevel) score += 15;
    if (student.aggregatePct) score += 15;
    if (student.ieltsScore || student.pteScore || student.toeflScore) score += 20;
    if (student.annualBudgetInr) score += 10;
    if (student.preferredCountries.length) score += 10;
    if (student.preferredIntake) score += 10;
    if (student.preferredField.length) score += 10;
    if (student.greScore || student.gmatScore) score += 10;
    if (student.profileDetails) score += 10;

    await this.prisma.student.update({ where: { id }, data: { profileScore: Math.min(100, score) } });
  }
}
