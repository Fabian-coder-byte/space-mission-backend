import { Module } from '@nestjs/common';
import { StatsService } from './stats.service.js';
import { StatsController } from './stats.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [StatsService],
  controllers: [StatsController],
})
export class StatsModule {}
