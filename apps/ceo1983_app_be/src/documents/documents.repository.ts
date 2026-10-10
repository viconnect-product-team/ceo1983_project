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
        SELECT code, name, category, size, uploaded_at, uploaded_by, type, file_path, association_id
        FROM public.documents
        WHERE association_id = ${associationId}::uuid
        ORDER BY uploaded_at DESC
      `.catch(() => []);
    }
    return this.prisma.$queryRaw<any[]>`
      SELECT code, name, category, size, uploaded_at, uploaded_by, type, file_path, association_id
      FROM public.documents
      ORDER BY uploaded_at DESC
    `.catch(() => []);
  }

  async insertDocument(code: string, name: string, category: string, size: string, uploadedBy: string, type: string, filePath: string | null, associationId: string | null): Promise<any> {
    await this.prisma.$executeRaw`
      INSERT INTO public.documents (code, name, category, size, uploaded_by, type, file_path, association_id, uploaded_at)
      VALUES (${code}, ${name}, ${category}, ${size}, ${uploadedBy}, ${type}, ${filePath}, ${associationId ? associationId : null}::uuid, NOW())
    `;

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT code, name, category, size, uploaded_at, uploaded_by, type, file_path
      FROM public.documents
      WHERE code = ${code}
      LIMIT 1
    `.catch(() => []);

    return rows[0] || null;
  }

  async updateDocument(id: string, name: string, category: string, size: string, uploadedBy: string, type: string, filePath: string | null): Promise<any> {
    await this.prisma.$executeRaw`
      UPDATE public.documents
      SET name = ${name},
          category = ${category},
          size = ${size},
          uploaded_by = ${uploadedBy},
          type = ${type},
          file_path = COALESCE(${filePath}, file_path)
      WHERE code = ${id}
    `;

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT code, name, category, size, uploaded_at, uploaded_by, type, file_path
      FROM public.documents
      WHERE code = ${id}
      LIMIT 1
    `.catch(() => []);

    return rows[0] || null;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const found = await this.prisma.$queryRaw<any[]>`
      SELECT name, file_path FROM public.documents WHERE code = ${id} LIMIT 1
    `.catch(() => []);

    if (found.length === 0) {
      return false;
    }

    await this.prisma.$executeRaw`
      DELETE FROM public.documents WHERE code = ${id}
    `;
    return true;
  }

  async findFilePath(id: string): Promise<string | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT file_path FROM public.documents WHERE code = ${id} LIMIT 1
    `.catch(() => []);
    return rows[0]?.file_path || null;
  }
}
