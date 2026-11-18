import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DocumentsRepository } from './documents.repository';
import { CreateDocumentDto, UpdateDocumentDto } from './dto';

export { CreateDocumentDto, UpdateDocumentDto };

@Injectable()
export class DocumentsService {
  constructor(private readonly documentsRepo: DocumentsRepository) {}

  private mapRow(r: any) {
    return {
      id: r.code,
      name: r.name,
      category: r.category,
      size: r.size || '',
      uploadedAt: r.uploaded_at
        ? new Date(r.uploaded_at).toISOString()
        : new Date().toISOString(),
      uploadedBy: r.uploaded_by || '',
      type: r.type,
      filePath: r.file_path || '',
      url: r.file_path || r.drive_url || '',
      fileUrl: r.file_path || r.drive_url || '',
      folderId: r.folder_id || null,
      driveUrl: r.drive_url || null,
      isFolder: Boolean(r.is_folder || r.type === 'folder'),
      shareScope: r.share_scope || 'public',
      shareRole: r.share_role || 'viewer',
      sharedWith: r.shared_with || [],
      isStarred: Boolean(r.is_starred),
      colorTag: r.color_tag || null,
      description: r.description || null,
      docScope: r.doc_scope || 'association',
      enterpriseName: r.enterprise_name || null,
      hasAccess: r.hasAccess !== undefined ? Boolean(r.hasAccess) : true,
      lockedReason: r.lockedReason || null,
    };
  }

  async list(userId: string) {
    const activeId = await this.documentsRepo.getActiveAssociationId(userId);
    // Đảm bảo 7 thư mục ban luôn có sẵn
    await this.documentsRepo.ensureDepartmentFolders(activeId);

    const rows = await this.documentsRepo.listDocuments(activeId);
    const { roles, departments } = await this.documentsRepo.getUserRoleAndDepartment(userId);

    const isGlobalAdmin = roles.some((r) =>
      ['admin', 'superadmin', 'bqt', 'chu_tich', 'tong_thu_ky', 'platform_admin', 'adm'].includes(r),
    );

    // Xây dựng map kiểm tra quyền cho từng thư mục cha
    const parentAccessMap = new Map<string, boolean>();

    return rows.map((r) => {
      let hasAccess = true;
      let lockedReason: string | null = null;

      // Nếu là thư mục gốc của một Ban (không có folderId cha)
      if (r.is_folder && !r.folder_id && r.code?.startsWith('FLD-DEPT-')) {
        if (!isGlobalAdmin) {
          const allowedRoles = (r.share_role || '')
            .split(',')
            .map((s: string) => s.trim().toLowerCase())
            .filter(Boolean);

          const matchesRole = roles.some((userRole) => allowedRoles.includes(userRole));
          const matchesDepartment = departments.some((d) => d === String(r.category || '').toLowerCase());

          if (!matchesRole && !matchesDepartment) {
            hasAccess = false;
            lockedReason = `Chỉ dành riêng cho thành viên ${r.name} hoặc Ban Quản Trị CLB`;
          }
        }
        parentAccessMap.set(r.code, hasAccess);
      } else if (r.folder_id && parentAccessMap.has(r.folder_id)) {
        // Thư mục con hoặc file con kế thừa quyền của thư mục cha
        hasAccess = parentAccessMap.get(r.folder_id)!;
        if (!hasAccess) {
          lockedReason = `Thuộc thư mục ban chuyên môn bị giới hạn quyền truy cập`;
        }
      }

      return this.mapRow({ ...r, hasAccess, lockedReason });
    });
  }

  /**
   * Kiểm tra quyền mở thư mục cụ thể
   */
  async checkFolderAccess(folderCode: string, userId: string): Promise<boolean> {
    const row = await this.documentsRepo.findDocumentById(folderCode);
    if (!row) throw new NotFoundException('Không tìm thấy thư mục');

    const { roles, departments } = await this.documentsRepo.getUserRoleAndDepartment(userId);
    const isGlobalAdmin = roles.some((r) =>
      ['admin', 'superadmin', 'bqt', 'chu_tich', 'tong_thu_ky', 'platform_admin', 'adm'].includes(r),
    );
    if (isGlobalAdmin) return true;

    // Kiểm tra thư mục cha nếu đây là thư mục con
    let targetFolder = row;
    if (row.folder_id && row.folder_id.startsWith('FLD-DEPT-')) {
      const parentRow = await this.documentsRepo.findDocumentById(row.folder_id);
      if (parentRow) targetFolder = parentRow;
    }

    if (targetFolder.code?.startsWith('FLD-DEPT-')) {
      const allowedRoles = (targetFolder.share_role || '')
        .split(',')
        .map((s: string) => s.trim().toLowerCase())
        .filter(Boolean);

      const matchesRole = roles.some((userRole) => allowedRoles.includes(userRole));
      const matchesDepartment = departments.some((d) => d === String(targetFolder.category || '').toLowerCase());

      if (!matchesRole && !matchesDepartment) {
        throw new ForbiddenException(
          `Bạn không có quyền truy cập vào thư mục "${targetFolder.name}". Thư mục chỉ dành cho thành viên của Ban và Ban Quản Trị.`,
        );
      }
    }

    return true;
  }

