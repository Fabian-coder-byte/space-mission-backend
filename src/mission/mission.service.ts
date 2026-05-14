/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateMissionDto } from './dto/create-mission.dto.js';
import { UpdateMissionDto } from './dto/update-mission.dto.js';

@Injectable()
export class MissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createMissionDto: CreateMissionDto) {
    try {
      return await this.prisma.mission.create({
        data: {
          name: createMissionDto.name,
          description: createMissionDto.description,
          missionType: createMissionDto.missionType,
          status: createMissionDto.status,
          launchDate: createMissionDto.launchDate
            ? new Date(createMissionDto.launchDate)
            : undefined,
          windowStart: createMissionDto.windowStart
            ? new Date(createMissionDto.windowStart)
            : undefined,
          windowEnd: createMissionDto.windowEnd
            ? new Date(createMissionDto.windowEnd)
            : undefined,
          destination: createMissionDto.destination,
          orbit: createMissionDto.orbit,
          isCrewed: createMissionDto.isCrewed ?? false,
          imageUrl: createMissionDto.imageUrl,
          detailsUrl: createMissionDto.detailsUrl,
          agencyId: createMissionDto.agencyId,
          rocketId: createMissionDto.rocketId,
          launchSiteId: createMissionDto.launchSiteId,
        },
        include: {
          agency: true,
          rocket: true,
          launchSite: true,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll() {
    return this.prisma.mission.findMany({
      include: {
        agency: true,
        rocket: true,
        launchSite: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const mission = await this.prisma.mission.findUnique({
      where: { id },
      include: {
        agency: true,
        rocket: true,
        launchSite: true,
      },
    });

    if (!mission) {
      throw new NotFoundException(`Mission con id "${id}" non trovata`);
    }

    return mission;
  }

  async update(id: string, updateMissionDto: UpdateMissionDto) {
    await this.findOne(id);

    try {
      return await this.prisma.mission.update({
        where: { id },
        data: {
          name: updateMissionDto.name,
          description: updateMissionDto.description,
          missionType: updateMissionDto.missionType,
          status: updateMissionDto.status,
          launchDate: updateMissionDto.launchDate
            ? new Date(updateMissionDto.launchDate)
            : undefined,
          windowStart: updateMissionDto.windowStart
            ? new Date(updateMissionDto.windowStart)
            : undefined,
          windowEnd: updateMissionDto.windowEnd
            ? new Date(updateMissionDto.windowEnd)
            : undefined,
          destination: updateMissionDto.destination,
          orbit: updateMissionDto.orbit,
          isCrewed: updateMissionDto.isCrewed,
          imageUrl: updateMissionDto.imageUrl,
          detailsUrl: updateMissionDto.detailsUrl,
          agencyId: updateMissionDto.agencyId,
          rocketId: updateMissionDto.rocketId,
          launchSiteId: updateMissionDto.launchSiteId,
        },
        include: {
          agency: true,
          rocket: true,
          launchSite: true,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      return await this.prisma.mission.delete({
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
          'Uno dei riferimenti relazionali non esiste: agencyId, rocketId o launchSiteId',
        );
      }
    }

    throw error;
  }
}
