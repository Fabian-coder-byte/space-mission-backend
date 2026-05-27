import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RocketsService } from './rocket.service.js';
import { CreateRocketDto } from './dto/create-rocket.dto.js';
import { UpdateRocketDto } from './dto/update-rocket.dto.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('rockets')
export class RocketsController {
  constructor(private readonly rocketsService: RocketsService) {}

  //  @UseGuards(SupabaseAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  @Post()
  create(@Body() createRocketDto: CreateRocketDto) {
    return this.rocketsService.create(createRocketDto);
  }

  @Get()
  findAll() {
    return this.rocketsService.findAll();
  }

  @Get('paginated')
  findAllPaginated(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.rocketsService.findAllPaginated(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      search ? String(search) : undefined,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rocketsService.findOne(id);
  }
  @Patch(':id')
  //  @UseGuards(SupabaseAuthGuard, RolesGuard)
  // @Roles('ADMIN')
  update(@Param('id') id: string, @Body() updateRocketDto: UpdateRocketDto) {
    return this.rocketsService.update(id, updateRocketDto);
  }
  @Delete(':id')
  // @Roles('ADMIN')
  // @UseGuards(SupabaseAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.rocketsService.remove(id);
  }
}
