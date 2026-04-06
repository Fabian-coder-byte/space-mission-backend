import { Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/LoginDto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post()
  async login(loginDto: LoginDto) {
    await this.authService.login(loginDto);
  }
}