  /**
   * Tự động đồng bộ ảnh khoảnh khắc và tài liệu hoạt động vào thư mục con của Ban
   */
  async syncActivityMedia(
    userId: string,
    payload: {
      activityType: 'event' | 'training' | 'meeting';
      activityId: string;
      activityTitle: string;
      mediaUrls: string[];
      uploadedBy?: string;
      notes?: string;
    },
  ) {
    const activeId = await this.documentsRepo.getActiveAssociationId(userId);
    const results: any[] = [];
    const uploader = payload.uploadedBy || 'Hội viên tham gia';

    for (const url of payload.mediaUrls || []) {
      const res = await this.documentsRepo.saveMediaToActivity(
        payload.activityType,
        payload.activityId,
        payload.activityTitle,
        url,
        uploader,
        activeId,
        payload.notes ? `Khoảnh khắc: ${payload.notes.slice(0, 40)}` : undefined,
      );
      if (res) results.push(res);
    }

    return {
      success: true,
      count: results.length,
      subfolderCode: results[0]?.subfolderCode,
    };
  }

  async create(userId: string, data: CreateDocumentDto) {
    const activeId = await this.documentsRepo.getActiveAssociationId(userId);
    const isFolder = Boolean(data.isFolder || data.type === 'folder');
    const code =
      (isFolder ? 'FLD-' : 'DOC-') +
      Math.random().toString(36).slice(2, 10).toUpperCase();
    const uploadedBy = data.uploadedBy || 'Thành viên CLB';
    const size = data.size || (isFolder ? 'Thư mục' : '');
    const filePath = data.filePath || null;
    const folderId =
      data.folderId !== undefined ? data.folderId : data.parentId || null;
    const driveUrl = data.driveUrl || null;
    const shareScope = data.shareScope || 'public';
    const shareRole = data.shareRole || 'viewer';
    const sharedWith = data.sharedWith || [];
    const isStarred = Boolean(data.isStarred);
    const colorTag = data.colorTag || null;
    const description = data.description || null;
    const docScope = data.docScope || 'association';
    const enterpriseName = data.enterpriseName || null;

    const r = await this.documentsRepo.insertDocument(
      code,
      data.name,
      data.category,
      size,
      uploadedBy,
      data.type,
      filePath,
      activeId,
      folderId,
      driveUrl,
      isFolder,
      shareScope,
      shareRole,
      sharedWith,
      isStarred,
      colorTag,
      description,
      docScope,
      enterpriseName,
    );

    if (!r) throw new Error('Không thể tạo tài liệu / thư mục');
    return this.mapRow(r);
  }

  async update(id: string, data: UpdateDocumentDto, userId?: string) {
    if (userId) {
      const existing = await this.documentsRepo.findFilePath(id);
      if (!existing) {
        throw new NotFoundException('Không tìm thấy tài liệu để cập nhật');
      }
    }
    const filePath = data.filePath;
    const isFolder =
      data.isFolder !== undefined
        ? data.isFolder
        : data.type === 'folder'
          ? true
          : undefined;
    const folderId =
      data.folderId !== undefined ? data.folderId : data.parentId;

    const r = await this.documentsRepo.updateDocument(
      id,
      data.name,
      data.category,
      data.size,
      data.uploadedBy,
      data.type,
      filePath,
      folderId,
      data.driveUrl,
      isFolder,
      data.shareScope,
      data.shareRole,
      data.sharedWith,
      data.isStarred,
      data.colorTag,
      data.description,
      data.docScope,
      data.enterpriseName,
    );

    if (!r) throw new NotFoundException('Không tìm thấy tài liệu để cập nhật');
    return this.mapRow(r);
  }

  async toggleStar(id: string) {
    const isStarred = await this.documentsRepo.toggleStar(id);
    return { id, isStarred };
  }

  async updateShare(
    id: string,
    shareScope: string,
    shareRole: string,
    sharedWith: any,
  ) {
    await this.documentsRepo.updateShare(id, shareScope, shareRole, sharedWith);
    return { id, shareScope, shareRole, sharedWith };
  }

  async move(id: string, targetFolderId: string | null) {
    await this.documentsRepo.moveDocument(id, targetFolderId);
    return { id, targetFolderId };
  }

  async delete(id: string, userId?: string) {
    if (userId) {
      const existing = await this.documentsRepo.findFilePath(id);
      if (!existing) {
        throw new NotFoundException('Không tìm thấy tài liệu để xóa');
      }
    }
    const ok = await this.documentsRepo.deleteDocument(id);
    return { ok };
  }

  async getById(id: string) {
    const row = await this.documentsRepo.findDocumentById(id);
    if (!row) {
      throw new NotFoundException('Không tìm thấy tài liệu');
    }
    return this.mapRow(row);
  }

  async getUrl(id: string) {
    const found = await this.documentsRepo.findFilePath(id);
    if (!found || !found.filePath) return null;

    let url = found.filePath;
    if (!url.startsWith('/upload/') && !url.startsWith('http')) {
      url = `/upload/file/${url}`;
    }

    return {
      url,
      name: found.name,
    };
  }
}
