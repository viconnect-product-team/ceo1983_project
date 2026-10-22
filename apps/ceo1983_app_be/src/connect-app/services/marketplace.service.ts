import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConnectAppGateway } from '../connect-app.gateway';
import { ConnectMessengerService } from './messenger.service';
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

@Injectable()
export class ConnectMarketplaceService {
  constructor(
    private prisma: PrismaService,
    private gateway: ConnectAppGateway,
    @Inject(forwardRef(() => ConnectMessengerService))
    private messengerService: ConnectMessengerService,
  ) {}

  async listActiveProducts() {
    try {
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT p.*, a.name as association_name,
               COALESCE(
                 NULLIF(up.display_name, ''),
                 NULLIF(u.name, ''),
                 NULLIF(m.name, ''),
                 NULLIF(m.contact, ''),
                 'Hội viên CLB'
               ) as seller_name,
               COALESCE(
                 NULLIF(up.avatar_url, ''),
                 NULLIF(u.avatar_url, ''),
                 NULLIF(m.avatar, ''),
                 NULLIF(m.cover_url, ''),
                 ''
               ) as seller_avatar,
               COALESCE(
                 NULLIF(m.phone, ''),
                 ''
               ) as seller_phone,
               COALESCE(
                 NULLIF(p.company, ''),
                 NULLIF(up.company_name, ''),
                 NULLIF(m.company_name, ''),
                 NULLIF(bi.company_name, ''),
                 'CLB Doanh Nhân CEO 1983'
               ) as seller_company
        FROM public.products p
        LEFT JOIN public.associations a ON p.association_id = a.id
        LEFT JOIN public.members m ON (p.seller_id = m.user_id::text OR p.seller_id = m.id OR p.seller_id = m.code)
        LEFT JOIN public.vione_users u ON (p.seller_id = u.id::text OR (m.user_id IS NOT NULL AND m.user_id = u.id))
        LEFT JOIN public.user_profiles up ON (u.id = up.user_id)
        LEFT JOIN public.business_identities bi ON (p.seller_id = bi.owner_user_id::text)
        WHERE p.status = 'active'
        ORDER BY p.created_at DESC
        LIMIT 100
      `.catch(() => []);

      if (rows.length === 0) {
        return [];
      }

      return rows.map((p) => {
        const numPrice = Number(p.price || p.sale_price || p.cost || 0);
        const formattedPrice = p.price_text || (numPrice > 0 ? `${numPrice.toLocaleString('vi-VN')} đ` : (p.price || 'Liên hệ báo giá'));
        const imgList = safeParseImages(p.image_urls);
        const firstImg = (imgList && imgList.length > 0 ? imgList[0] : null) || p.image_url || p.image || null;
        const finalImgList = imgList.length > 0 ? imgList : (firstImg ? [firstImg] : []);
        return {
          id: String(p.custom_id || p.id),
          name: p.name || p.title || 'Sản phẩm doanh nghiệp',
          title: p.title || p.name || 'Sản phẩm doanh nghiệp',
          company: p.seller_company || p.company || p.association_name || 'CLB Doanh Nhân CEO 1983',
          sellerName: p.seller_name || undefined,
          sellerAvatar: p.seller_avatar || undefined,
          sellerPhone: p.seller_phone || undefined,
          category: p.category || 'Sản phẩm & Dịch vụ',
          likes: Number(p.likes ?? 0),
          views: Number(p.views ?? 0),
          time: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
          createdAt: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
          imageUrl: firstImg,
          imageUrls: finalImgList,
          videoUrl: p.video_url || undefined,
          price: formattedPrice,
          originalPrice: p.original_price ? `${Number(p.original_price).toLocaleString('vi-VN')} đ` : undefined,
          memberPrice: p.member_discount_price || p.member_price ? `${Number(p.member_discount_price || p.member_price).toLocaleString('vi-VN')} đ` : undefined,
          unit: p.unit || 'Gói',
          currency: p.currency || 'VND',
          sellerId: p.seller_id ? String(p.seller_id) : undefined,
        };
      });
    } catch {
      return [];
    }
  }

  async createProduct(userId: string, data: any) {
    const prodId = data.id || `PROD-${Date.now().toString(36).toUpperCase()}`;
    const name = (data.name || data.title || 'Sản phẩm mới').trim();
    const description = (data.description || '').trim();
    const company = (data.company || 'CLB Doanh Nhân CEO 1983').trim();
    const category = (data.category || 'Sản phẩm & Dịch vụ').trim();
    const price = Number(data.price || 0);
    const originalPrice = data.originalPrice !== undefined && data.originalPrice !== null && data.originalPrice !== '' ? Number(data.originalPrice) : price;
    const memberPrice = data.memberPrice !== undefined && data.memberPrice !== null && data.memberPrice !== '' ? Number(data.memberPrice) : price;
    const unit = data.unit || 'Gói';
    const currency = data.currency || 'VND';
    const imageUrls: string[] = safeParseImages(data.imageUrls || (data.imageUrl ? [data.imageUrl] : []));
    const imageUrl = imageUrls[0] || data.imageUrl || null;
    const videoUrl = data.videoUrl || data.video_url || null;
    const sellerId = String(data.sellerId || userId || 'ceo1983');
    const status = data.status || 'active';
    const assocId = data.associationId || 'c1983000-0000-4000-8000-000000001983';

    // B2B Marketplace Policy: Giới hạn tối đa 5 sản phẩm/doanh nghiệp tiêu biểu
    try {
      const countRes = await this.prisma.$queryRaw<any[]>`
        SELECT count(*)::int as cnt
        FROM public.products
        WHERE status != 'archived'
          AND (
            seller_id = ${sellerId}
            OR (NULLIF(${company}, '') IS NOT NULL AND company = ${company} AND company != 'CLB Doanh Nhân CEO 1983')
          )
      `;
      const currentCount = Number(countRes?.[0]?.cnt || 0);
      if (currentCount >= 5) {
        throw new BadRequestException('Mỗi doanh nghiệp chỉ được đăng tối đa 5 sản phẩm/dịch vụ tiêu biểu trên sàn B2B CEO 1983 (tránh spam, đảm bảo chất lượng sàn).');
      }
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      // non-blocking fallback if query error
    }

    try {
      await this.prisma.$executeRaw`
        INSERT INTO public.products (
          custom_id, title, name, description, company, category,
          price, original_price, member_price, unit, currency,
          image_url, image_urls, video_url, seller_id, status, views, emoji,
          association_id, created_at, updated_at
        ) VALUES (
          ${prodId}, ${name}, ${name}, ${description}, ${company}, ${category},
          ${price}, ${originalPrice}, ${memberPrice}, ${unit}, ${currency},
          ${imageUrl}, ${JSON.stringify(imageUrls)}::jsonb, ${videoUrl}, ${sellerId}, ${status}, 0, '🛍️',
          ${assocId}::uuid, now(), now()
        )
      `;
    } catch (err: any) {
      console.warn('createProduct primary insert failed, using fallback:', err?.message);
      await this.prisma.$executeRaw`
        INSERT INTO public.products (
          custom_id, title, name, description, category, price,
          image_urls, video_url, seller_id, status, views, emoji,
          association_id, created_at, updated_at
        ) VALUES (
          ${prodId}, ${name}, ${name}, ${description}, ${category}, ${price},
          ${JSON.stringify(imageUrls)}::jsonb, ${videoUrl}, ${sellerId}, ${status}, 0, '🛍️',
          ${assocId}::uuid, now(), now()
        )
      `;
    }
    return { ok: true, id: prodId };
  }

  async updateProduct(userId: string, productId: string, data: any) {
    const name = data.name || data.title;
    const cleanPrice = data.price !== undefined && data.price !== null && data.price !== '' ? Number(data.price) : null;
    const cleanOriginalPrice = data.originalPrice !== undefined && data.originalPrice !== null && data.originalPrice !== '' ? Number(data.originalPrice) : cleanPrice;
    const cleanMemberPrice = data.memberPrice !== undefined && data.memberPrice !== null && data.memberPrice !== '' ? Number(data.memberPrice) : cleanPrice;
    const imageUrls: string[] | null = data.imageUrls || data.imageUrl ? safeParseImages(data.imageUrls || [data.imageUrl]) : null;
    const imageUrl = imageUrls && imageUrls[0] ? imageUrls[0] : (data.imageUrl || null);
    const videoUrl = data.videoUrl !== undefined ? data.videoUrl : (data.video_url !== undefined ? data.video_url : null);

    try {
      await this.prisma.$executeRaw`
        UPDATE public.products
        SET
          title = COALESCE(${name}, title),
          name = COALESCE(${name}, name),
          description = COALESCE(${data.description}, description),
          company = COALESCE(${data.company}, company),
          category = COALESCE(${data.category}, category),
          price = COALESCE(${cleanPrice}, price),
          original_price = COALESCE(${cleanOriginalPrice}, original_price),
          member_price = COALESCE(${cleanMemberPrice}, member_price),
          unit = COALESCE(${data.unit}, unit),
          currency = COALESCE(${data.currency}, currency),
          image_url = COALESCE(${imageUrl}, image_url),
          image_urls = CASE WHEN ${imageUrls ? true : false} THEN ${JSON.stringify(imageUrls || [])}::jsonb ELSE image_urls END,
          video_url = COALESCE(${videoUrl}, video_url),
          updated_at = now()
        WHERE custom_id = ${productId} OR id::text = ${productId}
      `;
    } catch (err: any) {
      console.warn('updateProduct primary update failed, using fallback:', err?.message);
      await this.prisma.$executeRaw`
        UPDATE public.products
        SET
          title = COALESCE(${name}, title),
          description = COALESCE(${data.description}, description),
          price = COALESCE(${cleanPrice}, price),
          updated_at = now()
        WHERE custom_id = ${productId} OR id::text = ${productId}
      `;
    }
    return { ok: true };
  }

  async deleteProduct(userId: string, productId: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.products WHERE custom_id = ${productId} OR id::text = ${productId}
    `.catch((err) => {
      console.warn('deleteProduct failed:', err?.message);
    });
    return { ok: true };
  }

  async listMarketplaceProducts(query?: any) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT p.*,
             COALESCE(
               NULLIF(up.display_name, ''),
               NULLIF(u.name, ''),
               NULLIF(m.name, ''),
               NULLIF(m.contact, ''),
               'Hội viên CLB'
             ) as seller_name,
             COALESCE(
               NULLIF(up.avatar_url, ''),
               NULLIF(u.avatar_url, ''),
               NULLIF(m.avatar, ''),
               NULLIF(m.cover_url, ''),
               ''
             ) as seller_avatar,
             COALESCE(
               NULLIF(m.phone, ''),
               ''
             ) as seller_phone,
             COALESCE(
               NULLIF(p.company, ''),
               NULLIF(up.company_name, ''),
               NULLIF(m.company_name, ''),
               NULLIF(bi.company_name, ''),
               'CLB Doanh Nhân CEO 1983'
             ) as seller_company
      FROM public.products p
      LEFT JOIN public.members m ON (p.seller_id = m.user_id::text OR p.seller_id = m.id OR p.seller_id = m.code)
      LEFT JOIN public.vione_users u ON (p.seller_id = u.id::text OR (m.user_id IS NOT NULL AND m.user_id = u.id))
      LEFT JOIN public.user_profiles up ON (u.id = up.user_id)
      LEFT JOIN public.business_identities bi ON (p.seller_id = bi.owner_user_id::text)
      ORDER BY p.created_at DESC
    `.catch((err) => {
      console.error(`listMarketplaceProducts error: ${err?.message}`);
      return [];
    });

    return rows.map((r) => {
      const imgList = safeParseImages(r.image_urls);
      const cat = r.category ?? 'mk.cat.other';
      const firstImg = (imgList && imgList.length > 0 ? imgList[0] : null) || r.image_url || r.image || '';
      const finalImgList = imgList && imgList.length > 0 ? imgList : (firstImg ? [firstImg] : []);

      return {
        id: String(r.custom_id || r.id),
        sellerId: r.seller_id,
        sellerName: r.seller_name || undefined,
        sellerAvatar: r.seller_avatar || undefined,
        sellerPhone: r.seller_phone || undefined,
        sellerCompany: r.seller_company || undefined,
        title: r.title,
        name: r.title,
        description: r.description ?? '',
        price: Number(r.price ?? 0),
        originalPrice: r.original_price ? Number(r.original_price) : undefined,
        memberPrice: r.member_price ? Number(r.member_price) : undefined,
        category: cat,
        company: r.seller_company || r.company || 'CLB Doanh Nhân CEO 1983',
        status: r.status ?? 'active',
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : '',
        time: r.created_at ? new Date(r.created_at).toISOString() : '',
        views: Number(r.views ?? 0),
        emoji: r.emoji ?? '🛍️',
        pdfUrl: r.pdf_url ?? '',
        imageUrls: finalImgList,
        imageUrl: firstImg,
        videoUrl: r.video_url || undefined,
        websiteUrl: r.website_url ?? '',
        facebookUrl: r.facebook_url ?? '',
        associationId: r.association_id,
      };
    });
  }

  async getMarketplaceProductById(id: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT p.*,
             COALESCE(
               NULLIF(up.display_name, ''),
               NULLIF(u.name, ''),
               NULLIF(m.name, ''),
               NULLIF(m.contact, ''),
               'Hội viên CLB'
             ) as seller_name,
             COALESCE(
               NULLIF(up.avatar_url, ''),
               NULLIF(u.avatar_url, ''),
               NULLIF(m.avatar, ''),
               NULLIF(m.cover_url, ''),
               ''
             ) as seller_avatar,
             COALESCE(
               NULLIF(m.phone, ''),
               ''
             ) as seller_phone,
             COALESCE(
               NULLIF(p.company, ''),
               NULLIF(up.company_name, ''),
               NULLIF(m.company_name, ''),
               NULLIF(bi.company_name, ''),
               'CLB Doanh Nhân CEO 1983'
             ) as seller_company
      FROM public.products p
      LEFT JOIN public.members m ON (p.seller_id = m.user_id::text OR p.seller_id = m.id OR p.seller_id = m.code)
      LEFT JOIN public.vione_users u ON (p.seller_id = u.id::text OR (m.user_id IS NOT NULL AND m.user_id = u.id))
      LEFT JOIN public.user_profiles up ON (u.id = up.user_id)
      LEFT JOIN public.business_identities bi ON (p.seller_id = bi.owner_user_id::text)
      WHERE (p.custom_id = ${id} OR p.id::text = ${id}) LIMIT 1
    `.catch(() => []);
    if (rows.length === 0) return null;
    const r = rows[0];
    // Bump views
    await this.prisma.$executeRaw`
      UPDATE public.products SET views = COALESCE(views, 0) + 1 WHERE custom_id = ${id} OR id::text = ${id}
    `.catch(() => {});

    const quotes = await this.prisma.$queryRaw<any[]>`
      SELECT q.*,
             COALESCE(m.contact, m.name, u.name, 'Hội viên CLB') as buyer_name,
             COALESCE(m.cover_url, u.avatar_url, '') as buyer_avatar,
             COALESCE(m.phone, q.contact, '') as buyer_phone,
             COALESCE(m.name, bi.company_name, '') as buyer_company
      FROM public.quote_requests q
      LEFT JOIN public.members m ON (q.buyer_id = m.user_id::text OR q.buyer_id = m.id OR q.buyer_id = m.code)
      LEFT JOIN public.vione_users u ON (q.buyer_id = u.id::text)
      LEFT JOIN public.business_identities bi ON (q.buyer_id = bi.owner_user_id::text)
      WHERE (q.product_id = ${id} OR q.product_id = ${r.custom_id} OR q.product_id = ${String(r.id)})
      ORDER BY q.created_at DESC
    `.catch(() => []);

    const imgList = safeParseImages(r.image_urls);
    const firstImg = (imgList && imgList.length > 0 ? imgList[0] : null) || r.image_url || r.image || '';
    const finalImgList = imgList && imgList.length > 0 ? imgList : (firstImg ? [firstImg] : []);

    return {
      product: {
        id: String(r.custom_id || r.id),
        sellerId: r.seller_id,
        sellerName: r.seller_name || undefined,
        sellerAvatar: r.seller_avatar || undefined,
        sellerPhone: r.seller_phone || undefined,
        sellerCompany: r.seller_company || undefined,
        title: r.title,
        name: r.name || r.title,
        description: r.description ?? '',
        price: Number(r.price ?? 0),
        category: r.category ?? 'mk.cat.other',
        company: r.seller_company || r.company || 'CLB Doanh Nhân CEO 1983',
        status: r.status ?? 'active',
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : '',
        views: Number(r.views ?? 0) + 1,
        emoji: r.emoji ?? '🛍️',
        pdfUrl: r.pdf_url ?? '',
        imageUrls: finalImgList,
        imageUrl: firstImg,
        videoUrl: r.video_url || undefined,
        websiteUrl: r.website_url ?? '',
        facebookUrl: r.facebook_url ?? '',
        associationId: r.association_id,
      },
      quotes: quotes.map((q) => ({
        id: q.id,
        productId: q.product_id,
        buyerId: q.buyer_id,
        buyerName: q.buyer_name || undefined,
        buyerAvatar: q.buyer_avatar || undefined,
        buyerPhone: q.buyer_phone || undefined,
        buyerCompany: q.buyer_company || undefined,
        quantity: Number(q.quantity ?? 1),
        message: q.message ?? '',
        contact: q.contact ?? q.buyer_phone ?? '',
        status: q.status ?? 'sent',
        reminderCount: Number(q.reminder_count ?? 0),
        cancelReason: q.cancel_reason ?? '',
        createdAt: q.created_at ? new Date(q.created_at).toISOString() : '',
        updatedAt: q.updated_at ? new Date(q.updated_at).toISOString() : '',
      })),
    };
  }

