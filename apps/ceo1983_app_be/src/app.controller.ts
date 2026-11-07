import { Controller, Get, Query, Param, Header, Req } from '@nestjs/common';
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
   * Chống hoàn toàn tình trạng Facebook crawler nhảy vào SPA index.html mất nội dung.
   */
  @Get([
    'share/preview',
    'api/share/preview',
    'share/:type/:id',
    'api/share/:type/:id',
  ])
  @Header('Content-Type', 'text/html; charset=utf-8')
  async getSharePreview(
    @Req() req: any,
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

    // Nhận diện Bot / Web Crawler của Facebook (kể cả Meta mới 2024-2026), Zalo, Twitter, Telegram, LinkedIn
    const userAgent = (req?.headers?.['user-agent'] || '').toLowerCase();
    const isCrawler = /facebookexternalhit|facebot|facebookcatalog|meta-externalagent|meta-externaladsagent|zalo|zalopc|twitterbot|linkedinbot|telegrambot|whatsapp|slackbot|googlebot|bingbot|baiduspider|yandex|vkshare/i.test(userAgent);

    let resolvedTitle = customTitle || 'CLB Doanh Nhân CEO 1983 — Kết Nối Giao Thương';
    let resolvedDesc =
      customDesc ||
      'Mạng lưới giao thương B2B, chia sẻ cơ hội kinh doanh và kết nối doanh nhân CEO 1983 trực thuộc Hội Doanh nghiệp Trẻ Hà Nội (HanoiBA).';
    let resolvedImage = customImage || DEFAULT_IMAGE;
    let targetUrl = customTarget || `${BASE_WEB_URL}/intro`;
    let richPostData: {
      authorName?: string;
      authorCompany?: string;
      authorRole?: string;
      authorAvatar?: string;
      createdAt?: string;
      contentFormattedHtml?: string;
      images: string[];
      likesCount?: number;
      commentsCount?: number;
      articleSnippet?: any;
    } | null = null;

    try {
      if (targetType === 'opportunity' && targetId) {
        targetUrl = customTarget || `${BASE_WEB_URL}/association/opportunities?id=${encodeURIComponent(targetId)}`;
        const rows = await this.prisma.$queryRawUnsafe<any[]>(
          `SELECT title, description, image, images, budget_min, budget_max, industry, company, contact_name, contact_phone FROM public.opportunities WHERE id::text = $1 LIMIT 1`,
          targetId,
        ).catch(() => [] as any[]);

        if (rows && rows.length > 0) {
          const item = rows[0];
          let budgetStr = '';
          const bMin = item.budget_min != null ? Number(item.budget_min) : 0;
          const bMax = item.budget_max != null ? Number(item.budget_max) : 0;
          const bVal = bMax > 0 ? bMax : bMin;
          if (bVal > 0) {
            budgetStr = bVal >= 1e9 ? ` (Quy mô: ${(bVal / 1e9).toFixed(1)} Tỷ VNĐ)` : ` (Quy mô: ${(bVal / 1e6).toFixed(0)} Tr VNĐ)`;
          }
          resolvedTitle = item.title ? `[Cơ Hội Giao Thương B2B] ${item.title}${budgetStr} — CLB CEO 1983` : (customTitle || resolvedTitle);
          
          let descParts: string[] = [];
          if (item.company) {
            descParts.push(`Doanh nghiệp: ${item.company}`);
          }
          if (item.contact_name) {
            descParts.push(`Đầu mối: ${item.contact_name}`);
          }
          if (item.description) {
            descParts.push(item.description.replace(/<[^>]*>?/gm, '').trim());
          }
          if (descParts.length > 0) {
            resolvedDesc = descParts.join(' — ').slice(0, 260);
          } else if (customDesc) {
            resolvedDesc = customDesc;
          }

          if (item.image) {
            resolvedImage = item.image;
          } else if (Array.isArray(item.images) && item.images.length > 0) {
            resolvedImage = item.images[0];
          } else if (typeof item.images === 'string') {
            try {
              const parsed = JSON.parse(item.images);
              if (Array.isArray(parsed) && parsed[0]) resolvedImage = parsed[0];
            } catch {
              if (item.images.startsWith('http')) resolvedImage = item.images;
            }
          } else if (customImage) {
            resolvedImage = customImage;
          }
        }
      } else if ((targetType === 'product' || targetType === 'marketplace') && targetId) {
        targetUrl = customTarget || `${BASE_WEB_URL}/association/products?id=${encodeURIComponent(targetId)}`;
        const rows = await this.prisma.$queryRawUnsafe<any[]>(
          `SELECT id, title, name, description, price, original_price, member_price, unit, currency, image_url, image_urls, company FROM public.products WHERE id::text = $1 OR custom_id = $1 LIMIT 1`,
          targetId,
        ).catch(() => [] as any[]);

        if (rows && rows.length > 0) {
          const item = rows[0];
          const prodName = item.name || item.title || 'Sản phẩm tiêu biểu';
          const pVal = item.member_price != null && Number(item.member_price) > 0 
            ? Number(item.member_price) 
            : (item.price != null && Number(item.price) > 0 ? Number(item.price) : 0);
          
          let priceStr = '';
          if (pVal > 0) {
            priceStr = pVal >= 1e9 ? ` (${(pVal / 1e9).toFixed(1)} Tỷ VNĐ)` : ` (${(pVal / 1e6).toFixed(0)} Tr VNĐ)`;
          }
          resolvedTitle = `[Sàn Thương Mại B2B CEO 1983] ${prodName}${priceStr}`;

          let descParts: string[] = [];
          if (item.company) descParts.push(`Cung cấp bởi: ${item.company}`);
          if (item.description) descParts.push(item.description.replace(/<[^>]*>?/gm, '').trim());
          if (descParts.length > 0) resolvedDesc = descParts.join(' — ').slice(0, 260);

          if (item.image_url) {
            resolvedImage = item.image_url;
          } else if (Array.isArray(item.image_urls) && item.image_urls.length > 0) {
            resolvedImage = item.image_urls[0];
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
          `SELECT title, content, images, author_name, author_company, author_role, author_avatar, shared_article, created_at, likes_count, comments_count FROM public.feed_posts WHERE id::text = $1 LIMIT 1`,
          targetId,
        ).catch(() => [] as any[]);

        if (rows && rows.length > 0) {
          const item = rows[0];
          resolvedTitle = item.title || (item.author_name ? `Bài chia sẻ từ Doanh nhân ${item.author_name} — Mạng lưới CEO 1983` : 'Bài viết trên Mạng lưới CEO 1983');
          if (item.content) {
            resolvedDesc = item.content.slice(0, 260);
          }
          
          let parsedImages: string[] = [];
          if (Array.isArray(item.images)) {
            parsedImages = item.images;
          } else if (typeof item.images === 'string') {
            try {
              const parsed = JSON.parse(item.images);
              if (Array.isArray(parsed)) parsedImages = parsed;
              else if (item.images.startsWith('http')) parsedImages = [item.images];
            } catch {
              if (item.images.startsWith('http')) parsedImages = [item.images];
            }
          }

          parsedImages = parsedImages.map(img => img.startsWith('http') ? img : `${BASE_WEB_URL}${img.startsWith('/') ? '' : '/'}${img}`);

          if (parsedImages.length > 0) {
            resolvedImage = parsedImages[0];
          }

          const rawContent = item.content || '';
          const escapedContent = rawContent
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
          
          const formattedHtml = escapedContent
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #003B95; text-decoration: underline;">$1</a>')
            .replace(/#([\w\u00C0-\u024F\u1E00-\u1EFF]+)/g, '<span style="color: #D97706; font-weight: 700;">#$1</span>')
            .split('\n\n')
            .map((p: string) => `<p style="margin: 0 0 12px 0; line-height: 1.65; font-size: 15px; color: #1e293b;">${p.replace(/\n/g, '<br/>')}</p>`)
            .join('');

          let parsedArticle: any = null;
          if (item.shared_article) {
            try {
              parsedArticle = typeof item.shared_article === 'string' ? JSON.parse(item.shared_article) : item.shared_article;
              if (parsedArticle?.title) resolvedTitle = `${parsedArticle.title} — Chia sẻ trên CEO 1983`;
              if (parsedArticle?.snippet || parsedArticle?.excerpt) resolvedDesc = (parsedArticle.snippet || parsedArticle.excerpt).slice(0, 260);
              if (parsedArticle?.thumbnailUrl || parsedArticle?.thumbnail || parsedArticle?.image) {
                resolvedImage = parsedArticle.thumbnailUrl || parsedArticle.thumbnail || parsedArticle.image;
              }
            } catch {}
          }

          richPostData = {
            authorName: item.author_name || 'Doanh nhân CEO 1983',
            authorCompany: item.author_company || 'CLB Doanh Nhân CEO 1983',
            authorRole: item.author_role || 'Hội viên chính thức',
            authorAvatar: item.author_avatar ? (item.author_avatar.startsWith('http') ? item.author_avatar : `${BASE_WEB_URL}${item.author_avatar.startsWith('/') ? '' : '/'}${item.author_avatar}`) : 'https://ceo1983.viconnect.vn/logo_ceo_1983_round.png',
            createdAt: item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : '',
            contentFormattedHtml: formattedHtml,
            images: parsedImages,
            likesCount: Number(item.likes_count || 0),
            commentsCount: Number(item.comments_count || 0),
            articleSnippet: parsedArticle,
          };
        }
      } else if ((targetType === 'news' || targetType === 'article') && targetId) {
        targetUrl = customTarget || `${BASE_WEB_URL}/association/news?id=${encodeURIComponent(targetId)}`;
        const rows = await this.prisma.$queryRawUnsafe<any[]>(
          `SELECT title, excerpt, content, cover_image, author, published_at, category FROM public.news WHERE id::text = $1 OR code = $1 LIMIT 1`,
          targetId,
        ).catch(() => [] as any[]);

        if (rows && rows.length > 0) {
          const item = rows[0];
          resolvedTitle = item.title ? `[Tin Tức CEO 1983] ${item.title}` : resolvedTitle;
          if (item.excerpt) resolvedDesc = item.excerpt.slice(0, 260);
          else if (item.content) resolvedDesc = item.content.replace(/<[^>]*>?/gm, '').slice(0, 260);

          if (item.cover_image) {
            resolvedImage = item.cover_image;
          }

          const rawContent = item.content || item.excerpt || '';
          const escapedContent = rawContent.startsWith('<') ? rawContent : rawContent
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .split('\n\n')
            .map((p: string) => `<p style="margin: 0 0 12px 0; line-height: 1.65; font-size: 15px; color: #1e293b;">${p.replace(/\n/g, '<br/>')}</p>`)
            .join('');

          richPostData = {
            authorName: item.author || 'Ban Truyền Thông CEO 1983',
            authorCompany: 'CLB Doanh Nhân CEO 1983 (HanoiBA)',
            authorRole: item.category || 'Tin tức nội bộ',
            authorAvatar: 'https://ceo1983.viconnect.vn/logo_ceo_1983_round.png',
            createdAt: item.published_at ? new Date(item.published_at).toLocaleDateString('vi-VN') : '',
            contentFormattedHtml: escapedContent,
            images: resolvedImage ? [resolvedImage] : [],
            likesCount: 0,
            commentsCount: 0,
          };
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

    // URL chuẩn cho og:url: Luôn giữ URL preview hiện tại để Facebook/Zalo không bị redirect sang SPA index.html
    const canonicalShareUrl = `${BASE_WEB_URL}${req?.originalUrl || `/share/${targetType || 'preview'}/${targetId || ''}`}`.replace(/"/g, '&quot;');
    const ogCanonicalUrl = canonicalShareUrl;

    // Xây dựng giao diện xem bài viết trực quan giữ nguyên 100% format & layout ảnh như app CEO 1983
    let bodyContentHtml = '';
    if (richPostData) {
      let imagesHtml = '';
      const imgs = richPostData.images || [];
      if (imgs.length === 1) {
        imagesHtml = `<div class="image-single"><img src="${imgs[0]}" alt="Ảnh bài đăng" onerror="this.style.display='none'" /></div>`;
      } else if (imgs.length === 2) {
        imagesHtml = `<div class="image-grid grid-2">
          <img src="${imgs[0]}" alt="Ảnh 1" onerror="this.style.display='none'" />
          <img src="${imgs[1]}" alt="Ảnh 2" onerror="this.style.display='none'" />
        </div>`;
      } else if (imgs.length === 3) {
        imagesHtml = `<div class="image-grid grid-3">
          <div class="col-main"><img src="${imgs[0]}" alt="Ảnh 1" onerror="this.style.display='none'" /></div>
          <div class="col-sub">
            <img src="${imgs[1]}" alt="Ảnh 2" onerror="this.style.display='none'" />
            <img src="${imgs[2]}" alt="Ảnh 3" onerror="this.style.display='none'" />
          </div>
        </div>`;
      } else if (imgs.length >= 4) {
        const remaining = imgs.length - 4;
        imagesHtml = `<div class="image-grid grid-4">
          <img src="${imgs[0]}" alt="Ảnh 1" onerror="this.style.display='none'" />
          <img src="${imgs[1]}" alt="Ảnh 2" onerror="this.style.display='none'" />
          <img src="${imgs[2]}" alt="Ảnh 3" onerror="this.style.display='none'" />
          <div class="more-wrap">
            <img src="${imgs[3]}" alt="Ảnh 4" onerror="this.style.display='none'" />
            ${remaining > 0 ? `<div class="more-overlay">+${remaining}</div>` : ''}
          </div>
        </div>`;
      }

      let articleCardHtml = '';
      if (richPostData.articleSnippet) {
        const art = richPostData.articleSnippet;
        articleCardHtml = `
          <div class="shared-article-card">
            ${art.thumbnailUrl || art.image ? `<img src="${art.thumbnailUrl || art.image}" class="shared-art-thumb" alt="Thumbnail" />` : ''}
            <div class="shared-art-info">
              <div class="shared-art-source">${art.source || 'CEO 1983 BẢN TIN'}</div>
              <div class="shared-art-title">${art.title || ''}</div>
              <div class="shared-art-snippet">${art.snippet || art.excerpt || ''}</div>
            </div>
          </div>
        `;
      }

      bodyContentHtml = `
        <div class="post-card">
          <div class="brand-bar">
            <div class="brand-logo-wrap">
              <img src="https://ceo1983.viconnect.vn/logo_ceo_1983_round.png" alt="CEO 1983" class="brand-logo" />
              <div>
                <div class="brand-name">CLB DOANH NHÂN CEO 1983</div>
                <div class="brand-sub">Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA)</div>
              </div>
            </div>
            <a href="${safeTarget}" class="btn-open-app">Mở App</a>
          </div>

          <div class="author-header">
            <img src="${richPostData.authorAvatar}" alt="${richPostData.authorName}" class="author-avatar" onerror="this.src='https://ceo1983.viconnect.vn/logo_ceo_1983_round.png'" />
            <div class="author-meta">
              <div class="author-name-row">
                <span class="author-name">${richPostData.authorName}</span>
                <span class="verified-badge">✓</span>
              </div>
              <div class="author-sub">${richPostData.authorCompany ? `${richPostData.authorCompany} · ` : ''}${richPostData.authorRole || 'Hội viên chính thức'}</div>
              ${richPostData.createdAt ? `<div class="post-time">🕒 ${richPostData.createdAt}</div>` : ''}
            </div>
          </div>

          <div class="post-body">
            ${richPostData.contentFormattedHtml || `<p>${safeDesc}</p>`}
          </div>

          ${imagesHtml}

          ${articleCardHtml}

          <div class="post-stats">
            <span>👍 ${richPostData.likesCount || 0} lượt thích</span>
            <span>💬 ${richPostData.commentsCount || 0} bình luận</span>
          </div>

          <div class="bottom-actions">
            <a href="${safeTarget}" class="action-btn">
              <span>💬 Bình luận trên App</span>
            </a>
            <a href="${safeTarget}" class="action-btn primary">
              <span>🚀 Mở App CEO 1983</span>
            </a>
          </div>
        </div>
      `;
    } else {
      bodyContentHtml = `
        <div class="card">
          <img src="${safeImage}" alt="${safeTitle}" class="preview-img" onerror="this.src='${DEFAULT_IMAGE}'" />
          <h2 class="title">${safeTitle}</h2>
          <p class="desc">${safeDesc}</p>
          <a href="${safeTarget}" class="btn">Mở trong Ứng dụng CEO 1983</a>
        </div>
      `;
    }

    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
  <link rel="canonical" href="${ogCanonicalUrl}" />
  
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
  <meta property="og:url" content="${ogCanonicalUrl}" />
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

  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #f1f5f9;
      color: #1e293b;
      display: flex;
      justify-content: center;
      min-height: 100vh;
      padding: 16px 12px 40px;
    }
    .post-card {
      background: #ffffff;
      max-width: 620px;
      width: 100%;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.06);
      border: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
    }
    .brand-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 18px;
      background: linear-gradient(135deg, #001A4D 0%, #003B95 100%);
      color: #ffffff;
    }
    .brand-logo-wrap {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-logo {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #ffffff;
      padding: 2px;
    }
    .brand-name {
      font-size: 13.5px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #FCD34D;
    }
    .brand-sub {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.8);
    }
    .btn-open-app {
      background: rgba(245, 158, 11, 0.2);
      border: 1px solid #F59E0B;
      color: #FCD34D;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      text-decoration: none;
      transition: background 0.2s;
    }
    .author-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 18px 10px;
    }
    .author-avatar {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #e2e8f0;
    }
    .author-meta { flex: 1; }
    .author-name-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .author-name {
      font-size: 15.5px;
      font-weight: 800;
      color: #0f172a;
    }
    .verified-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      background: #003B95;
      color: #ffffff;
      border-radius: 50%;
      font-size: 10px;
      font-weight: 900;
    }
    .author-sub {
      font-size: 12px;
      color: #64748b;
      margin-top: 1px;
    }
    .post-time {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 2px;
    }
    .post-body {
      padding: 12px 18px 14px;
      font-size: 15px;
      line-height: 1.65;
      color: #1e293b;
      word-break: break-word;
    }
    .image-single {
      width: 100%;
      max-height: 520px;
      overflow: hidden;
      background: #0f172a;
    }
    .image-single img {
      width: 100%;
      height: 100%;
      max-height: 520px;
      object-fit: cover;
      display: block;
    }
    .image-grid {
      display: grid;
      gap: 4px;
      width: 100%;
      background: #f1f5f9;
    }
    .grid-2 {
      grid-template-columns: 1fr 1fr;
      height: 280px;
    }
    .grid-2 img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .grid-3 {
      grid-template-columns: 1.4fr 1fr;
      height: 320px;
    }
    .grid-3 .col-main img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .grid-3 .col-sub {
      display: grid;
      grid-template-rows: 1fr 1fr;
      gap: 4px;
      height: 100%;
    }
    .grid-3 .col-sub img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .grid-4 {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 160px 160px;
    }
    .grid-4 img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .more-wrap {
      position: relative;
      height: 100%;
    }
    .more-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.55);
      color: #ffffff;
      font-size: 26px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .shared-article-card {
      margin: 14px 18px;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      overflow: hidden;
      background: #f8fafc;
    }
    .shared-art-thumb {
      width: 100%;
      height: 180px;
      object-fit: cover;
      display: block;
    }
    .shared-art-info {
      padding: 12px 14px;
    }
    .shared-art-source {
      font-size: 11px;
      font-weight: 700;
      color: #003B95;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .shared-art-title {
      font-size: 14px;
      font-weight: 800;
      color: #0f172a;
      margin: 4px 0;
    }
    .shared-art-snippet {
      font-size: 12.5px;
      color: #64748b;
      line-height: 1.45;
    }
    .post-stats {
      display: flex;
      justify-content: space-between;
      padding: 12px 18px;
      border-top: 1px solid #f1f5f9;
      border-bottom: 1px solid #f1f5f9;
      font-size: 12.5px;
      color: #64748b;
      font-weight: 600;
    }
    .bottom-actions {
      display: flex;
      gap: 10px;
      padding: 14px 18px;
      background: #ffffff;
    }
    .action-btn {
      flex: 1;
      text-align: center;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 13.5px;
      font-weight: 700;
      text-decoration: none;
      border: 1px solid #cbd5e1;
      color: #334155;
      background: #f8fafc;
      transition: all 0.2s;
    }
    .action-btn.primary {
      background: linear-gradient(135deg, #003B95 0%, #001A4D 100%);
      color: #ffffff;
      border: none;
      box-shadow: 0 4px 14px rgba(0, 59, 149, 0.25);
    }
    .card {
      background: #ffffff;
      padding: 32px 24px;
      border-radius: 20px;
      box-shadow: 0 4px 25px rgba(0,0,0,0.08);
      max-width: 480px;
      width: 100%;
      border: 1px solid #e2e8f0;
      text-align: center;
    }
    .preview-img {
      width: 100%;
      height: 220px;
      object-fit: cover;
      border-radius: 14px;
      margin-bottom: 16px;
      background: #0f172a;
    }
    .title {
      font-size: 17px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 10px 0;
      line-height: 1.4;
    }
    .desc {
      font-size: 13.5px;
      color: #64748b;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .btn {
      display: inline-block;
      background: #003B95;
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 12px;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      transition: background 0.2s;
      box-shadow: 0 4px 12px rgba(0, 59, 149, 0.25);
    }
  </style>
</head>
<body>
  ${bodyContentHtml}
</body>
</html>`;
  }
}
