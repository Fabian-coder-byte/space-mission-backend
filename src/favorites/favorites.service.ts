import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateFavoriteDto } from './dto/create-favorite.dto.js';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByUser(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateFavoriteDto) {
    try {
      return await this.prisma.favorite.create({
        data: {
          userId,
          launchId: dto.launchId,
          launchName: dto.launchName,
          agencyName: dto.agencyName,
          net: dto.net ? new Date(dto.net) : undefined,
          imageUrl: dto.imageUrl,
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new ConflictException('Questo lancio è già nei preferiti');
      }
      throw error;
    }
  }

  async remove(userId: string, id: string) {
    const favorite = await this.prisma.favorite.findFirst({
      where: { id, userId },
    });

    if (!favorite) {
      throw new NotFoundException('Preferito non trovato');
    }

    return this.prisma.favorite.delete({ where: { id } });
  }

  async removeByLaunchId(userId: string, launchId: string) {
    const favorite = await this.prisma.favorite.findFirst({
      where: { launchId, userId },
    });

    if (!favorite) {
      throw new NotFoundException('Preferito non trovato');
    }

    return this.prisma.favorite.delete({ where: { id: favorite.id } });
  }
}
