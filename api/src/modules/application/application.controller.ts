import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser, Tenant } from '../../common/decorators';
import { UserRole, ApplicationStage } from '@prisma/client';

@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('applications')
export class ApplicationController {
  constructor(private applications: ApplicationService) {}

  @Get()
  @Roles(UserRole.AGENT_OWNER, UserRole.AGENT_MANAGER, UserRole.AGENT_COUNSELOR, UserRole.UNIVERSITY_ADMIN, UserRole.UNIVERSITY_STAFF)
  async list(@Tenant() tenantId: string, @Query() query: any) {
    return this.applications.list(tenantId, query);
  }

  @Get('kanban')
  @Roles(UserRole.AGENT_OWNER, UserRole.AGENT_MANAGER, UserRole.AGENT_COUNSELOR)
  async kanban(@Tenant() tenantId: string) {
    const data = await this.applications.getKanban(tenantId);
    return { data };
  }

  @Get(':id')
  @Roles(UserRole.AGENT_OWNER, UserRole.AGENT_MANAGER, UserRole.AGENT_COUNSELOR, UserRole.UNIVERSITY_ADMIN, UserRole.UNIVERSITY_STAFF)
  async findOne(@Tenant() tenantId: string, @Param('id') id: string) {
    const data = await this.applications.findOne(tenantId, id);
    return { data };
  }

  @Post()
  @Roles(UserRole.AGENT_OWNER, UserRole.AGENT_MANAGER, UserRole.AGENT_COUNSELOR)
  async create(@Tenant() tenantId: string, @CurrentUser() user: any, @Body() dto: any) {
    const data = await this.applications.create(tenantId, user.agentId, user.sub, dto);
    return { data };
  }

  @Patch(':id/stage')
  @Roles(UserRole.AGENT_OWNER, UserRole.AGENT_MANAGER, UserRole.AGENT_COUNSELOR)
  async changeStage(
    @Tenant() tenantId: string,
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: { stage: ApplicationStage; note?: string },
  ) {
    const data = await this.applications.changeStage(tenantId, id, user.sub, dto.stage, dto.note);
    return { data };
  }

  @Patch(':id')
  @Roles(UserRole.AGENT_OWNER, UserRole.AGENT_MANAGER, UserRole.AGENT_COUNSELOR)
  async update(@Tenant() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    const data = await this.applications.update(tenantId, id, dto);
    return { data };
  }
}
