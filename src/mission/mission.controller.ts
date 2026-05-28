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
import { MissionsService } from './mission.service.js';
import { CreateMissionDto } from './dto/create-mission.dto.js';
import { UpdateMissionDto } from './dto/update-mission.dto.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Post()
  @Roles('ADMIN')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  create(@Body() createMissionDto: CreateMissionDto) {
    return this.missionsService.create(createMissionDto);
  }

  @Get()
  findAll() {
    return this.missionsService.findAll();
  }

  @Get('paginated')
  findAllPaginated(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.missionsService.findAllPaginated(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      search,
    );
  }

  @Get('upcoming')
  findUpcoming(@Query('limit') limit?: string) {
    return this.missionsService.findUpcoming(limit ? Number(limit) : undefined);
  }

  @Get('chart-stats')
  getChartStats() {
    return this.missionsService.getChartStats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.missionsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() updateMissionDto: UpdateMissionDto) {
    return this.missionsService.update(id, updateMissionDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.missionsService.remove(id);
  }
}
