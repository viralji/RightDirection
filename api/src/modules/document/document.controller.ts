import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { DocumentService } from './document.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentUser, Tenant } from '../../common/decorators';
import { DocumentCategory, DocumentStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard, TenantGuard)
@Controller('documents')
export class DocumentController {
  constructor(private documents: DocumentService) {}

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
