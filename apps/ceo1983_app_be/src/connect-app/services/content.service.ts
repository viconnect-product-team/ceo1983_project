import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
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
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
      return [trimmed];
    }
  }
  return [];
}

const DEFAULT_OFFICIAL_NEWS = [
  {
    code: 'NEWS-001',
    title: 'Hiệp hội CEO 1983 phát động chương trình Xúc tiến Thương mại & Kết nối Giao thương Toàn diện 2026',
    category: 'Giao thương B2B',
    author: 'Ban Thư ký & Ban Truyền thông',
    published_at: '2026-09-20',
    excerpt: 'Chương trình trọng điểm quy tụ hơn 200+ doanh nghiệp hội viên cùng các phiên kết nối 1-1, ký kết thỏa thuận hợp tác thương mại đa ngành và mở rộng chuỗi cung ứng nội khối.',
    cover_image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
    views: 428,
  },
  {
    code: 'NEWS-002',
    title: 'Đại hội Hội viên thường niên CLB CEO 1983: Bầu cử Ban Chấp Hành nhiệm kỳ 2026 - 2029',
    category: 'Hoạt động CLB',
    author: 'Ban Chấp Hành CLB',
    published_at: '2026-09-18',
    excerpt: 'Đánh giá kết quả hoạt động năm qua và thông qua nghị quyết nhiệm kỳ mới với nhiều chính sách hỗ trợ tăng trưởng doanh thu và bảo trợ thương hiệu cho hội viên.',
    cover_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
    views: 315,
  },
  {
    code: 'NEWS-003',
    title: 'Chương trình Caravan Thiện nguyện 2026: Trao 200 suất học bổng cho học sinh nghèo vượt khó',
    category: 'Thiện nguyện',
    author: 'Ban Thiện nguyện',
    published_at: '2026-09-15',
    excerpt: 'Hành trình lan tỏa yêu thương của cộng đồng doanh nhân tuổi Hợi 1983, mang hơi ấm và cơ hội học tập phát triển tài năng đến các điểm trường vùng cao.',
    cover_image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80',
    views: 289,
  },
  {
    code: 'NEWS-004',
    title: 'Diễn đàn Kinh tế & Chuyển đổi số Doanh nghiệp: Tối ưu hóa chuỗi cung ứng bằng Trí tuệ Nhân tạo',
    category: 'Tin doanh nghiệp',
    author: 'Ban Xúc tiến Thương mại',
    published_at: '2026-09-12',
    excerpt: 'Chuyên gia công nghệ hàng đầu chia sẻ giải pháp tự động hóa vận hành, quản trị khách hàng CRM và giải pháp phân tích dữ liệu chuyên sâu cho lãnh đạo CEO.',
    cover_image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80',
    views: 512,
  },
  {
    code: 'NEWS-005',
    title: 'Giải Golf Doanh nhân CEO 1983 Championship: Giao lưu thể thao & kết nối đối tác chiến lược',
    category: 'Hoạt động CLB',
    author: 'Ban Thể thao & Sự kiện',
    published_at: '2026-09-10',
    excerpt: 'Sân chơi thể thao đẳng cấp kết hợp dạ tiệc Gala vinh danh các tay golf xuất sắc và tạo điều kiện xúc tiến các thương vụ đầu tư quy mô lớn.',
    cover_image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&auto=format&fit=crop&q=80',
    views: 376,
  },
  {
    code: 'NEWS-006',
    title: 'Doanh nghiệp thành viên CEO 1983 ra mắt dòng sản phẩm tiêu chuẩn xuất khẩu sang thị trường Châu Âu',
    category: 'Tin doanh nghiệp',
    author: 'Ban Truyền thông',
    published_at: '2026-09-05',
    excerpt: 'Khẳng định chất lượng sản phẩm thương hiệu Việt trên bản đồ quốc tế, mở ra cơ hội hợp tác phân phối độc quyền và gia công liên kết cho các hội viên CLB.',
    cover_image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
    views: 640,
  },
];

