import { Controller, Get, Query, Param, Header } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * GET /api/share/preview, /share/preview, /share/:type/:id, /api/share/:type/:id
   * Trả về HTML chứa OpenGraph tags & Twitter Cards động chuẩn mực cho Facebook, Zalo, Telegram.
   * Đồng thời tự động chuyển hướng người dùng khi click link vào đúng trang trên App / Web.
   */
  @Get([
    'share/preview',
    'api/share/preview',
    'share/:type/:id',
    'api/share/:type/:id',
  ])
  @Header('Content-Type', 'text/html; charset=utf-8')
  async getSharePreview(
    @Query('type') rawQueryType?: string,
    @Query('id') rawQueryId?: string,
    @Param('type') rawParamType?: string,
    @Param('id') rawParamId?: string,
    @Query('title') customTitle?: string,
    @Query('desc') customDesc?: string,
    @Query('image') customImage?: string,
    @Query('target') customTarget?: string,
  ): Promise<string> {
    const targetType = (rawParamType || rawQueryType || '').toLowerCase();
    const targetId = rawParamId || rawQueryId || '';

    const DEFAULT_IMAGE = 'https://ceo1983.viconnect.vn/ceo1983_hero_daylight_skyline.jpg';
    const SITE_NAME = 'CLB Doanh Nhân CEO 1983 (HanoiBA)';
    const BASE_WEB_URL = 'https://ceo1983.viconnect.vn';

    let resolvedTitle = customTitle || 'CLB Doanh Nhân CEO 1983 — Kết Nối Giao Thương';
    let resolvedDesc =
      customDesc ||
      'Mạng lưới giao thương B2B, chia sẻ cơ hội kinh doanh và kết nối doanh nhân CEO 1983 trực thuộc Hội Doanh nghiệp Trẻ Hà Nội (HanoiBA).';
    let resolvedImage = customImage || DEFAULT_IMAGE;
    let targetUrl = customTarget || `${BASE_WEB_URL}/intro`;

    try {
      if (targetType === 'opportunity' && targetId) {
        targetUrl = customTarget || `${BASE_WEB_URL}/association/opportunities?id=${encodeURIComponent(targetId)}`;
        const rows = await this.prisma.$queryRawUnsafe<any[]>(
          `SELECT title, description, images, budget, currency, category, contact_name, contact_phone FROM public.opportunities WHERE id::text = $1 LIMIT 1`,
          targetId,
        ).catch(() => [] as any[]);

        if (rows && rows.length > 0) {
          const item = rows[0];
          let budgetStr = '';
          if (item.budget && Number(item.budget) > 0) {
            const num = Number(item.budget);
            budgetStr = num >= 1e9 ? ` (Quy mô: ${(num / 1e9).toFixed(1)} Tỷ VNĐ)` : ` (Quy mô: ${(num / 1e6).toFixed(0)} Triệu VNĐ)`;
          }
          resolvedTitle = item.title ? `[Cơ Hội Giao Thương B2B] ${item.title}${budgetStr} — CLB CEO 1983` : resolvedTitle;
          
          let descParts: string[] = [];
          if (item.description) {
            descParts.push(item.description.replace(/<[^>]*>?/gm, '').trim());
          }
          if (item.contact_name) {
            descParts.push(`Người liên hệ: ${item.contact_name}`);
          }
          if (descParts.length > 0) {
            resolvedDesc = descParts.join(' — ').slice(0, 260);
          }

          let imgList: string[] = [];
          if (Array.isArray(item.images)) {
            imgList = item.images;
          } else if (typeof item.images === 'string') {
            try {
              imgList = JSON.parse(item.images);
            } catch {
              if (item.images.startsWith('http')) imgList = [item.images];
            }
          }
          if (imgList.length > 0 && imgList[0]) {
            resolvedImage = imgList[0];
          }
        }
      } else if (targetType === 'event' && targetId) {
        targetUrl = customTarget || `${BASE_WEB_URL}/association/events?id=${encodeURIComponent(targetId)}`;
        const rows = await this.prisma.$queryRawUnsafe<any[]>(
          `SELECT title, description, cover_image, banner_url, location, event_date, category FROM public.events WHERE id::text = $1 LIMIT 1`,
          targetId,
        ).catch(() => [] as any[]);

        if (rows && rows.length > 0) {
          const item = rows[0];
          resolvedTitle = item.title ? `[Sự Kiện CEO 1983] ${item.title}` : resolvedTitle;
          let details: string[] = [];
          if (item.event_date) {
            try {
              const d = new Date(item.event_date);
              details.push(`Thời gian: ${d.toLocaleDateString('vi-VN')}`);
            } catch {}
          }
          if (item.location) {
            details.push(`Địa điểm: ${item.location}`);
          }
          if (item.description) {
            details.push(item.description.replace(/<[^>]*>?/gm, '').trim());
          }
          if (details.length > 0) {
            resolvedDesc = details.join(' — ').slice(0, 260);
          }
          if (item.cover_image || item.banner_url) {
            resolvedImage = item.cover_image || item.banner_url;
          }
        }
      } else if ((targetType === 'post' || targetType === 'feed') && targetId) {
        targetUrl = customTarget || `${BASE_WEB_URL}/association/messages?post=${encodeURIComponent(targetId)}`;
        const rows = await this.prisma.$queryRawUnsafe<any[]>(
          `SELECT content, images, author_name FROM public.feed_posts WHERE id::text = $1 LIMIT 1`,
          targetId,
        ).catch(() => [] as any[]);

        if (rows && rows.length > 0) {
          const item = rows[0];
          resolvedTitle = item.author_name ? `Bài chia sẻ từ Doanh nhân ${item.author_name} — Mạng lưới CEO 1983` : 'Bài viết trên Mạng lưới CEO 1983';
          if (item.content) {
            resolvedDesc = item.content.slice(0, 260);
          }
          if (Array.isArray(item.images) && item.images.length > 0) {
            resolvedImage = item.images[0];
          }
        }
      } else if (targetType === 'training' && targetId) {
        targetUrl = customTarget || `${BASE_WEB_URL}/association/training?id=${encodeURIComponent(targetId)}`;
        const rows = await this.prisma.$queryRawUnsafe<any[]>(
          `SELECT title, description, cover_image, instructor FROM public.trainings WHERE id::text = $1 LIMIT 1`,
          targetId,
        ).catch(() => [] as any[]);

        if (rows && rows.length > 0) {
          const item = rows[0];
          resolvedTitle = item.title ? `[Khóa Đào Tạo Doanh Nhân] ${item.title} — CEO 1983` : resolvedTitle;
          let details: string[] = [];
          if (item.instructor) details.push(`Giảng viên: ${item.instructor}`);
          if (item.description) details.push(item.description.replace(/<[^>]*>?/gm, '').trim());
          if (details.length > 0) {
            resolvedDesc = details.join(' — ').slice(0, 260);
          }
          if (item.cover_image) {
            resolvedImage = item.cover_image;
          }
        }
      }
    } catch (err) {
      console.error('[SharePreview] Error resolving entity metadata:', err);
    }

    // Đảm bảo URL ảnh luôn tuyệt đối và hợp lệ
    if (resolvedImage && !resolvedImage.startsWith('http')) {
      resolvedImage = `${BASE_WEB_URL}${resolvedImage.startsWith('/') ? '' : '/'}${resolvedImage}`;
    }

    // Escape ký tự an toàn cho HTML meta tag
    const safeTitle = (resolvedTitle || '').replace(/"/g, '&quot;');
    const safeDesc = (resolvedDesc || '').replace(/"/g, '&quot;').replace(/\n/g, ' ');
    const safeImage = (resolvedImage || DEFAULT_IMAGE).replace(/"/g, '&quot;');
    const safeTarget = targetUrl.replace(/"/g, '&quot;');

    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
  
  <!-- OpenGraph Metadata cho Facebook, Zalo, LinkedIn, Telegram -->
  <meta property="og:site_name" content="${SITE_NAME}" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:image" content="${safeImage}" />
  <meta property="og:image:secure_url" content="${safeImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${safeTitle}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:url" content="${safeTarget}" />
  <meta property="og:type" content="article" />
  
  <!-- Twitter Card Metadata -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="${safeImage}" />

  <!-- Schema.org Microdata -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": "${safeTitle}",
    "image": ["${safeImage}"],
    "description": "${safeDesc}",
    "publisher": {
      "@type": "Organization",
      "name": "CLB Doanh Nhân CEO 1983",
      "logo": {
        "@type": "ImageObject",
        "url": "https://ceo1983.viconnect.vn/logo_ceo_1983_round.png"
      }
    }
  }
  </script>

  <!-- Tự động chuyển hướng trình duyệt của người dùng sang Web / Mobile App -->
  <meta http-equiv="refresh" content="0; url=${safeTarget}" />
  <script type="text/javascript">
    setTimeout(function() {
      window.location.replace("${safeTarget}");
    }, 150);
  </script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #f8fafc;
      color: #334155;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 16px;
      box-sizing: border-box;
      text-align: center;
    }
    .card {
      background: #ffffff;
      padding: 32px 24px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      max-width: 480px;
      width: 100%;
    }
    .preview-img {
      width: 100%;
      height: 220px;
      object-fit: cover;
      border-radius: 12px;
      margin-bottom: 16px;
    }
    .logo {
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
      border-radius: 10px;
    }
    .title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 10px 0;
      line-height: 1.4;
    }
    .desc {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .btn {
      display: inline-block;
      background: #dc2626;
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 10px;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      transition: background 0.2s;
    }
    .btn:hover {
      background: #b91c1c;
    }
  </style>
</head>
<body>
  <div class="card">
    <img src="${safeImage}" alt="${safeTitle}" class="preview-img" onerror="this.src='${DEFAULT_IMAGE}'" />
    <h2 class="title">${safeTitle}</h2>
    <p class="desc">${safeDesc}</p>
    <a href="${safeTarget}" class="btn">Mở trong Ứng dụng CEO 1983</a>
  </div>
</body>
</html>`;
  }
}
