import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ConnectContentService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublishedNews() {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, title, category, author, excerpt, cover_image, views, created_at
      FROM public.news
      WHERE status = 'published'
      ORDER BY created_at DESC
    `.catch(() => []);

    return rows.map((n) => ({
      id: n.id,
      title: n.title,
      category: n.category ?? '',
      author: n.author ?? '',
      excerpt: n.excerpt ?? '',
      image: n.cover_image ?? '',
      coverImage: n.cover_image ?? '',
      time: n.created_at ? new Date(n.created_at).toISOString() : '',
      views: Number(n.views ?? 0),
    }));
  }

  async listActivePerks() {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.perks
      WHERE status = 'active'
      ORDER BY sort_order ASC
    `.catch(() => []);

    return rows.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category ?? '',
      partner: p.partner ?? '',
      summary: p.summary ?? '',
      description: p.description ?? '',
      discount: p.discount ?? '',
      icon: p.icon ?? 'Gift',
      link: p.link ?? '',
      validUntil: p.valid_until ? (p.valid_until instanceof Date ? p.valid_until.toISOString().slice(0, 10) : String(p.valid_until).slice(0, 10)) : null,
    }));
  }

  async getPerkById(id: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.perks WHERE id::text = ${id}::text LIMIT 1
    `.catch((err) => {
      console.error(`getPerkById error: ${err?.message}`);
      return [];
    });

    if (rows.length === 0) return null;
    const p = rows[0];
    return {
      id: p.id,
      title: p.title,
      category: p.category ?? '',
      partner: p.partner ?? '',
      summary: p.summary ?? '',
      description: p.description ?? '',
      discount: p.discount ?? '',
      icon: p.icon ?? 'Gift',
      link: p.link ?? '',
      validUntil: p.valid_until ? (p.valid_until instanceof Date ? p.valid_until.toISOString().slice(0, 10) : String(p.valid_until).slice(0, 10)) : null,
    };
  }

  async listAllPerksAdmin() {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.perks
      ORDER BY sort_order ASC, created_at DESC
    `.catch((err) => {
      console.error(`listAllPerksAdmin error: ${err?.message}`);
      return [];
    });

    return rows.map((p) => ({
      id: p.id,
      title: p.title ?? '',
      category: p.category ?? '',
      partner: p.partner ?? '',
      summary: p.summary ?? '',
      description: p.description ?? '',
      discount: p.discount ?? '',
      icon: p.icon ?? 'Gift',
      link: p.link ?? '',
      validUntil: p.valid_until ? (p.valid_until instanceof Date ? p.valid_until.toISOString().slice(0, 10) : String(p.valid_until).slice(0, 10)) : '',
      sortOrder: Number(p.sort_order ?? 0),
      status: p.status === 'inactive' ? 'inactive' : 'active',
    }));
  }

  async createPerkAdmin(data: any) {
    const rows = await this.prisma.$queryRaw<any[]>`
      INSERT INTO public.perks (title, category, partner, summary, description, discount, icon, link, valid_until, sort_order, status)
      VALUES (
        ${data.title},
        ${data.category ?? ''},
        ${data.partner ?? ''},
        ${data.summary ?? ''},
        ${data.description ?? ''},
        ${data.discount ?? ''},
        ${data.icon ?? 'Gift'},
        ${data.link ?? ''},
        ${data.validUntil ? new Date(data.validUntil) : null},
        ${Number(data.sortOrder ?? 0)},
        ${data.status ?? 'active'}
      )
      RETURNING *
    `;
    const p = rows[0];
    return {
      id: p.id,
      title: p.title,
      category: p.category ?? '',
      partner: p.partner ?? '',
      summary: p.summary ?? '',
      description: p.description ?? '',
      discount: p.discount ?? '',
      icon: p.icon ?? 'Gift',
      link: p.link ?? '',
      validUntil: p.valid_until ? (p.valid_until instanceof Date ? p.valid_until.toISOString().slice(0, 10) : String(p.valid_until).slice(0, 10)) : '',
      sortOrder: Number(p.sort_order ?? 0),
      status: p.status ?? 'active',
    };
  }

  async updatePerkAdmin(id: string, data: any) {
    const rows = await this.prisma.$queryRaw<any[]>`
      UPDATE public.perks
      SET
        title = COALESCE(${data.title}, title),
        category = COALESCE(${data.category}, category),
        partner = COALESCE(${data.partner}, partner),
        summary = COALESCE(${data.summary}, summary),
        description = COALESCE(${data.description}, description),
        discount = COALESCE(${data.discount}, discount),
        icon = COALESCE(${data.icon}, icon),
        link = COALESCE(${data.link}, link),
        valid_until = ${data.validUntil ? new Date(data.validUntil) : null},
        sort_order = COALESCE(${data.sortOrder !== undefined ? Number(data.sortOrder) : null}, sort_order),
        status = COALESCE(${data.status}, status),
        updated_at = NOW()
      WHERE id::text = ${id}::text
      RETURNING *
    `;
    if (rows.length === 0) return null;
    const p = rows[0];
    return {
      id: p.id,
      title: p.title,
      category: p.category ?? '',
      partner: p.partner ?? '',
      summary: p.summary ?? '',
      description: p.description ?? '',
      discount: p.discount ?? '',
      icon: p.icon ?? 'Gift',
      link: p.link ?? '',
      validUntil: p.valid_until ? (p.valid_until instanceof Date ? p.valid_until.toISOString().slice(0, 10) : String(p.valid_until).slice(0, 10)) : '',
      sortOrder: Number(p.sort_order ?? 0),
      status: p.status ?? 'active',
    };
  }

  async deletePerkAdmin(id: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.perks WHERE id::text = ${id}::text
    `;
    return { ok: true };
  }


  // ---------------------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------------------

  async listAdminNews() {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, code, title, category, author, published_at, views, status, excerpt, content, cover_image, association_id, created_at, updated_at
      FROM public.news
      ORDER BY created_at DESC
    `.catch((err) => {
      console.error(`listAdminNews error: ${err?.message}`);
      return [];
    });

    return rows.map((n) => ({
      id: n.code || n.id,
      code: n.code,
      title: n.title,
      category: n.category ?? '',
      author: n.author ?? '',
      publishedAt: n.published_at ? (n.published_at instanceof Date ? n.published_at.toISOString().slice(0, 10) : String(n.published_at).slice(0, 10)) : '—',
      views: Number(n.views ?? 0),
      status: n.status ?? 'draft',
      excerpt: n.excerpt ?? '',
      content: n.content ?? '',
      image: n.cover_image ?? '',
      coverImage: n.cover_image ?? '',
      cover_image: n.cover_image ?? '',
      associationId: n.association_id,
      createdAt: n.created_at ? new Date(n.created_at).toISOString() : '',
    }));
  }

  async createNewsAdmin(data: any) {
    const code = data.code || `NEWS-${Date.now().toString().slice(-6)}`;
    const img = data.image || data.coverImage || data.cover_image || null;
    const rows = await this.prisma.$queryRaw<any[]>`
      INSERT INTO public.news (code, title, category, author, published_at, status, excerpt, content, cover_image, views, association_id, created_at, updated_at)
      VALUES (
        ${code},
        ${data.title},
        ${data.category ?? ''},
        ${data.author ?? 'Ban Truyền Thông'},
        ${data.publishedAt || new Date().toISOString().slice(0, 10)},
        ${data.status ?? 'published'},
        ${data.excerpt ?? ''},
        ${data.content ?? ''},
        ${img},
        0,
        ${data.associationId ? data.associationId : null}::uuid,
        NOW(),
        NOW()
      )
      RETURNING *
    `;
    const n = rows[0];
    return {
      id: n.code || n.id,
      code: n.code,
      title: n.title,
      category: n.category ?? '',
      author: n.author ?? '',
      publishedAt: n.published_at ? (n.published_at instanceof Date ? n.published_at.toISOString().slice(0, 10) : String(n.published_at).slice(0, 10)) : '—',
      views: Number(n.views ?? 0),
      status: n.status ?? 'published',
      excerpt: n.excerpt ?? '',
      content: n.content ?? '',
      image: n.cover_image ?? '',
      coverImage: n.cover_image ?? '',
      cover_image: n.cover_image ?? '',
      associationId: n.association_id,
    };
  }

  async updateNewsAdmin(id: string, data: any) {
    const img = data.image !== undefined ? data.image : (data.coverImage !== undefined ? data.coverImage : (data.cover_image !== undefined ? data.cover_image : null));
    const rows = await this.prisma.$queryRaw<any[]>`
      UPDATE public.news
      SET
        title = COALESCE(${data.title}, title),
        category = COALESCE(${data.category}, category),
        author = COALESCE(${data.author}, author),
        published_at = COALESCE(${data.publishedAt}, published_at),
        status = COALESCE(${data.status}, status),
        excerpt = COALESCE(${data.excerpt}, excerpt),
        content = COALESCE(${data.content}, content),
        cover_image = COALESCE(${img}, cover_image),
        updated_at = NOW()
      WHERE code = ${id} OR id::text = ${id}
      RETURNING *
    `;
    if (rows.length === 0) return null;
    const n = rows[0];
    return {
      id: n.code || n.id,
      code: n.code,
      title: n.title,
      category: n.category ?? '',
      author: n.author ?? '',
      publishedAt: n.published_at ? (n.published_at instanceof Date ? n.published_at.toISOString().slice(0, 10) : String(n.published_at).slice(0, 10)) : '—',
      views: Number(n.views ?? 0),
      status: n.status ?? 'published',
      excerpt: n.excerpt ?? '',
      content: n.content ?? '',
      image: n.cover_image ?? '',
      coverImage: n.cover_image ?? '',
      cover_image: n.cover_image ?? '',
      associationId: n.association_id,
    };
  }

  async deleteNewsAdmin(id: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.news WHERE code = ${id} OR id::text = ${id}
    `;
    return { ok: true };
  }
}

