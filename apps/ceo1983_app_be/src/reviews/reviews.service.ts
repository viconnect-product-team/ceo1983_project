import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { ReviewsRepository } from './reviews.repository';
import { CreateReviewDto, UpdateReviewDto } from './dto';

export { CreateReviewDto, UpdateReviewDto };

@Injectable()
export class ReviewsService {
  constructor(private readonly reviewsRepo: ReviewsRepository) {}

  async listReviews(filter: { sellerId?: string; productId?: string; companyName?: string } | string) {
    const filterObj = typeof filter === 'string' ? { sellerId: filter } : (filter || {});
    const rows = await this.reviewsRepo.listReviews(filterObj);

    const reviews = rows.map((r) => ({
      id: r.id,
      sellerId: r.seller_id,
      productId: r.product_id,
      companyName: r.company_name,
      reviewerId: r.reviewer_id,
      reviewerName: r.reviewer_name || 'Hội viên',
      reviewerRole: r.reviewer_role || 'Hội viên CLB CEO 1983',
      reviewerAvatar: r.reviewer_avatar || '',
      rating: Number(r.rating || 5),
      comment: r.comment || '',
      reviewType: r.review_type || 'service',
      images: Array.isArray(r.images) ? r.images : [],
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    }));

    const count = reviews.length;
    const avg = count ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
    return { reviews, stats: { count, avg: Number(avg.toFixed(1)) } };
  }

  async addReview(userId: string, data: CreateReviewDto) {
    if (!data.comment?.trim()) {
      throw new BadRequestException('Vui lòng nhập nội dung đánh giá');
    }
    const id = crypto.randomUUID();
    const reviewerId = data.reviewerId || userId;

    const reviewerName = data.reviewerName || (await this.reviewsRepo.findReviewerName(reviewerId, userId)) || 'Hội viên CEO 1983';

    const r = await this.reviewsRepo.insertReview({
      id,
      sellerId: data.sellerId || '',
      productId: data.productId,
      companyName: data.companyName,
      reviewerId,
      reviewerName,
      reviewerRole: data.reviewerRole,
      reviewerAvatar: data.reviewerAvatar,
      rating: data.rating || 5,
      comment: data.comment.trim(),
      reviewType: data.reviewType || 'product',
      images: data.images || [],
    });

    return {
      id: r.id,
      sellerId: r.seller_id,
      productId: r.product_id,
      companyName: r.company_name,
      reviewerId: r.reviewer_id,
      reviewerName: r.reviewer_name,
      reviewerRole: r.reviewer_role,
      reviewerAvatar: r.reviewer_avatar,
      rating: Number(r.rating),
      comment: r.comment,
      reviewType: r.review_type,
      images: r.images || [],
      createdAt: new Date(r.created_at).toISOString(),
    };
  }

  async updateReview(userId: string, id: string, data: UpdateReviewDto) {
    const r = await this.reviewsRepo.updateReviewRaw(id, data.rating, data.comment, data.reviewType);
    if (!r) throw new NotFoundException('Review not found');

    return {
      id: r.id,
      sellerId: r.seller_id,
      reviewerId: r.reviewer_id,
      reviewerName: r.reviewer_name,
      rating: Number(r.rating),
      comment: r.comment,
      reviewType: r.review_type,
      createdAt: new Date(r.created_at).toISOString(),
    };
  }

  async deleteReview(userId: string, id: string) {
    await this.reviewsRepo.deleteReviewRaw(id);
    return { ok: true };
  }
}
