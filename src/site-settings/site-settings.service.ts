import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto.js';

@Injectable()
export class SiteSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    return this.prisma.siteSettings.upsert({
      where: { id: 'main' },
      update: {},
      create: { id: 'main' },
    });
  }

  async update(dto: UpdateSiteSettingsDto) {
    return this.prisma.siteSettings.upsert({
      where: { id: 'main' },
      update: dto,
      create: { id: 'main', ...dto },
    });
  }
}
