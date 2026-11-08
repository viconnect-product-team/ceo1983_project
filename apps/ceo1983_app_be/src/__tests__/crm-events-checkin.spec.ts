import { EventsService } from '../events/events.service';
import { EventsRepository } from '../events/events.repository';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { createMockPrismaService } from '../__mocks__/prisma.service.mock';

describe('CRM Events, QR Gate & Cinema Seating Module', () => {
  let service: EventsService;
  let mockPrisma: any;
  let mockMail: any;
  let mockRepo: any;

  beforeEach(() => {
    mockPrisma = createMockPrismaService();
    mockMail = {
      sendEventRegistrationEmail: jest.fn().mockResolvedValue(true),
    };
    mockRepo = {
      findUpcomingEvents: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
    };
    service = new EventsService(
      mockPrisma as unknown as PrismaService,
      mockMail as unknown as MailService,
      mockRepo as unknown as EventsRepository,
    );
  });

  describe('Events Service Definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('Check-in QR Gate state', () => {
    it('should return initial QR gate checkin state structure', async () => {
      mockPrisma.$queryRaw.mockResolvedValueOnce([
        {
          id: 'EV-001',
          name: 'Đại Hội Thường Niên CEO 1983',
          date: new Date(),
          location: 'Hà Nội',
        },
      ]);
      mockPrisma.$queryRaw.mockResolvedValueOnce([
        { total_registered: 150, total_checked_in: 45 },
      ]);

      const state = await service.getCheckinState('EV-001');
      expect(state).toBeDefined();
    });
  });
});