@Injectable()
export class ConnectContentService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureSeedNews(): Promise<void> {
    try {
      const count = await this.prisma.$queryRaw<any[]>`
        SELECT COUNT(*)::int as cnt FROM public.news
      `.catch(() => [{ cnt: 0 }]);
      if (Number(count[0]?.cnt || 0) === 0) {
        for (const item of DEFAULT_OFFICIAL_NEWS) {
          const imgsJson = JSON.stringify([item.cover_image]);
          await this.prisma.$executeRaw`
            INSERT INTO public.news (code, title, category, author, published_at, status, excerpt, content, cover_image, images, views, created_at, updated_at)
            VALUES (
              ${item.code},
              ${item.title},
              ${item.category},
              ${item.author},
              ${item.published_at},
              'published',
              ${item.excerpt},
              ${item.excerpt},
              ${item.cover_image},
              ${imgsJson}::jsonb,
              ${item.views},
              NOW(),
              NOW()
            )
            ON CONFLICT DO NOTHING
          `.catch(() => {});
        }
      }
    } catch (e: any) {
      console.warn('ensureSeedNews warning:', e?.message);
    }
  }

  async listPublishedNews() {
    await this.ensureSeedNews();
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, title, category, author, excerpt, cover_image, images, views, created_at
      FROM public.news
      WHERE status = 'published'
      ORDER BY created_at DESC
    `.catch(() => []);

    return rows.map((n) => {
      const imgList = safeParseImages(n.images || (n.cover_image ? [n.cover_image] : []));
      const firstImg = imgList[0] || n.cover_image || '';
      return {
        id: n.id,
        title: n.title,
        category: n.category ?? '',
        author: n.author ?? '',
        excerpt: n.excerpt ?? '',
        image: firstImg,
        coverImage: firstImg,
        images: imgList,
        time: n.created_at ? new Date(n.created_at).toISOString() : '',
        views: Number(n.views ?? 0),
      };
    });
  }

  private async ensureSeedPerks() {
    try {
      const existing = await this.prisma.$queryRaw<any[]>`
        SELECT id FROM public.perks LIMIT 1
      `.catch(() => []);
      if (existing.length > 0) return;

      const seedData = [
        {
          title: "Voucher Nghỉ Dưỡng Vinpearl 5 Sao Trị Giá 10.000.000đ",
          category: "Golf & Nghỉ dưỡng",
          partner: "Vinpearl Resort & Spa",
          summary: "Áp dụng nghỉ dưỡng tại toàn bộ hệ thống resort và villa Vinpearl trên toàn quốc dành cho Hội viên chính thức.",
          description: "Voucher bao gồm phòng hướng biển, buffet sáng cho 2 người lớn và 2 trẻ em, miễn phí vé vui chơi VinWonders và Safari.",
          discount: "10.000.000đ",
          icon: "hotel",
          link: "https://vinpearl.com",
          sort_order: 1,
        },
        {
          title: "Ưu đãi 30% Đặt Sân Golf BRG Kings Island & FLC Quy Nhơn",
          category: "Golf & Nghỉ dưỡng",
          partner: "BRG Golf & FLC Group",
          summary: "Đặc quyền đặt tee-time ưu tiên kèm giảm giá green fee 30% tại các sân golf hàng đầu Việt Nam.",
          description: "Áp dụng vào cả các ngày trong tuần và cuối tuần cho hội viên CLB Doanh Nhân CEO 1983.",
          discount: "30%",
          icon: "trophy",
          link: "https://brggolf.vn",
          sort_order: 2,
        },
        {
          title: "Gói Tư Vấn Luật Doanh Nghiệp & M&A Miễn Phí 6 Tháng",
          category: "Dịch vụ Doanh nghiệp",
          partner: "Hãng Luật Quốc Tế & Ban Pháp Chế CEO 1983",
          summary: "Hỗ trợ rà soát hợp đồng thương mại, tư vấn pháp lý quản trị công ty và hỗ trợ xúc tiến M&A.",
          description: "Được hỗ trợ trực tiếp bởi đội ngũ luật sư cao cấp và chuyên gia thẩm định pháp lý thành viên CLB.",
          discount: "Miễn phí 100%",
          icon: "scale",
          link: "/association/documents",
          sort_order: 3,
        },
        {
          title: "Gói Kiểm Toán Báo Cáo Tài Chính & Tối Ưu Thuế Doanh Nghiệp",
          category: "Dịch vụ Doanh nghiệp",
          partner: "Ban Tài Chính & Đối Tác Kiểm Toán",
          summary: "Hỗ trợ soát xét sổ sách kế toán, lập kế hoạch thuế và bảo vệ số liệu trước cơ quan kiểm toán.",
          description: "Áp dụng cho doanh nghiệp của hội viên CEO 1983 có quy mô doanh thu từ 10 tỷ đến 500 tỷ.",
          discount: "-25%",
          icon: "calculator",
          link: "/finance-report",
          sort_order: 4,
        },
        {
          title: "Thẻ Danh Thiếp Điện Tử Thông Minh CEO 1983 Smart NFC Mạ Vàng",
          category: "Đặc quyền Hội viên",
          partner: "Ban Chuyển Đổi Số CEO 1983",
          summary: "Thẻ NFC kim loại đen bóng viền mạ vàng sang trọng tích hợp công nghệ chạm danh thiếp 1 chạm.",
          description: "Mỗi hội viên chính thức được cấp phát 01 thẻ danh thiếp thông minh đồng bộ hồ sơ kết nối giao thương.",
          discount: "Miễn Phí 100%",
          icon: "gift",
          link: "/association/card",
          sort_order: 5,
        },
        {
          title: "Ưu đãi Đặt Tiệc Chiêu Đãi & Hội Nghị Khách Sạn Daewoo Hà Nội",
          category: "Ẩm thực & Tiếp khách",
          partner: "Khách Sạn Daewoo Hà Nội",
          summary: "Giảm 20% toàn bộ dịch vụ phòng tiệc, hội thảo và thực đơn tiệc chiêu đãi đối tác B2B.",
          description: "Miễn phí âm thanh ánh sáng tiêu chuẩn và màn hình LED cho các sự kiện từ 50 khách trở lên.",
          discount: "20%",
          icon: "coffee",
          link: "https://daewoohotel.com",
          sort_order: 6,
        },
      ];

      for (const item of seedData) {
        await this.prisma.$executeRaw`
          INSERT INTO public.perks (
            id, title, category, partner, summary, description, discount, icon, link, valid_until, sort_order, status, created_at, updated_at
          ) VALUES (
            gen_random_uuid(), ${item.title}, ${item.category}, ${item.partner}, ${item.summary}, ${item.description},
            ${item.discount}, ${item.icon}, ${item.link}, (NOW() + INTERVAL '180 days')::timestamp, ${item.sort_order}, 'active', NOW(), NOW()
          )
        `.catch(() => {});
      }
    } catch (err: any) {
      console.warn("Failed to seed perks:", err?.message);
    }
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
    await this.ensureSeedNews();
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, code, title, category, author, published_at, views, status, excerpt, content, cover_image, images, association_id, created_at, updated_at
      FROM public.news
      ORDER BY created_at DESC
    `.catch((err) => {
      console.error(`listAdminNews error: ${err?.message}`);
      return [];
    });

    return rows.map((n) => {
      const imgList = safeParseImages(n.images || (n.cover_image ? [n.cover_image] : []));
      const firstImg = imgList[0] || n.cover_image || '';
      return {
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
    const imgList = safeParseImages(data.images || (data.image ? [data.image] : (data.coverImage ? [data.coverImage] : [])));
    const firstImg = imgList[0] || data.image || data.coverImage || data.cover_image || null;
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
    const resImgs = safeParseImages(n.images || (n.cover_image ? [n.cover_image] : []));
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
      images: resImgs,
      associationId: n.association_id,
    };
  }

  async updateNewsAdmin(id: string, data: any) {
    const imgList = data.images !== undefined ? safeParseImages(data.images) : null;
    const singleImg = data.image !== undefined ? data.image : (data.coverImage !== undefined ? data.coverImage : (data.cover_image !== undefined ? data.cover_image : null));
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
    const resImgs = safeParseImages(n.images || (n.cover_image ? [n.cover_image] : []));
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
      images: resImgs,
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

