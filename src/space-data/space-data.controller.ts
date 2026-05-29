import { Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { SpaceDataService } from './space-data.service.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('space-data')
@Roles('ADMIN')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class SpaceDataController {
  constructor(private readonly spaceDataService: SpaceDataService) {}

  @Post('import/all')
  @HttpCode(200)
  importAll() {
    return this.spaceDataService.importAll();
  }

  @Post('import/agencies')
  @HttpCode(200)
  importAgencies() {
    return this.spaceDataService.importAgencies();
  }

  @Post('import/rockets')
  @HttpCode(200)
  importRockets() {
    return this.spaceDataService.importRockets();
  }

  @Post('import/launch-sites')
  @HttpCode(200)
  importLaunchSites() {
    return this.spaceDataService.importLaunchSites();
  }

  @Post('import/missions')
  @HttpCode(200)
  importMissions() {
    return this.spaceDataService.importMissions();
  }
}
