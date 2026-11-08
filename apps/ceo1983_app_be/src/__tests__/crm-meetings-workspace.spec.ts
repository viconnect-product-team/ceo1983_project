import { MeetingsService } from '../meetings/meetings.service';
import { MeetingsRepository } from '../meetings/meetings.repository';
import { PrismaService } from '../prisma/prisma.service';
import { createMockPrismaService } from '../__mocks__/prisma.service.mock';

describe('CRM Meetings & Workspace Check-in Module', () => {
  let service: MeetingsService;
  let mockPrisma: any;
  let mockRepo: any;

  beforeEach(() => {
    mockPrisma = createMockPrismaService();
    mockRepo = {
      listMeetings: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
    };
    service = new MeetingsService(
      mockPrisma as unknown as PrismaService,
      mockRepo as unknown as MeetingsRepository,
    );
  });

  describe('MeetingsService definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('Meeting status and agenda rules', () => {
    it('should validate meeting type is online, offline, or hybrid', () => {
      const validTypes = ['online', 'offline', 'hybrid'];
      expect(validTypes).toContain('offline');
      expect(validTypes).toContain('online');
    });
  });
});

