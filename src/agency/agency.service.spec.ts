import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AgencyService } from './agency.service';
import { PrismaService } from '../prisma/prisma.service';

const mockAgency = {
  id: 'agency-001',
  externalId: null,
  name: 'NASA',
  country: 'USA',
  type: 'GOVERNMENT',
  description: 'National Aeronautics and Space Administration',
  website: 'https://nasa.gov',
  logoUrl: null,
  foundedYear: 1958,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockPrisma = {
  agency: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('AgencyService', () => {
  let service: AgencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgencyService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AgencyService>(AgencyService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = {
      name: 'ESA',
      country: 'Europe',
      type: 'INTERNATIONAL' as const,
      description: 'European Space Agency',
    };

    it('creates and returns the agency when name is unique', async () => {
      mockPrisma.agency.findFirst.mockResolvedValue(null);
      mockPrisma.agency.create.mockResolvedValue({ ...mockAgency, ...dto, id: 'esa-001' });

      const result = await service.create(dto as any);

      expect(result.name).toBe('ESA');
      expect(mockPrisma.agency.create).toHaveBeenCalledTimes(1);
    });

    it('throws ConflictException when name already exists', async () => {
      mockPrisma.agency.findFirst.mockResolvedValue(mockAgency);

      await expect(service.create({ name: 'NASA' } as any)).rejects.toThrow(ConflictException);
      expect(mockPrisma.agency.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns all agencies ordered by createdAt desc', async () => {
      mockPrisma.agency.findMany.mockResolvedValue([mockAgency]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('NASA');
    });
  });

  describe('findAllPaginated', () => {
    it('returns items and meta with defaults', async () => {
      mockPrisma.$transaction.mockResolvedValue([[mockAgency], 1]);

      const result = await service.findAllPaginated();

      expect(result.items).toHaveLength(1);
      expect(result.meta).toMatchObject({ total: 1, page: 1, limit: 10, totalPages: 1 });
    });

    it('returns correct totalPages for multiple pages', async () => {
      mockPrisma.$transaction.mockResolvedValue([Array(5).fill(mockAgency), 23]);

      const result = await service.findAllPaginated(1, 5);

      expect(result.meta.totalPages).toBe(5);
    });

    it('returns empty list with zero total when no agencies exist', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const result = await service.findAllPaginated();

      expect(result.items).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('findOne', () => {
    it('returns the agency when found', async () => {
      mockPrisma.agency.findUnique.mockResolvedValue(mockAgency);

      const result = await service.findOne('agency-001');

      expect(result.id).toBe('agency-001');
      expect(result.name).toBe('NASA');
    });

    it('throws NotFoundException when agency does not exist', async () => {
      mockPrisma.agency.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates and returns the agency', async () => {
      const updated = { ...mockAgency, country: 'United States' };
      mockPrisma.agency.findUnique.mockResolvedValue(mockAgency);
      mockPrisma.agency.update.mockResolvedValue(updated);

      const result = await service.update('agency-001', { country: 'United States' } as any);

      expect(result.country).toBe('United States');
    });

    it('throws NotFoundException when agency does not exist', async () => {
      mockPrisma.agency.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes the agency when it exists', async () => {
      mockPrisma.agency.findUnique.mockResolvedValue(mockAgency);
      mockPrisma.agency.delete.mockResolvedValue(mockAgency);

      await service.remove('agency-001');

      expect(mockPrisma.agency.delete).toHaveBeenCalledWith({ where: { id: 'agency-001' } });
    });

    it('throws NotFoundException when agency does not exist', async () => {
      mockPrisma.agency.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
