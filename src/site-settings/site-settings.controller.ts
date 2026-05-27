import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { SiteSettingsService } from './site-settings.service.js';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('site-settings')
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get()
  get() {
    return this.siteSettingsService.get();
  }

  @Patch()
  @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Body() dto: UpdateSiteSettingsDto) {
    return this.siteSettingsService.update(dto);
  }
}
