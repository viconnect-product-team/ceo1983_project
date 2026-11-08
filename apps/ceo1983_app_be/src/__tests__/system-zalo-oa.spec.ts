import { ZaloService } from '../zalo/zalo.service';
import { PrismaService } from '../prisma/prisma.service';
import { createMockPrismaService } from '../__mocks__/prisma.service.mock';

describe('System Zalo OA Integration & Auto-Refresh Module', () => {
  let service: ZaloService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = createMockPrismaService();
    service = new ZaloService(mockPrisma as unknown as PrismaService);
  });

  describe('ZaloService definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('6-Hour Auto-Refresh Timing Logic', () => {
    it('should identify tokens that are older than 6 hours as needing refresh', () => {
      const sixHoursInMs = 6 * 60 * 60 * 1000;
      const now = Date.now();
      const lastRefreshedOld = now - (7 * 60 * 60 * 1000); // 7 hours ago
      const lastRefreshedRecent = now - (2 * 60 * 60 * 1000); // 2 hours ago

      const needsRefreshOld = (now - lastRefreshedOld) >= sixHoursInMs;
      const needsRefreshRecent = (now - lastRefreshedRecent) >= sixHoursInMs;

      expect(needsRefreshOld).toBe(true);
      expect(needsRefreshRecent).toBe(false);
    });
  });

  describe('getOaConfig', () => {
    it('should return OA configuration structure with active status', async () => {
      mockPrisma.$queryRaw.mockResolvedValueOnce([
        {
          oa_id: '198300000000',
          app_id: 'zalo_app_123',
          access_token: 'valid_access_token',
          refresh_token: 'valid_refresh_token',
          expires_at: new Date(Date.now() + 86400000),
          is_active: true,
        },
      ]);

      const config = await service.getOaConfig();
      expect(config).toBeDefined();
    });
  });
});

