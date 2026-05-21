import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { CommissionService } from './commission.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser, Tenant } from '../../common/decorators';
import { UserRole, CommissionStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('commissions')
export class CommissionController {
  constructor(private commissions: CommissionService) {}

  @Get()
  @Roles(UserRole.AGENT_OWNER, UserRole.SUPER_ADMIN)
  async list(@Tenant() tenantId: string, @Query() query: any) {
    return this.commissions.list(tenantId, query);
  }

  @Get('wallet')
  @Roles(UserRole.AGENT_OWNER)
  async wallet(@Tenant() tenantId: string, @CurrentUser() user: any) {
    const data = await this.commissions.walletSummary(tenantId, user.agentId);
    return { data };
  }

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  async create(@Tenant() tenantId: string, @Body() dto: any) {
    const data = await this.commissions.create(tenantId, dto);
    return { data };
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN)
  async updateStatus(@Param('id') id: string, @Body() dto: { status: CommissionStatus; payoutRef?: string }) {
    const data = await this.commissions.updateStatus(id, dto.status, dto.payoutRef);
    return { data };
  }
}
