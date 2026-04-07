import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/LoginDto';
import { RegisterDto } from './dto/RegisterDto';
import { RefreshTokenDto } from './dto/RefreshTokenDto';
import { ResetPasswordDto } from './dto/ResetPasswordDto';
import { ResendConfirmationDto } from './dto/ResendConfirmationDto';
import { ForgotPasswordDto } from './dto/ForgotPasswordDto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('logout')
  async logout(@Headers('authorization') authorization?: string) {
    const accessToken = this.extractBearerToken(authorization);
    return this.authService.logout(accessToken);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @Get('me')
  async me(@Headers('authorization') authorization?: string) {
    const accessToken = this.extractBearerToken(authorization);
    return this.authService.me(accessToken);
  }

  @Post('resend-confirmation')
  async resendConfirmation(@Body() dto: ResendConfirmationDto) {
    return this.authService.resendConfirmation(dto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  private extractBearerToken(authorization?: string): string {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token mancante o non valido');
    }

    return authorization.replace('Bearer ', '').trim();
  }
}
