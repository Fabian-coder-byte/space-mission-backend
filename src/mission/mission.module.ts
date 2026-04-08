import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { MissionsController } from './mission.controller.js';
import { MissionsService } from './mission.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [MissionsController],
  providers: [MissionsService],
})
export class MissionModule {}
