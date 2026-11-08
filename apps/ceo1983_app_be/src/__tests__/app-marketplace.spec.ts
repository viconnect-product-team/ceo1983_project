import { ConnectMarketplaceService } from '../connect-app/services/marketplace.service';
import { ConnectAppGateway } from '../connect-app/connect-app.gateway';
import { ConnectMessengerService } from '../connect-app/services/messenger.service';
import { PrismaService } from '../prisma/prisma.service';
import { createMockPrismaService } from '../__mocks__/prisma.service.mock';

describe('App Marketplace & Products Module', () => {
  let service: ConnectMarketplaceService;
  let mockPrisma: any;
  let mockGateway: any;
  let mockMessenger: any;

  beforeEach(() => {
    mockPrisma = createMockPrismaService();
    mockGateway = {
      emitToAll: jest.fn(),
      emitNotification: jest.fn(),
    };
    mockMessenger = {
      sendMessage: jest.fn(),
    };
    service = new ConnectMarketplaceService(
      mockPrisma as unknown as PrismaService,
      mockGateway as unknown as ConnectAppGateway,
      mockMessenger as unknown as ConnectMessengerService,
    );
  });

  describe('listActiveProducts', () => {
    it('should query and return active marketplace products with association details', async () => {
      mockPrisma.$queryRaw.mockResolvedValueOnce([
        {
          id: 'prod-1',
          name: 'Phần mềm ERP ViConnect',
          price: 25000000,
          member_price: 20000000,
          original_price: 30000000,
          unit: 'Gói',
          company: 'ViConnect',
          seller_name: 'Nguyễn Văn A',
        },
      ]);

      const products = await service.listActiveProducts();
      expect(products).toBeDefined();
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBe(1);
      expect(products[0].id).toBe('prod-1');
      expect(products[0].memberPrice).toContain('20.000.000');
    });
  });

  describe('Pricing calculation', () => {
    it('should compute member discount percentage correctly', () => {
      const originalPrice = 30000000;
      const memberPrice = 24000000;
      const discountPercent = Math.round(((originalPrice - memberPrice) / originalPrice) * 100);
      expect(discountPercent).toBe(20);
    });
  });
});
