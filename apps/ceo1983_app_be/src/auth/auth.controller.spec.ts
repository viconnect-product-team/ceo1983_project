import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: jest.fn().mockResolvedValue({
      access_token: 'mock-token',
      user: { id: 'u1', email: 'admin@connect.vn', role: 'admin' },
    }),
    register: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should process login request', async () => {
    const req = { user: { id: 'u1', email: 'admin@connect.vn', role: 'admin' } };
    const res = await controller.login(req);
    expect(res).toEqual({
      access_token: 'mock-token',
      user: { id: 'u1', email: 'admin@connect.vn', role: 'admin' },
    });
  });
});
