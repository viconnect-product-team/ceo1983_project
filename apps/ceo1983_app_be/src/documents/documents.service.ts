import { Injectable } from '@nestjs/common';
import { DocumentsRepository } from './documents.repository';
import { CreateDocumentDto, UpdateDocumentDto } from './dto';

export { CreateDocumentDto, UpdateDocumentDto };

@Injectable()
export class DocumentsService {
  constructor(private readonly documentsRepo: DocumentsRepository) {}

  async list(userId: string) {
    const activeId = await this.documentsRepo.getActiveAssociationId(userId);
    const rows = await this.documentsRepo.listDocuments(activeId);

    return rows.map((r) => ({
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
    }));
  }

  async create(userId: string, data: CreateDocumentDto) {
    const activeId = await this.documentsRepo.getActiveAssociationId(userId);
    const isFolder = Boolean(data.isFolder || data.type === 'folder');
    const code = (isFolder ? 'FLD-' : 'DOC-') + Math.random().toString(36).slice(2, 10).toUpperCase();
    const uploadedBy = data.uploadedBy || 'System';
    const size = data.size || (isFolder ? '--' : '');
    const filePath = data.filePath || null;
    const folderId = data.folderId || data.parentId || null;
    const driveUrl = data.driveUrl || null;

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
    );

    if (!r) throw new Error('Failed to retrieve created document');

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
    };
  }

  async update(id: string, data: UpdateDocumentDto) {
    const filePath = data.filePath || null;
    const isFolder = data.isFolder !== undefined ? data.isFolder : (data.type === 'folder' ? true : undefined);
    const folderId = data.folderId !== undefined ? data.folderId : data.parentId;
    const driveUrl = data.driveUrl;

    const r = await this.documentsRepo.updateDocument(
      id,
      data.name || '',
      data.category || '',
      data.size || '',
      data.uploadedBy || 'System',
      data.type || '',
      filePath,
      folderId,
      driveUrl,
      isFolder,
    );

    if (!r) throw new Error('Failed to retrieve updated document');

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
    };
  }

  async delete(id: string) {
    const ok = await this.documentsRepo.deleteDocument(id);
    return { ok };
  }

  async getUrl(id: string) {
    const filePath = await this.documentsRepo.findFilePath(id);
    if (!filePath) return null;

    if (filePath.startsWith('/upload/') || filePath.startsWith('http')) {
      return filePath;
    }

    return `/upload/file/${filePath}`;
  }
}
