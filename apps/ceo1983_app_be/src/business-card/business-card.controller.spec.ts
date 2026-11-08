import { Test, TestingModule } from '@nestjs/testing';
import { BusinessCardController } from './business-card.controller';
import { BusinessCardService } from './business-card.service';
import { JwtService } from '@nestjs/jwt';

describe('BusinessCardController', () => {
  let controller: BusinessCardController;

  const mockBusinessCardService = {
    listMyCards: jest.fn().mockResolvedValue([]),
    getCardById: jest.fn(),
  };

  const mockJwtService = {
    verify: jest.fn().mockReturnValue({ id: 'u1' }),
    sign: jest.fn().mockReturnValue('tok'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessCardController],
      providers: [
        { provide: BusinessCardService, useValue: mockBusinessCardService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    controller = module.get<BusinessCardController>(BusinessCardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
