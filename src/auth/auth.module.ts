import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { SupabaseModule } from '../supabase/supabase.module.js';
import { PassportModule } from '@nestjs/passport';
import { RolesGuard } from './guards/roles.guard.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [
    SupabaseModule,
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [PassportModule],
})
export class AuthModule {}
