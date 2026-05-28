import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';
import { S3Service } from '../../lib/s3.service';
import { env } from '../../lib/config/env.config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProposalService {
  private readonly logger = new Logger(ProposalService.name);

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
    const proposal = await this.findOne(tenantId, id);
    const pdfKey = this.s3.buildProposalKey(tenantId, proposal.studentId, uuidv4());

    const pdfBuffer = await this.renderPdf(proposal);
    await this.s3.uploadBuffer(pdfKey, pdfBuffer, 'application/pdf');

    await this.prisma.proposal.update({
      where: { id },
      data: { pdfS3Key: pdfKey, pdfGeneratedAt: new Date() },
    });

    const downloadUrl = await this.s3.getPresignedDownloadUrl(pdfKey);
    return { downloadUrl, pdfKey };
  }

  private async renderPdf(proposal: any): Promise<Buffer> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const puppeteer = require('puppeteer');

    const universities: any[] = Array.isArray(proposal.matchedUniversities)
      ? proposal.matchedUniversities
      : [];

    const studentName: string = proposal.student?.user?.name ?? 'Student';
    const intake: string = proposal.targetIntake ?? 'TBD';
    const countries: string = (proposal.targetCountries ?? []).join(', ') || 'Any';
    const budget: string = proposal.budgetInr
      ? `₹${Number(proposal.budgetInr).toLocaleString('en-IN')}`
      : 'Not specified';

    const uniRows = universities
      .map(
        (u, i) => `
        <tr class="${i % 2 === 0 ? 'even' : 'odd'}">
          <td>${i + 1}</td>
          <td><strong>${u.university_name ?? u.universityName ?? 'N/A'}</strong></td>
          <td>${u.country ?? ''}</td>
          <td>${u.course_name ?? u.courseName ?? ''}</td>
          <td>${u.tuition_fee_usd != null ? `$${Number(u.tuition_fee_usd).toLocaleString()}` : 'N/A'}</td>
          <td>${u.qs_rank ?? u.qsRank ?? '—'}</td>
          <td>${u.roi_score != null ? (Number(u.roi_score) * 100).toFixed(0) + '%' : '—'}</td>
        </tr>`,
      )
      .join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a2e; font-size: 13px; padding: 32px 40px; }
  .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; border-bottom: 3px solid #2b7cff; padding-bottom: 16px; }
  .header h1 { font-size: 22px; color: #2b7cff; }
  .header .meta { font-size: 11px; color: #666; text-align: right; }
  .section { margin-bottom: 24px; }
  .section h2 { font-size: 14px; font-weight: 700; color: #2b7cff; border-left: 4px solid #2b7cff; padding-left: 8px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; background: #f7f9ff; padding: 14px 16px; border-radius: 6px; }
  .grid .item label { font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: 0.4px; display: block; }
  .grid .item span { font-size: 13px; font-weight: 600; color: #1a1a2e; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: #2b7cff; color: #fff; padding: 8px 10px; text-align: left; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3px; }
  td { padding: 7px 10px; vertical-align: top; border-bottom: 1px solid #e8ecf5; }
  tr.even td { background: #f7f9ff; }
  .sop { background: #f7f9ff; padding: 14px 16px; border-radius: 6px; line-height: 1.7; white-space: pre-wrap; font-size: 12px; }
  .footer { margin-top: 32px; border-top: 1px solid #e8ecf5; padding-top: 12px; font-size: 10px; color: #aaa; text-align: center; }
  .badge { display: inline-block; background: #e8f0ff; color: #2b7cff; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Study Abroad Proposal</h1>
      <p style="color:#666;font-size:12px;margin-top:4px;">Prepared by RightDirection</p>
    </div>
    <div class="meta">
      <div><strong>Student:</strong> ${studentName}</div>
      <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
      <div><strong>Intake:</strong> ${intake}</div>
    </div>
  </div>

  <div class="section">
    <h2>Profile Summary</h2>
    <div class="grid">
      <div class="item"><label>Target Countries</label><span>${countries}</span></div>
      <div class="item"><label>Annual Budget</label><span>${budget}</span></div>
      <div class="item"><label>Preferred Intake</label><span>${intake}</span></div>
      <div class="item"><label>Shortlisted Universities</label><span>${universities.length}</span></div>
    </div>
  </div>

  ${
    universities.length > 0
      ? `<div class="section">
    <h2>Shortlisted Universities</h2>
    <table>
      <thead>
        <tr>
          <th>#</th><th>University</th><th>Country</th><th>Course</th>
          <th>Tuition / yr</th><th>QS Rank</th><th>ROI Score</th>
        </tr>
      </thead>
      <tbody>${uniRows}</tbody>
    </table>
  </div>`
      : ''
  }

  ${
    proposal.sopContent
      ? `<div class="section">
    <h2>Statement of Purpose</h2>
    <div class="sop">${proposal.sopContent.replace(/<[^>]+>/g, '')}</div>
  </div>`
      : ''
  }

  <div class="footer">
    This proposal was generated by RightDirection. All information is for guidance purposes only.
    &copy; ${new Date().getFullYear()} RightDirection
  </div>
</body>
</html>`;

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      headless: true,
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
      });
      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
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
