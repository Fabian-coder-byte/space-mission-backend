/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/LoginDto.js';
import { RegisterDto } from './dto/RegisterDto.js';
import { RefreshTokenDto } from './dto/RefreshTokenDto.js';
import { ResetPasswordDto } from './dto/ResetPasswordDto.js';
import { ResendConfirmationDto } from './dto/ResendConfirmationDto.js';
import { ForgotPasswordDto } from './dto/ForgotPasswordDto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  @Post('logout')
  async logout(@Headers('authorization') authorization?: string) {
    const accessToken = this.extractBearerToken(authorization);
    return await this.authService.logout(accessToken);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return await this.authService.refresh(dto);
  }

  @Get('me')
  async me(@Headers('authorization') authorization?: string) {
    const accessToken = this.extractBearerToken(authorization);
    return await this.authService.me(accessToken);
  }

  @Post('resend-confirmation')
  async resendConfirmation(@Body() dto: ResendConfirmationDto) {
    return await this.authService.resendConfirmation(dto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return await this.authService.resetPassword(dto);
  }

  private extractBearerToken(authorization?: string): string {
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token mancante o non valido');
    }

    return authorization.replace('Bearer ', '').trim();
  }
}
