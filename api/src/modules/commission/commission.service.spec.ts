import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommissionStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { CommissionService } from './commission.service';
import { PrismaService } from '../../lib/prisma.service';

const mockPrisma = {
  setTenantContext: jest.fn().mockResolvedValue(undefined),
  commissionLedger: {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    aggregate: jest.fn(),
  },
  agent: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

describe('CommissionService', () => {
  let service: CommissionService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommissionService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CommissionService>(CommissionService);
  });

  describe('create — commission calculation', () => {
    const tenantId = 'tenant-1';
    const dto = {
      applicationId: 'app-1',
      universityId: 'uni-1',
      agentId: 'agent-1',
      grossAmountInr: 100_000,
    };

    it('splits gross into 30% platform + 70% agent share', async () => {
      mockPrisma.commissionLedger.findUnique.mockResolvedValue(null);
      mockPrisma.commissionLedger.create.mockImplementation(({ data }) => Promise.resolve(data));

      const result = await service.create(tenantId, dto);

      // Platform gets 30%
      expect(Number(result.platformShare)).toBeCloseTo(30_000);
      // Agent gross is 70%
      expect(Number(result.agentShare)).toBeCloseTo(70_000);
      // TDS = 10% of agent gross = 7 000
      expect(Number(result.tdsAmount)).toBeCloseTo(7_000);
      // Net payable = 70 000 - 7 000 = 63 000
      expect(Number(result.netPayableInr)).toBeCloseTo(63_000);
    });

    it('sets status to PENDING on creation', async () => {
      mockPrisma.commissionLedger.findUnique.mockResolvedValue(null);
      mockPrisma.commissionLedger.create.mockImplementation(({ data }) => Promise.resolve(data));

      const result = await service.create(tenantId, dto);

      expect(result.status).toBe(CommissionStatus.PENDING);
    });

    it('throws BadRequestException when commission already exists for application', async () => {
      mockPrisma.commissionLedger.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.create(tenantId, dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus — wallet crediting', () => {
    const existingCommission = {
      id: 'comm-1',
      agentId: 'agent-1',
      tenantId: 'tenant-1',
      netPayableInr: new Decimal(63_000),
    };

    it('increments agent walletBalance and totalEarned when status = PAID_TO_AGENT', async () => {
      mockPrisma.commissionLedger.findUnique.mockResolvedValue(existingCommission);
      mockPrisma.commissionLedger.update.mockResolvedValue({ ...existingCommission, status: CommissionStatus.PAID_TO_AGENT });
      mockPrisma.agent.update.mockResolvedValue({});

      await service.updateStatus('comm-1', CommissionStatus.PAID_TO_AGENT);

      expect(mockPrisma.agent.update).toHaveBeenCalledWith({
        where: { id: 'agent-1' },
        data: {
          walletBalance: { increment: existingCommission.netPayableInr },
          totalEarned: { increment: existingCommission.netPayableInr },
        },
      });
    });

    it('does NOT credit wallet for other status transitions', async () => {
      mockPrisma.commissionLedger.findUnique.mockResolvedValue(existingCommission);
      mockPrisma.commissionLedger.update.mockResolvedValue({ ...existingCommission, status: CommissionStatus.APPROVED });

      await service.updateStatus('comm-1', CommissionStatus.APPROVED);

      expect(mockPrisma.agent.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for unknown commission id', async () => {
      mockPrisma.commissionLedger.findUnique.mockResolvedValue(null);

      await expect(service.updateStatus('bad-id', CommissionStatus.APPROVED)).rejects.toThrow(NotFoundException);
    });
  });
});
