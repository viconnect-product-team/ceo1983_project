import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listReviews(filter: { sellerId?: string; productId?: string; companyName?: string }): Promise<any[]> {
    const { sellerId, productId, companyName } = filter;
    if (productId) {
      return this.prisma.$queryRaw<any[]>`
        SELECT id, seller_id, reviewer_id, reviewer_name, reviewer_role, reviewer_avatar, rating, comment, review_type, product_id, company_name, images, created_at
        FROM public.reviews
        WHERE product_id = ${productId}
           OR (${sellerId || ''} <> '' AND seller_id = ${sellerId})
           OR (${companyName || ''} <> '' AND company_name = ${companyName})
        ORDER BY created_at DESC
      `.catch(() => [] as any[]);
    }
    if (sellerId) {
      return this.prisma.$queryRaw<any[]>`
        SELECT id, seller_id, reviewer_id, reviewer_name, reviewer_role, reviewer_avatar, rating, comment, review_type, product_id, company_name, images, created_at
        FROM public.reviews
        WHERE seller_id = ${sellerId}
           OR (${companyName || ''} <> '' AND company_name = ${companyName})
        ORDER BY created_at DESC
      `.catch(() => [] as any[]);
    }
    if (companyName) {
      return this.prisma.$queryRaw<any[]>`
        SELECT id, seller_id, reviewer_id, reviewer_name, reviewer_role, reviewer_avatar, rating, comment, review_type, product_id, company_name, images, created_at
        FROM public.reviews
        WHERE company_name = ${companyName}
        ORDER BY created_at DESC
      `.catch(() => [] as any[]);
    }
    return this.prisma.$queryRaw<any[]>`
      SELECT id, seller_id, reviewer_id, reviewer_name, reviewer_role, reviewer_avatar, rating, comment, review_type, product_id, company_name, images, created_at
      FROM public.reviews
      ORDER BY created_at DESC
      LIMIT 100
    `.catch(() => [] as any[]);
  }

  async listReviewsBySellerId(sellerId: string): Promise<any[]> {
    return this.listReviews({ sellerId });
  }

  async findReviewerName(reviewerId: string, userId: string): Promise<string | null> {
    const memberRows = await this.prisma.$queryRaw<any[]>`
      SELECT name FROM public.members WHERE id::text = ${reviewerId} OR user_id::text = ${userId} LIMIT 1
    `.catch(() => [] as any[]);
    return memberRows[0]?.name || null;
  }

  async insertReview(data: {
    id: string;
    sellerId?: string;
    productId?: string;
    companyName?: string;
    reviewerId: string;
    reviewerName: string;
    reviewerRole?: string;
    reviewerAvatar?: string;
    rating: number;
    comment: string;
    reviewType?: string;
    images?: string[];
  }): Promise<any> {
    const {
      id,
      sellerId = '',
      productId = null,
      companyName = null,
      reviewerId,
      reviewerName,
      reviewerRole = null,
      reviewerAvatar = null,
      rating,
      comment,
      reviewType = 'service',
      images = [],
    } = data;

    const inserted = await this.prisma.$queryRaw<any[]>`
      INSERT INTO public.reviews (
        id, seller_id, product_id, company_name, reviewer_id, reviewer_name,
        reviewer_role, reviewer_avatar, rating, comment, review_type, images, created_at
      )
      VALUES (
        ${id}::uuid, ${sellerId}, ${productId}, ${companyName}, ${reviewerId}, ${reviewerName},
        ${reviewerRole}, ${reviewerAvatar}, ${rating}, ${comment}, ${reviewType}, ${images}::text[], now()
      )
      RETURNING id, seller_id, product_id, company_name, reviewer_id, reviewer_name, reviewer_role, reviewer_avatar, rating, comment, review_type, images, created_at
    `.catch((err) => {
      console.warn('[ReviewsRepository] insertReview raw fallback:', err?.message);
      return [] as any[];
    });

    return inserted[0] || {
      id,
      seller_id: sellerId,
      product_id: productId,
      company_name: companyName,
      reviewer_id: reviewerId,
      reviewer_name: reviewerName,
      reviewer_role: reviewerRole,
      reviewer_avatar: reviewerAvatar,
      rating,
      comment,
      review_type: reviewType,
      images,
      created_at: new Date(),
    };
  }

  async updateReviewRaw(id: string, rating?: number, comment?: string, reviewType?: string): Promise<any> {
    await this.prisma.$executeRaw`
      UPDATE public.reviews
      SET rating = COALESCE(${rating}, rating),
          comment = COALESCE(${comment}, comment),
          review_type = COALESCE(${reviewType}, review_type)
      WHERE id = ${id}::uuid
    `.catch(() => {});

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, seller_id, reviewer_id, reviewer_name, rating, comment, review_type, created_at
      FROM public.reviews WHERE id = ${id}::uuid LIMIT 1
    `.catch(() => [] as any[]);

    return rows[0] || null;
  }

  async deleteReviewRaw(id: string): Promise<void> {
    await this.prisma.$executeRaw`
      DELETE FROM public.reviews WHERE id = ${id}::uuid
    `.catch(() => {});
  }
}
