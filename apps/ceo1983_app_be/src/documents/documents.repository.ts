import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveAssociationId(userId: string): Promise<string | null> {
    try {
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT association_id
        FROM public.memberships
        WHERE user_id = ${userId}::uuid AND is_default = true
        LIMIT 1
      `;
      return rows[0]?.association_id || null;
    } catch (err) {
      console.error('Failed to get active association ID:', err);
      return null;
    }
  }

  async listDocuments(associationId?: string | null): Promise<any[]> {
    if (associationId) {
      return this.prisma.$queryRaw<any[]>`
        SELECT code, name, category, size, uploaded_at, uploaded_by, type, file_path, association_id, folder_id, drive_url, is_folder,
               share_scope, share_role, shared_with, is_starred, color_tag, description, doc_scope, enterprise_name
        FROM public.documents
        WHERE association_id = ${associationId}::uuid
        ORDER BY is_folder DESC, uploaded_at DESC
      `.catch(() => []);
    }
    return this.prisma.$queryRaw<any[]>`
      SELECT code, name, category, size, uploaded_at, uploaded_by, type, file_path, association_id, folder_id, drive_url, is_folder,
             share_scope, share_role, shared_with, is_starred, color_tag, description, doc_scope, enterprise_name
      FROM public.documents
      ORDER BY is_folder DESC, uploaded_at DESC
    `.catch(() => []);
  }

  async insertDocument(
    code: string,
    name: string,
    category: string,
    size: string,
    uploadedBy: string,
    type: string,
    filePath: string | null,
    associationId: string | null,
    folderId?: string | null,
    driveUrl?: string | null,
    isFolder: boolean = false,
    shareScope: string = 'public',
    shareRole: string = 'viewer',
    sharedWith: any = [],
    isStarred: boolean = false,
    colorTag?: string | null,
    description?: string | null,
    docScope: string = 'association',
    enterpriseName?: string | null,
  ): Promise<any> {
    const sharedWithJson = JSON.stringify(sharedWith || []);
    await this.prisma.$executeRaw`
      INSERT INTO public.documents (
        code, name, category, size, uploaded_by, type, file_path, association_id, 
        folder_id, drive_url, is_folder, share_scope, share_role, shared_with, 
        is_starred, color_tag, description, doc_scope, enterprise_name, uploaded_at
      )
      VALUES (
        ${code}, ${name}, ${category}, ${size}, ${uploadedBy}, ${type}, ${filePath}, 
        ${associationId ? associationId : null}::uuid, ${folderId || null}, ${driveUrl || null}, 
        ${isFolder}, ${shareScope}, ${shareRole}, ${sharedWithJson}::jsonb, 
        ${isStarred}, ${colorTag || null}, ${description || null}, ${docScope}, 
        ${enterpriseName || null}, NOW()
      )
    `;

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT code, name, category, size, uploaded_at, uploaded_by, type, file_path, folder_id, drive_url, is_folder,
             share_scope, share_role, shared_with, is_starred, color_tag, description, doc_scope, enterprise_name
      FROM public.documents
      WHERE code = ${code}
      LIMIT 1
    `.catch(() => []);

    return rows[0] || null;
  }

  async updateDocument(
    id: string,
    name?: string,
    category?: string,
    size?: string,
    uploadedBy?: string,
    type?: string,
    filePath?: string | null,
    folderId?: string | null,
    driveUrl?: string | null,
    isFolder?: boolean,
    shareScope?: string,
    shareRole?: string,
    sharedWith?: any,
    isStarred?: boolean,
    colorTag?: string | null,
    description?: string | null,
    docScope?: string,
    enterpriseName?: string | null,
  ): Promise<any> {
    const sharedWithJson =
      sharedWith !== undefined ? JSON.stringify(sharedWith) : null;
    await this.prisma.$executeRaw`
      UPDATE public.documents
      SET name = COALESCE(${name !== undefined ? name : null}, name),
          category = COALESCE(${category !== undefined ? category : null}, category),
          size = COALESCE(${size !== undefined ? size : null}, size),
          uploaded_by = COALESCE(${uploadedBy !== undefined ? uploadedBy : null}, uploaded_by),
          type = COALESCE(${type !== undefined ? type : null}, type),
          file_path = COALESCE(${filePath !== undefined ? filePath : null}, file_path),
          folder_id = CASE WHEN ${folderId !== undefined} THEN ${folderId || null} ELSE folder_id END,
          drive_url = COALESCE(${driveUrl !== undefined ? driveUrl : null}, drive_url),
          is_folder = COALESCE(${isFolder !== undefined ? isFolder : null}, is_folder),
          share_scope = COALESCE(${shareScope !== undefined ? shareScope : null}, share_scope),
          share_role = COALESCE(${shareRole !== undefined ? shareRole : null}, share_role),
          shared_with = COALESCE(${sharedWithJson !== null ? sharedWithJson : null}::jsonb, shared_with),
          is_starred = COALESCE(${isStarred !== undefined ? isStarred : null}, is_starred),
          color_tag = COALESCE(${colorTag !== undefined ? colorTag : null}, color_tag),
          description = COALESCE(${description !== undefined ? description : null}, description),
          doc_scope = COALESCE(${docScope !== undefined ? docScope : null}, doc_scope),
          enterprise_name = COALESCE(${enterpriseName !== undefined ? enterpriseName : null}, enterprise_name),
          updated_at = NOW()
      WHERE code = ${id}
    `;

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT code, name, category, size, uploaded_at, uploaded_by, type, file_path, folder_id, drive_url, is_folder,
             share_scope, share_role, shared_with, is_starred, color_tag, description, doc_scope, enterprise_name
      FROM public.documents
      WHERE code = ${id}
      LIMIT 1
    `.catch(() => []);

    return rows[0] || null;
  }

  async toggleStar(id: string): Promise<boolean> {
    await this.prisma.$executeRaw`
      UPDATE public.documents
      SET is_starred = NOT COALESCE(is_starred, false)
      WHERE code = ${id}
    `;
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT is_starred FROM public.documents WHERE code = ${id} LIMIT 1
    `.catch(() => []);
    return Boolean(rows[0]?.is_starred);
  }

  async updateShare(
    id: string,
    shareScope: string,
    shareRole: string,
    sharedWith: any,
  ): Promise<any> {
    const jsonStr = JSON.stringify(sharedWith || []);
    await this.prisma.$executeRaw`
      UPDATE public.documents
      SET share_scope = ${shareScope},
          share_role = ${shareRole},
          shared_with = ${jsonStr}::jsonb,
          updated_at = NOW()
      WHERE code = ${id}
    `;
    return true;
  }

  async moveDocument(
    id: string,
    targetFolderId: string | null,
  ): Promise<boolean> {
    await this.prisma.$executeRaw`
      UPDATE public.documents
      SET folder_id = ${targetFolderId || null},
          updated_at = NOW()
      WHERE code = ${id}
    `;
    return true;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const found = await this.prisma.$queryRaw<any[]>`
      SELECT code, is_folder FROM public.documents WHERE code = ${id} LIMIT 1
    `.catch(() => []);

    if (found.length === 0) {
      return false;
    }

    // Nếu là thư mục, xóa toàn bộ các tệp con và thư mục con
    if (found[0].is_folder) {
      await this.prisma.$executeRaw`
        DELETE FROM public.documents WHERE folder_id = ${id}
      `.catch(() => {});
    }

    await this.prisma.$executeRaw`
      DELETE FROM public.documents WHERE code = ${id}
    `;
    return true;
  }

  async findDocumentById(id: string): Promise<any | null> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      );
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT code, name, category, size, uploaded_at, uploaded_by, type, file_path, folder_id, drive_url, is_folder,
             share_scope, share_role, shared_with, is_starred, color_tag, description, doc_scope, enterprise_name
      FROM public.documents
      WHERE code = ${id} OR (${isUuid}::boolean AND id = ${id}::uuid)
      LIMIT 1
    `.catch(() => []);
    return rows[0] || null;
  }

  async findFilePath(
    id: string,
  ): Promise<{ filePath: string | null; name: string } | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT file_path, name FROM public.documents WHERE code = ${id} LIMIT 1
    `.catch(() => []);
    if (!rows[0]) return null;
    return {
      filePath: rows[0].file_path || null,
      name: rows[0].name || 'document',
    };
  }

  /**
   * Đảm bảo 7 thư mục gốc của 7 Ban Chuyên Môn luôn sẵn sàng trong hệ thống
   */
  async ensureDepartmentFolders(associationId: string | null): Promise<void> {
    const DEPARTMENTS = [
      {
        code: 'FLD-DEPT-BDH',
        name: 'Ban Điều Hành',
        category: 'ban_dieu_hanh',
        description: 'Văn kiện, nghị quyết, chỉ đạo điều hành CLB CEO 1983',
        shareRole: 'admin,bqt,bdh,chu_tich,tong_thu_ky',
      },
      {
        code: 'FLD-DEPT-BTK',
        name: 'Ban Thư Ký',
        category: 'ban_thu_ky',
        description: 'Biên bản cuộc họp, kế hoạch công tác và tài liệu hành chính',
        shareRole: 'admin,bqt,btk,tong_thu_ky',
      },
      {
        code: 'FLD-DEPT-BTV',
        name: 'Ban Thành Viên',
        category: 'ban_thanh_vien',
        description: 'Hồ sơ kết nạp, danh bạ và quy chế hội viên',
        shareRole: 'admin,bqt,btv,truong_ban_thanh_vien',
      },
      {
        code: 'FLD-DEPT-BXT',
        name: 'Ban Xúc Tiến Thương Mại',
        category: 'ban_xuc_tien',
        description: 'Hồ sơ giao thương B2B, hợp đồng liên minh và cơ hội đầu tư',
        shareRole: 'admin,bqt,bxt,truong_ban_xuc_tien',
      },
      {
        code: 'FLD-DEPT-BTT',
        name: 'Ban Truyền Thông & Sự Kiện',
        category: 'ban_truyen_thong',
        description: 'Hình ảnh, video khoảnh khắc sự kiện, thông cáo báo chí và tư liệu đào tạo',
        shareRole: 'admin,bqt,btt,truong_ban_truyen_thong',
      },
      {
        code: 'FLD-DEPT-BTN',
        name: 'Ban Thiện Nguyện',
        category: 'ban_thien_nguyen',
        description: 'Chương trình an sinh xã hội, sao kê đóng góp và kế hoạch từ thiện',
        shareRole: 'admin,bqt,btn,truong_ban_thien_nguyen',
      },
      {
        code: 'FLD-DEPT-BTC',
        name: 'Ban Tài Chính',
        category: 'ban_tai_chinh',
        description: 'Báo cáo thu chi, quyết toán hội phí và ngân sách quỹ CLB',
        shareRole: 'admin,bqt,btc,ke_toan,thu_quy',
      },
    ];

    for (const dept of DEPARTMENTS) {
      try {
        const existing = await this.prisma.$queryRaw<any[]>`
          SELECT code FROM public.documents WHERE code = ${dept.code} LIMIT 1
        `;
        if (existing.length === 0) {
          await this.prisma.$executeRaw`
            INSERT INTO public.documents (
              code, name, category, size, uploaded_by, type, file_path, association_id,
              folder_id, is_folder, share_scope, share_role, shared_with, is_starred,
              color_tag, description, doc_scope, uploaded_at
            ) VALUES (
              ${dept.code}, ${dept.name}, ${dept.category}, 'Thư mục Ban', 'Ban Quản Trị',
              'folder', null, ${associationId ? associationId : null}::uuid,
              null, true, 'department', ${dept.shareRole}, '[]'::jsonb, false,
              '#003B95', ${dept.description}, 'association', NOW()
            )
          `;
        }
      } catch (e) {
        // bỏ qua lỗi nếu đã tồn tại
      }
    }
  }

  /**
   * Tạo hoặc lấy thư mục con tương ứng cho Sự kiện, Khóa đào tạo hoặc Cuộc họp
   */
  async ensureActivitySubfolder(
    activityType: 'event' | 'training' | 'meeting',
    activityId: string,
    activityTitle: string,
    associationId: string | null,
  ): Promise<string> {
    await this.ensureDepartmentFolders(associationId);

    let parentFolderCode = 'FLD-DEPT-BTT';
    let folderCodePrefix = 'FLD-EVT-';
    let category = 'ban_truyen_thong';
    let labelPrefix = 'Sự kiện: ';

    if (activityType === 'training') {
      parentFolderCode = 'FLD-DEPT-BTT';
      folderCodePrefix = 'FLD-TRN-';
      category = 'ban_truyen_thong';
      labelPrefix = 'Đào tạo: ';
    } else if (activityType === 'meeting') {
      parentFolderCode = 'FLD-DEPT-BTK';
      folderCodePrefix = 'FLD-MTG-';
      category = 'ban_thu_ky';
      labelPrefix = 'Cuộc họp: ';
    }

    const subfolderCode = `${folderCodePrefix}${activityId}`;
    const folderName = `${labelPrefix}${activityTitle}`;

    try {
      const existing = await this.prisma.$queryRaw<any[]>`
        SELECT code FROM public.documents WHERE code = ${subfolderCode} LIMIT 1
      `;
      if (existing.length === 0) {
        await this.prisma.$executeRaw`
          INSERT INTO public.documents (
            code, name, category, size, uploaded_by, type, file_path, association_id,
            folder_id, is_folder, share_scope, share_role, shared_with, is_starred,
            color_tag, description, doc_scope, uploaded_at
          ) VALUES (
            ${subfolderCode}, ${folderName}, ${category}, 'Thư mục Hoạt động', 'Hệ thống tự động',
            'folder', null, ${associationId ? associationId : null}::uuid,
            ${parentFolderCode}, true, 'department', 'member', '[]'::jsonb, false,
            '#0284C7', ${`Tập tin & Hình ảnh khoảnh khắc của ${folderName}`}, 'association', NOW()
          )
        `;
      }
    } catch (e) {}

    return subfolderCode;
  }

  /**
   * Tự động lưu ảnh khoảnh khắc hoặc tài liệu media vào đúng thư mục con của sự kiện / đào tạo / cuộc họp
   */
  async saveMediaToActivity(
    activityType: 'event' | 'training' | 'meeting',
    activityId: string,
    activityTitle: string,
    mediaUrl: string,
    uploadedBy: string,
    associationId: string | null,
    fileName?: string,
  ): Promise<any> {
    const subfolderCode = await this.ensureActivitySubfolder(
      activityType,
      activityId,
      activityTitle,
      associationId,
    );

    const docCode = `MED-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const isVideo = Boolean(mediaUrl.match(/\.(mp4|mov|avi|webm)$/i));
    const type = isVideo ? 'video' : 'image';
    const name = fileName || `Khoảnh khắc - ${activityTitle} (${new Date().toLocaleDateString('vi-VN')})`;

    let category = 'ban_truyen_thong';
    if (activityType === 'meeting') category = 'ban_thu_ky';

    try {
      await this.prisma.$executeRaw`
        INSERT INTO public.documents (
          code, name, category, size, uploaded_by, type, file_path, association_id,
          folder_id, is_folder, share_scope, share_role, shared_with, is_starred,
          color_tag, description, doc_scope, uploaded_at
        ) VALUES (
          ${docCode}, ${name}, ${category}, 'Media đính kèm', ${uploadedBy},
          ${type}, ${mediaUrl}, ${associationId ? associationId : null}::uuid,
          ${subfolderCode}, false, 'public', 'viewer', '[]'::jsonb, false,
          null, ${`Được lưu tự động từ hoạt động ${activityTitle}`}, 'association', NOW()
        )
      `;
      return { success: true, docCode, subfolderCode };
    } catch (e: any) {
      console.warn('saveMediaToActivity error:', e.message);
      return null;
    }
  }

  /**
   * Lấy quyền và ban chuyên môn của người dùng từ CSDL
   */
  async getUserRoleAndDepartment(userId: string): Promise<{ roles: string[]; departments: string[] }> {
    try {
      const [userRoles, memberships] = await Promise.all([
        this.prisma.$queryRaw<any[]>`
          SELECT role FROM public.user_roles WHERE user_id = ${userId}::uuid
        `.catch(() => []),
        this.prisma.$queryRaw<any[]>`
          SELECT role, department FROM public.memberships WHERE user_id = ${userId}::uuid
        `.catch(() => []),
      ]);

      const roles = Array.from(
        new Set([
          ...userRoles.map((r) => String(r.role).toLowerCase()),
          ...memberships.map((m) => String(m.role).toLowerCase()),
        ]),
      );

      const departments = Array.from(
        new Set(
          memberships
            .map((m) => String(m.department || '').toLowerCase())
            .filter(Boolean),
        ),
      );

      return { roles, departments };
    } catch (e) {
      return { roles: ['member'], departments: [] };
    }
  }
}
