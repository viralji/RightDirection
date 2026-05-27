import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../lib/prisma.service';
import { IS_PUBLIC_KEY } from './jwt-auth.guard';

@Injectable()
export class TenantGuard {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

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
