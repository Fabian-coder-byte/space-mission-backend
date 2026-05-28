import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/LoginDto.js';
import { RegisterDto } from './dto/RegisterDto.js';
import { RefreshTokenDto } from './dto/RefreshTokenDto.js';
import { ResetPasswordDto } from './dto/ResetPasswordDto.js';
import { ResendConfirmationDto } from './dto/ResendConfirmationDto.js';
import { UpdateProfileDto } from './dto/UpdateProfileDto.js';
import { ChangePasswordDto } from './dto/ChangePasswordDto.js';
import { SupabaseService } from '../supabase/supabase.service.js';
import { ForgotPasswordDto } from './dto/ForgotPasswordDto.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
  ) {}

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

    const profile = await this.prisma.profile.upsert({
      where: { id: data.user.id },
      update: {
        email: data.user.email,
        username: (data.user.user_metadata?.username as string | undefined) ?? undefined,
      },
      create: {
        id: data.user.id,
        email: data.user.email,
        username: (data.user.user_metadata?.username as string | undefined) ?? null,
        role: 'USER',
      },
      select: { id: true, role: true },
    });

    return {
      user: {
        id: data.user.id,
        email: data.user.email,
        emailConfirmedAt: data.user.email_confirmed_at,
        userMetadata: data.user.user_metadata,
        role: profile.role,
        createdAt: data.user.created_at,
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

  async updateProfile(accessToken: string, dto: UpdateProfileDto) {
    const supabase = this.supabaseService.getClient();

    const { data: userData, error: userError } =
      await supabase.auth.getUser(accessToken);

    if (userError || !userData.user) {
      throw new UnauthorizedException('Token non valido');
    }

    const existing = userData.user.user_metadata ?? {};
    const updatedMeta = {
      ...existing,
      ...(dto.username !== undefined && { username: dto.username }),
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.bio !== undefined && { bio: dto.bio }),
    };

    const adminClient = this.supabaseService.getAdminClient();
    const { data, error } = await adminClient.auth.admin.updateUserById(
      userData.user.id,
      { user_metadata: updatedMeta },
    );

    if (error) {
      throw new BadRequestException(error.message);
    }

    return {
      message: 'Profilo aggiornato con successo',
      user: {
        id: data.user.id,
        email: data.user.email,
        userMetadata: data.user.user_metadata,
      },
    };
  }

  async changePassword(accessToken: string, dto: ChangePasswordDto) {
    const supabase = this.supabaseService.getClient();

    const { data: userData, error: userError } =
      await supabase.auth.getUser(accessToken);

    if (userError || !userData.user?.email) {
      throw new UnauthorizedException('Token non valido');
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: userData.user.email,
      password: dto.currentPassword,
    });

    if (verifyError) {
      throw new BadRequestException('Password attuale non corretta');
    }

    const adminClient = this.supabaseService.getAdminClient();
    const { error } = await adminClient.auth.admin.updateUserById(
      userData.user.id,
      { password: dto.newPassword },
    );

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { message: 'Password aggiornata con successo' };
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
