import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SpaceDataController } from './space-data.controller.js';
import { SpaceDataService } from './space-data.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ExternalApiModule } from '../external-api/external-api.module.js';

@Module({
  imports: [ScheduleModule.forRoot(), PrismaModule, ExternalApiModule],
  controllers: [SpaceDataController],
  providers: [SpaceDataService],
  exports: [SpaceDataService],
})
export class SpaceDataModule {}
