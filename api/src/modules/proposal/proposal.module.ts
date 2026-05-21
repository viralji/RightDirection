import { Module } from '@nestjs/common';
import { ProposalController } from './proposal.controller';
import { ProposalService } from './proposal.service';
import { PrismaService } from '../../lib/prisma.service';
import { S3Service } from '../../lib/s3.service';

@Module({
  controllers: [ProposalController],
  providers: [ProposalService, PrismaService, S3Service],
  exports: [ProposalService],
})
export class ProposalModule {}
