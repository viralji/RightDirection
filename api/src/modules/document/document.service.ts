import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';
import { S3Service } from '../../lib/s3.service';
import { DocumentCategory, DocumentStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService, private s3: S3Service) {}

  async getPresignedUpload(tenantId: string, dto: {
    studentId: string;
    category: DocumentCategory;
    fileName: string;
    mimeType: string;
    fileSize: number;
  }) {
    const uuid = uuidv4();
    const ext = dto.fileName.split('.').pop();
    const s3Key = this.s3.buildDocumentKey(tenantId, dto.studentId, dto.category, `${uuid}.${ext}`);
    const { url } = await this.s3.getPresignedUploadUrl(s3Key, dto.mimeType);
    return { uploadUrl: url, s3Key };
  }

  async create(tenantId: string, userId: string, dto: {
    studentId?: string;
    applicationId?: string;
    category: DocumentCategory;
    fileName: string;
    fileSize: number;
    mimeType: string;
    s3Key: string;
    parentDocId?: string;
  }) {
    let version = 1;
    if (dto.parentDocId) {
      const parent = await this.prisma.document.findUnique({ where: { id: dto.parentDocId } });
      if (parent) version = parent.version + 1;
    }

    return this.prisma.document.create({
      data: {
        userId,
        tenantId,
        studentId: dto.studentId,
        applicationId: dto.applicationId,
        category: dto.category,
        fileName: dto.fileName,
        fileSize: dto.fileSize,
        mimeType: dto.mimeType,
        s3Key: dto.s3Key,
        version,
        parentDocId: dto.parentDocId,
        status: DocumentStatus.UPLOADED,
      },
    });
  }

  async list(tenantId: string, filters: { studentId?: string; applicationId?: string; category?: DocumentCategory; search?: string }) {
    await this.prisma.setTenantContext(tenantId);
    const where: any = { tenantId, studentId: { not: null } };
    if (filters.studentId) where.studentId = filters.studentId;
    if (filters.applicationId) where.applicationId = filters.applicationId;
    if (filters.category) where.category = filters.category;
    if (filters.search) {
      where.OR = [
        { fileName: { contains: filters.search, mode: 'insensitive' } },
        { user: { name: { contains: filters.search, mode: 'insensitive' } } },
        { student: { user: { name: { contains: filters.search, mode: 'insensitive' } } } },
      ];
    }
    return this.prisma.document.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        student: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: [{ category: 'asc' }, { version: 'desc' }],
    });
  }

  async getDownloadUrl(tenantId: string, id: string) {
    const doc = await this.prisma.document.findFirst({ where: { id, tenantId } });
    if (!doc) throw new NotFoundException('Document not found');
    const url = await this.s3.getPresignedDownloadUrl(doc.s3Key);
    return { url, fileName: doc.fileName };
  }

  async updateStatus(tenantId: string, id: string, status: DocumentStatus, rejectedReason?: string, verifiedById?: string) {
    await this.prisma.setTenantContext(tenantId);
    return this.prisma.document.update({
      where: { id },
      data: { status, rejectedReason, verifiedById, verifiedAt: status === DocumentStatus.VERIFIED ? new Date() : undefined },
    });
  }

  async createShareToken(tenantId: string, id: string) {
    const doc = await this.prisma.document.findFirst({ where: { id, tenantId } });
    if (!doc) throw new NotFoundException('Document not found');

    const token = uuidv4().replace(/-/g, '');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.prisma.document.update({ where: { id }, data: { shareToken: token, expiresAt } });
    return { shareToken: token, expiresAt };
  }
}
