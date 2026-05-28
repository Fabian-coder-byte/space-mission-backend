import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  mission: { count: jest.fn() },
  rocket: { count: jest.fn() },
  agency: { count: jest.fn() },
  launchSite: { count: jest.fn() },
};

describe('StatsService', () => {
  let service: StatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('returns counts for all four entity types', async () => {
      mockPrisma.mission.count.mockResolvedValue(5);
      mockPrisma.rocket.count.mockResolvedValue(3);
      mockPrisma.agency.count.mockResolvedValue(10);
      mockPrisma.launchSite.count.mockResolvedValue(2);

      const result = await service.getStats();

      expect(result).toEqual({ missions: 5, rockets: 3, agencies: 10, launchSites: 2 });
    });

    it('returns zeros when database is empty', async () => {
      mockPrisma.mission.count.mockResolvedValue(0);
      mockPrisma.rocket.count.mockResolvedValue(0);
      mockPrisma.agency.count.mockResolvedValue(0);
      mockPrisma.launchSite.count.mockResolvedValue(0);

      const result = await service.getStats();

      expect(result).toEqual({ missions: 0, rockets: 0, agencies: 0, launchSites: 0 });
    });

    it('calls all four prisma count methods', async () => {
      mockPrisma.mission.count.mockResolvedValue(1);
      mockPrisma.rocket.count.mockResolvedValue(1);
      mockPrisma.agency.count.mockResolvedValue(1);
      mockPrisma.launchSite.count.mockResolvedValue(1);

      await service.getStats();

      expect(mockPrisma.mission.count).toHaveBeenCalledTimes(1);
      expect(mockPrisma.rocket.count).toHaveBeenCalledTimes(1);
      expect(mockPrisma.agency.count).toHaveBeenCalledTimes(1);
      expect(mockPrisma.launchSite.count).toHaveBeenCalledTimes(1);
    });
  });
});
