import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { RocketsService } from './rocket.service.js';
import { CreateRocketDto } from './dto/create-rocket.dto.js';
import { UpdateRocketDto } from './dto/update-rocket.dto.js';

@Controller('rockets')
export class RocketsController {
  constructor(private readonly rocketsService: RocketsService) {}

  @Post()
  create(@Body() createRocketDto: CreateRocketDto) {
    return this.rocketsService.create(createRocketDto);
  }

  @Get()
  findAll() {
    return this.rocketsService.findAll();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.rocketsService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rocketsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRocketDto: UpdateRocketDto) {
    return this.rocketsService.update(id, updateRocketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rocketsService.remove(id);
  }
}
