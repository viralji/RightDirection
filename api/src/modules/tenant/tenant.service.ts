import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';
import { RedisService } from '../../lib/redis.service';
import { S3Service } from '../../lib/s3.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TenantService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private s3: S3Service,
  ) {}

  async getTenantBySubdomain(subdomain: string) {
    // Try cache first
    const cached = await this.redis.getTenantBranding(subdomain);
    if (cached) return cached;

    const tenant = await this.prisma.tenant.findUnique({
      where: { subdomain },
      select: {
        id: true,
        subdomain: true,
        name: true,
        type: true,
        status: true,
        subscriptionPlan: true,
        logoUrl: true,
        primaryColor: true,
        secondaryColor: true,
        customDomain: true,
      },
    });

    if (!tenant) throw new NotFoundException(`Tenant not found: ${subdomain}`);
    await this.redis.setTenantBranding(subdomain, tenant);
    return tenant;
  }

  async updateBranding(tenantId: string, data: { primaryColor?: string; secondaryColor?: string; name?: string }) {
    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data,
    });
    await this.redis.invalidateTenantBranding(tenant.subdomain);
    return tenant;
  }

  async getLogoUploadUrl(tenantId: string) {
    const key = `logos/${tenantId}/${uuidv4()}.png`;
    return this.s3.getPresignedUploadUrl(key, 'image/png');
  }

  async setLogoUrl(tenantId: string, s3Key: string) {
    const logoUrl = this.s3.getPublicUrl(s3Key);
    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { logoUrl },
    });
    await this.redis.invalidateTenantBranding(tenant.subdomain);
    return { logoUrl };
  }
}
