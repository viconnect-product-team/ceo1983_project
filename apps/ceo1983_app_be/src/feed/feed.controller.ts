import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FeedService } from './feed.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('platform_admin', 'superadmin', 'adm', 'admin', 'bqt', 'btt', 'btv', 'btk', 'bxt', 'btn', 'quan_tri', 'tong_thu_ky', 'ban_thu_ky', 'truong_ban_truyen_thong', 'member')
  @Get('moderation/comments')
  async listAllCommentsForModeration(
    @Query('search') search?: string,
    @Query('postId') postId?: string,
  ) {
    return this.feedService.listAllCommentsForModeration(search, postId);
  }

  @Get('url-metadata')
  async extractUrlMetadata(@Query('url') url: string) {
    return this.feedService.extractUrlMetadata(url);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async listFeed(
    @Request() req: any,
    @Query('category') category?: string,
    @Query('department') department?: string,
    @Query('q') q?: string,
    @Query('authorId') authorId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user?.id || req.user?.sub || '';
    return this.feedService.listFeed({
      category,
      department,
      q,
      authorId,
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
      privacy?: string;
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

  @UseGuards(JwtAuthGuard)
  @Put('comments/:commentId')
  async updateComment(
    @Request() req: any,
    @Param('commentId') commentId: string,
    @Body() body: { content: string },
  ) {
    const userId = req.user?.id || req.user?.sub || 'anonymous';
    return this.feedService.updateComment(userId, commentId, body?.content);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comments/:commentId')
  async deleteComment(
    @Request() req: any,
    @Param('commentId') commentId: string,
  ) {
    const userId = req.user?.id || req.user?.sub || 'anonymous';
    return this.feedService.deleteComment(userId, commentId);
  }

  @Post(':id/share')
  async sharePost(@Param('id') id: string) {
    return this.feedService.sharePost(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updatePost(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const userId = req.user?.id || req.user?.sub || '';
    return this.feedService.updatePost(userId, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deletePost(
    @Request() req: any,
    @Param('id') id: string,
  ) {
    const userId = req.user?.id || req.user?.sub || '';
    return this.feedService.deletePost(userId, id);
  }

}
