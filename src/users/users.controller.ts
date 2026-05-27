import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';

@Controller('users')
@Roles('ADMIN')
@UseGuards(SupabaseAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      search,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
