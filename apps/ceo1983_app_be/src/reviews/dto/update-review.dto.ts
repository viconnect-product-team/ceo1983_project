export class UpdateReviewDto {
  rating?: number;
  comment?: string;
  reviewType?: 'service' | 'event' | 'networking';
}
