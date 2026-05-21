import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { UniversityService } from './university.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Public, CurrentUser } from '../../common/decorators';
import { UserRole } from '@prisma/client';

@Controller('universities')
export class UniversityController {
  constructor(private universities: UniversityService) {}

  @Public()
  @Get()
  async list(@Query() query: any) {
    return this.universities.list(query);
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.universities.findOne(id);
    return { data };
  }

  @Public()
  @Get(':id/courses')
  async listCourses(@Param('id') id: string) {
    const data = await this.universities.listCourses(id);
    return { data };
  }

  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  async create(@Body() dto: any) {
    const data = await this.universities.create(dto);
    return { data };
  }

  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  async update(@Param('id') id: string, @Body() dto: any) {
    const data = await this.universities.update(id, dto);
    return { data };
  }

  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Post(':id/courses')
  @Roles(UserRole.SUPER_ADMIN)
  async createCourse(@Param('id') universityId: string, @Body() dto: any) {
    const data = await this.universities.createCourse(universityId, dto);
    return { data };
  }

  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Patch('courses/:courseId')
  @Roles(UserRole.SUPER_ADMIN)
  async updateCourse(@Param('courseId') courseId: string, @Body() dto: any) {
    const data = await this.universities.updateCourse(courseId, dto);
    return { data };
  }

  // ── University Portal endpoints (authenticated as UNIVERSITY_ADMIN/STAFF) ──

  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(UserRole.UNIVERSITY_ADMIN, UserRole.UNIVERSITY_STAFF)
  @Get('portal/analytics')
  async portalAnalytics(@CurrentUser() user: any) {
    const data = await this.universities.getUniversityAnalytics(user.universityId);
    return { data };
  }

  @UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
  @Roles(UserRole.UNIVERSITY_ADMIN, UserRole.UNIVERSITY_STAFF)
  @Get('portal/agents')
  async portalAgents(@CurrentUser() user: any) {
    const data = await this.universities.getPartnerAgents(user.universityId);
    return { data };
  }
}
