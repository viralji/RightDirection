import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';
import { S3Service } from '../../lib/s3.service';
import { env } from '../../lib/config/env.config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProposalService {
  constructor(private prisma: PrismaService, private s3: S3Service) {}

  async list(tenantId: string, studentId?: string) {
    await this.prisma.setTenantContext(tenantId);
    return this.prisma.proposal.findMany({
      where: { tenantId, ...(studentId && { studentId }) },
      include: { student: { include: { user: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    await this.prisma.setTenantContext(tenantId);
    const proposal = await this.prisma.proposal.findFirst({
      where: { id, tenantId },
      include: { student: { include: { user: true } } },
    });
    if (!proposal) throw new NotFoundException('Proposal not found');
    return proposal;
  }

  async create(tenantId: string, userId: string, dto: {
    studentId: string;
    matchedUniversities: any[];
    budgetInr?: number;
    targetCountries?: string[];
    targetIntake?: string;
    aiExplanation?: string;
  }) {
    await this.prisma.setTenantContext(tenantId);
    return this.prisma.proposal.create({
      data: {
        studentId: dto.studentId,
        tenantId,
        createdById: userId,
        matchedUniversities: dto.matchedUniversities,
        budgetInr: dto.budgetInr,
        targetCountries: dto.targetCountries ?? [],
        targetIntake: dto.targetIntake,
      },
    });
  }

  async updateSop(tenantId: string, id: string, sopContent: string) {
    await this.prisma.setTenantContext(tenantId);
    const proposal = await this.prisma.proposal.findFirst({ where: { id, tenantId } });
    if (!proposal) throw new NotFoundException('Proposal not found');

    return this.prisma.proposal.update({
      where: { id },
      data: { sopContent, sopVersion: { increment: 1 } },
    });
  }

  async generatePdf(tenantId: string, id: string) {
    // PDF generation is done via Puppeteer — placeholder for now
    // TODO: implement Puppeteer PDF rendering
    const proposal = await this.findOne(tenantId, id);
    const pdfKey = this.s3.buildProposalKey(tenantId, proposal.studentId, uuidv4());

    await this.prisma.proposal.update({
      where: { id },
      data: { pdfS3Key: pdfKey, pdfGeneratedAt: new Date() },
    });

    const downloadUrl = await this.s3.getPresignedDownloadUrl(pdfKey);
    return { downloadUrl, pdfKey };
  }

  async triggerAiProposal(tenantId: string, studentId: string, userId: string) {
    await this.prisma.setTenantContext(tenantId);

    const student = await this.prisma.student.findFirst({
      where: { id: studentId, tenantId },
    });
    if (!student) throw new NotFoundException('Student not found');

    // Call FastAPI proposal endpoint
    const response = await fetch(`${env.AI_SERVICE_URL}/ai/proposal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-api-key': env.INTERNAL_API_KEY,
      },
      body: JSON.stringify({
        student_id: studentId,
        tenant_id: tenantId,
        grade_pct: student.aggregatePct,
        ielts_score: student.ieltsScore,
        pte_score: student.pteScore,
        annual_budget_inr: student.annualBudgetInr,
        preferred_countries: student.preferredCountries,
        preferred_field: student.preferredField,
        preferred_intake: student.preferredIntake,
        education_level: student.educationLevel,
      }),
    });

    if (!response.ok) throw new Error('AI proposal generation failed');

    const result = await response.json();

    return this.create(tenantId, userId, {
      studentId,
      matchedUniversities: result.universities,
      budgetInr: student.annualBudgetInr ?? undefined,
      targetCountries: student.preferredCountries,
      targetIntake: student.preferredIntake ?? undefined,
      aiExplanation: result.ai_explanation,
    });
  }
}
