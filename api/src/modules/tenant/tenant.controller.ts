import { Controller, Get, Patch, Post, Body, Param, UseGuards } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { CurrentUser, Tenant, Public } from '../../common/decorators';

@Controller('tenants')
export class TenantController {
  constructor(private tenantService: TenantService) {}

  @Public()
  @Get('by-subdomain/:subdomain')
  async getBySubdomain(@Param('subdomain') subdomain: string) {
    const data = await this.tenantService.getTenantBySubdomain(subdomain);
    return { data };
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Patch('branding')
  async updateBranding(@Tenant() tenantId: string, @Body() dto: any) {
    const data = await this.tenantService.updateBranding(tenantId, dto);
    return { data };
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Post('logo-upload-url')
  async getLogoUploadUrl(@Tenant() tenantId: string) {
    const data = await this.tenantService.getLogoUploadUrl(tenantId);
    return { data };
  }

  @UseGuards(JwtAuthGuard, TenantGuard)
  @Post('logo')
  async setLogo(@Tenant() tenantId: string, @Body('s3Key') s3Key: string) {
    const data = await this.tenantService.setLogoUrl(tenantId, s3Key);
    return { data };
  }
}
