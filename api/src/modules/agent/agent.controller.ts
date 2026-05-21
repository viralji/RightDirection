import { Controller, Get, Patch, Post, Body, UseGuards } from '@nestjs/common';
import { AgentService } from './agent.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Tenant } from '../../common/decorators';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('agent')
export class AgentController {
  constructor(private agent: AgentService) {}

  @Get('profile')
  @Roles(UserRole.AGENT_OWNER, UserRole.AGENT_MANAGER)
  async profile(@Tenant() tenantId: string) {
    const data = await this.agent.getProfile(tenantId);
    return { data };
  }

  @Get('stats')
  async stats(@Tenant() tenantId: string) {
    const data = await this.agent.getStats(tenantId);
    return { data };
  }

  @Get('team')
  @Roles(UserRole.AGENT_OWNER, UserRole.AGENT_MANAGER)
  async team(@Tenant() tenantId: string) {
    const data = await this.agent.listTeamMembers(tenantId);
    return { data };
  }

  @Patch('profile')
  @Roles(UserRole.AGENT_OWNER)
  async update(@Tenant() tenantId: string, @Body() dto: any) {
    const data = await this.agent.update(tenantId, dto);
    return { data };
  }

  @Post('kyc/upload-url')
  @Roles(UserRole.AGENT_OWNER)
  async kycUploadUrl(@Tenant() tenantId: string, @Body('docType') docType: string) {
    const data = await this.agent.getKycUploadUrl(tenantId, docType);
    return { data };
  }

  @Post('kyc/submit')
  @Roles(UserRole.AGENT_OWNER)
  async submitKyc(@Tenant() tenantId: string, @Body() dto: { s3Key: string; docType: string }) {
    const data = await this.agent.submitKyc(tenantId, dto.s3Key, dto.docType);
    return { data };
  }
}
