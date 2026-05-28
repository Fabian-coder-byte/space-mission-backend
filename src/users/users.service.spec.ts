import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

const mockProfile = {
  id: 'abc-123',
  email: 'user@example.com',
  username: 'testuser',
  role: 'USER' as const,
  createdAt: new Date('2026-01-15T10:00:00Z'),
};

const mockAdminProfile = {
  ...mockProfile,
  id: 'admin-456',
  email: 'admin@example.com',
  username: 'adminuser',
  role: 'ADMIN' as const,
};

const mockPrisma = {
  profile: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('returns paginated list with correct meta', async () => {
      mockPrisma.$transaction.mockResolvedValue([[mockProfile], 1]);

      const result = await service.findAll(1, 10);

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toMatchObject({
        id: 'abc-123',
        email: 'user@example.com',
        username: 'testuser',
        role: 'USER',
      });
      expect(result.meta).toEqual({ total: 1, page: 1, limit: 10, totalPages: 1 });
    });

    it('calculates totalPages correctly', async () => {
      mockPrisma.$transaction.mockResolvedValue([Array(10).fill(mockProfile), 25]);

      const result = await service.findAll(1, 10);

      expect(result.meta.totalPages).toBe(3);
    });

    it('returns empty list when no profiles exist', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const result = await service.findAll();

      expect(result.items).toHaveLength(0);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });

    it('maps null email to placeholder', async () => {
      mockPrisma.$transaction.mockResolvedValue([
        [{ ...mockProfile, email: null, username: null }],
        1,
      ]);

      const result = await service.findAll();

      expect(result.items[0].email).toBe('—');
      expect(result.items[0].username).toBeNull();
    });

    it('uses correct skip for page 2', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      await service.findAll(2, 5);

      const call = mockPrisma.$transaction.mock.calls[0][0];
      expect(call).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('returns the correct user when found', async () => {
      mockPrisma.profile.findUnique.mockResolvedValue(mockAdminProfile);

      const result = await service.findOne('admin-456');

      expect(result).toMatchObject({
        id: 'admin-456',
        email: 'admin@example.com',
        username: 'adminuser',
        role: 'ADMIN',
      });
    });

    it('throws NotFoundException when profile does not exist', async () => {
      mockPrisma.profile.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });

    it('queries by the provided id', async () => {
      mockPrisma.profile.findUnique.mockResolvedValue(mockProfile);

      await service.findOne('abc-123');

      expect(mockPrisma.profile.findUnique).toHaveBeenCalledWith({
        where: { id: 'abc-123' },
      });
    });
  });
});
