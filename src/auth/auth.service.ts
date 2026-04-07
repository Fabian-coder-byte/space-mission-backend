import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/LoginDto';
import { RegisterDto } from './dto/RegisterDto';
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

  async register(registerDto: RegisterDto) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.signUp({
      email: registerDto.email,
      password: registerDto.password,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      message:
        'Registrazione avvenuta con successo. Controlla la tua email per confermare l’account, se la conferma email è attiva.',
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email,
          }
        : null,
      session: data.session
        ? {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            expiresAt: data.session.expires_at,
          }
        : null,
    };
  }
}
