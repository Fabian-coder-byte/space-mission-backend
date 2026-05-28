import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.ProfileWhereInput = search
      ? {
          OR: [
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { username: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    const [profiles, total] = await this.prisma.$transaction([
      this.prisma.profile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.profile.count({ where }),
    ]);

    return {
      items: profiles.map((p) => ({
        id: p.id,
        email: p.email ?? '—',
        username: p.username ?? null,
        emailConfirmedAt: null,
        createdAt: p.createdAt,
        lastSignInAt: null,
        provider: 'email',
        role: p.role,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException('Utente non trovato');
    }

    return {
      id: profile.id,
      email: profile.email ?? '—',
      username: profile.username ?? null,
      emailConfirmedAt: null,
      createdAt: profile.createdAt,
      lastSignInAt: null,
      provider: 'email',
      role: profile.role,
    };
  }
}
