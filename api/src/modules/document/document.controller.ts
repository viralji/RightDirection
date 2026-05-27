import { Controller, Get, Post, Put, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { DocumentService } from './document.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Public } from '../../common/decorators';
import { CurrentUser, Tenant } from '../../common/decorators';
import { DocumentCategory, DocumentStatus } from '@prisma/client';
import { env } from '../../lib/config/env.config';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('documents')
export class DocumentController {
  constructor(private documents: DocumentService) {}

  /** Local dev: accept PUT when AWS is not configured (presign points here). */
  @Public()
  @Put('dev-upload')
  devUpload(@Query('key') key: string) {
    if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY && env.AWS_S3_BUCKET) {
      return { ok: false, message: 'Dev upload only when S3 is not configured' };
    }
    return { ok: true, key };
  }

  @Post('presign')
  async getPresignedUpload(@Tenant() tenantId: string, @Body() dto: any) {
    const data = await this.documents.getPresignedUpload(tenantId, dto);
    return { data };
  }

  @Post()
  async create(@Tenant() tenantId: string, @CurrentUser() user: any, @Body() dto: any) {
    const data = await this.documents.create(tenantId, user.sub, dto);
    return { data };
  }

  @Get()
  async list(@Tenant() tenantId: string, @Query() query: any) {
    const data = await this.documents.list(tenantId, query);
    return { data };
  }

  @Get(':id/download')
  async download(@Tenant() tenantId: string, @Param('id') id: string) {
    const data = await this.documents.getDownloadUrl(tenantId, id);
    return { data };
  }

  @Patch(':id/status')
  async updateStatus(@Tenant() tenantId: string, @Param('id') id: string, @Body() dto: { status: DocumentStatus; rejectedReason?: string }, @CurrentUser() user: any) {
    const data = await this.documents.updateStatus(tenantId, id, dto.status, dto.rejectedReason, user.sub);
    return { data };
  }

  @Post(':id/share-token')
  async createShareToken(@Tenant() tenantId: string, @Param('id') id: string) {
    const data = await this.documents.createShareToken(tenantId, id);
    return { data };
  }
}
