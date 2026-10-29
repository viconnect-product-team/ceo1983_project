import { Injectable, NotFoundException } from '@nestjs/common';
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
      uploadedAt: r.uploaded_at ? new Date(r.uploaded_at).toISOString() : new Date().toISOString(),
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
    };
  }

  async list(userId: string) {
    const activeId = await this.documentsRepo.getActiveAssociationId(userId);
    const rows = await this.documentsRepo.listDocuments(activeId);
    return rows.map((r) => this.mapRow(r));
  }

  async create(userId: string, data: CreateDocumentDto) {
    const activeId = await this.documentsRepo.getActiveAssociationId(userId);
    const isFolder = Boolean(data.isFolder || data.type === 'folder');
    const code = (isFolder ? 'FLD-' : 'DOC-') + Math.random().toString(36).slice(2, 10).toUpperCase();
    const uploadedBy = data.uploadedBy || 'Thành viên CLB';
    const size = data.size || (isFolder ? 'Thư mục' : '');
    const filePath = data.filePath || null;
    const folderId = data.folderId !== undefined ? data.folderId : (data.parentId || null);
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

  async update(id: string, data: UpdateDocumentDto) {
    const filePath = data.filePath;
    const isFolder = data.isFolder !== undefined ? data.isFolder : (data.type === 'folder' ? true : undefined);
    const folderId = data.folderId !== undefined ? data.folderId : data.parentId;

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

  async updateShare(id: string, shareScope: string, shareRole: string, sharedWith: any) {
    await this.documentsRepo.updateShare(id, shareScope, shareRole, sharedWith);
    return { id, shareScope, shareRole, sharedWith };
  }

  async move(id: string, targetFolderId: string | null) {
    await this.documentsRepo.moveDocument(id, targetFolderId);
    return { id, targetFolderId };
  }

  async delete(id: string) {
    const ok = await this.documentsRepo.deleteDocument(id);
    return { ok };
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
