import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listReviewsBySellerId(sellerId: string): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT id, seller_id, reviewer_id, reviewer_name, rating, comment, review_type, created_at
      FROM public.reviews
      WHERE seller_id = ${sellerId}
      ORDER BY created_at DESC
    `.catch(() => [] as any[]);
  }

  async findReviewerName(reviewerId: string, userId: string): Promise<string | null> {
    const memberRows = await this.prisma.$queryRaw<any[]>`
      SELECT name FROM public.members WHERE id = ${reviewerId}::uuid OR user_id = ${userId}::uuid LIMIT 1
    `.catch(() => [] as any[]);
    return memberRows[0]?.name || null;
  }

  async insertReview(id: string, sellerId: string, reviewerId: string, reviewerName: string, rating: number, comment: string, reviewType: string): Promise<any> {
    const inserted = await this.prisma.$queryRaw<any[]>`
      INSERT INTO public.reviews (id, seller_id, reviewer_id, reviewer_name, rating, comment, review_type, created_at)
      VALUES (${id}::uuid, ${sellerId}, ${reviewerId}, ${reviewerName}, ${rating}, ${comment}, ${reviewType}, now())
      RETURNING id, seller_id, reviewer_id, reviewer_name, rating, comment, review_type, created_at
    `.catch(() => [] as any[]);

    return inserted[0] || {
      id,
      seller_id: sellerId,
      reviewer_id: reviewerId,
      reviewer_name: reviewerName,
      rating,
      comment,
      review_type: reviewType,
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
