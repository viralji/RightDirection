import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  async list(tenantId: string, filters: { search?: string; country?: string; status?: string; page?: number; pageSize?: number }) {
    await this.prisma.setTenantContext(tenantId);
    const { page = 1, pageSize = 20, search, country } = filters;
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

  async findOne(tenantId: string, id: string) {
    await this.prisma.setTenantContext(tenantId);
    const student = await this.prisma.student.findFirst({
      where: { id, tenantId },
      include: {
        user: { select: { name: true, email: true, phone: true, avatarUrl: true } },
        applications: { include: { course: true, university: true } },
        proposals: true,
        documents: true,
        trustScore: true,
      },
    });
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async create(tenantId: string, agentId: string, dto: any) {
    await this.prisma.setTenantContext(tenantId);
    const passwordHash = await bcrypt.hash(uuidv4(), 10); // temp password

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

    await this.prisma.student.update({ where: { id }, data: { profileScore: score } });
  }
}
