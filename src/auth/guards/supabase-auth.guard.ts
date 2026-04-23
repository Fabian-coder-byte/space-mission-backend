/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
  );

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    console.log('Auth');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token mancante');
    }

    const token = authHeader.replace('Bearer ', '').trim();

    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('Token Supabase non valido');
    }

    const profile = await this.prisma.profile.findUnique({
      where: { id: data.user.id },
      select: {
        id: true,
        role: true,
      },
    });

    if (!profile) {
      throw new UnauthorizedException('Profilo utente non trovato');
    }
    Logger.debug(profile);

    request.user = {
      id: data.user.id,
      email: data.user.email,
      role: profile.role,
    };

    return true;
  }
}
