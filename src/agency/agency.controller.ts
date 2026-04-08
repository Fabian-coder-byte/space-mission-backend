import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AgencyService } from './agency.service.js';
import { CreateAgencyDto } from './dto/CreateAgencyDto.js';
import { UpdateAgencyDto } from './dto/UpdateAgencyDto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';

@Controller('agencies')
export class AgencyController {
  constructor(private readonly agencyService: AgencyService) {}

  @Get('test-header')
  testHeader(@Req() req: any) {
    return {
      authorization: req.headers.authorization,
    };
  }

  @UseGuards(SupabaseAuthGuard)
  @Post()
  create(@Body() createAgencyDto: CreateAgencyDto) {
    return this.agencyService.create(createAgencyDto);
  }

  @Get()
  findAll() {
    return this.agencyService.findAll();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.agencyService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agencyService.findOne(id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAgencyDto: UpdateAgencyDto) {
    return this.agencyService.update(id, updateAgencyDto);
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agencyService.remove(id);
  }
}
