import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { ReviewsRepository } from './reviews.repository';
import { CreateReviewDto, UpdateReviewDto } from './dto';

export { CreateReviewDto, UpdateReviewDto };

@Injectable()
export class ReviewsService {
  constructor(private readonly reviewsRepo: ReviewsRepository) {}

  async listReviews(sellerId: string) {
    if (!sellerId) return { reviews: [], stats: { count: 0, avg: 0 } };

    const rows = await this.reviewsRepo.listReviewsBySellerId(sellerId);

    const reviews = rows.map((r) => ({
      id: r.id,
      sellerId: r.seller_id,
      reviewerId: r.reviewer_id,
      reviewerName: r.reviewer_name || 'Hội viên',
      rating: Number(r.rating || 5),
      comment: r.comment || '',
      reviewType: r.review_type || 'service',
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    }));

    const count = reviews.length;
    const avg = count ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
    return { reviews, stats: { count, avg: Number(avg.toFixed(1)) } };
  }

  async addReview(userId: string, data: CreateReviewDto) {
    if (!data.sellerId || !data.comment) {
      throw new BadRequestException('sellerId and comment are required');
    }
    const id = crypto.randomUUID();
    const reviewerId = data.reviewerId || userId;

    const reviewerName = (await this.reviewsRepo.findReviewerName(reviewerId, userId)) || 'Hội viên CEO 1983';

    const r = await this.reviewsRepo.insertReview(
      id,
      data.sellerId,
      reviewerId,
      reviewerName,
      data.rating || 5,
      data.comment,
      data.reviewType || 'service',
    );

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
