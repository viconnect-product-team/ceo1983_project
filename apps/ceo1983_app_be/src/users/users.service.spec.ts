import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { createMockPrismaService } from '../__mocks__/prisma.service.mock';

describe('UsersService', () => {
  let service: UsersService;

  const mockUsersRepo = {
    getMemberInfo: jest.fn().mockResolvedValue({ id: 'm1', name: 'Nguyễn Văn A' }),
    findByUsername: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
  };

  const mockMailService = {
    sendWelcomeEmail: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockUsersRepo },
        { provide: MailService, useValue: mockMailService },
        { provide: PrismaService, useValue: createMockPrismaService() },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get member info', async () => {
    const res = await service.getMemberInfo('user-1');
    expect(res).toEqual({ id: 'm1', name: 'Nguyễn Văn A' });
    expect(mockUsersRepo.getMemberInfo).toHaveBeenCalledWith('user-1', undefined);
  });
});
