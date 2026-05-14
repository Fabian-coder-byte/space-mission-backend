import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { LaunchSitesService } from './launch-site.service.js';
import { CreateLaunchSiteDto } from './dto/create-launch-site.dto.js';
import { UpdateLaunchSiteDto } from './dto/update-launch-site.dto.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('launch-sites')
export class LaunchSitesController {
  constructor(private readonly launchSitesService: LaunchSitesService) {}

  @Post()
  @Roles('ADMIN')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  create(@Body() createLaunchSiteDto: CreateLaunchSiteDto) {
    return this.launchSitesService.create(createLaunchSiteDto);
  }

  @Get()
  findAll() {
    return this.launchSitesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.launchSitesService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  update(
    @Param('id') id: string,
    @Body() updateLaunchSiteDto: UpdateLaunchSiteDto,
  ) {
    return this.launchSitesService.update(id, updateLaunchSiteDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.launchSitesService.remove(id);
  }
}
