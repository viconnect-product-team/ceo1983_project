import { ConnectMessengerService } from '../connect-app/services/messenger.service';
import { ConnectAppGateway } from '../connect-app/connect-app.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { createMockPrismaService } from '../__mocks__/prisma.service.mock';

describe('App Direct Messaging & B2B Chat Module', () => {
  let service: ConnectMessengerService;
  let mockPrisma: any;
  let mockGateway: any;

  beforeEach(() => {
    mockPrisma = createMockPrismaService();
    mockGateway = {
      emitToAll: jest.fn(),
      emitNotification: jest.fn(),
    };
    service = new ConnectMessengerService(
      mockPrisma as unknown as PrismaService,
      mockGateway as unknown as ConnectAppGateway,
    );
  });

  describe('ConnectMessengerService definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('resolveMemberCodeForUser', () => {
    it('should return member code if found in database', async () => {
      mockPrisma.$queryRaw.mockResolvedValueOnce([{ code: 'M83-VUPV' }]);
      const code = await service.resolveMemberCodeForUser('user-uuid-1');
      expect(code).toBe('M83-VUPV');
    });

    it('should return fallback member code starting with M1983- if member not found', async () => {
      mockPrisma.$queryRaw.mockResolvedValueOnce([]); // members
      mockPrisma.$queryRaw.mockResolvedValueOnce([]); // vione_users
      mockPrisma.$queryRaw.mockResolvedValueOnce([]); // auth.users
      const code = await service.resolveMemberCodeForUser('unknown-user');
      expect(code).toContain('M1983-');
    });

    it('should list conversations without throwing', async () => {
      mockPrisma.$queryRaw.mockResolvedValueOnce([{ code: 'M83-VUPV' }]); // resolve code
      mockPrisma.$queryRaw.mockResolvedValueOnce([]); // messages
      mockPrisma.$queryRaw.mockResolvedValueOnce([]); // members
      const convs = await service.listMemberConversations('user-1');
      expect(Array.isArray(convs)).toBe(true);
    });
  });
});
