import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto';

@Controller('documents')
@UseGuards(AuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  async list(@Request() req: any) {
    const userId = req.user.id || req.user.sub;
    return this.documentsService.list(userId);
  }

  @Post()
  async create(@Request() req: any, @Body() data: CreateDocumentDto) {
    const userId = req.user.id || req.user.sub;
    if (!data.name || !data.category || !data.type) {
      throw new BadRequestException('Missing required fields: name, category, or type');
    }
    return this.documentsService.create(userId, data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateDocumentDto) {
    return this.documentsService.update(id, data);
  }

  @Patch(':id/star')
  async toggleStar(@Param('id') id: string) {
    return this.documentsService.toggleStar(id);
  }

  @Patch(':id/share')
  async updateShare(
    @Param('id') id: string,
    @Body() body: { shareScope: string; shareRole: string; sharedWith?: any },
  ) {
    if (!body.shareScope) {
      throw new BadRequestException('shareScope is required');
    }
    return this.documentsService.updateShare(
      id,
      body.shareScope,
      body.shareRole || 'viewer',
      body.sharedWith || [],
    );
  }

  @Post('move')
  async move(@Body() body: { id: string; targetFolderId: string | null }) {
    if (!body.id) {
      throw new BadRequestException('id is required');
    }
    return this.documentsService.move(body.id, body.targetFolderId || null);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.documentsService.delete(id);
  }

  @Get(':id/url')
  async getUrl(@Param('id') id: string) {
    return this.documentsService.getUrl(id);
  }
}
