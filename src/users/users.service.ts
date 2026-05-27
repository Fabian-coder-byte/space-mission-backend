import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(page = 1, limit = 10, search?: string) {
    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage: limit,
    });

    if (error) {
      throw new Error(error.message);
    }

    const profiles = await this.prisma.profile.findMany({
      select: { id: true, role: true },
    });

    const profileMap = new Map(profiles.map((p) => [p.id, p.role]));

    let users = data.users.map((u) => ({
      id: u.id,
      email: u.email,
      username: u.user_metadata?.username ?? null,
      emailConfirmedAt: u.email_confirmed_at,
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at,
      provider: u.app_metadata?.provider ?? 'email',
      role: profileMap.get(u.id) ?? 'USER',
    }));

    if (search) {
      const q = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.email?.toLowerCase().includes(q) ||
          u.username?.toLowerCase().includes(q),
      );
    }

    return {
      items: users,
      meta: {
        total: data.total ?? users.length,
        page,
        limit,
        totalPages: Math.ceil((data.total ?? users.length) / limit),
      },
    };
  }

  async findOne(id: string) {
    const adminClient = this.supabaseService.getAdminClient();

    const { data, error } = await adminClient.auth.admin.getUserById(id);

    if (error || !data.user) {
      throw new Error(error?.message ?? 'Utente non trovato');
    }

    const profile = await this.prisma.profile.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    return {
      id: data.user.id,
      email: data.user.email,
      username: data.user.user_metadata?.username ?? null,
      emailConfirmedAt: data.user.email_confirmed_at,
      createdAt: data.user.created_at,
      lastSignInAt: data.user.last_sign_in_at,
      provider: data.user.app_metadata?.provider ?? 'email',
      role: profile?.role ?? 'USER',
    };
  }
}
