import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DocumentCategory, DocumentStatus } from '@prisma/client';
import { PrismaService } from '../../lib/prisma.service';
import { DocumentService } from '../document/document.service';
import {
  STUDENT_CATEGORY_LABELS,
  STUDENT_DOCUMENT_SLOTS,
  STUDENT_UPLOAD_CATEGORIES,
} from './student-document-slots';

const MAX_FILE_BYTES = 15 * 1024 * 1024;

@Injectable()
export class StudentDocumentsService {
  constructor(
    private prisma: PrismaService,
    private documents: DocumentService,
  ) {}

  private async resolveStudent(userId: string) {
    const student = await this.prisma.student.findFirst({
      where: { userId },
      include: { user: { select: { name: true, email: true } } },
    });
    if (!student) throw new NotFoundException('Student profile not found');
    return student;
  }

  private assertCategory(category: DocumentCategory) {
    if (!STUDENT_UPLOAD_CATEGORIES.includes(category)) {
      throw new ForbiddenException('Students cannot upload documents in this category');
    }
  }

  async getMyDocuments(userId: string) {
    const student = await this.resolveStudent(userId);
    await this.prisma.setTenantContext(student.tenantId);

    const docs = await this.prisma.document.findMany({
      where: { studentId: student.id, tenantId: student.tenantId },
      orderBy: [{ category: 'asc' }, { version: 'desc' }, { createdAt: 'desc' }],
    });

    const latestByCategory = new Map<DocumentCategory, (typeof docs)[0]>();
    for (const doc of docs) {
      if (!latestByCategory.has(doc.category)) {
        latestByCategory.set(doc.category, doc);
      }
    }

    const slots = STUDENT_DOCUMENT_SLOTS.map((slot) => {
      const latest = latestByCategory.get(slot.category);
      return {
        ...slot,
        status: latest?.status ?? DocumentStatus.NOT_UPLOADED,
        document: latest
          ? {
              id: latest.id,
              fileName: latest.fileName,
              fileSize: latest.fileSize,
              mimeType: latest.mimeType,
              status: latest.status,
              rejectedReason: latest.rejectedReason,
              version: latest.version,
              createdAt: latest.createdAt,
              updatedAt: latest.updatedAt,
            }
          : null,
        historyCount: docs.filter((d) => d.category === slot.category).length,
      };
    });

    const verified = slots.filter((s) => s.status === DocumentStatus.VERIFIED).length;
    const required = slots.filter((s) => s.required);
    const requiredUploaded = required.filter(
      (s) => s.status !== DocumentStatus.NOT_UPLOADED,
    ).length;

    return {
      studentId: student.id,
      slots,
      summary: {
        totalSlots: slots.length,
        uploaded: slots.filter((s) => s.status !== DocumentStatus.NOT_UPLOADED).length,
        verified,
        requiredTotal: required.length,
        requiredUploaded,
        underReview: slots.filter((s) => s.status === DocumentStatus.UNDER_REVIEW).length,
        rejected: slots.filter((s) => s.status === DocumentStatus.REJECTED).length,
      },
    };
  }

  async presignMyDocument(
    userId: string,
    dto: {
      category: DocumentCategory;
      fileName: string;
      mimeType: string;
      fileSize: number;
    },
  ) {
    this.assertCategory(dto.category);
    if (dto.fileSize > MAX_FILE_BYTES) {
      throw new BadRequestException('File must be 15 MB or smaller');
    }

    const student = await this.resolveStudent(userId);
    return this.documents.getPresignedUpload(student.tenantId, {
      studentId: student.id,
      category: dto.category,
      fileName: dto.fileName,
      mimeType: dto.mimeType,
      fileSize: dto.fileSize,
    });
  }

  async createMyDocument(
    userId: string,
    dto: {
      category: DocumentCategory;
      fileName: string;
      fileSize: number;
      mimeType: string;
      s3Key: string;
      parentDocId?: string;
    },
  ) {
    this.assertCategory(dto.category);
    if (dto.fileSize > MAX_FILE_BYTES) {
      throw new BadRequestException('File must be 15 MB or smaller');
    }

    const student = await this.resolveStudent(userId);
    const label = STUDENT_CATEGORY_LABELS[dto.category] ?? dto.category;

    const doc = await this.documents.create(student.tenantId, userId, {
      studentId: student.id,
      category: dto.category,
      fileName: dto.fileName,
      fileSize: dto.fileSize,
      mimeType: dto.mimeType,
      s3Key: dto.s3Key,
      parentDocId: dto.parentDocId,
    });

    await this.prisma.studentJourneyEvent.create({
      data: {
        studentId: student.id,
        tenantId: student.tenantId,
        type: 'document',
        title: `${label} uploaded`,
        description: `${dto.fileName} · ${DocumentStatus.UPLOADED.replace(/_/g, ' ')}`,
        occurredAt: new Date(),
        actorName: student.user.name,
        metadata: { documentId: doc.id, category: dto.category, status: doc.status },
      },
    });

    return doc;
  }

  async downloadMyDocument(userId: string, documentId: string) {
    const student = await this.resolveStudent(userId);
    const doc = await this.prisma.document.findFirst({
      where: { id: documentId, studentId: student.id, tenantId: student.tenantId },
    });
    if (!doc) throw new NotFoundException('Document not found');
    return this.documents.getDownloadUrl(student.tenantId, doc.id);
  }
}
