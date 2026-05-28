import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { MissionsService } from './mission.service';
import { PrismaService } from '../prisma/prisma.service';

const now = new Date();
const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

const mockMission = {
  id: 'mission-001',
  name: 'Artemis III',
  description: 'Moon landing mission',
  missionType: 'CREWED',
  status: 'SCHEDULED',
  launchDate: futureDate,
  windowStart: null,
  windowEnd: null,
  destination: 'Moon',
  orbit: null,
  isCrewed: true,
  imageUrl: null,
  detailsUrl: null,
  agencyId: 'agency-001',
  rocketId: 'rocket-001',
  launchSiteId: 'site-001',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  agency: { id: 'agency-001', name: 'NASA' },
  rocket: { id: 'rocket-001', name: 'SLS' },
  launchSite: { id: 'site-001', name: 'KSC LC-39B' },
};

const mockPrisma = {
  mission: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('MissionsService', () => {
  let service: MissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MissionsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<MissionsService>(MissionsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns all missions ordered by createdAt desc', async () => {
      mockPrisma.mission.findMany.mockResolvedValue([mockMission]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Artemis III');
    });

    it('returns empty array when no missions exist', async () => {
      mockPrisma.mission.findMany.mockResolvedValue([]);

      expect(await service.findAll()).toHaveLength(0);
    });
  });

  describe('findAllPaginated', () => {
    it('returns paginated results with meta', async () => {
      mockPrisma.$transaction.mockResolvedValue([[mockMission], 1]);

      const result = await service.findAllPaginated(1, 10);

      expect(result.items).toHaveLength(1);
      expect(result.meta).toEqual({ total: 1, page: 1, limit: 10, totalPages: 1 });
    });

    it('calculates correct totalPages', async () => {
      mockPrisma.$transaction.mockResolvedValue([Array(10).fill(mockMission), 32]);

      const result = await service.findAllPaginated(1, 10);

      expect(result.meta.totalPages).toBe(4);
    });
  });

  describe('findUpcoming', () => {
    it('returns only future scheduled/confirmed missions', async () => {
      mockPrisma.mission.findMany.mockResolvedValue([mockMission]);

      const result = await service.findUpcoming(5);

      expect(result).toHaveLength(1);
      const call = mockPrisma.mission.findMany.mock.calls[0][0];
      expect(call.where.status.in).toContain('SCHEDULED');
      expect(call.where.status.in).toContain('CONFIRMED');
      expect(call.take).toBe(5);
    });

    it('queries with gte: now for launchDate', async () => {
      mockPrisma.mission.findMany.mockResolvedValue([]);

      await service.findUpcoming();

      const call = mockPrisma.mission.findMany.mock.calls[0][0];
      expect(call.where.launchDate.gte).toBeInstanceOf(Date);
    });
  });

  describe('findOne', () => {
    it('returns the mission when found', async () => {
      mockPrisma.mission.findUnique.mockResolvedValue(mockMission);

      const result = await service.findOne('mission-001');

      expect(result.id).toBe('mission-001');
      expect(result.name).toBe('Artemis III');
    });

    it('throws NotFoundException when mission does not exist', async () => {
      mockPrisma.mission.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getChartStats', () => {
    it('returns upcoming, byMonth, and byStatus arrays', async () => {
      mockPrisma.mission.findMany
        .mockResolvedValueOnce([mockMission])
        .mockResolvedValueOnce([{ launchDate: futureDate, status: 'SCHEDULED' }]);
      mockPrisma.mission.groupBy.mockResolvedValue([
        { status: 'SCHEDULED', _count: { id: 1 } },
      ]);

      const result = await service.getChartStats();

      expect(result).toHaveProperty('upcoming');
      expect(result).toHaveProperty('byMonth');
      expect(result).toHaveProperty('byStatus');
      expect(Array.isArray(result.byMonth)).toBe(true);
      expect(result.byMonth).toHaveLength(12);
    });

    it('byMonth has 12 entries covering last 12 months', async () => {
      mockPrisma.mission.findMany.mockResolvedValue([]);
      mockPrisma.mission.groupBy.mockResolvedValue([]);

      const result = await service.getChartStats();

      expect(result.byMonth).toHaveLength(12);
      result.byMonth.forEach((entry: { month: string; count: number }) => {
        expect(entry).toHaveProperty('month');
        expect(entry).toHaveProperty('count');
        expect(entry.count).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('remove', () => {
    it('deletes the mission when it exists', async () => {
      mockPrisma.mission.findUnique.mockResolvedValue(mockMission);
      mockPrisma.mission.delete.mockResolvedValue(mockMission);

      await service.remove('mission-001');

      expect(mockPrisma.mission.delete).toHaveBeenCalledWith({ where: { id: 'mission-001' } });
    });

    it('throws NotFoundException when mission does not exist', async () => {
      mockPrisma.mission.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
