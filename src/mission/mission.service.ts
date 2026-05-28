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
          agencyId: createMissionDto.agencyId ?? null,
          rocketId: createMissionDto.rocketId ?? null,
          launchSiteId: createMissionDto.launchSiteId ?? null,
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

  async getChartStats() {
    const now = new Date();
    const sixMonthsLater = new Date(now);
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const [upcoming, recentMissions, statusCounts] = await Promise.all([
      this.prisma.mission.findMany({
        where: {
          launchDate: { gte: now, lte: sixMonthsLater },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
        orderBy: { launchDate: 'asc' },
        take: 10,
        select: {
          id: true,
          name: true,
          launchDate: true,
          status: true,
          agency: { select: { name: true } },
        },
      }),
      this.prisma.mission.findMany({
        where: { launchDate: { gte: twelveMonthsAgo } },
        select: { launchDate: true, status: true },
      }),
      this.prisma.mission.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    const byMonthMap: Record<string, number> = {};
    recentMissions.forEach((m) => {
      if (!m.launchDate) return;
      const d = new Date(m.launchDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      byMonthMap[key] = (byMonthMap[key] ?? 0) + 1;
    });

    const byMonth: { month: string; count: number }[] = [];
    for (let i = -11; i <= 0; i++) {
      const d = new Date(now);
      d.setMonth(d.getMonth() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      byMonth.push({ month: key, count: byMonthMap[key] ?? 0 });
    }

    return {
      upcoming,
      byMonth,
      byStatus: statusCounts.map((s) => ({ status: s.status, count: s._count.id })),
    };
  }

  async findUpcoming(limit?: number) {
    return this.prisma.mission.findMany({
      where: {
        launchDate: { gte: new Date() },
        status: { in: ['SCHEDULED', 'CONFIRMED'] },
      },
      orderBy: { launchDate: 'asc' },
      take: limit,
      include: {
        agency: true,
        rocket: true,
        launchSite: true,
      },
    });
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

  async findAllPaginated(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? { name: { contains: search, mode: Prisma.QueryMode.insensitive } }
      : undefined;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.mission.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),

      this.prisma.mission.count({ where }),
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
          agencyId: updateMissionDto.agencyId ?? null,
          rocketId: updateMissionDto.rocketId ?? null,
          launchSiteId: updateMissionDto.launchSiteId ?? null,
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
