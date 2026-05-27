import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatsService } from './stats.service.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('stats')
@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles('ADMIN')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  getStats() {
    return this.statsService.getStats();
  }
}
