import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FeedService } from './feed.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async listFeed(
    @Request() req: any,
    @Query('category') category?: string,
    @Query('department') department?: string,
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user?.id || req.user?.sub || '';
    return this.feedService.listFeed({
      category,
      department,
      q,
      userId,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 30,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async createPost(
    @Request() req: any,
    @Body()
    body: {
      title?: string;
      content: string;
      category?: string;
      department?: string;
      images?: string[];
    },
  ) {
    const userId = req.user?.id || req.user?.sub || 'system';
    return this.feedService.createPost(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  async toggleLike(@Request() req: any, @Param('id') id: string) {
    const userId = req.user?.id || req.user?.sub || 'anonymous';
    return this.feedService.toggleLike(userId, id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/comments')
  async listComments(@Param('id') id: string) {
    return this.feedService.listComments(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  async addComment(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const userId = req.user?.id || req.user?.sub || 'anonymous';
    return this.feedService.addComment(userId, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('comments/:commentId/reaction')
  async reactToComment(
    @Request() req: any,
    @Param('commentId') commentId: string,
    @Body() body: { reaction: string },
  ) {
    const userId = req.user?.id || req.user?.sub || 'anonymous';
    return this.feedService.reactToComment(userId, commentId, body?.reaction);
  }

  @Post(':id/share')
  async sharePost(@Param('id') id: string) {
    return this.feedService.sharePost(id);
  }
}
