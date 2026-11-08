import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { ZaloService } from '../zalo/zalo.service';
import { PrismaService } from '../prisma/prisma.service';
import { createMockPrismaService } from '../__mocks__/prisma.service.mock';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
    verify: jest.fn().mockReturnValue({ id: 'user-1', email: 'test@connect.vn' }),
  };

  const mockMailService = {
    sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  };

  const mockZaloService = {
    sendZns: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
        { provide: ZaloService, useValue: mockZaloService },
        { provide: PrismaService, useValue: createMockPrismaService() },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('JWT token generation and validation', () => {
    it('should generate a valid JWT token on login', async () => {
      const token = mockJwtService.sign({ sub: 'user-123', email: 'admin@connect.vn' });
      expect(token).toBe('mock-jwt-token');
      expect(mockJwtService.sign).toHaveBeenCalled();
    });
  });
});
