import { BadRequestException } from '@nestjs/common';
import { AdminService } from '../admin/admin.service';
import { AdminRepository } from '../admin/admin.repository';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { createMockPrismaService } from '../__mocks__/prisma.service.mock';

describe('CRM RBAC & Permission Matrix Module', () => {
  let adminService: AdminService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = createMockPrismaService();
    const mockRepo = {} as AdminRepository;
    const mockMail = {} as MailService;
    adminService = new AdminService(mockPrisma as unknown as PrismaService, mockRepo, mockMail);
  });

  describe('savePermissionMatrix', () => {
    it('should throw BadRequestException if payload categories is empty or missing', async () => {
      await expect(adminService.savePermissionMatrix(null)).rejects.toThrow(BadRequestException);
      await expect(adminService.savePermissionMatrix({})).rejects.toThrow(BadRequestException);
      await expect(adminService.savePermissionMatrix({ categories: [] })).rejects.toThrow(BadRequestException);
    });

    it('should save permission matrix when valid categories array is provided', async () => {
      const validCategories = [
        {
          id: 'cat_members',
          name: 'HỘI VIÊN',
          features: [
            {
              id: 'feat_members',
              name: 'Hội viên',
              route: '/members',
              actions: [
                {
                  id: 'act_mem_view',
                  code: 'MEM_VIEW',
                  name: 'Xem danh sách',
                  roles: { admin: true, member: true },
                },
              ],
            },
          ],
        },
      ];

      const res = await adminService.savePermissionMatrix({ categories: validCategories }, 'user-uuid-1');
      expect(res).toBeDefined();
      expect(res.success).toBe(true);
      expect(res.categories).toEqual(validCategories);
      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalled();
    });
  });

  describe('getActiveTheme', () => {
    it('should return active theme status', async () => {
      mockPrisma.$queryRaw.mockResolvedValueOnce([]);
      const theme = await adminService.getActiveTheme();
      expect(theme).toBeDefined();
      expect(theme.themeId).toBe('none');
      expect(theme.enabled).toBe(false);
    });

    it('should return enabled theme when stored in app_settings', async () => {
      mockPrisma.$queryRaw.mockResolvedValueOnce([
        { value: { themeId: 'gold_standard', enabled: true, updatedAt: '2026-11-08' } }
      ]);
      const theme = await adminService.getActiveTheme();
      expect(theme.themeId).toBe('gold_standard');
      expect(theme.enabled).toBe(true);
    });
  });
});