  async createMarketplaceProduct(userId: string, data: any) {
    const id = data.id || `prod-${Date.now()}`;
    const sellerId = String(data.sellerId || userId || 'ceo1983');
    const title = (data.title || data.name || 'Sản phẩm mới').trim();
    const imageUrls = safeParseImages(data.imageUrls || (data.imageUrl ? [data.imageUrl] : []));
    const firstImage = imageUrls[0] || data.imageUrl || data.image || null;
    const videoUrl = data.videoUrl || data.video_url || null;
    const company = (data.company || 'CLB Doanh Nhân CEO 1983').trim();
    const originalPrice = data.originalPrice !== undefined ? Number(data.originalPrice) : Number(data.price ?? 0);
    const memberPrice = data.memberPrice !== undefined ? Number(data.memberPrice) : Number(data.price ?? 0);
    const unit = data.unit || 'Gói';
    const currency = data.currency || 'VND';
    const assocId = data.associationId || 'c1983000-0000-4000-8000-000000001983';

    const rows = await this.prisma.$queryRaw<any[]>`
      INSERT INTO public.products (
        custom_id, seller_id, title, name, description, price, original_price, member_price, unit, currency,
        category, status, views, emoji, pdf_url, image_urls, image_url, video_url, company, website_url, facebook_url,
        association_id, created_at, updated_at
      ) VALUES (
        ${id}, ${sellerId}, ${title}, ${title}, ${data.description ?? ''}, ${Number(data.price ?? 0)},
        ${originalPrice}, ${memberPrice}, ${unit}, ${currency},
        ${data.category ?? 'mk.cat.other'}, ${data.status ?? 'active'}, 0, ${data.emoji ?? '🛍️'},
        ${data.pdfUrl ?? ''}, ${JSON.stringify(imageUrls)}::jsonb, ${firstImage}, ${videoUrl}, ${company}, ${data.websiteUrl ?? ''}, ${data.facebookUrl ?? ''},
        ${assocId}::uuid, NOW(), NOW()
      )
      RETURNING *
    `.catch(async (err) => {
      console.warn('createMarketplaceProduct primary insert failed, using fallback:', err?.message);
      return this.prisma.$queryRaw<any[]>`
        INSERT INTO public.products (
          custom_id, seller_id, title, description, price, category, status, views, emoji, pdf_url, image_urls, video_url, website_url, facebook_url, association_id, created_at, updated_at
        ) VALUES (
          ${id}, ${sellerId}, ${title}, ${data.description ?? ''}, ${Number(data.price ?? 0)},
          ${data.category ?? 'mk.cat.other'}, ${data.status ?? 'active'}, 0, ${data.emoji ?? '🛍️'},
          ${data.pdfUrl ?? ''}, ${JSON.stringify(imageUrls)}::jsonb, ${videoUrl}, ${data.websiteUrl ?? ''}, ${data.facebookUrl ?? ''},
          ${assocId}::uuid, NOW(), NOW()
        )
        RETURNING *
      `.catch(() => [] as any[]);
    });
    const r = rows[0] || {};
    return {
      id: String(r.custom_id || r.id || id),
      sellerId: r.seller_id,
      title: r.title || title,
      name: r.name || r.title || title,
      description: r.description ?? '',
      price: Number(r.price ?? 0),
      originalPrice,
      memberPrice,
      unit: r.unit || unit,
      currency: r.currency || currency,
      category: r.category ?? 'mk.cat.other',
      status: r.status ?? 'active',
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      views: 0,
      emoji: r.emoji ?? '🛍️',
      pdfUrl: r.pdf_url ?? '',
      imageUrls: imageUrls.length > 0 ? imageUrls : (firstImage ? [firstImage] : []),
      imageUrl: firstImage,
      videoUrl: videoUrl || undefined,
      company: company || r.company || 'CLB Doanh Nhân CEO 1983',
      websiteUrl: r.website_url ?? '',
      facebookUrl: r.facebook_url ?? '',
    };
  }

