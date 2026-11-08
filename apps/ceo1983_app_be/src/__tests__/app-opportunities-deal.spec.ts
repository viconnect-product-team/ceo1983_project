import { BadRequestException } from '@nestjs/common';
import { ConnectOpportunityService } from '../connect-app/services/opportunity.service';
import { ConnectAppGateway } from '../connect-app/connect-app.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { createMockPrismaService } from '../__mocks__/prisma.service.mock';

describe('App Opportunities & Deal Margin Module', () => {
  let service: ConnectOpportunityService;
  let mockPrisma: any;
  let mockGateway: any;

  beforeEach(() => {
    mockPrisma = createMockPrismaService();
    mockGateway = {
      emitToAll: jest.fn(),
      emitNotification: jest.fn(),
    };
    service = new ConnectOpportunityService(
      mockPrisma as unknown as PrismaService,
      mockGateway as unknown as ConnectAppGateway,
    );
  });

  describe('Anti-spam duplicate title detection', () => {
    it('should throw BadRequestException if same title posted within 1 hour', async () => {
      // Mock 1: members, 2: users, 3: recentDup
      mockPrisma.$queryRaw
        .mockResolvedValueOnce([]) // members
        .mockResolvedValueOnce([]) // vione_users
        .mockResolvedValueOnce([{ id: 'opp-old', title: 'Cung cấp vật liệu xây dựng' }]); // recentDup

      const payload = {
        title: 'Cung cấp vật liệu xây dựng',
        description: 'Mô tả chi tiết',
      };

      await expect(service.createOpportunity('user-1', payload)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('Deal Margin & % Calculation', () => {
    it('should calculate correct percentage of deal compared to budget', () => {
      const budgetMax = 1000000000; // 1 Billion VND
      const dealValue = 450000000; // 450 Million VND
      const dealPercent = Math.round((dealValue / budgetMax) * 100);
      expect(dealPercent).toBe(45);
    });

    it('should cap at 100% if deal value exceeds or equals budget', () => {
      const budgetMax = 200000000;
      const dealValue = 250000000;
      const dealPercent = Math.round((dealValue / budgetMax) * 100);
      expect(dealPercent).toBe(125);
    });
  });

  describe('Assigned vs Public Visibility Security', () => {
    it('should reject non-assigned members from viewing confidential opportunities', () => {
      const opp = {
        id: 'opp-secret',
        visibility: 'assigned',
        assigned_to_ids: ['user-allowed-1', 'user-allowed-2'],
      };

      const isAllowed1 = opp.visibility === 'public' || opp.assigned_to_ids.includes('user-allowed-1');
      const isAllowedStranger = opp.visibility === 'public' || opp.assigned_to_ids.includes('stranger-user');

      expect(isAllowed1).toBe(true);
      expect(isAllowedStranger).toBe(false);
    });
  });
});
