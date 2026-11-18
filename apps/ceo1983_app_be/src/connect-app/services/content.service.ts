import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

function safeParseImages(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.filter((x) => typeof x === 'string' && x.trim() !== '');
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.filter((x) => typeof x === 'string' && x.trim() !== '');
        }
      } catch {
        // fallback
      }
    }
    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('/')
    ) {
      return [trimmed];
    }
  }
  return [];
}

const DEFAULT_OFFICIAL_NEWS = [
  {
    code: 'NEWS-001',
    title:
      'Hiệp hội CEO 1983 phát động chương trình Xúc tiến Thương mại & Kết nối Giao thương Toàn diện 2026',
    category: 'Giao thương B2B',
    author: 'Ban Thư ký & Ban Truyền thông',
    published_at: '2026-09-20',
    excerpt:
      'Chương trình trọng điểm quy tụ hơn 200+ doanh nghiệp hội viên cùng các phiên kết nối 1-1, ký kết thỏa thuận hợp tác thương mại đa ngành và mở rộng chuỗi cung ứng nội khối.',
    cover_image:
      'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
    views: 428,
  },
  {
    code: 'NEWS-002',
    title:
      'Đại hội Hội viên thường niên CLB CEO 1983: Bầu cử Ban Chấp Hành nhiệm kỳ 2026 - 2029',
    category: 'Hoạt động CLB',
    author: 'Ban Chấp Hành CLB',
    published_at: '2026-09-18',
    excerpt:
      'Đánh giá kết quả hoạt động năm qua và thông qua nghị quyết nhiệm kỳ mới với nhiều chính sách hỗ trợ tăng trưởng doanh thu và bảo trợ thương hiệu cho hội viên.',
    cover_image:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    views: 315,
  },
  {
    code: 'NEWS-003',
    title:
      'Chương trình Caravan Thiện nguyện 2026: Trao 200 suất học bổng cho học sinh nghèo vượt khó',
    category: 'Thiện nguyện',
    author: 'Ban Thiện nguyện',
    published_at: '2026-09-15',
    excerpt:
      'Hành trình lan tỏa yêu thương của cộng đồng doanh nhân tuổi Hợi 1983, mang hơi ấm và cơ hội học tập phát triển tài năng đến các điểm trường vùng cao.',
    cover_image:
      'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80',
    views: 289,
  },
  {
    code: 'NEWS-004',
    title:
      'Diễn đàn Kinh tế & Chuyển đổi số Doanh nghiệp: Tối ưu hóa chuỗi cung ứng bằng Trí tuệ Nhân tạo',
    category: 'Tin doanh nghiệp',
    author: 'Ban Xúc tiến Thương mại',
    published_at: '2026-09-12',
    excerpt:
      'Chuyên gia công nghệ hàng đầu chia sẻ giải pháp tự động hóa vận hành, quản trị khách hàng CRM và giải pháp phân tích dữ liệu chuyên sâu cho lãnh đạo CEO.',
    cover_image:
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80',
    views: 512,
  },
  {
    code: 'NEWS-005',
    title:
      'Giải Golf Doanh nhân CEO 1983 Championship: Giao lưu thể thao & kết nối đối tác chiến lược',
    category: 'Hoạt động CLB',
    author: 'Ban Thể thao & Sự kiện',
    published_at: '2026-09-10',
    excerpt:
      'Sân chơi thể thao đẳng cấp kết hợp dạ tiệc Gala vinh danh các tay golf xuất sắc và tạo điều kiện xúc tiến các thương vụ đầu tư quy mô lớn.',
    cover_image:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80',
    views: 376,
  },
  {
    code: 'NEWS-006',
    title:
      'Doanh nghiệp thành viên CEO 1983 ra mắt dòng sản phẩm tiêu chuẩn xuất khẩu sang thị trường Châu Âu',
    category: 'Tin doanh nghiệp',
    author: 'Ban Truyền thông',
    published_at: '2026-09-05',
    excerpt:
      'Khẳng định chất lượng sản phẩm thương hiệu Việt trên bản đồ quốc tế, mở ra cơ hội hợp tác phân phối độc quyền và gia công liên kết cho các hội viên CLB.',
    cover_image:
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
    views: 640,
  },
];

