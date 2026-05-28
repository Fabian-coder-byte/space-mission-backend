import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { PrismaService } from '../prisma/prisma.service';

const mockFavorite = {
  id: 'fav-001',
  userId: 'user-abc',
  launchId: 'launch-xyz',
  launchName: 'Falcon 9 — Starlink',
  agencyName: 'SpaceX',
  net: new Date('2026-07-01T12:00:00Z'),
  imageUrl: 'https://example.com/img.jpg',
  createdAt: new Date('2026-05-01'),
};

const mockPrisma = {
  favorite: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
};

describe('FavoritesService', () => {
  let service: FavoritesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllByUser', () => {
    it('returns favorites for the given user ordered by createdAt desc', async () => {
      mockPrisma.favorite.findMany.mockResolvedValue([mockFavorite]);

      const result = await service.findAllByUser('user-abc');

      expect(result).toHaveLength(1);
      expect(result[0].launchId).toBe('launch-xyz');
      expect(mockPrisma.favorite.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-abc' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('returns empty array when user has no favorites', async () => {
      mockPrisma.favorite.findMany.mockResolvedValue([]);

      const result = await service.findAllByUser('user-abc');

      expect(result).toHaveLength(0);
    });
  });

  describe('checkFavorite', () => {
    it('returns isFavorite true when record exists', async () => {
      mockPrisma.favorite.findFirst.mockResolvedValue(mockFavorite);

      const result = await service.checkFavorite('user-abc', 'launch-xyz');

      expect(result).toEqual({ isFavorite: true, favoriteId: 'fav-001' });
    });

    it('returns isFavorite false when record does not exist', async () => {
      mockPrisma.favorite.findFirst.mockResolvedValue(null);

      const result = await service.checkFavorite('user-abc', 'unknown-launch');

      expect(result).toEqual({ isFavorite: false, favoriteId: null });
    });
  });

  describe('create', () => {
    const dto = {
      launchId: 'launch-xyz',
      launchName: 'Falcon 9 — Starlink',
      agencyName: 'SpaceX',
      net: '2026-07-01T12:00:00Z',
      imageUrl: 'https://example.com/img.jpg',
    };

    it('creates and returns the favorite', async () => {
      mockPrisma.favorite.create.mockResolvedValue(mockFavorite);

      const result = await service.create('user-abc', dto);

      expect(result).toEqual(mockFavorite);
      expect(mockPrisma.favorite.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-abc',
            launchId: 'launch-xyz',
            launchName: 'Falcon 9 — Starlink',
          }),
        }),
      );
    });

    it('throws ConflictException on duplicate (P2002)', async () => {
      const prismaError = Object.assign(new Error('Unique constraint'), { code: 'P2002' });
      mockPrisma.favorite.create.mockRejectedValue(prismaError);

      await expect(service.create('user-abc', dto)).rejects.toThrow(ConflictException);
    });

    it('re-throws unknown errors', async () => {
      const unknownError = new Error('DB unavailable');
      mockPrisma.favorite.create.mockRejectedValue(unknownError);

      await expect(service.create('user-abc', dto)).rejects.toThrow('DB unavailable');
    });
  });

  describe('remove', () => {
    it('deletes the favorite when it belongs to the user', async () => {
      mockPrisma.favorite.findFirst.mockResolvedValue(mockFavorite);
      mockPrisma.favorite.delete.mockResolvedValue(mockFavorite);

      const result = await service.remove('user-abc', 'fav-001');

      expect(result).toEqual(mockFavorite);
      expect(mockPrisma.favorite.delete).toHaveBeenCalledWith({ where: { id: 'fav-001' } });
    });

    it('throws NotFoundException when favorite does not belong to user', async () => {
      mockPrisma.favorite.findFirst.mockResolvedValue(null);

      await expect(service.remove('user-abc', 'other-fav')).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeByLaunchId', () => {
    it('deletes by launchId when favorite exists', async () => {
      mockPrisma.favorite.findFirst.mockResolvedValue(mockFavorite);
      mockPrisma.favorite.delete.mockResolvedValue(mockFavorite);

      await service.removeByLaunchId('user-abc', 'launch-xyz');

      expect(mockPrisma.favorite.delete).toHaveBeenCalledWith({ where: { id: 'fav-001' } });
    });

    it('throws NotFoundException when launch not in favorites', async () => {
      mockPrisma.favorite.findFirst.mockResolvedValue(null);

      await expect(
        service.removeByLaunchId('user-abc', 'nonexistent-launch'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
