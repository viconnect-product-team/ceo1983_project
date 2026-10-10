export class CreateReviewDto {
  sellerId!: string;
  reviewerId?: string;
  rating!: number;
  comment!: string;
  reviewType?: 'service' | 'event' | 'networking';
}
