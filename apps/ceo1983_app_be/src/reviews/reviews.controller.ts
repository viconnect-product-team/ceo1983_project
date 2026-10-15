import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewDto } from './dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async listReviews(
    @Query('sellerId') sellerId?: string,
    @Query('productId') productId?: string,
    @Query('companyName') companyName?: string,
  ) {
    return this.reviewsService.listReviews({ sellerId, productId, companyName });
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async addReview(@Request() req: any, @Body() body: CreateReviewDto) {
    const userId = req.user?.id || req.user?.sub || '00000000-0000-4000-8000-000000000002';
    return this.reviewsService.addReview(userId, body);
  }

  @Put(':id')
  async updateReview(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(req.user.id || req.user.sub, id, body);
  }

  @Delete(':id')
  async deleteReview(@Request() req: any, @Param('id') id: string) {
    return this.reviewsService.deleteReview(req.user.id || req.user.sub, id);
  }
}
