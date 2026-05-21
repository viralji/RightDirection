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

  @Get()
  @Roles(UserRole.AGENT_OWNER, UserRole.AGENT_MANAGER, UserRole.AGENT_COUNSELOR)
  async list(@Tenant() tenantId: string, @Query() query: any) {
    return this.students.list(tenantId, query);
  }

  @Get(':id')
  @Roles(UserRole.AGENT_OWNER, UserRole.AGENT_MANAGER, UserRole.AGENT_COUNSELOR)
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