  async updateMarketplaceProduct(userId: string, id: string, data: any) {
    const title = data.title || data.name;
    const imageUrls = data.imageUrls || data.imageUrl ? safeParseImages(data.imageUrls || [data.imageUrl]) : null;
    const firstImage = imageUrls && imageUrls[0] ? imageUrls[0] : (data.imageUrl || null);
    const videoUrl = data.videoUrl !== undefined ? data.videoUrl : (data.video_url !== undefined ? data.video_url : null);
    const cleanPrice = data.price !== undefined ? Number(data.price) : null;
    const cleanOriginalPrice = data.originalPrice !== undefined ? Number(data.originalPrice) : null;
    const cleanMemberPrice = data.memberPrice !== undefined ? Number(data.memberPrice) : null;

    const rows = await this.prisma.$queryRaw<any[]>`
      UPDATE public.products
      SET
        title = COALESCE(${title}, title),
        name = COALESCE(${title}, name),
        description = COALESCE(${data.description}, description),
        price = COALESCE(${cleanPrice}, price),
        original_price = COALESCE(${cleanOriginalPrice}, original_price),
        member_price = COALESCE(${cleanMemberPrice}, member_price),
        company = COALESCE(${data.company}, company),
        unit = COALESCE(${data.unit}, unit),
        currency = COALESCE(${data.currency}, currency),
        image_url = COALESCE(${firstImage}, image_url),
        image_urls = CASE WHEN ${imageUrls ? true : false} THEN ${JSON.stringify(imageUrls || [])}::jsonb ELSE image_urls END,
        video_url = COALESCE(${videoUrl}, video_url),
        category = COALESCE(${data.category}, category),
        status = COALESCE(${data.status}, status),
        emoji = COALESCE(${data.emoji}, emoji),
        pdf_url = COALESCE(${data.pdfUrl}, pdf_url),
        website_url = COALESCE(${data.websiteUrl}, website_url),
        facebook_url = COALESCE(${data.facebookUrl}, facebook_url),
        updated_at = NOW()
      WHERE custom_id = ${id} OR id::text = ${id}
      RETURNING *
    `;
    if (rows.length === 0) return null;
    const r = rows[0];
    const parsedImages = safeParseImages(r.image_urls);
    return {
      id: String(r.custom_id || r.id),
      sellerId: r.seller_id,
      title: r.title,
      description: r.description ?? '',
      price: Number(r.price ?? 0),
      category: r.category ?? 'mk.cat.other',
      status: r.status ?? 'active',
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : '',
      views: Number(r.views ?? 0),
      emoji: r.emoji ?? '🛍️',
      pdfUrl: r.pdf_url ?? '',
      imageUrls: parsedImages,
      imageUrl: parsedImages[0] || r.image_url || '',
      videoUrl: r.video_url || undefined,
      websiteUrl: r.website_url ?? '',
      facebookUrl: r.facebook_url ?? '',
    };
  }

