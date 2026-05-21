import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { PrismaService } from '../../lib/prisma.service';
import { S3Service } from '../../lib/s3.service';

@Module({
  controllers: [DocumentController],
  providers: [DocumentService, PrismaService, S3Service],
  exports: [DocumentService],
})
export class DocumentModule {}
