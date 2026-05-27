import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service.js';
import { CreateFavoriteDto } from './dto/create-favorite.dto.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';

@Controller('favorites')
@UseGuards(SupabaseAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.favoritesService.findAllByUser(req.user.id);
  }

  @Get('check/:launchId')
  checkFavorite(@Req() req: any, @Param('launchId') launchId: string) {
    return this.favoritesService.checkFavorite(req.user.id, launchId);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateFavoriteDto) {
    return this.favoritesService.create(req.user.id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.favoritesService.remove(req.user.id, id);
  }

  @Delete('launch/:launchId')
  removeByLaunchId(@Req() req: any, @Param('launchId') launchId: string) {
    return this.favoritesService.removeByLaunchId(req.user.id, launchId);
  }
}
