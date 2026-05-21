import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma.service';

@Injectable()
export class TenantGuard {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;

    const tenantId: string = user.tenantId;
    if (!tenantId) throw new ForbiddenException('No tenant context');

    // Set RLS context for this request
    await this.prisma.setTenantContext(tenantId);
    request['tenantId'] = tenantId;
    return true;
  }
}
