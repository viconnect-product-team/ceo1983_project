import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { randomUUID } from 'crypto';
import { MinioService } from './minio.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UploadService {
  constructor(
    private readonly minioService: MinioService,
    private readonly prisma: PrismaService,
  ) {}

  private async saveToLocalDisk(subfolder: string, filename: string, buffer: Buffer): Promise<string> {
    const os = require('os');
    const candidates = [
      path.join('/app', 'uploads', subfolder),
      path.join('/tmp', 'uploads', subfolder),
      path.join(os.tmpdir(), 'ceo1983_uploads', subfolder),
    ];
    let saved = false;
    for (const uploadDir of candidates) {
      try {
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, filename);
        await fs.promises.writeFile(filePath, buffer);
        saved = true;
        break;
      } catch (err: any) {
        console.warn(`Local disk write failed for ${uploadDir}:`, err?.message);
      }
    }
    if (!saved) {
      throw new Error('All local disk candidate locations failed to write');
    }
    return `/upload/file/${subfolder}/${filename}`;
  }

  async saveBase64Avatar(base64Data: string, userId: string, standalone = false): Promise<string> {
    try {
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 data format');
      }
      const mimetype = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      let ext = '.jpg';
      if (mimetype.includes('png')) ext = '.png';
      else if (mimetype.includes('webp')) ext = '.webp';
      else if (mimetype.includes('svg')) ext = '.svg';
      else if (mimetype.includes('gif')) ext = '.gif';

      const file = {
        originalname: `avatar-${Date.now()}${ext}`,
        mimetype,
        buffer,
        size: buffer.length,
      };
      return await this.saveAvatar(file, userId, standalone);
    } catch (err: any) {
      console.warn('saveBase64Avatar notice, fallback directly:', err?.message);
      return base64Data;
    }
  }

  async saveAvatar(file: any, userId: string, standalone = false): Promise<string> {
    const fileExt = path.extname(file.originalname).toLowerCase() || '.jpg';
    const baseFilename = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${fileExt}`;
    const safeFilename = `avatars/${baseFilename}`;

    let saved = false;
    let url: string | null = null;

    // 1. Ưu tiên tải trực tiếp lên MinIO (S3 Object Storage)
    try {
      const minioUrl = await this.minioService.uploadFile(safeFilename, file.buffer, file.mimetype);
      if (minioUrl) {
        url = minioUrl;
        saved = true;
      }
    } catch (minioErr: any) {
      console.warn('MinIO upload unreachable/failed, fallback to disk storage:', minioErr?.message);
    }

    // 2. Chỉ ghi vào ổ đĩa cục bộ làm fallback nếu MinIO không khả dụng
    if (!saved) {
      try {
        url = await this.saveToLocalDisk('avatars', baseFilename, file.buffer);
        saved = true;
      } catch (diskErr: any) {
        console.warn('Local disk write notice in saveAvatar:', diskErr?.message);
      }
    }

    if (!saved || !url) {
      throw new InternalServerErrorException('Không thể lưu trữ tệp ảnh lên hệ thống. Vui lòng thử lại sau.');
    }
    
    // Save upload metadata (non-fatal if uuid check fails)
    try {
      const uploadId = randomUUID();
      await this.prisma.$executeRaw`
        INSERT INTO public.user_uploads (id, user_id, file_path, filename, original_name, mime_type, size, created_at, updated_at)
        VALUES (${uploadId}::uuid, ${userId}::uuid, ${url}, ${safeFilename}, ${file.originalname}, ${file.mimetype}, ${file.size}, NOW(), NOW())
      `;
    } catch (err: any) {
      console.warn('user_uploads metadata insert notice:', err?.message);
    }

    // Nếu là ảnh tải lên riêng cho từng danh thiếp số độc lập, chỉ trả về URL và không ghi đè hồ sơ chung
    if (standalone) {
      return url;
    }

    // Save url to database user_profiles
    await this.prisma.$executeRaw`
      UPDATE public.user_profiles
      SET avatar_url = ${url}
      WHERE user_id = ${userId}::uuid
    `.catch(() => null);

    // Save url to database members
    await this.prisma.$executeRaw`
      UPDATE public.members
      SET avatar = ${url}
      WHERE user_id = ${userId}::uuid OR id = ${userId}::uuid
    `.catch(() => null);
    
    // Save url to database business_identities
    await this.prisma.$executeRaw`
      UPDATE public.business_identities
      SET avatar_url = ${url}
      WHERE owner_user_id = ${userId}::uuid
    `.catch(() => null);

    // Save url to database vione_users (synchronize with dev server / local)
    await this.prisma.$executeRaw`
      UPDATE public.vione_users
      SET avatar_url = ${url}
      WHERE id = ${userId}::uuid
    `.catch(() => null);

    // Save url to database card_settings (SSOT for digital card & mobile app)
    await this.prisma.$executeRaw`
      INSERT INTO public.card_settings (user_id, photo_url, updated_at)
      VALUES (${userId}::uuid, ${url}, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        photo_url = ${url},
        updated_at = NOW()
    `.catch(() => null);

    // Save url to database member_business_cards
    await this.prisma.$executeRaw`
      UPDATE public.member_business_cards
      SET avatar_url = ${url}, updated_at = NOW()
      WHERE owner_user_id = ${userId}::uuid
    `.catch(() => null);
    
    return url;
  }

  async saveCompanyLogo(file: any, userId: string): Promise<string> {
    const fileExt = path.extname(file.originalname).toLowerCase() || '.png';
    const baseFilename = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${fileExt}`;
    const safeFilename = `logos/${baseFilename}`;

    let saved = false;
    let url: string | null = null;

    try {
      const minioUrl = await this.minioService.uploadFile(safeFilename, file.buffer, file.mimetype);
      if (minioUrl) {
        url = minioUrl;
        saved = true;
      }
    } catch (minioErr: any) {
      console.warn('MinIO upload unreachable/failed for logo, fallback to disk storage:', minioErr?.message);
    }

    if (!saved) {
      try {
        url = await this.saveToLocalDisk('logos', baseFilename, file.buffer);
        saved = true;
      } catch (diskErr: any) {
        console.warn('Local disk write notice in saveCompanyLogo:', diskErr?.message);
      }
    }

    if (!saved || !url) {
      throw new InternalServerErrorException('Không thể lưu trữ tệp logo lên hệ thống. Vui lòng thử lại sau.');
    }

    try {
      const uploadId = randomUUID();
      await this.prisma.$executeRaw`
        INSERT INTO public.user_uploads (id, user_id, file_path, filename, original_name, mime_type, size, created_at, updated_at)
        VALUES (${uploadId}::uuid, ${userId}::uuid, ${url}, ${safeFilename}, ${file.originalname}, ${file.mimetype}, ${file.size}, NOW(), NOW())
      `;
    } catch {}

    // Save to card_settings (SSOT for digital card & mobile app)
    await this.prisma.$executeRaw`
      INSERT INTO public.card_settings (user_id, company_logo_url, updated_at)
      VALUES (${userId}::uuid, ${url}, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        company_logo_url = ${url},
        updated_at = NOW()
    `.catch(() => null);

    // Save to members table
    await this.prisma.$executeRaw`
      UPDATE public.members
      SET company_logo_url = ${url}, updated_at = NOW()
      WHERE user_id = ${userId}::uuid OR id = ${userId}::uuid
    `.catch(() => null);

    // Save to user_profiles
    await this.prisma.$executeRaw`
      UPDATE public.user_profiles
      SET company_logo_url = ${url}, updated_at = NOW()
      WHERE user_id = ${userId}::uuid
    `.catch(() => null);

    // Save to business_identities
    await this.prisma.$executeRaw`
      UPDATE public.business_identities
      SET company_logo_url = ${url}, updated_at = NOW()
      WHERE owner_user_id = ${userId}::uuid
    `.catch(() => null);

    // Save to member_business_cards
    await this.prisma.$executeRaw`
      UPDATE public.member_business_cards
      SET company_logo_url = ${url}, updated_at = NOW()
      WHERE owner_user_id = ${userId}::uuid
    `.catch(() => null);

    return url;
  }

  async saveAssociationLogo(file: any, userId: string, associationId?: string): Promise<string> {
    const fileExt = path.extname(file.originalname).toLowerCase() || '.png';
    const baseFilename = `${associationId || 'assoc'}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${fileExt}`;
    const safeFilename = `association-logos/${baseFilename}`;

    let saved = false;
    let url: string | null = null;

    try {
      const minioUrl = await this.minioService.uploadFile(safeFilename, file.buffer, file.mimetype);
      if (minioUrl) {
        url = minioUrl;
        saved = true;
      }
    } catch (minioErr: any) {
      console.warn('MinIO upload unreachable/failed for association logo, fallback to disk storage:', minioErr?.message);
    }

    if (!saved) {
      try {
        url = await this.saveToLocalDisk('association-logos', baseFilename, file.buffer);
        saved = true;
      } catch (diskErr: any) {
        console.warn('Local disk write notice in saveAssociationLogo:', diskErr?.message);
      }
    }

    if (!saved || !url) {
      throw new InternalServerErrorException('Không thể lưu trữ tệp logo lên hệ thống. Vui lòng thử lại sau.');
    }

    // Save upload metadata
    try {
      const uploadId = randomUUID();
      await this.prisma.$executeRaw`
        INSERT INTO public.user_uploads (id, user_id, file_path, filename, original_name, mime_type, size, created_at, updated_at)
        VALUES (${uploadId}::uuid, ${userId}::uuid, ${url}, ${safeFilename}, ${file.originalname}, ${file.mimetype}, ${file.size}, NOW(), NOW())
      `;
    } catch {}

    // Update public.associations
    try {
      if (associationId && /^[0-9a-fA-F-]{36}$/.test(associationId)) {
        await this.prisma.$executeRaw`
          UPDATE public.associations
          SET logo_url = ${url}, updated_at = NOW()
          WHERE id = ${associationId}::uuid
        `;
      } else {
        await this.prisma.$executeRaw`
          UPDATE public.associations
          SET logo_url = ${url}, updated_at = NOW()
          WHERE id = (SELECT id FROM public.associations ORDER BY created_at ASC LIMIT 1)
        `;
      }
    } catch (e) {
      console.warn('Failed to update association logo_url:', e);
    }

    // Record in public.association_logo_history
    try {
      const user = await this.prisma.vione_users.findUnique({ where: { id: userId } }).catch(() => null);
      const actorName = user?.name || user?.email || 'Quản trị viên';
      const targetAssoc = associationId && /^[0-9a-fA-F-]{36}$/.test(associationId)
        ? associationId
        : (await this.prisma.$queryRaw<any[]>`SELECT id FROM public.associations ORDER BY created_at ASC LIMIT 1`.then(r => r[0]?.id).catch(() => null));

      if (targetAssoc) {
        await this.prisma.$executeRaw`
          INSERT INTO public.association_logo_history (id, association_id, changed_by, changed_by_name, new_logo_url, action, created_at)
          VALUES (gen_random_uuid(), ${targetAssoc}::uuid, ${userId}::uuid, ${actorName}, ${url}, 'change', NOW())
        `;
      }
    } catch {}

    return url;
  }

  async saveFile(file: any, userId: string, folder = 'documents'): Promise<string> {
    const fileExt = path.extname(file.originalname).toLowerCase() || '.bin';
    const baseFilename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${fileExt}`;
    const safeFilename = `${folder}/${baseFilename}`;

    let saved = false;
    let url: string | null = null;

    // 1. Ưu tiên tải trực tiếp lên MinIO (S3 Object Storage)
    try {
      const minioUrl = await this.minioService.uploadFile(safeFilename, file.buffer, file.mimetype);
      if (minioUrl) {
        url = minioUrl;
        saved = true;
      }
    } catch (minioErr: any) {
      console.warn('MinIO upload unreachable/failed, fallback to disk storage:', minioErr?.message);
    }

    // 2. Chỉ ghi vào ổ đĩa cục bộ làm fallback nếu MinIO không khả dụng
    if (!saved) {
      try {
        url = await this.saveToLocalDisk(folder, baseFilename, file.buffer);
        saved = true;
      } catch (diskErr: any) {
        console.warn('Local disk write notice in saveFile:', diskErr?.message);
      }
    }

    if (!saved || !url) {
      throw new InternalServerErrorException('Không thể lưu trữ tệp tin lên hệ thống. Vui lòng thử lại sau.');
    }

    // Save upload metadata
    try {
      const uploadId = randomUUID();
      await this.prisma.$executeRaw`
        INSERT INTO public.user_uploads (id, user_id, file_path, filename, original_name, mime_type, size, created_at, updated_at)
        VALUES (${uploadId}::uuid, ${userId}::uuid, ${url}, ${safeFilename}, ${file.originalname}, ${file.mimetype}, ${file.size}, NOW(), NOW())
      `;
    } catch (err: any) {
      console.warn('user_uploads metadata insert notice in saveFile:', err?.message);
    }

    return url;
  }

  async getFileStream(filename: string): Promise<any> {
    return this.minioService.getFileStream(filename);
  }

  async deleteFile(filename: string, userId: string): Promise<void> {
    // Find upload metadata record to verify ownership
    const uploads = await this.prisma.$queryRaw<any[]>`
      SELECT id, file_path FROM public.user_uploads
      WHERE filename = ${filename} AND user_id = ${userId}::uuid
    `.catch(() => []);

    if (uploads.length === 0) {
      throw new InternalServerErrorException('File not found or access denied');
    }

    const upload = uploads[0];

    // Remove from MinIO
    await this.minioService.deleteFile(filename);

    // Remove metadata from DB
    await this.prisma.$executeRaw`
      DELETE FROM public.user_uploads
      WHERE id = ${upload.id}::uuid
    `;

    // Reset avatars if they matched this deleted file
    await this.prisma.$executeRaw`
      UPDATE public.user_profiles
      SET avatar_url = NULL
      WHERE user_id = ${userId}::uuid AND avatar_url = ${upload.file_path}
    `;

    await this.prisma.$executeRaw`
      UPDATE public.business_identities
      SET avatar_url = NULL
      WHERE owner_user_id = ${userId}::uuid AND avatar_url = ${upload.file_path}
    `;
  }
}

