import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service.js';
import { FavoritesController } from './favorites.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [FavoritesService],
  controllers: [FavoritesController],
})
export class FavoritesModule {}
