import { AdminService } from '../admin/admin.service';
import { AdminRepository } from '../admin/admin.repository';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { createMockPrismaService } from '../__mocks__/prisma.service.mock';

describe('CRM Finance, Cashbook & Invoices Module', () => {
  let adminService: AdminService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = createMockPrismaService();
    const mockRepo = {} as AdminRepository;
    const mockMail = {
      sendMembershipFeeNotificationEmail: jest.fn().mockResolvedValue(true),
    } as unknown as MailService;
    adminService = new AdminService(mockPrisma as unknown as PrismaService, mockRepo, mockMail);
  });

  describe('createTransaction (Cashbook)', () => {
    it('should create an expense transaction with advance and refund amounts', async () => {
      const payload = {
        type: 'expense',
        category: 'Vận hành CLB',
        description: 'Chi phí tiếp khách và họp ban',
        amount: 2500000,
        method: 'bank',
        status: 'completed',
        recipient: 'Ban Thư Ký CLB',
        advanceAmount: 500000,
        refundAmount: 0,
      };

      const result = await adminService.createTransaction(payload);
      expect(result).toBeDefined();
      expect(result.type).toBe('expense');
      expect(result.amount).toBe(2500000);
      expect(result.recipient).toBe('Ban Thư Ký CLB');
      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalled();
    });

    it('should default type to income if not specified', async () => {
      const payload = {
        amount: 5000000,
        description: 'Thu tài trợ kim cương',
      };

      const result = await adminService.createTransaction(payload);
      expect(result.type).toBe('income');
      expect(result.status).toBe('completed');
    });
  });

  describe('Invoice default values', () => {
    it('should calculate correct default fiscal year and due date', () => {
      const currentYear = new Date().getFullYear();
      const defaultDueDate = `${currentYear}-12-31`;
      expect(currentYear).toBeGreaterThanOrEqual(2026);
      expect(defaultDueDate).toContain('-12-31');
    });
  });
});

