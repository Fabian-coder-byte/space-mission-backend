import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateLaunchSiteDto } from './dto/create-launch-site.dto.js';
import { UpdateLaunchSiteDto } from './dto/update-launch-site.dto.js';

@Injectable()
export class LaunchSitesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLaunchSiteDto: CreateLaunchSiteDto) {
    try {
      return await this.prisma.launchSite.create({
        data: {
          name: createLaunchSiteDto.name,
          code: createLaunchSiteDto.code,
          locationName: createLaunchSiteDto.locationName,
          country: createLaunchSiteDto.country,
          region: createLaunchSiteDto.region,
          latitude: createLaunchSiteDto.latitude,
          longitude: createLaunchSiteDto.longitude,
          description: createLaunchSiteDto.description,
          imageUrl: createLaunchSiteDto.imageUrl,
        },
        include: {
          missions: true,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll() {
    return this.prisma.launchSite.findMany({
      // include: {
      //   missions: true,
      // },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAllPaginated(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? { name: { contains: search, mode: Prisma.QueryMode.insensitive } }
      : undefined;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.launchSite.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),

      this.prisma.launchSite.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const launchSite = await this.prisma.launchSite.findUnique({
      where: { id },
      include: {
        missions: true,
      },
    });

    if (!launchSite) {
      throw new NotFoundException(`LaunchSite con id "${id}" non trovato`);
    }

    return launchSite;
  }

  async update(id: string, updateLaunchSiteDto: UpdateLaunchSiteDto) {
    await this.findOne(id);

    try {
      return await this.prisma.launchSite.update({
        where: { id },
        data: {
          name: updateLaunchSiteDto.name,
          code: updateLaunchSiteDto.code,
          locationName: updateLaunchSiteDto.locationName,
          country: updateLaunchSiteDto.country,
          region: updateLaunchSiteDto.region,
          latitude: updateLaunchSiteDto.latitude,
          longitude: updateLaunchSiteDto.longitude,
          description: updateLaunchSiteDto.description,
          imageUrl: updateLaunchSiteDto.imageUrl,
        },
        include: {
          missions: true,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      return await this.prisma.launchSite.delete({
        where: { id },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = Array.isArray(error.meta?.target)
          ? error.meta.target.join(', ')
          : 'campo univoco';

        throw new ConflictException(
          `Esiste già un record con questo valore univoco: ${target}`,
        );
      }
    }

    throw error;
  }
}
