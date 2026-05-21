import { Controller, Get, Patch, Param, Body, Query, UseGuards, Delete } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { UserRole, KYCStatus, SubscriptionPlan } from '@prisma/client';

@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('stats')
  async stats() {
    const data = await this.admin.platformStats();
    return { data };
  }

  @Get('agents')
  async listAgents(@Query() query: any) {
    return this.admin.listAgents(query);
  }

  @Patch('agents/:tenantId/kyc')
  async reviewKyc(
    @Param('tenantId') tenantId: string,
    @Body() dto: { status: KYCStatus; reason?: string },
  ) {
    const data = await this.admin.reviewKyc(tenantId, dto.status, dto.reason);
    return { data };
  }

  @Patch('agents/:tenantId/suspend')
  async suspend(@Param('tenantId') tenantId: string) {
    const data = await this.admin.suspendAgent(tenantId);
    return { data };
  }

  @Patch('agents/:tenantId/plan')
  async updatePlan(
    @Param('tenantId') tenantId: string,
    @Body() dto: { plan: SubscriptionPlan; expiresAt?: string },
  ) {
    const data = await this.admin.updateAgentPlan(
      tenantId,
      dto.plan,
      dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    );
    return { data };
  }

  @Get('universities')
  async listUniversities(@Query() query: any) {
    return this.admin.listUniversitiesAdmin(query);
  }

  @Get('commissions/pending')
  async pendingCommissions() {
    const data = await this.admin.pendingCommissions();
    return { data };
  }

  @Get('fraud/high-risk')
  async highRisk() {
    const data = await this.admin.highRiskDocuments();
    return { data };
  }

  @Get('config')
  async getConfig() {
    const data = await this.admin.getPlatformConfig();
    return { data };
  }

  @Patch('config')
  async updateConfig(@Body() dto: Record<string, any>) {
    const data = await this.admin.updatePlatformConfig(dto);
    return { data };
  }

  @Get('activity-log')
  async activityLog(@Query() query: any) {
    return this.admin.getActivityLog(query);
  }
}
