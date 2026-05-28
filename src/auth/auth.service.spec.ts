import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SupabaseService } from '../supabase/supabase.service';
import { PrismaService } from '../prisma/prisma.service';

const mockSupabaseClient = {
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    refreshSession: jest.fn(),
    getUser: jest.fn(),
    resend: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    updateUser: jest.fn(),
    setSession: jest.fn(),
  },
};

const mockAdminClient = {
  auth: {
    admin: {
      updateUserById: jest.fn(),
    },
  },
};

const mockSupabaseService = {
  getClient: jest.fn().mockReturnValue(mockSupabaseClient),
  getAdminClient: jest.fn().mockReturnValue(mockAdminClient),
};

const mockPrisma = {
  profile: {
    upsert: jest.fn(),
    findUnique: jest.fn(),
  },
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('returns session data on successful login', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'u1', email: 'test@test.com' },
          session: { access_token: 'at', refresh_token: 'rt', expires_at: 9999 },
        },
        error: null,
      });

      const result = await service.login({ email: 'test@test.com', password: 'pass' });

      expect(result.session.accessToken).toBe('at');
      expect(result.user.email).toBe('test@test.com');
    });

    it('throws UnauthorizedException on invalid credentials', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      await expect(
        service.login({ email: 'bad@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('returns user and session on successful registration', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: {
          user: { id: 'u2', email: 'new@test.com' },
          session: { access_token: 'at2', refresh_token: 'rt2', expires_at: 9999 },
        },
        error: null,
      });

      const result = await service.register({
        email: 'new@test.com',
        password: 'pass123',
        username: 'newuser',
      });

      expect(result.user?.id).toBe('u2');
      expect(result.message).toContain('Registrazione');
    });

    it('throws BadRequestException on Supabase error', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email already registered' },
      });

      await expect(
        service.register({ email: 'dup@test.com', password: 'pass' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('me', () => {
    it('returns user with role from profile', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'u1',
            email: 'me@test.com',
            email_confirmed_at: '2026-01-01',
            user_metadata: { username: 'myuser' },
            created_at: '2026-01-01',
          },
        },
        error: null,
      });
      mockPrisma.profile.upsert.mockResolvedValue({ id: 'u1', role: 'ADMIN' });

      const result = await service.me('valid-token');

      expect(result.user.role).toBe('ADMIN');
      expect(result.user.email).toBe('me@test.com');
    });

    it('throws UnauthorizedException when token is invalid', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' },
      });

      await expect(service.me('bad-token')).rejects.toThrow(UnauthorizedException);
    });
  });
});
