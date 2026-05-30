import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../lib/prisma.service';
import { RedisService } from '../../lib/redis.service';
import { TwilioService } from '../../lib/twilio.service';
import { env } from '../../lib/config/env.config';
import { UserRole, TenantType, NotificationChannel } from '@prisma/client';

const AGENT_ROLES: UserRole[] = [
  UserRole.AGENT_OWNER,
  UserRole.AGENT_MANAGER,
  UserRole.AGENT_COUNSELOR,
  UserRole.AGENT_TELECALLER,
];
const UNIVERSITY_ROLES: UserRole[] = [UserRole.UNIVERSITY_ADMIN, UserRole.UNIVERSITY_STAFF];

const OTP_TTL = 600; // 10 minutes

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private jwt: JwtService,
    private twilio: TwilioService,
  ) {}

  async sendOtp(phone: string): Promise<void> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redis.set(`otp:${phone}`, otp, 'EX', OTP_TTL);

    if (this.twilio.isConfigured) {
      await this.twilio.sendOtp(phone, otp);
    } else if (env.NODE_ENV !== 'production') {
      console.log(`[DEV] OTP for ${phone}: ${otp}`);
    }
  }

  async verifyOtp(phone: string, otp: string): Promise<boolean> {
    const stored = await this.redis.get(`otp:${phone}`);
    if (!stored || stored !== otp) throw new BadRequestException('Invalid or expired OTP');
    await this.redis.del(`otp:${phone}`);
    return true;
  }

  async loginWithOtp(phone: string, otp: string) {
    await this.verifyOtp(phone, otp);
    const user = await this.prisma.user.findFirst({
      where: { phone, role: UserRole.STUDENT, isActive: true },
    });
    if (!user) {
      throw new NotFoundException(
        'No student account for this number. Register with your counselor agency code first.',
      );
    }
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    return this.generateTokens(user);
  }

  async registerStudent(dto: {
    phone: string;
    otp: string;
    name: string;
    email: string;
    password: string;
    agentSubdomain: string;
    preferredCountries?: string[];
  }) {
    await this.verifyOtp(dto.phone, dto.otp);

    const existingEmail = await this.prisma.user.findFirst({ where: { email: dto.email } });
    if (existingEmail) throw new ConflictException('Email already registered');

    const tenant = await this.prisma.tenant.findUnique({
      where: { subdomain: dto.agentSubdomain.toLowerCase().trim() },
      include: { agents: true },
    });
    if (!tenant || tenant.type !== TenantType.AGENT || tenant.status === 'SUSPENDED') {
      throw new BadRequestException('Invalid agency code. Check the subdomain your counselor shared.');
    }
    const agent = tenant.agents[0];
    if (!agent) throw new BadRequestException('Agency is not fully set up yet');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: dto.email,
          phone: dto.phone,
          passwordHash,
          role: UserRole.STUDENT,
          name: dto.name,
        },
      });

      const student = await tx.student.create({
        data: {
          userId: user.id,
          agentId: agent.id,
          tenantId: tenant.id,
          preferredCountries: dto.preferredCountries ?? [],
          leadSource: 'B2C_SELF_REGISTER',
          profileScore: 10,
        },
      });

      await tx.studentJourneyEvent.create({
        data: {
          studentId: student.id,
          tenantId: tenant.id,
          type: 'lead',
          title: 'Joined RightDirection',
          description: `Self-registered under ${agent.businessName}`,
          occurredAt: new Date(),
          actorName: dto.name,
          metadata: { source: 'self_register', subdomain: dto.agentSubdomain },
        },
      });

      await tx.notification.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          title: 'Welcome to RightDirection',
          body: `Your profile is linked to ${agent.businessName}. Upload documents to get started.`,
          channel: NotificationChannel.IN_APP,
        },
      });

      return { user, student, tenant };
    });

    await this.prisma.setTenantContext(tenant.id);
    return this.generateTokens(result.user);
  }

  async registerAgent(dto: {
    phone: string;
    otp: string;
    name: string;
    email: string;
    password: string;
    businessName: string;
    city: string;
    subdomain: string;
  }) {
    await this.verifyOtp(dto.phone, dto.otp);

    const existingSubdomain = await this.prisma.tenant.findUnique({
      where: { subdomain: dto.subdomain },
    });
    if (existingSubdomain) throw new ConflictException('Subdomain already taken');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          type: TenantType.AGENT,
          subdomain: dto.subdomain,
          name: dto.businessName,
          email: dto.email,
          phone: dto.phone,
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: dto.email,
          phone: dto.phone,
          passwordHash,
          role: UserRole.AGENT_OWNER,
          name: dto.name,
        },
      });

      await tx.agent.create({
        data: {
          tenantId: tenant.id,
          businessName: dto.businessName,
          city: dto.city,
        },
      });

      return { user, tenant };
    });
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findFirst({ where: { email, isActive: true } });
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    return this.generateTokens(user);
  }

  async refreshTokens(refreshToken: string) {
    let payload: any;
    try {
      payload = this.jwt.verify(refreshToken, { secret: env.JWT_REFRESH_SECRET });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const stored = await this.prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) throw new UnauthorizedException('Refresh token expired');

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) throw new UnauthorizedException();

    await this.prisma.refreshToken.delete({ where: { token: refreshToken } });
    return this.generateTokens(user);
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }

  /** Issue a full session for a user (super-admin demo impersonation). */
  async createSessionForUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) throw new NotFoundException('User not found');
    return this.generateTokens(user);
  }

  /** Restore admin session after demo impersonation. */
  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, tenantId: true, avatarUrl: true },
    });
    if (!user) throw new UnauthorizedException();
    return user;
  }

  async stopImpersonation(impersonatorUserId: string | undefined, currentRefreshToken?: string) {
    if (currentRefreshToken) {
      await this.logout(currentRefreshToken).catch(() => undefined);
    }

    let adminId = impersonatorUserId;
    if (!adminId) {
      const admin = await this.prisma.user.findFirst({
        where: { role: UserRole.SUPER_ADMIN, email: 'admin@rightdirection.com', isActive: true },
      });
      adminId = admin?.id;
    }

    if (!adminId) {
      throw new BadRequestException('Not in demo mode — sign in as admin@rightdirection.com');
    }

    return this.createSessionForUser(adminId);
  }

  private async generateTokens(user: any) {
    let agentId: string | undefined;
    let universityId: string | undefined;

    if (AGENT_ROLES.includes(user.role)) {
      const agent = await this.prisma.agent.findUnique({
        where: { tenantId: user.tenantId },
        select: { id: true },
      });
      agentId = agent?.id;
    } else if (UNIVERSITY_ROLES.includes(user.role)) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: user.tenantId },
        select: { universityId: true },
      });
      universityId = tenant?.universityId ?? undefined;
    }

    const payload = {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
      agentId,
      universityId,
    };

    const accessToken = this.jwt.sign(payload);
    const refreshToken = this.jwt.sign(payload, {
      secret: env.JWT_REFRESH_SECRET,
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt },
    });

    return { accessToken, refreshToken, user: { id: user.id, role: user.role, email: user.email, name: user.name, tenantId: user.tenantId } };
  }
}
