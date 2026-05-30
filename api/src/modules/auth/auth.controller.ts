import { Controller, Post, Body, Res, Req, Get, HttpCode, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { Public, CurrentUser } from '../../common/decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Throttle } from '@nestjs/throttler';
import { AUTH_COOKIE_OPTS } from '../../lib/cookie-options';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('send-otp')
  async sendOtp(@Body('phone') phone: string) {
    await this.auth.sendOtp(phone);
    return {
      data: {
        message: 'OTP sent',
        devHint:
          process.env.NODE_ENV !== 'production'
            ? 'Check API server console for OTP in development'
            : undefined,
      },
    };
  }

  @Public()
  @Post('register/agent')
  async registerAgent(@Body() dto: any, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.registerAgent(dto);
    return { data: result };
  }

  @Public()
  @Post('register/student')
  @HttpCode(200)
  async registerStudent(@Body() dto: any, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = await this.auth.registerStudent(dto);
    res.clearCookie('impersonator_user_id');
    res.clearCookie('impersonator_refresh_token');
    res.cookie('access_token', accessToken, { ...AUTH_COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', refreshToken, { ...AUTH_COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return { data: { user } };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login/otp')
  @HttpCode(200)
  async loginOtp(
    @Body() dto: { phone: string; otp: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, user } = await this.auth.loginWithOtp(dto.phone, dto.otp);
    res.cookie('access_token', accessToken, { ...AUTH_COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', refreshToken, { ...AUTH_COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return { data: { user } };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: { email: string; password: string }, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, user } = await this.auth.login(dto.email, dto.password);
    res.clearCookie('impersonator_user_id');
    res.clearCookie('impersonator_refresh_token');
    res.cookie('access_token', accessToken, { ...AUTH_COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', refreshToken, { ...AUTH_COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return { data: { user } };
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refresh_token;
    const { accessToken, refreshToken, user } = await this.auth.refreshTokens(token);
    res.cookie('access_token', accessToken, { ...AUTH_COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', refreshToken, { ...AUTH_COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return { data: { user } };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refresh_token;
    if (token) await this.auth.logout(token);
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.clearCookie('impersonator_refresh_token');
    res.clearCookie('impersonator_user_id');
    return { data: { message: 'Logged out' } };
  }

  @UseGuards(JwtAuthGuard)
  @Post('impersonate/stop')
  @HttpCode(200)
  async stopImpersonation(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const impersonatorUserId = req.cookies?.impersonator_user_id;
    const currentRefresh = req.cookies?.refresh_token;

    const { accessToken, refreshToken, user } = await this.auth.stopImpersonation(
      impersonatorUserId,
      currentRefresh,
    );

    res.clearCookie('impersonator_refresh_token');
    res.clearCookie('impersonator_user_id');
    res.cookie('access_token', accessToken, { ...AUTH_COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', refreshToken, { ...AUTH_COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 * 1000 });

    return { data: { user, redirectPath: '/admin/dashboard', impersonating: false } };
  }

  @Get('me')
  async me(@Req() req: Request, @CurrentUser() user: any) {
    const impersonating = !!req.cookies?.impersonator_user_id;
    const dbUser = await this.auth.getUserProfile(user.sub);
    return { data: { ...dbUser, impersonating } };
  }
}
