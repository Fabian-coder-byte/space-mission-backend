import { Module } from '@nestjs/common';
import { RocketsService } from './rocket.service.js';
import { RocketsController } from './rocket.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [RocketsService],
  controllers: [RocketsController],
})
export class RocketModule {}
