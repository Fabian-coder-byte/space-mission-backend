import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { SupabaseModule } from '../supabase/supabase.module.js';

@Module({
  imports: [SupabaseModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
