import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/LoginDto';
import { RegisterDto } from './dto/RegisterDto';
import { RefreshTokenDto } from './dto/RefreshTokenDto';
import { ResetPasswordDto } from './dto/ResetPasswordDto';
import { ResendConfirmationDto } from './dto/ResendConfirmationDto';
import { SupabaseService } from 'src/supabase/supabase.service';
import { ForgotPasswordDto } from './dto/ForgotPasswordDto';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

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
      options: {
        data: {
          username: registerDto.username ?? null,
        },
      },
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

  async logout(accessToken: string) {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      message: 'Logout eseguito con successo',
    };
  }

  async refresh(dto: RefreshTokenDto) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: dto.refreshToken,
    });

    if (error || !data.session || !data.user) {
      throw new UnauthorizedException(
        error?.message || 'Refresh token non valido',
      );
    }

    return {
      message: 'Sessione aggiornata con successo',
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

  async me(accessToken: string) {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      throw new UnauthorizedException(
        error?.message || 'Utente non autenticato',
      );
    }

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        emailConfirmedAt: data.user.email_confirmed_at,
        userMetadata: data.user.user_metadata,
        role: data.user.role,
      },
    };
  }

  async resendConfirmation(dto: ResendConfirmationDto) {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: dto.email,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      message: 'Email di conferma inviata nuovamente',
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.auth.resetPasswordForEmail(dto.email, {
      redirectTo: 'http://localhost:3000/reset-password',
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      message: 'Email per reset password inviata con successo',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const supabase = this.supabaseService.getClient();

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: dto.accessToken,
      refresh_token: dto.refreshToken,
    });

    if (sessionError) {
      throw new BadRequestException(sessionError.message);
    }

    const { data, error } = await supabase.auth.updateUser({
      password: dto.newPassword,
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      message: 'Password aggiornata con successo',
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    };
  }
}
