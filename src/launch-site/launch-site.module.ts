import { Module } from '@nestjs/common';
import { LaunchSitesController } from './launch-site.controller.js';
import { LaunchSitesService } from './launch-site.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [LaunchSitesController],
  providers: [LaunchSitesService],
})
export class LaunchSiteModule {}
