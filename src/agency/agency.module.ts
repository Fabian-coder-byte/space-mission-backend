import { Module } from '@nestjs/common';
import { AgencyService } from './agency.service.js';
import { AgencyController } from './agency.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [AgencyService],
  controllers: [AgencyController],
})
export class AgencyModule {}
