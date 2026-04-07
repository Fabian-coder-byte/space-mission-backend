import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AgencyService } from './agency.service.js';
import { CreateAgencyDto } from './dto/CreateAgencyDto.js';
import { UpdateAgencyDto } from './dto/UpdateAgencyDto.js';

@Controller('agencies')
export class AgencyController {
  constructor(private readonly agencyService: AgencyService) {}

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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAgencyDto: UpdateAgencyDto) {
    return this.agencyService.update(id, updateAgencyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agencyService.remove(id);
  }
}
