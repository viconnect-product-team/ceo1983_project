import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentsRepository {
  constructor(private readonly prisma: PrismaService) { }

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
    const sharedWithJson = sharedWith !== undefined ? JSON.stringify(sharedWith) : null;
    await this.prisma.$executeRaw`
      UPDATE public.documents
      SET name = COALESCE(${name !== undefined ? name : null}, name),
          category = COALESCE(${category !== undefined ? category : null}, category),
          size = COALESCE(${size !== undefined ? size : null}, size),
          uploaded_by = COALESCE(${uploadedBy !== undefined ? uploadedBy : null}, uploaded_by),
          type = COALESCE(${type !== undefined ? type : null}, type),
          file_path = COALESCE(${filePath !== undefined ? filePath : null}, file_path),
          folder_id = ${folderId !== undefined ? folderId : null},
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

  async moveDocument(id: string, targetFolderId: string | null): Promise<boolean> {
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
      `.catch(() => { });
    }

    await this.prisma.$executeRaw`
      DELETE FROM public.documents WHERE code = ${id}
    `;
    return true;
  }

  async findFilePath(id: string): Promise<{ filePath: string | null; name: string } | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT file_path, name FROM public.documents WHERE code = ${id} LIMIT 1
    `.catch(() => []);
    if (!rows[0]) return null;
    return {
      filePath: rows[0].file_path || null,
      name: rows[0].name || 'document',
    };
  }
}
