import { Module } from '@nestjs/common';
import { UniversityController } from './university.controller';
import { UniversityService } from './university.service';
import { PrismaService } from '../../lib/prisma.service';
import { S3Service } from '../../lib/s3.service';

@Module({
  controllers: [UniversityController],
  providers: [UniversityService, PrismaService, S3Service],
  exports: [UniversityService],
})
export class UniversityModule {}
