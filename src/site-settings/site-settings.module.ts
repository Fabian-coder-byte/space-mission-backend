import { Module } from '@nestjs/common';
import { SiteSettingsService } from './site-settings.service.js';
import { SiteSettingsController } from './site-settings.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [SiteSettingsService],
  controllers: [SiteSettingsController],
})
export class SiteSettingsModule {}
