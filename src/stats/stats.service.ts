import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [missions, rockets, agencies, launchSites] = await Promise.all([
      this.prisma.mission.count(),
      this.prisma.rocket.count(),
      this.prisma.agency.count(),
      this.prisma.launchSite.count(),
    ]);

    return { missions, rockets, agencies, launchSites };
  }
}