  async deleteMarketplaceProduct(userId: string, id: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.products WHERE custom_id = ${id} OR id::text = ${id}
    `;
    return { ok: true };
  }

  async toggleProductSold(userId: string, id: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      UPDATE public.products
      SET status = CASE WHEN status = 'sold' THEN 'active' ELSE 'sold' END,
          updated_at = NOW()
      WHERE custom_id = ${id} OR id::text = ${id}
      RETURNING *
    `;
    if (rows.length === 0) return null;
    const r = rows[0];
    return { id: String(r.custom_id || r.id), status: r.status };
  }

  async listProductQuotes(userId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT q.*, p.title as product_title, p.price as product_price
      FROM public.quote_requests q
      LEFT JOIN public.products p ON q.product_id = p.id
      ORDER BY q.created_at DESC
    `.catch(() => []);

    return rows.map((q) => ({
      id: q.id,
      productId: q.product_id,
      productTitle: q.product_title ?? '',
      productPrice: Number(q.product_price ?? 0),
      buyerId: q.buyer_id,
      quantity: Number(q.quantity ?? 1),
      message: q.message ?? '',
      contact: q.contact ?? '',
      status: q.status ?? 'sent',
      reminderCount: Number(q.reminder_count ?? 0),
      cancelReason: q.cancel_reason ?? '',
      createdAt: q.created_at ? new Date(q.created_at).toISOString() : '',
      updatedAt: q.updated_at ? new Date(q.updated_at).toISOString() : '',
    }));
  }

  async requestProductQuote(userId: string, data: any) {
    if (!data?.productId) {
      throw new BadRequestException('Vui lòng chỉ định sản phẩm cần gửi yêu cầu báo giá!');
    }

    // 0. Ownership check: Sellers cannot quote/bid on their own products
    let prodRows: any[] = [];
    let prodTitle = 'Sản phẩm Marketplace';
    let assocId = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d';
    try {
      prodRows = await this.prisma.$queryRaw<any[]>`
        SELECT p.title, p.seller_id, p.association_id, m.user_id as seller_user_id, m.id as member_id, m.code as member_code
        FROM public.products p
        LEFT JOIN public.members m ON (m.user_id::text = p.seller_id::text OR m.id::text = p.seller_id::text OR m.code::text = p.seller_id::text)
        WHERE p.id = ${data.productId} LIMIT 1
      `.catch((err) => {
        console.warn('Error querying product for quote ownership check:', err?.message);
        return [];
      });

      if (prodRows && prodRows.length > 0) {
        const prod = prodRows[0];
        if (prod.title) prodTitle = prod.title;
        if (prod.association_id) assocId = prod.association_id;
        const uid = String(userId || '').trim().toLowerCase();
        const sellerId = String(prod.seller_id || '').trim().toLowerCase();
        const sellerUserId = String(prod.seller_user_id || '').trim().toLowerCase();
        const memberId = String(prod.member_id || '').trim().toLowerCase();

        if (uid && (uid === sellerId || uid === sellerUserId || uid === memberId)) {
          throw new BadRequestException('Bạn là người đăng sản phẩm này nên không thể tự gửi yêu cầu báo giá cho chính mình!');
        }
      }
    } catch (checkErr: any) {
      if (checkErr instanceof BadRequestException) throw checkErr;
    }

    const id = `quote-${Date.now()}`;
    let q: any = {
      id,
      product_id: data.productId,
      buyer_id: userId,
      quantity: Number(data.quantity ?? 1),
      message: data.message ?? '',
      contact: data.contact ?? '',
      status: 'sent',
      reminder_count: 0,
      created_at: new Date(),
    };

    try {
      const rows = await this.prisma.$queryRaw<any[]>`
        INSERT INTO public.quote_requests (
          id, product_id, buyer_id, quantity, message, contact, status, reminder_count, created_at, updated_at
        ) VALUES (
          ${id}, ${data.productId}, ${userId}::uuid, ${Number(data.quantity ?? 1)},
          ${data.message ?? ''}, ${data.contact ?? ''}, 'sent', 0, NOW(), NOW()
        )
        RETURNING *
      `;
      if (rows && rows.length > 0) q = rows[0];
    } catch (e: any) {
      console.warn('Fallback quote insert:', e?.message);
    }

    // 1. Query buyer info for CRM Lead
    let buyerName = 'Hội viên CEO 1983';
    let buyerPhone = data.contact || '';
    try {
      const buyerRows = await this.prisma.$queryRaw<any[]>`
        SELECT name, phone, email FROM public.vione_users WHERE id = ${userId}::uuid LIMIT 1
      `.catch(() => []);
      if (buyerRows.length > 0) {
        buyerName = buyerRows[0].name || buyerName;
        buyerPhone = buyerPhone || buyerRows[0].phone || '';
      }
    } catch {}

    // 2. Product & seller info already resolved above

    // 3. PUSH TO CRM SYSTEM: Dispatch to Association Staff / CRM Notification Center
    try {
      await this.notifyAssociationAdmins(assocId, {
        title: `[CRM Báo giá] Yêu cầu báo giá mới: ${prodTitle}`,
        body: `Khách hàng/Hội viên ${buyerName} (SĐT: ${buyerPhone || 'Chưa cung cấp'}) gửi yêu cầu báo giá cho sản phẩm "${prodTitle}" (SL: ${data.quantity ?? 1}). Ghi chú: "${(data.message || '').slice(0, 120)}"`,
        targetRoute: '/marketplace',
        type: 'crm_quote_lead',
        sourceRecordId: id,
        meta: {
          leadType: 'quote_request',
          buyerId: userId,
          buyerName,
          buyerPhone,
          productId: data.productId,
          productTitle: prodTitle,
          quantity: data.quantity ?? 1,
          message: data.message,
          contact: data.contact,
        },
      });
    } catch (crmErr: any) {
      console.warn('CRM quote notification dispatch error:', crmErr?.message);
    }

    // 4. 2-Way Notification: Push to product seller (Association App)
    try {
      if (prodRows.length > 0 && prodRows[0].seller_id) {
        const prod = prodRows[0];
        const targetUserId = prod.seller_user_id || prod.seller_id;
        const targetMemberId = prod.member_id || prod.seller_id;
        const notifTitle = 'Yêu cầu báo giá mới trên Marketplace';
        const notifBody = `Sản phẩm "${prod.title}" của bạn vừa nhận được yêu cầu báo giá (${data.quantity ?? 1} sản phẩm) từ ${buyerName} (SĐT: ${buyerPhone}): "${(data.message || '').slice(0, 100)}"`;
        const notifId = require('crypto').randomUUID();
        const safeData = JSON.stringify({
          title: notifTitle,
          body: notifBody,
          quoteId: id,
          productId: data.productId,
          targetRoute: `/marketplace`,
        });

        // business_notifications
        await this.prisma.$executeRawUnsafe(`
          INSERT INTO public.business_notifications (
            id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
            title_key, body_key, safe_display_data, priority, status, dedupe_key, app_scope, target_app, created_at, updated_at
          ) VALUES (
            $1::uuid, $2::uuid, 'marketplace', $3, 'quote_requested', 'new_quote',
            $4, $5, $6::jsonb, 'high', 'delivered', $7, 'all', 'all', NOW(), NOW()
          )
        `, notifId, targetUserId, id, notifTitle, notifBody, safeData, `quote-req-${id}`).catch(() => {});

        // member_notifications
        await this.prisma.$executeRawUnsafe(`
          INSERT INTO public.member_notifications (
            id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, false, false, 'quote', $4, NOW()
          )
        `, targetMemberId, notifTitle, notifBody, id).catch(() => {});

        // Real-time WebSocket emission
        this.gateway.emitNotification(String(targetUserId), {
          id: notifId,
          title: notifTitle,
          body: notifBody,
          action: { targetRoute: '/marketplace' },
          safeDisplayData: { title: notifTitle, body: notifBody },
        });

        // 5. PUSH TO MESSENGER: Push quote template into seller's direct chat inbox
        try {
          const targetPeer = prod.member_code || prod.member_id || prod.seller_user_id || prod.seller_id;
          if (targetPeer && this.messengerService) {
            const quoteChatTemplate = 
`📋 [YÊU CẦU BÁO GIÁ SẢN PHẨM]
───────────────
🛍️ Sản phẩm: ${prodTitle}
🔢 Số lượng: ${data.quantity ?? 1}
👤 Người yêu cầu: ${buyerName}
📞 Số điện thoại: ${buyerPhone || 'Chưa cung cấp'}
💬 Lời nhắn: ${data.message ? data.message : 'Tôi quan tâm đến sản phẩm này, vui lòng gửi báo giá chi tiết và chính sách ưu đãi cho hội viên CLB CEO 1983.'}
───────────────
⚡ Thời gian gửi: ${new Date().toLocaleString('vi-VN')}
🆔 Mã báo giá: ${id}`;

            await this.messengerService.sendMemberMessage(userId, String(targetPeer), quoteChatTemplate);
          }
        } catch (chatErr: any) {
          console.warn('Failed to push quote template into chat:', chatErr?.message);
        }
      }
    } catch (e: any) {
      console.warn('Failed to send seller quote notification:', e?.message);
    }

    return {
      id: q.id,
      productId: q.product_id,
      buyerId: q.buyer_id,
      quantity: Number(q.quantity ?? 1),
      message: q.message ?? '',
      contact: q.contact ?? '',
      status: q.status ?? 'sent',
      reminderCount: 0,
      createdAt: q.created_at ? new Date(q.created_at).toISOString() : '',
    };
  }

  async updateQuoteStatus(userId: string, id: string, status: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      UPDATE public.quote_requests
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (rows.length === 0) return null;
    const q = rows[0];

    // 2-Way Notification: Notify buyer about status update
    try {
      const notifTitle = 'Cập nhật trạng thái yêu cầu báo giá';
      const notifBody = `Yêu cầu báo giá #${id} của bạn đã chuyển sang trạng thái: ${status}.`;
      const notifId = require('crypto').randomUUID();
      const safeData = JSON.stringify({
        title: notifTitle,
        body: notifBody,
        quoteId: id,
        status,
        targetRoute: '/marketplace',
      });

      await this.prisma.$executeRawUnsafe(`
        INSERT INTO public.business_notifications (
          id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
          title_key, body_key, safe_display_data, priority, status, dedupe_key, app_scope, target_app, created_at, updated_at
        ) VALUES (
          $1::uuid, $2::uuid, 'marketplace', $3, 'quote_status_updated', 'quote_status',
          $4, $5, $6::jsonb, 'normal', 'delivered', $7, 'all', 'all', NOW(), NOW()
        )
      `, notifId, q.buyer_id, id, notifTitle, notifBody, safeData, `quote-status-${id}-${status}`).catch(() => {});

      await this.prisma.$executeRawUnsafe(`
        INSERT INTO public.member_notifications (
          id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
        ) VALUES (
          gen_random_uuid(), $1, $2, $3, false, false, 'quote', $4, NOW()
        )
      `, q.buyer_id, notifTitle, notifBody, id).catch(() => {});

      this.gateway.emitNotification(String(q.buyer_id), {
        id: notifId,
        title: notifTitle,
        body: notifBody,
        action: { targetRoute: '/marketplace' },
        safeDisplayData: { title: notifTitle, body: notifBody },
      });
    } catch {}

