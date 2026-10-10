/* eslint-disable */
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
import { TasksService } from './tasks.service';
import { TaskItem, TaskFilterDto, CreateTaskDto, UpdateTaskDto } from './dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async getTasks(
    @Query('department') department?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.tasksService.getAllTasks({ department, status, priority, keyword });
  }

  @Get(':id')
  async getTask(@Param('id') id: string) {
    return this.tasksService.getTaskById(id);
  }

  @Post()
  async createTask(@Request() req: any, @Body() data: Partial<TaskItem>) {
    const creator = req?.user?.fullName || req?.user?.name || 'Ban Quản trị';
    return this.tasksService.createTask(data, creator);
  }

  @Put(':id')
  async updateTask(@Request() req: any, @Param('id') id: string, @Body() data: Partial<TaskItem>) {
    const updater = req?.user?.fullName || req?.user?.name || 'Người quản trị';
    return this.tasksService.updateTask(id, data, updater);
  }

  @Patch(':id/status')
  async updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body('status') status: TaskItem['status'],
  ) {
    const actor = req?.user?.fullName || req?.user?.name || 'Người quản trị';
    return this.tasksService.updateStatus(id, status, actor);
  }

  @Patch(':id/progress')
  async updateProgress(
    @Request() req: any,
    @Param('id') id: string,
    @Body('progress') progress: number,
  ) {
    const actor = req?.user?.fullName || req?.user?.name || 'Người quản trị';
    return this.tasksService.updateProgress(id, Number(progress), actor);
  }

  @Post(':id/comments')
  async addComment(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { content: string; authorName?: string; authorRole?: string },
  ) {
    const authorName = body.authorName || req?.user?.fullName || 'Hội viên';
    const authorRole = body.authorRole || req?.user?.role || 'Hội viên';
    return this.tasksService.addComment(id, {
      content: body.content,
      authorName,
      authorRole,
    });
  }

  @Patch(':id/subtasks/:subtaskId/toggle')
  async toggleSubtask(
    @Request() req: any,
    @Param('id') id: string,
    @Param('subtaskId') subtaskId: string,
  ) {
    const actor = req?.user?.fullName || req?.user?.name || 'Người quản trị';
    return this.tasksService.toggleSubtask(id, subtaskId, actor);
  }

  @Post(':id/accept')
  async acceptTask(@Request() req: any, @Param('id') id: string, @Body('actorName') explicitActor?: string) {
    const actor = explicitActor || req?.user?.fullName || req?.user?.name || 'Người phụ trách';
    return this.tasksService.acceptTask(id, actor);
  }

  @Post(':id/decline')
  async declineTask(
    @Request() req: any,
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Body('actorName') explicitActor?: string,
  ) {
    const actor = explicitActor || req?.user?.fullName || req?.user?.name || 'Người phụ trách';
    return this.tasksService.declineTask(id, reason || 'Không thể tiếp nhận vì lý do chuyên môn', actor);
  }

  @Post(':id/submit-review')
  async submitReview(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { deliverables?: string; note?: string; actorName?: string },
  ) {
    const actor = body.actorName || req?.user?.fullName || req?.user?.name || 'Người phụ trách';
    return this.tasksService.submitTaskReview(id, body, actor);
  }

  @Post(':id/evaluate')
  async evaluateProgress(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { rating?: number; statusAssessment: 'ON_TRACK' | 'AT_RISK' | 'DELAYED' | 'AHEAD'; feedback: string; actorName?: string },
  ) {
    const actor = body.actorName || req?.user?.fullName || req?.user?.name || 'Ban Quản trị';
    return this.tasksService.evaluateProgress(id, body, actor);
  }

  @Post(':id/approve')
  async approveTask(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { rating?: number; feedback?: string; actorName?: string },
  ) {
    const actor = body.actorName || req?.user?.fullName || req?.user?.name || 'Ban Quản trị';
    return this.tasksService.approveTask(id, body, actor);
  }

  @Post(':id/rework')
  async requestRework(
    @Request() req: any,
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Body('actorName') explicitActor?: string,
  ) {
    const actor = explicitActor || req?.user?.fullName || req?.user?.name || 'Ban Quản trị';
    return this.tasksService.requestTaskRework(id, reason || 'Yêu cầu hoàn thiện lại kết quả', actor);
  }

  @Post(':id/remind')
  async remindTask(@Request() req: any, @Param('id') id: string, @Body('actorName') explicitActor?: string) {
    const actor = explicitActor || req?.user?.fullName || req?.user?.name || 'Ban Quản trị';
    return this.tasksService.remindTask(id, actor);
  }

  @Post(':id/attachments')
  async addAttachment(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { name: string; url: string; size?: string; type?: string; isDeliverable?: boolean; actorName?: string },
  ) {
    const actor = body.actorName || req?.user?.fullName || req?.user?.name || 'Người dùng';
    return this.tasksService.addAttachment(id, body, actor);
  }

  @Delete(':id/attachments/:attachmentIndex')
  async deleteAttachment(
    @Request() req: any,
    @Param('id') id: string,
    @Param('attachmentIndex') attachmentIndex: string,
    @Query('actorName') explicitActor?: string,
  ) {
    const actor = explicitActor || req?.user?.fullName || req?.user?.name || 'Người dùng';
    return this.tasksService.deleteAttachment(id, attachmentIndex, actor);
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string) {
    return this.tasksService.deleteTask(id);
  }
}
