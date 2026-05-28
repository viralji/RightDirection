import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DocumentCategory } from '@prisma/client';
import { DocumentService } from './document.service';
import { PrismaService } from '../../lib/prisma.service';
import { S3Service } from '../../lib/s3.service';

const mockPrisma = {
  setTenantContext: jest.fn().mockResolvedValue(undefined),
  document: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const mockS3 = {
  buildDocumentKey: jest.fn().mockReturnValue('docs/tenant/student/category/uuid.pdf'),
  getPresignedUploadUrl: jest.fn().mockResolvedValue({ url: 'https://s3.example.com/upload' }),
  getPresignedDownloadUrl: jest.fn().mockResolvedValue('https://s3.example.com/download'),
};

describe('DocumentService', () => {
  let service: DocumentService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: S3Service, useValue: mockS3 },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  describe('getPresignedUpload — MIME type allowlist', () => {
    const validBase = {
      studentId: 'stu-1',
      category: DocumentCategory.IDENTITY,
      fileName: 'passport.pdf',
      fileSize: 1_000_000,
    };

    it.each([
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ])('allows %s', async (mimeType) => {
      await expect(
        service.getPresignedUpload('tenant-1', { ...validBase, mimeType }),
      ).resolves.toMatchObject({ uploadUrl: expect.any(String), s3Key: expect.any(String) });
    });

    it.each([
      'text/html',
      'application/javascript',
      'application/x-executable',
      'video/mp4',
    ])('rejects %s', async (mimeType) => {
      await expect(
        service.getPresignedUpload('tenant-1', { ...validBase, mimeType }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPresignedUpload — file size cap', () => {
    const baseDto = {
      studentId: 'stu-1',
      category: DocumentCategory.IDENTITY,
      fileName: 'doc.pdf',
      mimeType: 'application/pdf',
    };

    it('accepts files at exactly 15 MB', async () => {
      await expect(
        service.getPresignedUpload('tenant-1', { ...baseDto, fileSize: 15 * 1024 * 1024 }),
      ).resolves.toBeDefined();
    });

    it('rejects files exceeding 15 MB', async () => {
      await expect(
        service.getPresignedUpload('tenant-1', { ...baseDto, fileSize: 15 * 1024 * 1024 + 1 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getDownloadUrl', () => {
    it('returns presigned URL for an existing document', async () => {
      mockPrisma.document.findFirst.mockResolvedValue({ id: 'doc-1', s3Key: 'key', fileName: 'file.pdf' });

      const result = await service.getDownloadUrl('tenant-1', 'doc-1');

      expect(result.url).toContain('s3.example.com');
      expect(result.fileName).toBe('file.pdf');
    });

    it('throws NotFoundException for unknown document', async () => {
      mockPrisma.document.findFirst.mockResolvedValue(null);

      await expect(service.getDownloadUrl('tenant-1', 'bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
