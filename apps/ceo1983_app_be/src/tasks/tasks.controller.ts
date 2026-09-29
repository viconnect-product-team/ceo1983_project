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
import { TasksService, TaskItem } from './tasks.service';

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

  @Delete(':id')
  async deleteTask(@Param('id') id: string) {
    return this.tasksService.deleteTask(id);
  }
}
