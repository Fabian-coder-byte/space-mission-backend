import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateRocketDto } from './dto/create-rocket.dto.js';
import { UpdateRocketDto } from './dto/update-rocket.dto.js';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class RocketsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRocketDto: CreateRocketDto) {
    try {
      return await this.prisma.rocket.create({
        data: {
          name: createRocketDto.name,
          manufacturer: createRocketDto.manufacturer,
          description: createRocketDto.description,
          reusable: createRocketDto.reusable ?? false,
          status: createRocketDto.status,
          heightMeters: createRocketDto.heightMeters,
          diameterMeters: createRocketDto.diameterMeters,
          massKg: createRocketDto.massKg,
          payloadToLeoKg: createRocketDto.payloadToLeoKg,
          payloadToGtoKg: createRocketDto.payloadToGtoKg,
          firstFlightDate: createRocketDto.firstFlightDate
            ? new Date(createRocketDto.firstFlightDate)
            : undefined,
          imageUrl: createRocketDto.imageUrl,
          agencyId: createRocketDto.agencyId,
        },
        include: {
          agency: true,
          missions: true,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll() {
    return this.prisma.rocket.findMany({
      include: {
        agency: true,
        missions: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const rocket = await this.prisma.rocket.findUnique({
      where: { id },
      include: {
        agency: true,
        missions: true,
      },
    });

    if (!rocket) {
      throw new NotFoundException(`Rocket con id "${id}" non trovata`);
    }

    return rocket;
  }

  async findAllPaginated(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.rocket.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),

      this.prisma.rocket.count(),
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

  async update(id: string, updateRocketDto: UpdateRocketDto) {
    await this.findOne(id);

    try {
      return await this.prisma.rocket.update({
        where: { id },
        data: {
          name: updateRocketDto.name,
          manufacturer: updateRocketDto.manufacturer,
          description: updateRocketDto.description,
          reusable: updateRocketDto.reusable,
          status: updateRocketDto.status,
          heightMeters: updateRocketDto.heightMeters,
          diameterMeters: updateRocketDto.diameterMeters,
          massKg: updateRocketDto.massKg,
          payloadToLeoKg: updateRocketDto.payloadToLeoKg,
          payloadToGtoKg: updateRocketDto.payloadToGtoKg,
          firstFlightDate: updateRocketDto.firstFlightDate
            ? new Date(updateRocketDto.firstFlightDate)
            : undefined,
          imageUrl: updateRocketDto.imageUrl,
          agencyId: updateRocketDto.agencyId,
        },
        include: {
          agency: true,
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
      return await this.prisma.rocket.delete({
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

      if (error.code === 'P2003') {
        throw new ConflictException(
          'Relazione non valida: agencyId o altro riferimento non esistente',
        );
      }
    }

    throw error;
  }
}
