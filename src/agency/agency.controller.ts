import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AgencyService } from './agency.service.js';
import { CreateAgencyDto } from './dto/CreateAgencyDto.js';
import { UpdateAgencyDto } from './dto/UpdateAgencyDto.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import type { Response } from 'express';

@Controller('agencies')
export class AgencyController {
  constructor(private readonly agencyService: AgencyService) {}

  @Post()
  @Roles('ADMIN')
  // @UseGuards(SupabaseAuthGuard, RolesGuard)
  create(@Body() createAgencyDto: CreateAgencyDto) {
    return this.agencyService.create(createAgencyDto);
  }

  @Get()
  findAll() {
    return this.agencyService.findAll();
  }
  @Get('paginated')
  findAllPaginated(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.agencyService.findAllPaginated(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      search,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agencyService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  // @UseGuards(SupabaseAuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() updateAgencyDto: UpdateAgencyDto) {
    return this.agencyService.update(id, updateAgencyDto);
  }

  @Delete(':id')
  // @UseGuards(SupabaseAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.agencyService.remove(id);
  }

  @Get('export/csv')
  async exportCsv(@Res() res: Response) {
    const csv = await this.agencyService.exportAgenciesCsv();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="agencies.csv"');

    return res.send(csv);
  }
}