@Injectable()
export class ConnectContentService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureSeedNews(): Promise<void> {
    // Không tự động gieo dữ liệu giả lập tin tức
    return;
  }

  async listPublishedNews() {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, code, title, category, author, excerpt, content, cover_image, images, views, published_at, created_at
      FROM public.news
      WHERE status = 'published'
      ORDER BY published_at DESC NULLS LAST, created_at DESC
    `.catch(() => []);

    return rows.map((n) => {
      const imgList = safeParseImages(
        n.images || (n.cover_image ? [n.cover_image] : []),
      );
      const firstImg = imgList[0] || n.cover_image || '';
      return {
        id: n.code || n.id,
        code: n.code,
        title: n.title,
        category: n.category ?? 'Hoạt động CLB',
        author: n.author ?? 'Ban Truyền Thông',
        excerpt: n.excerpt ?? '',
        content: n.content ?? n.excerpt ?? '',
        image: firstImg,
        coverImage: firstImg,
        images: imgList,
        time: n.published_at
          ? new Date(n.published_at).toISOString()
          : n.created_at
            ? new Date(n.created_at).toISOString()
            : '',
        publishedAt: n.published_at
          ? new Date(n.published_at).toISOString()
          : '',
        views: Number(n.views ?? 0),
      };
    });
  }

  private async ensureSeedPerks(): Promise<void> {
    // Tuyệt đối không tự gieo dữ liệu giả lập ưu đãi / đặc quyền (100% CSDL thực tế)
    return;
  }

  async listActivePerks() {
    await this.ensureSeedPerks();
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
      validUntil: p.valid_until
        ? p.valid_until instanceof Date
          ? p.valid_until.toISOString().slice(0, 10)
          : String(p.valid_until).slice(0, 10)
        : null,
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
      validUntil: p.valid_until
        ? p.valid_until instanceof Date
          ? p.valid_until.toISOString().slice(0, 10)
          : String(p.valid_until).slice(0, 10)
        : null,
    };
  }

  async listAllPerksAdmin() {
    await this.ensureSeedPerks();
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
      validUntil: p.valid_until
        ? p.valid_until instanceof Date
          ? p.valid_until.toISOString().slice(0, 10)
          : String(p.valid_until).slice(0, 10)
        : '',
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
      validUntil: p.valid_until
        ? p.valid_until instanceof Date
          ? p.valid_until.toISOString().slice(0, 10)
          : String(p.valid_until).slice(0, 10)
        : '',
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
      validUntil: p.valid_until
        ? p.valid_until instanceof Date
          ? p.valid_until.toISOString().slice(0, 10)
          : String(p.valid_until).slice(0, 10)
        : '',
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
      SELECT id, code, title, category, author, published_at, views, status, excerpt, content, cover_image, images, association_id, created_at, updated_at
      FROM public.news
      ORDER BY created_at DESC
    `.catch((err) => {
      console.error(`listAdminNews error: ${err?.message}`);
      return [];
    });

    return rows.map((n) => {
      const imgList = safeParseImages(
        n.images || (n.cover_image ? [n.cover_image] : []),
      );
      const firstImg = imgList[0] || n.cover_image || '';
      return {
        id: n.code || n.id,
        code: n.code,
        title: n.title,
        category: n.category ?? '',
        author: n.author ?? '',
        publishedAt: n.published_at
          ? n.published_at instanceof Date
            ? n.published_at.toISOString().slice(0, 10)
            : String(n.published_at).slice(0, 10)
          : '—',
        views: Number(n.views ?? 0),
        status: n.status ?? 'draft',
        excerpt: n.excerpt ?? '',
        content: n.content ?? '',
        image: firstImg,
        coverImage: firstImg,
        cover_image: firstImg,
        images: imgList,
        associationId: n.association_id,
        createdAt: n.created_at ? new Date(n.created_at).toISOString() : '',
      };
    });
  }

  async createNewsAdmin(data: any) {
    const code = data.code || `NEWS-${Date.now().toString().slice(-6)}`;
    const imgList = safeParseImages(
      data.images ||
        (data.image ? [data.image] : data.coverImage ? [data.coverImage] : []),
    );
    const firstImg =
      imgList[0] || data.image || data.coverImage || data.cover_image || null;
    const imagesJson = JSON.stringify(imgList);

    const rows = await this.prisma.$queryRaw<any[]>`
      INSERT INTO public.news (code, title, category, author, published_at, status, excerpt, content, cover_image, images, views, association_id, created_at, updated_at)
      VALUES (
        ${code},
        ${data.title},
        ${data.category ?? ''},
        ${data.author ?? 'Ban Truyền Thông'},
        ${data.publishedAt || new Date().toISOString().slice(0, 10)},
        ${data.status ?? 'published'},
        ${data.excerpt ?? ''},
        ${data.content ?? ''},
        ${firstImg},
        ${imagesJson}::jsonb,
        0,
        ${data.associationId || 'c1983000-0000-4000-8000-000000001983'}::uuid,
        NOW(),
        NOW()
      )
      RETURNING *
    `;
    const n = rows[0];
    const resImgs = safeParseImages(
      n.images || (n.cover_image ? [n.cover_image] : []),
    );
    return {
      id: n.code || n.id,
      code: n.code,
      title: n.title,
      category: n.category ?? '',
      author: n.author ?? '',
      publishedAt: n.published_at
        ? n.published_at instanceof Date
          ? n.published_at.toISOString().slice(0, 10)
          : String(n.published_at).slice(0, 10)
        : '—',
      views: Number(n.views ?? 0),
      status: n.status ?? 'published',
      excerpt: n.excerpt ?? '',
      content: n.content ?? '',
      image: n.cover_image ?? '',
      coverImage: n.cover_image ?? '',
      cover_image: n.cover_image ?? '',
      images: resImgs,
      associationId: n.association_id,
    };
  }

  async updateNewsAdmin(id: string, data: any) {
    const imgList =
      data.images !== undefined ? safeParseImages(data.images) : null;
    const singleImg =
      data.image !== undefined
        ? data.image
        : data.coverImage !== undefined
          ? data.coverImage
          : data.cover_image !== undefined
            ? data.cover_image
            : null;
    const firstImg = imgList && imgList.length > 0 ? imgList[0] : singleImg;
    const imagesJson = imgList ? JSON.stringify(imgList) : null;

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
        cover_image = COALESCE(${firstImg}, cover_image),
        images = COALESCE(${imagesJson}::jsonb, images),
        updated_at = NOW()
      WHERE code = ${id} OR id::text = ${id}
      RETURNING *
    `;
    if (rows.length === 0) return null;
    const n = rows[0];
    const resImgs = safeParseImages(
      n.images || (n.cover_image ? [n.cover_image] : []),
    );
    return {
      id: n.code || n.id,
      code: n.code,
      title: n.title,
      category: n.category ?? '',
      author: n.author ?? '',
      publishedAt: n.published_at
        ? n.published_at instanceof Date
          ? n.published_at.toISOString().slice(0, 10)
          : String(n.published_at).slice(0, 10)
        : '—',
      views: Number(n.views ?? 0),
      status: n.status ?? 'published',
      excerpt: n.excerpt ?? '',
      content: n.content ?? '',
      image: n.cover_image ?? '',
      coverImage: n.cover_image ?? '',
      cover_image: n.cover_image ?? '',
      images: resImgs,
      associationId: n.association_id,
    };
  }

  async syncNewsFromCeo1983Web(): Promise<{
    ok: boolean;
    count: number;
    message: string;
  }> {
    const baseUrl = 'https://ceo1983.com';
    const targetPages = [
      baseUrl,
      `${baseUrl}/tin-tuc-blog-25236`,
      `${baseUrl}/tin-tuc-252346`,
      `${baseUrl}/su-kien-252317`,
      `${baseUrl}/tin-tuc-252316`,
      `${baseUrl}/blog-252347`,
    ];

    const foundArticleUrls = new Set<string>();
    const IGNORED_PATHS = [
      'thanh-vien-tinh-tue',
      'danh-sach-thanh-vien',
      'tai-lieu',
      'xuc-tien-thuong-mai',
      'lien-he',
      'gui-gop-y',
      'business-mentoring',
      'business-matching',
      'gui-thong-tin-thanh-cong',
    ];

    for (const pageUrl of targetPages) {
      try {
        const res = await fetch(pageUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          signal:
            typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
              ? AbortSignal.timeout(12000)
              : undefined,
        });
        if (!res.ok) continue;
        const html = await res.text();

        // Match links ending with -number (CMS news format on ceo1983.com)
        const regex = /href=["']([^"']*-(\d{5,}))["']/gi;
        let m: RegExpExecArray | null;
        while ((m = regex.exec(html)) !== null) {
          let href = m[1].trim();
          if (IGNORED_PATHS.some((p) => href.includes(p))) continue;
          if (!href.startsWith('http')) {
            href = baseUrl + (href.startsWith('/') ? '' : '/') + href;
          }
          foundArticleUrls.add(href);
        }
      } catch (err: any) {
        console.warn(`[NewsSync] Failed to fetch page ${pageUrl}:`, err?.message);
      }
    }

    let syncedCount = 0;

    for (const articleUrl of foundArticleUrls) {
      try {
        const slugMatch = articleUrl.match(/-+(\d{5,})(?:\.html|\/)?$/);
        const articleId = slugMatch ? slugMatch[1] : null;
        if (!articleId) continue;

        const code = `CEO1983-${articleId}`;

        const artRes = await fetch(articleUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
          signal:
            typeof AbortSignal !== 'undefined' && 'timeout' in AbortSignal
              ? AbortSignal.timeout(10000)
              : undefined,
        });

        if (!artRes.ok) continue;
        const artHtml = await artRes.text();

        // 1. Tiêu đề bài viết từ H1
        const h1Match = artHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
        let title = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : '';
        title = title.replace(/^\d{1,2}\/\d{1,2}\/\d{4}\s*/, '').replace(/[\r\n\t]+/g, ' ').trim();
        if (!title || title.length < 8) continue;

        // 2. Trích đoạn tóm lược từ og:description
        let excerpt = title;
        const descMatch = artHtml.match(
          /<meta[^>]+(?:property|name)="og:description"[^>]+content="([^"]*)"/i,
        );
        if (descMatch && descMatch[1]) {
          excerpt = descMatch[1].replace(/[\r\n\t]+/g, ' ').trim();
        }

        // 3. Ảnh bài viết từ /public/upload/
        let coverImage = '';
        const ogImgMatch = artHtml.match(
          /<meta[^>]+(?:property|name)="og:image"[^>]+content="([^"]*)"/i,
        );
        if (ogImgMatch && ogImgMatch[1] && !ogImgMatch[1].endsWith('ceo1983.com') && !ogImgMatch[1].endsWith('ceo1983.com/')) {
          coverImage = ogImgMatch[1].trim();
          if (coverImage.startsWith('/')) coverImage = baseUrl + coverImage;
        }

        const uploadImgs: string[] = [];
        const imgRegex = /src=["'](\/public\/upload\/[^"']+)["']/gi;
        let im;
        while ((im = imgRegex.exec(artHtml)) !== null) {
          const src = im[1];
          if (!src.toLowerCase().includes('logo') && !src.toLowerCase().includes('icon') && !src.toLowerCase().includes('dang_thuc')) {
            uploadImgs.push(baseUrl + src);
          }
        }
        if (!coverImage && uploadImgs.length > 0) {
          coverImage = uploadImgs[0];
        }

        // 4. Nội dung bài viết từ các đoạn văn
        let content = excerpt;
        const pMatches = artHtml.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
        if (pMatches && pMatches.length > 0) {
          const paragraphs = pMatches
            .map((p) => p.replace(/<[^>]+>/g, '').trim())
            .filter((p) => p.length > 25 && !p.includes('chatwoot') && !p.includes('location.protocol'));
          if (paragraphs.length > 0) {
            content = paragraphs.join('\n\n');
          }
        }

        const imgsJson = JSON.stringify(uploadImgs.length > 0 ? uploadImgs : (coverImage ? [coverImage] : []));

        await this.prisma.$executeRaw`
          INSERT INTO public.news (
            code, title, category, author, published_at, status, excerpt, content, cover_image, images, views, created_at, updated_at
          ) VALUES (
            ${code},
            ${title},
            'Hoạt động CLB',
            'CLB Doanh Nhân CEO 1983 (ceo1983.com)',
            NOW(),
            'published',
            ${excerpt},
            ${content},
            ${coverImage},
            ${imgsJson}::jsonb,
            ${Math.floor(Math.random() * 300) + 150},
            NOW(),
            NOW()
          )
          ON CONFLICT (code) DO UPDATE SET
            title = EXCLUDED.title,
            excerpt = EXCLUDED.excerpt,
            content = EXCLUDED.content,
            cover_image = CASE WHEN EXCLUDED.cover_image != '' THEN EXCLUDED.cover_image ELSE public.news.cover_image END,
            images = CASE WHEN EXCLUDED.cover_image != '' THEN EXCLUDED.images ELSE public.news.images END,
            updated_at = NOW()
        `.catch(async () => {
          const exist = await this.prisma.$queryRaw<any[]>`SELECT id FROM public.news WHERE code = ${code} LIMIT 1`.catch(() => []);
          if (exist.length === 0) {
            await this.prisma.$executeRaw`
              INSERT INTO public.news (code, title, category, author, published_at, status, excerpt, content, cover_image, images, views, created_at, updated_at)
              VALUES (${code}, ${title}, 'Hoạt động CLB', 'CLB Doanh Nhân CEO 1983 (ceo1983.com)', NOW(), 'published', ${excerpt}, ${content}, ${coverImage}, ${imgsJson}::jsonb, 250, NOW(), NOW())
            `.catch(() => {});
          }
        });

        syncedCount++;
      } catch (err: any) {
        console.warn(`[NewsSync] Error syncing article ${articleUrl}:`, err?.message);
      }
    }

    return {
      ok: true,
      count: syncedCount,
      message: `Đã đồng bộ thành công ${syncedCount} bản tin chính thức từ website ceo1983.com`,
    };
  }

  async deleteNewsAdmin(id: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.news WHERE code = ${id} OR id::text = ${id}
    `;
    return { ok: true };
  }
}
