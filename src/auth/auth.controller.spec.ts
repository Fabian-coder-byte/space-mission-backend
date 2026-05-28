import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  refresh: jest.fn(),
  me: jest.fn(),
  resendConfirmation: jest.fn(),
  forgotPassword: jest.fn(),
  updateProfile: jest.fn(),
  changePassword: jest.fn(),
  resetPassword: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('delegates to authService.register and returns its result', async () => {
      const dto = { email: 'new@example.com', password: 'pass123' };
      const expected = { message: 'Registrazione avvenuta con successo.', user: { id: 'u1' } };
      mockAuthService.register.mockResolvedValue(expected);

      const result = await controller.register(dto as any);

      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('logout', () => {
    it('calls authService.logout and returns success message', async () => {
      mockAuthService.logout.mockResolvedValue({ message: 'Logout eseguito con successo' });

      const result = await controller.logout('Bearer tok');

      expect(mockAuthService.logout).toHaveBeenCalledWith('tok');
      expect(result).toEqual({ message: 'Logout eseguito con successo' });
    });
  });

  describe('me', () => {
    it('returns user data from authService.me', async () => {
      const userData = { user: { id: 'u1', email: 'me@test.com', role: 'USER' } };
      mockAuthService.me.mockResolvedValue(userData);

      const result = await controller.me('Bearer my-token');

      expect(mockAuthService.me).toHaveBeenCalledWith('my-token');
      expect(result).toEqual(userData);
    });

    it('throws UnauthorizedException when no Bearer token provided', async () => {
      const { UnauthorizedException } = await import('@nestjs/common');
      await expect(controller.me('')).rejects.toThrow(UnauthorizedException);
    });
  });
});
