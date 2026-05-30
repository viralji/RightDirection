import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { env } from '../../lib/config/env.config';
import { AUTH_COOKIE_OPTS } from '../../lib/cookie-options';
import { AuthService } from '../../modules/auth/auth.service';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class JwtAuthGuard {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private moduleRef: ModuleRef,
  ) {}

  private get authService(): AuthService {
    return this.moduleRef.get(AuthService, { strict: false });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const accessToken = this.extractAccessToken(request);
    if (accessToken) {
      try {
        const payload = await this.jwtService.verifyAsync(accessToken, {
          secret: env.JWT_ACCESS_SECRET,
        });
        request['user'] = payload;
        return true;
      } catch {
        // try refresh below
      }
    }

    const refreshToken = request.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('Session expired — please sign in again');
    }

    try {
      const { accessToken: newAccess, refreshToken: newRefresh } =
        await this.authService.refreshTokens(refreshToken);

      response.cookie('access_token', newAccess, { ...AUTH_COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
      response.cookie('refresh_token', newRefresh, { ...AUTH_COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });

      const payload = await this.jwtService.verifyAsync(newAccess, {
        secret: env.JWT_ACCESS_SECRET,
      });
      request['user'] = payload;
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Refresh token expired — please sign in again');
    }
  }

  private extractAccessToken(request: Request): string | null {
    if (request.cookies?.access_token) return request.cookies.access_token;
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
