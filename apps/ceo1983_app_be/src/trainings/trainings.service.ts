import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrainingsService {
  constructor(private readonly prisma: PrismaService) {}

  async listTrainings(query?: { status?: string; search?: string }) {
    let sqlWhere = `1=1`;
    if (query?.status && query.status !== 'all') {
      sqlWhere += ` AND status = '${query.status}'`;
    }
    if (query?.search?.trim()) {
      const s = query.search.trim().replace(/'/g, "''");
      sqlWhere += ` AND (title ILIKE '%${s}%' OR instructor_name ILIKE '%${s}%' OR description ILIKE '%${s}%')`;
    }

    const items = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT * FROM public.trainings
      WHERE ${sqlWhere}
      ORDER BY 
        CASE WHEN status = 'ongoing' THEN 1 WHEN status = 'upcoming' THEN 2 ELSE 3 END,
        start_time ASC
    `).catch(() => []);

    return {
      success: true,
      items: items.map(t => ({
        ...t,
        materials: typeof t.materials === 'string' ? JSON.parse(t.materials) : (t.materials || [])
      }))
    };
  }

  async getTrainingById(id: string) {
    const list = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT * FROM public.trainings WHERE id::text = '${id}' LIMIT 1;
    `).catch(() => []);

    if (!list.length) {
      throw new NotFoundException('Không tìm thấy phòng đào tạo');
    }

    const attendees = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT ta.*, m.name, m.company_name, m.avatar, m.phone, m.department
      FROM public.training_attendees ta
      LEFT JOIN public.members m ON (m.id = ta.member_id OR m.user_id::text = ta.member_id)
      WHERE ta.training_id::text = '${id}'
      ORDER BY ta.joined_at DESC;
    `).catch(() => []);

    const training = list[0];
    return {
      success: true,
      data: {
        ...training,
        materials: typeof training.materials === 'string' ? JSON.parse(training.materials) : (training.materials || []),
        attendees
      }
    };
  }

  async createTraining(data: any, createdByUserId?: string) {
    const title = data.title || 'Buổi Chia Sẻ Doanh Nhân CEO 1983';
    const instructorName = data.instructorName || 'Ban Đào Tạo & Chuyển Đổi Số';
    const instructorTitle = data.instructorTitle || 'Chuyên gia cố vấn CLB';
    const description = data.description || '';
    const rawRoomId = data.roomId || `CEO1983_${Date.now().toString(36).toUpperCase()}`;
    const roomId = rawRoomId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const roomUrl = data.roomUrl || `https://meet.jit.si/${roomId}`;
    const startTime = data.startTime ? new Date(data.startTime) : new Date(Date.now() + 3600000);
    const endTime = data.endTime ? new Date(data.endTime) : new Date(Date.now() + 7200000);
    const maxAttendees = data.maxAttendees ? parseInt(data.maxAttendees) : 100;
    const materialsJson = JSON.stringify(data.materials || []);

    const result = await this.prisma.$queryRawUnsafe<any[]>(`
      INSERT INTO public.trainings (
        title, instructor_name, instructor_title, description, room_id, room_url, video_provider,
        status, start_time, end_time, materials, max_attendees, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12, ${createdByUserId ? `'${createdByUserId}'::uuid` : 'NULL'}
      )
      RETURNING *;
    `, title, instructorName, instructorTitle, description, roomId, roomUrl, data.videoProvider || 'jitsi', data.status || 'upcoming', startTime, endTime, materialsJson, maxAttendees).catch(e => {
      console.error('Create training error:', e);
      throw new BadRequestException('Lỗi tạo phòng đào tạo: ' + e?.message);
    });

    return {
      success: true,
      data: result[0]
    };
  }

  async updateTraining(id: string, data: any) {
    const list = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT id FROM public.trainings WHERE id::text = '${id}' LIMIT 1;
    `);
    if (!list.length) throw new NotFoundException('Không tìm thấy phòng đào tạo');

    let updates: string[] = [];
    if (data.title) updates.push(`title = '${data.title.replace(/'/g, "''")}'`);
    if (data.instructorName) updates.push(`instructor_name = '${data.instructorName.replace(/'/g, "''")}'`);
    if (data.instructorTitle !== undefined) updates.push(`instructor_title = '${data.instructorTitle.replace(/'/g, "''")}'`);
    if (data.description !== undefined) updates.push(`description = '${data.description.replace(/'/g, "''")}'`);
    if (data.status) updates.push(`status = '${data.status}'`);
    if (data.roomUrl) updates.push(`room_url = '${data.roomUrl}'`);
    if (data.startTime) updates.push(`start_time = '${new Date(data.startTime).toISOString()}'::timestamptz`);
    if (data.endTime) updates.push(`end_time = '${new Date(data.endTime).toISOString()}'::timestamptz`);
    if (data.materials) updates.push(`materials = '${JSON.stringify(data.materials)}'::jsonb`);
    if (data.maxAttendees) updates.push(`max_attendees = ${parseInt(data.maxAttendees)}`);
    updates.push(`updated_at = now()`);

    await this.prisma.$executeRawUnsafe(`
      UPDATE public.trainings SET ${updates.join(', ')} WHERE id::text = '${id}';
    `);

    return this.getTrainingById(id);
  }

  async joinTraining(id: string, memberId: string, userId?: string) {
    await this.prisma.$executeRawUnsafe(`
      INSERT INTO public.training_attendees (training_id, member_id, user_id, joined_at, status)
      VALUES ('${id}'::uuid, '${memberId}', ${userId ? `'${userId}'::uuid` : 'NULL'}, now(), 'attended')
      ON CONFLICT (training_id, member_id) DO UPDATE SET joined_at = now(), status = 'attended';
    `).catch(() => null);

    // Update count
    await this.prisma.$executeRawUnsafe(`
      UPDATE public.trainings 
      SET attendee_count = (SELECT COUNT(*) FROM public.training_attendees WHERE training_id::text = '${id}')
      WHERE id::text = '${id}';
    `);

    return {
      success: true,
      message: 'Đã điểm danh vào phòng đào tạo'
    };
  }

  async deleteTraining(id: string) {
    await this.prisma.$executeRawUnsafe(`
      DELETE FROM public.trainings WHERE id::text = '${id}';
    `);
    return { success: true };
  }
}
