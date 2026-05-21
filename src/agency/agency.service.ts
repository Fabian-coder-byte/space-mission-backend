/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAgencyDto } from './dto/CreateAgencyDto.js';
import { UpdateAgencyDto } from './dto/UpdateAgencyDto.js';

@Injectable()
export class AgencyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAgencyDto: CreateAgencyDto) {
    const existingAgency = await this.prisma.agency.findFirst({
      where: {
        OR: [{ name: createAgencyDto.name }],
      },
    });

    if (existingAgency) {
      if (existingAgency.name === createAgencyDto.name) {
        throw new ConflictException('Esiste già una agency con questo name');
      }
    }

    return this.prisma.agency.create({
      data: createAgencyDto,
    });
  }

  async findAll() {
    return this.prisma.agency.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAllPaginated(page = 1, limit = 10, search = '') {
    const skip = (page - 1) * limit;

    const where = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.agency.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        where,
      }),

      this.prisma.agency.count({
        where,
      }),
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
    const agency = await this.prisma.agency.findUnique({
      where: { id },
      include: {
        missions: true,
        rockets: true,
      },
    });

    if (!agency) {
      throw new NotFoundException('Agency non trovata');
    }

    return agency;
  }

  async update(id: string, updateAgencyDto: UpdateAgencyDto) {
    await this.findOne(id);

    if (updateAgencyDto.name) {
      const existingAgency = await this.prisma.agency.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                updateAgencyDto.name
                  ? { name: updateAgencyDto.name }
                  : undefined,
              ].filter(Boolean) as any,
            },
          ],
        },
      });

      if (existingAgency) {
        if (
          updateAgencyDto.name &&
          existingAgency.name === updateAgencyDto.name
        ) {
          throw new ConflictException('Esiste già una agency con questo name');
        }
      }
    }

    return this.prisma.agency.update({
      where: { id },
      data: updateAgencyDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.agency.delete({
      where: { id },
    });
  }
}
