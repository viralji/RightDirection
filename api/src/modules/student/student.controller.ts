import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { StudentService } from './student.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, CurrentUser, Tenant } from '../../common/decorators';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@Controller('students')
export class StudentController {
  constructor(private students: StudentService) {}

  @Get('me/dashboard')
  @Roles(UserRole.STUDENT)
  async myDashboard(@CurrentUser() user: any) {
    const data = await this.students.getMyDashboard(user.sub);
    return { data };
  }

  @Get('me/journey')
  @Roles(UserRole.STUDENT)
  async myJourney(@CurrentUser() user: any) {
    const data = await this.students.getMyJourney(user.sub);
    return { data };
  }

  @Get('me/profile')
  @Roles(UserRole.STUDENT)
  async myProfile(@CurrentUser() user: any) {
    const data = await this.students.findByUserId(user.sub);
    return { data };
  }

  @Get()
  @Roles(UserRole.AGENT_OWNER, UserRole.AGENT_MANAGER, UserRole.AGENT_COUNSELOR, UserRole.AGENT_TELECALLER)
  async list(@Tenant() tenantId: string, @Query() query: any) {
    return this.students.list(tenantId, query);
  }

  @Get(':id/journey')
  @Roles(UserRole.AGENT_OWNER, UserRole.AGENT_MANAGER, UserRole.AGENT_COUNSELOR, UserRole.AGENT_TELECALLER)
  async journey(@Tenant() tenantId: string, @Param('id') id: string) {
    const data = await this.students.getJourney(tenantId, id);
    return { data };
  }

  @Get(':id')
  @Roles(UserRole.AGENT_OWNER, UserRole.AGENT_MANAGER, UserRole.AGENT_COUNSELOR, UserRole.AGENT_TELECALLER)
  async findOne(@Tenant() tenantId: string, @Param('id') id: string) {
    const data = await this.students.findOne(tenantId, id);
    return { data };
  }

  @Post()
  @Roles(UserRole.AGENT_OWNER, UserRole.AGENT_MANAGER, UserRole.AGENT_COUNSELOR)
  async create(@Tenant() tenantId: string, @CurrentUser() user: any, @Body() dto: any) {
    const data = await this.students.create(tenantId, user.agentId, dto);
    return { data };
  }

  @Patch(':id')
  @Roles(UserRole.AGENT_OWNER, UserRole.AGENT_MANAGER, UserRole.AGENT_COUNSELOR)
  async update(@Tenant() tenantId: string, @Param('id') id: string, @Body() dto: any) {
    const data = await this.students.update(tenantId, id, dto);
    return { data };
  }
}