    return { id: q.id, status: q.status };
  }

  async sendQuoteReminder(userId: string, id: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      UPDATE public.quote_requests
      SET reminder_count = COALESCE(reminder_count, 0) + 1, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (rows.length === 0) return null;
    const q = rows[0];

    // 2-Way Notification: send reminder to seller
    try {
      const prodRows = await this.prisma.$queryRaw<any[]>`
        SELECT p.title, p.seller_id
        FROM public.products p
        WHERE p.id = ${q.product_id} LIMIT 1
      `.catch(() => []);

      if (prodRows.length > 0 && prodRows[0].seller_id) {
        const notifTitle = 'Nhắc nhở phản hồi báo giá Marketplace';
        const notifBody = `Khách hàng đang chờ phản hồi báo giá cho sản phẩm "${prodRows[0].title}".`;
        const notifId = require('crypto').randomUUID();
        const safeData = JSON.stringify({
          title: notifTitle,
          body: notifBody,
          quoteId: id,
          targetRoute: '/marketplace',
        });

        await this.prisma.$executeRawUnsafe(`
          INSERT INTO public.business_notifications (
            id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
            title_key, body_key, safe_display_data, priority, status, dedupe_key, app_scope, target_app, created_at, updated_at
          ) VALUES (
            $1::uuid, $2::uuid, 'marketplace', $3, 'quote_reminder', 'quote_reminder',
            $4, $5, $6::jsonb, 'high', 'delivered', $7, 'all', 'all', NOW(), NOW()
          )
        `, notifId, prodRows[0].seller_id, id, notifTitle, notifBody, safeData, `quote-remind-${id}-${Date.now()}`).catch(() => {});

        await this.prisma.$executeRawUnsafe(`
          INSERT INTO public.member_notifications (
            id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, false, false, 'quote', $4, NOW()
          )
        `, prodRows[0].seller_id, notifTitle, notifBody, id).catch(() => {});

        this.gateway.emitNotification(String(prodRows[0].seller_id), {
          id: notifId,
          title: notifTitle,
          body: notifBody,
          action: { targetRoute: '/marketplace' },
          safeDisplayData: { title: notifTitle, body: notifBody },
        });
      }
    } catch {}

    return { id: q.id, reminderCount: Number(q.reminder_count ?? 1) };
  }

  async cancelQuote(userId: string, id: string, reason: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      UPDATE public.quote_requests
      SET status = 'cancelled', cancel_reason = ${reason ?? ''}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (rows.length === 0) return null;
    return { id, status: 'cancelled', cancelReason: reason };
  }

  async deleteQuote(userId: string, id: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.quote_requests WHERE id = ${id}
    `.catch(() => {});
    return { ok: true, id };
  }

  async notifyAssociationAdmins(
    associationId: string,
    payload: {
      title: string;
      body: string;
      targetRoute: string;
      type?: string;
      sourceRecordId?: string;
      meta?: any;
    },
  ) {
    try {
      const now = new Date();
      const code = `NTF-${Date.now().toString(36).toUpperCase()}`;

      // 1. Insert into public.notifications for Web CRM Notification Center (both scoped and global fallback)
      await this.prisma.$executeRaw`
        INSERT INTO public.notifications (
          id, code, title, body, audience, channel, status, sent_at, association_id, app_scope, target_app, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), ${code}, ${payload.title}, ${payload.body},
          'staff', 'inapp', 'sent', ${now}, ${associationId}::uuid, 'crm', 'crm', ${now}, ${now}
        )
      `.catch((err) => console.warn('Could not insert scoped public.notifications:', err));

      // 2. Query admin / staff user IDs of this association + all platform administrators
      const adminMembers = await this.prisma.$queryRaw<any[]>`
        SELECT DISTINCT user_id FROM public.memberships
        WHERE (association_id = ${associationId}::uuid OR association_id IS NULL)
          AND role IN ('admin', 'association_admin', 'owner', 'staff', 'manager', 'executive')
        UNION
        SELECT DISTINCT user_id FROM public.user_roles
        WHERE role IN ('platform_admin', 'tenant_admin')
        UNION
        SELECT DISTINCT id AS user_id FROM public.vione_users
        WHERE email LIKE '%admin%' OR username LIKE '%admin%'
      `.catch(() => [] as any[]);

      const adminUserIds = Array.from(new Set(adminMembers.map((m) => m.user_id).filter(Boolean)));

      // 3. For each admin user, insert business_notifications & emit WebSocket
      for (const adminId of adminUserIds) {
        const notifId = crypto.randomUUID();
        const safeData = JSON.stringify({
          title: payload.title,
          body: payload.body,
          companyName: payload.meta?.companyName || payload.title,
          applicantName: payload.meta?.applicantName,
          phone: payload.meta?.phone,
          targetRoute: payload.targetRoute,
          appScope: 'crm',
          ...(payload.meta || {}),
        });
        const actionTarget = JSON.stringify({
          route: payload.targetRoute,
          targetRoute: payload.targetRoute,
          associationId,
        });

        await this.prisma.$executeRaw`
          INSERT INTO public.business_notifications (
            id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
            title_key, body_key, safe_display_data, action_kind, action_label_key, action_target,
            priority, status, app_scope, target_app, created_at, updated_at, dedupe_key
          ) VALUES (
            ${notifId}::uuid, ${adminId}::uuid, 'association', ${payload.sourceRecordId || associationId},
            ${payload.type || 'assoc_registration'}, ${payload.type || 'assoc_admin_alert'},
            ${payload.title}, ${payload.body},
            ${safeData}::jsonb, 'navigate', 'Xem hồ sơ & duyệt', ${actionTarget}::jsonb,
            'high', 'delivered', 'crm', 'crm', ${now}, ${now}, ${`assoc_alert:${notifId}`}
          )
        `.catch((err) => console.warn('Error inserting business_notification for admin:', err));

        this.gateway.emitNotification(adminId, {
          id: notifId,
          title: payload.title,
          body: payload.body,
          appScope: 'crm',
          targetApp: 'crm',
          action: { targetRoute: payload.targetRoute },
          safeDisplayData: {
            title: payload.title,
            body: payload.body,
            targetRoute: payload.targetRoute,
            appScope: 'crm',
          },
          targetRoute: payload.targetRoute,
        });
      }

      // 4. Also broadcast to association room & all connected CRM clients
      this.gateway.emitToRoom(`assoc:${associationId}`, 'notification:new', {
        title: payload.title,
        body: payload.body,
        targetRoute: payload.targetRoute,
        action: { targetRoute: payload.targetRoute },
        safeDisplayData: {
          title: payload.title,
          body: payload.body,
          targetRoute: payload.targetRoute,
        },
      });

      this.gateway.emitToAll('notification:new', {
        title: payload.title,
        body: payload.body,
        targetRoute: payload.targetRoute,
        action: { targetRoute: payload.targetRoute },
        safeDisplayData: {
          title: payload.title,
          body: payload.body,
          targetRoute: payload.targetRoute,
        },
      });
    } catch (err) {
      console.warn('Error in notifyAssociationAdmins:', err);
    }
  }

}
