export class CreateReviewDto {
  sellerId?: string;
  productId?: string;
  companyName?: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewerRole?: string;
  reviewerAvatar?: string;
  rating!: number;
  comment!: string;
  reviewType?: string;
  images?: string[];
}

