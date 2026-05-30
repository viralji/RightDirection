import { BadRequestException, Controller, Get, Patch, Post, Param, Body, Query, Req, Res, UseGuards, HttpCode } from '@nestjs/common';
import { Request, Response } from 'express';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators';
import { UserRole, KYCStatus, SubscriptionPlan } from '@prisma/client';
import { AUTH_COOKIE_OPTS } from '../../lib/cookie-options';

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

  @Get('demo-personas')
  listDemoPersonas() {
    return { data: this.admin.listDemoPersonas() };
  }

  @Post('impersonate')
  @HttpCode(200)
  async impersonate(
    @Body() dto: { email: string },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const adminUserId = (req as any).user?.sub as string | undefined;
    if (!adminUserId) {
      throw new BadRequestException('No active session — sign in again as super admin');
    }

    const { accessToken, refreshToken, user, redirectPath, personaLabel } =
      await this.admin.impersonate(dto.email);

    res.cookie('impersonator_user_id', adminUserId, {
      ...AUTH_COOKIE_OPTS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie('access_token', accessToken, { ...AUTH_COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', refreshToken, { ...AUTH_COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });

    return { data: { user, redirectPath, personaLabel, impersonating: true } };
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

  @Get('commissions/analytics')
  async commissionAnalytics() {
    const data = await this.admin.getCommissionAnalytics();
    return { data };
  }

  @Get('agents/:agentId/detail')
  async agentDetail(@Param('agentId') agentId: string) {
    const data = await this.admin.getAgentDetail(agentId);
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
