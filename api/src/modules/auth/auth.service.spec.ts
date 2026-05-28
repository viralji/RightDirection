import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { AuthService } from './auth.service';
import { PrismaService } from '../../lib/prisma.service';
import { RedisService } from '../../lib/redis.service';
import { TwilioService } from '../../lib/twilio.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed'),
  compare: jest.fn(),
}));

const mockPrisma = {
  setTenantContext: jest.fn().mockResolvedValue(undefined),
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn().mockResolvedValue({}),
    create: jest.fn(),
  },
  refreshToken: {
    create: jest.fn().mockResolvedValue({}),
    findUnique: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  agent: { findUnique: jest.fn() },
  tenant: { findUnique: jest.fn() },
};

const mockRedis = {
  set: jest.fn().mockResolvedValue('OK'),
  get: jest.fn(),
  del: jest.fn().mockResolvedValue(1),
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('signed-token'),
  verify: jest.fn(),
};

const mockTwilio = { isConfigured: false, sendOtp: jest.fn() };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
        { provide: JwtService, useValue: mockJwt },
        { provide: TwilioService, useValue: mockTwilio },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('verifyOtp', () => {
    it('returns true when OTP matches', async () => {
      mockRedis.get.mockResolvedValue('123456');

      const result = await service.verifyOtp('+919876543210', '123456');

      expect(result).toBe(true);
      expect(mockRedis.del).toHaveBeenCalledWith('otp:+919876543210');
    });

    it('throws BadRequestException when OTP is wrong', async () => {
      mockRedis.get.mockResolvedValue('111111');

      await expect(service.verifyOtp('+919876543210', '999999')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when OTP is expired (null)', async () => {
      mockRedis.get.mockResolvedValue(null);

      await expect(service.verifyOtp('+919876543210', '123456')).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    const bcrypt = require('bcrypt');

    it('throws UnauthorizedException for unknown email', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(service.login('x@x.com', 'pw')).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'u1', passwordHash: 'hashed', email: 'a@b.com', role: UserRole.AGENT_OWNER, tenantId: 'tid' });
      bcrypt.compare.mockResolvedValue(false);

      await expect(service.login('a@b.com', 'wrong')).rejects.toThrow(UnauthorizedException);
    });

    it('returns tokens for valid credentials', async () => {
      const user = { id: 'u1', passwordHash: 'hashed', email: 'a@b.com', role: UserRole.AGENT_OWNER, tenantId: 'tid', name: 'Test' };
      mockPrisma.user.findFirst.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      mockPrisma.agent.findUnique.mockResolvedValue({ id: 'agent-1' });

      const result = await service.login('a@b.com', 'correct');

      expect(result.accessToken).toBe('signed-token');
      expect(result.refreshToken).toBe('signed-token');
    });
  });

  describe('generateTokens — JWT payload', () => {
    const bcrypt = require('bcrypt');

    it('includes agentId for AGENT_OWNER role', async () => {
      const user = { id: 'u1', passwordHash: 'hashed', email: 'a@b.com', role: UserRole.AGENT_OWNER, tenantId: 'tid', name: 'Owner' };
      mockPrisma.user.findFirst.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      mockPrisma.agent.findUnique.mockResolvedValue({ id: 'agent-99' });

      await service.login('a@b.com', 'correct');

      const signPayload = mockJwt.sign.mock.calls[0][0];
      expect(signPayload.agentId).toBe('agent-99');
      expect(signPayload.universityId).toBeUndefined();
    });

    it('includes universityId for UNIVERSITY_ADMIN role', async () => {
      const user = { id: 'u2', passwordHash: 'hashed', email: 'u@uni.com', role: UserRole.UNIVERSITY_ADMIN, tenantId: 'tid-u', name: 'UniAdmin' };
      mockPrisma.user.findFirst.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      mockPrisma.tenant.findUnique.mockResolvedValue({ universityId: 'uni-55' });

      await service.login('u@uni.com', 'correct');

      const signPayload = mockJwt.sign.mock.calls[0][0];
      expect(signPayload.universityId).toBe('uni-55');
      expect(signPayload.agentId).toBeUndefined();
    });

    it('includes neither agentId nor universityId for STUDENT role', async () => {
      const user = { id: 'u3', passwordHash: 'hashed', email: 's@s.com', role: UserRole.STUDENT, tenantId: 'tid-s', name: 'Student' };
      mockPrisma.user.findFirst.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);

      await service.login('s@s.com', 'correct');

      const signPayload = mockJwt.sign.mock.calls[0][0];
      expect(signPayload.agentId).toBeUndefined();
      expect(signPayload.universityId).toBeUndefined();
    });
  });
});
