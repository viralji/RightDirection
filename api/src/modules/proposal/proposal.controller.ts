import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ProposalService } from './proposal.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser, Tenant } from '../../common/decorators';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('proposals')
export class ProposalController {
  constructor(private proposals: ProposalService) {}

  @Get()
  async list(@Tenant() tenantId: string, @Query('studentId') studentId?: string) {
    const data = await this.proposals.list(tenantId, studentId);
    return { data };
  }

  @Get(':id')
  async findOne(@Tenant() tenantId: string, @Param('id') id: string) {
    const data = await this.proposals.findOne(tenantId, id);
    return { data };
  }

  @Post('generate')
  @Roles(UserRole.AGENT_OWNER, UserRole.AGENT_MANAGER, UserRole.AGENT_COUNSELOR)
  async generate(@Tenant() tenantId: string, @CurrentUser() user: any, @Body('studentId') studentId: string) {
    const data = await this.proposals.triggerAiProposal(tenantId, studentId, user.sub);
    return { data };
  }

  @Patch(':id/sop')
  @Roles(UserRole.AGENT_OWNER, UserRole.AGENT_MANAGER, UserRole.AGENT_COUNSELOR)
  async updateSop(@Tenant() tenantId: string, @Param('id') id: string, @Body('sopContent') content: string) {
    const data = await this.proposals.updateSop(tenantId, id, content);
    return { data };
  }

  @Post(':id/pdf')
  @Roles(UserRole.AGENT_OWNER, UserRole.AGENT_MANAGER, UserRole.AGENT_COUNSELOR)
  async generatePdf(@Tenant() tenantId: string, @Param('id') id: string) {
    const data = await this.proposals.generatePdf(tenantId, id);
    return { data };
  }
}
