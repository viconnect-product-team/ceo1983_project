import { Test, TestingModule } from '@nestjs/testing';
import { BusinessCardService } from './business-card.service';
import { BusinessCardRepository } from './business-card.repository';
import { PrismaService } from '../prisma/prisma.service';
import { createMockPrismaService } from '../__mocks__/prisma.service.mock';

describe('BusinessCardService', () => {
  let service: BusinessCardService;

  const mockCardRepo = {
    findByUserId: jest.fn(),
    save: jest.fn(),
    findExchangeHistory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessCardService,
        { provide: BusinessCardRepository, useValue: mockCardRepo },
        { provide: PrismaService, useValue: createMockPrismaService() },
      ],
    }).compile();

    service = module.get<BusinessCardService>(BusinessCardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
