/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/LoginDto';
import { SupabaseService } from 'src/supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(private supabaseService: SupabaseService) {}
  async login(loginDto: LoginDto) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginDto.email,
      password: loginDto.password,
    });

    if (error || !data.session || !data.user) {
      throw new UnauthorizedException(
        error?.message || 'Credenziali non valide',
      );
    }

    // await this.prisma.profile.upsert({
    //   where: { id: data.user.id },
    //   update: {},
    //   create: {
    //     id: data.user.id,
    //     username: data.user.email?.split('@')[0] ?? null,
    //   },
    // });

    return {
      message: 'Login eseguito con successo',
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      session: {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        expiresAt: data.session.expires_at,
      },
    };
  }
}
