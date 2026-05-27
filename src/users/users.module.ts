import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { SupabaseModule } from '../supabase/supabase.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [SupabaseModule, PrismaModule],
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
