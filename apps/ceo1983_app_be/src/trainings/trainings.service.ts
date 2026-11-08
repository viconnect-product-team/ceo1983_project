import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrainingsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureSchema();
  }

  /**
   * Tự động khởi tạo và chuẩn hóa cấu trúc bảng public.trainings trong PostgreSQL
   * Bổ sung đầy đủ các trường khai báo chuyên nghiệp như Sự kiện (Số lượng học viên, Hạng vé, Địa điểm, v.v. - KHÔNG xếp chỗ)
   */
  async ensureSchema() {
    try {
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS public.trainings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          tagline TEXT,
          instructor_name TEXT,
          instructor_title TEXT,
          instructor_company TEXT,
          description TEXT,
          category TEXT DEFAULT 'Kỹ năng lãnh đạo',
          format TEXT DEFAULT 'hybrid',
          status TEXT DEFAULT 'upcoming',
          start_time TIMESTAMPTZ,
          end_time TIMESTAMPTZ,
          location TEXT,
          address TEXT,
          room_id TEXT,
          room_url TEXT,
          meeting_passcode TEXT DEFAULT '198388',
          video_provider TEXT DEFAULT 'jitsi',
          max_attendees INTEGER DEFAULT 100,
          attendee_count INTEGER DEFAULT 0,
          ticket_tiers JSONB DEFAULT '[]'::jsonb,
          materials JSONB DEFAULT '[]'::jsonb,
          cover_image TEXT,
          registration_url TEXT,
          open_registration BOOLEAN DEFAULT true,
          created_by UUID,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // Add columns safely if table already existed
      const columnsToAdd = [
        `ALTER TABLE public.trainings ADD COLUMN IF NOT EXISTS tagline TEXT;`,
        `ALTER TABLE public.trainings ADD COLUMN IF NOT EXISTS instructor_company TEXT;`,
        `ALTER TABLE public.trainings ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Kỹ năng lãnh đạo';`,
        `ALTER TABLE public.trainings ADD COLUMN IF NOT EXISTS format TEXT DEFAULT 'hybrid';`,
        `ALTER TABLE public.trainings ADD COLUMN IF NOT EXISTS location TEXT;`,
        `ALTER TABLE public.trainings ADD COLUMN IF NOT EXISTS address TEXT;`,
        `ALTER TABLE public.trainings ADD COLUMN IF NOT EXISTS meeting_passcode TEXT DEFAULT '198388';`,
        `ALTER TABLE public.trainings ADD COLUMN IF NOT EXISTS max_attendees INTEGER DEFAULT 100;`,
        `ALTER TABLE public.trainings ADD COLUMN IF NOT EXISTS attendee_count INTEGER DEFAULT 0;`,
        `ALTER TABLE public.trainings ADD COLUMN IF NOT EXISTS ticket_tiers JSONB DEFAULT '[]'::jsonb;`,
        `ALTER TABLE public.trainings ADD COLUMN IF NOT EXISTS cover_image TEXT;`,
        `ALTER TABLE public.trainings ADD COLUMN IF NOT EXISTS registration_url TEXT;`,
        `ALTER TABLE public.trainings ADD COLUMN IF NOT EXISTS open_registration BOOLEAN DEFAULT true;`,
      ];

      for (const sql of columnsToAdd) {
        await this.prisma.$executeRawUnsafe(sql).catch(() => {});
      }
    } catch (e) {
      console.warn('Could not ensure trainings schema:', e);
    }
  }

  async listTrainings(query?: {
    status?: string;
    search?: string;
    format?: string;
    category?: string;
  }) {
    let sqlWhere = `1=1`;
    if (query?.status && query.status !== 'all') {
      sqlWhere += ` AND status = '${query.status.replace(/'/g, "''")}'`;
    }
    if (query?.format && query.format !== 'all') {
      sqlWhere += ` AND format = '${query.format.replace(/'/g, "''")}'`;
    }
    if (query?.category && query.category !== 'all') {
      sqlWhere += ` AND category = '${query.category.replace(/'/g, "''")}'`;
    }
    if (query?.search?.trim()) {
      const s = query.search.trim().replace(/'/g, "''");
      sqlWhere += ` AND (title ILIKE '%${s}%' OR instructor_name ILIKE '%${s}%' OR description ILIKE '%${s}%' OR location ILIKE '%${s}%')`;
    }

    const items = await this.prisma
      .$queryRawUnsafe<any[]>(
        `
      SELECT * FROM public.trainings
      WHERE ${sqlWhere}
      ORDER BY 
        CASE WHEN status = 'ongoing' THEN 1 WHEN status = 'upcoming' THEN 2 ELSE 3 END,
        start_time ASC
    `,
      )
      .catch(() => []);

    return {
      success: true,
      items: items.map((t) => ({
        ...t,
        materials:
          typeof t.materials === 'string'
            ? JSON.parse(t.materials)
            : t.materials || [],
        ticket_tiers:
          typeof t.ticket_tiers === 'string'
            ? JSON.parse(t.ticket_tiers)
            : t.ticket_tiers || [],
      })),
    };
  }

  async getTrainingById(id: string) {
    const list = await this.prisma
      .$queryRawUnsafe<any[]>(
        `
      SELECT * FROM public.trainings WHERE id::text = '${id.replace(/'/g, "''")}' LIMIT 1;
    `,
      )
      .catch(() => []);

    if (!list.length) {
      throw new NotFoundException('Không tìm thấy phòng đào tạo');
    }

    const attendees = await this.prisma
      .$queryRawUnsafe<any[]>(
        `
      SELECT ta.*, m.name, m.company_name, m.avatar, m.phone, m.department
      FROM public.training_attendees ta
      LEFT JOIN public.members m ON (m.id = ta.member_id OR m.user_id::text = ta.member_id)
      WHERE ta.training_id::text = '${id.replace(/'/g, "''")}'
      ORDER BY ta.joined_at DESC;
    `,
      )
      .catch(() => []);

    const training = list[0];
    return {
      success: true,
      data: {
        ...training,
        materials:
          typeof training.materials === 'string'
            ? JSON.parse(training.materials)
            : training.materials || [],
        ticket_tiers:
          typeof training.ticket_tiers === 'string'
            ? JSON.parse(training.ticket_tiers)
            : training.ticket_tiers || [],
        attendees,
      },
    };
  }

  async createTraining(data: any, createdByUserId?: string) {
    const title = data.title || 'Buổi Chia Sẻ Doanh Nhân CEO 1983';
    const tagline = data.tagline || '';
    const instructorName = data.instructorName || 'Ban Đào Tạo & Chuyển Đổi Số';
    const instructorTitle = data.instructorTitle || 'Chuyên gia cố vấn CLB';
    const instructorCompany =
      data.instructorCompany || 'CLB Doanh Nhân CEO 1983';
    const description = data.description || '';
    const category = data.category || 'Kỹ năng lãnh đạo';
    const format = data.format || 'hybrid';
    const rawRoomId =
      data.roomId || `CEO1983_${Date.now().toString(36).toUpperCase()}`;
    const roomId = rawRoomId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const roomUrl = data.roomUrl || `https://meet.jit.si/${roomId}`;
    const meetingPasscode = data.meetingPasscode || '198388';
    const startTime = data.startTime
      ? new Date(data.startTime)
      : new Date(Date.now() + 3600000);
    const endTime = data.endTime
      ? new Date(data.endTime)
      : new Date(Date.now() + 7200000);
    const location =
      data.location ||
      (format === 'online'
        ? 'Phòng họp trực tuyến Video Call Jitsi'
        : 'Keangnam Landmark 72, Hà Nội');
    const address = data.address || '';
    const maxAttendees = data.maxAttendees ? parseInt(data.maxAttendees) : 100;
    const materialsJson = JSON.stringify(data.materials || []);
    const ticketTiersJson = JSON.stringify(
      data.ticketTiers || [
        {
          name: 'Vé Hội Viên CEO 1983',
          price: 0,
          quantity: maxAttendees,
          description: 'Đặc quyền miễn phí 100% dành cho hội viên chính thức',
        },
      ],
    );
    const coverImage = data.coverImage || '';
    const registrationUrl = data.registrationUrl || '';
    const openRegistration = data.openRegistration !== false;

    const result = await this.prisma
      .$queryRawUnsafe<any[]>(
        `
      INSERT INTO public.trainings (
        title, tagline, instructor_name, instructor_title, instructor_company, description, category, format,
        room_id, room_url, meeting_passcode, video_provider, status, start_time, end_time, location, address,
        materials, ticket_tiers, max_attendees, cover_image, registration_url, open_registration, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18::jsonb, $19::jsonb, $20, $21, $22, $23, ${createdByUserId ? `'${createdByUserId}'::uuid` : 'NULL'}
      )
      RETURNING *;
    `,
        title,
        tagline,
        instructorName,
        instructorTitle,
        instructorCompany,
        description,
        category,
        format,
        roomId,
        roomUrl,
        meetingPasscode,
        data.videoProvider || 'jitsi',
        data.status || 'upcoming',
        startTime,
        endTime,
        location,
        address,
        materialsJson,
        ticketTiersJson,
        maxAttendees,
        coverImage,
        registrationUrl,
        openRegistration,
      )
      .catch((e) => {
        console.error('Create training error:', e);
        throw new BadRequestException('Lỗi tạo khóa đào tạo: ' + e?.message);
      });

    return {
      success: true,
      data: result[0],
    };
  }

  async updateTraining(id: string, data: any) {
    const list = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT id FROM public.trainings WHERE id::text = '${id.replace(/'/g, "''")}' LIMIT 1;
    `);
    if (!list.length)
      throw new NotFoundException('Không tìm thấy phòng đào tạo');

    const updates: string[] = [];
    if (data.title) updates.push(`title = '${data.title.replace(/'/g, "''")}'`);
    if (data.tagline !== undefined)
      updates.push(`tagline = '${data.tagline.replace(/'/g, "''")}'`);
    if (data.instructorName)
      updates.push(
        `instructor_name = '${data.instructorName.replace(/'/g, "''")}'`,
      );
    if (data.instructorTitle !== undefined)
      updates.push(
        `instructor_title = '${data.instructorTitle.replace(/'/g, "''")}'`,
      );
    if (data.instructorCompany !== undefined)
      updates.push(
        `instructor_company = '${data.instructorCompany.replace(/'/g, "''")}'`,
      );
    if (data.description !== undefined)
      updates.push(`description = '${data.description.replace(/'/g, "''")}'`);
    if (data.category !== undefined)
      updates.push(`category = '${data.category.replace(/'/g, "''")}'`);
    if (data.format !== undefined)
      updates.push(`format = '${data.format.replace(/'/g, "''")}'`);
    if (data.status)
      updates.push(`status = '${data.status.replace(/'/g, "''")}'`);
    if (data.roomUrl)
      updates.push(`room_url = '${data.roomUrl.replace(/'/g, "''")}'`);
    if (data.meetingPasscode !== undefined)
      updates.push(
        `meeting_passcode = '${data.meetingPasscode.replace(/'/g, "''")}'`,
      );
    if (data.startTime)
      updates.push(
        `start_time = '${new Date(data.startTime).toISOString()}'::timestamptz`,
      );
    if (data.endTime)
      updates.push(
        `end_time = '${new Date(data.endTime).toISOString()}'::timestamptz`,
      );
    if (data.location !== undefined)
      updates.push(`location = '${data.location.replace(/'/g, "''")}'`);
    if (data.address !== undefined)
      updates.push(`address = '${data.address.replace(/'/g, "''")}'`);
    if (data.materials)
      updates.push(`materials = '${JSON.stringify(data.materials)}'::jsonb`);
    if (data.ticketTiers)
      updates.push(
        `ticket_tiers = '${JSON.stringify(data.ticketTiers)}'::jsonb`,
      );
    if (data.maxAttendees)
      updates.push(`max_attendees = ${parseInt(data.maxAttendees)}`);
    if (data.coverImage !== undefined)
      updates.push(`cover_image = '${data.coverImage.replace(/'/g, "''")}'`);
    if (data.registrationUrl !== undefined)
      updates.push(
        `registration_url = '${data.registrationUrl.replace(/'/g, "''")}'`,
      );
    if (data.openRegistration !== undefined)
      updates.push(
        `open_registration = ${data.openRegistration ? 'true' : 'false'}`,
      );
    updates.push(`updated_at = now()`);

    await this.prisma.$executeRawUnsafe(`
      UPDATE public.trainings SET ${updates.join(', ')} WHERE id::text = '${id.replace(/'/g, "''")}';
    `);

    return this.getTrainingById(id);
  }

  async joinTraining(id: string, memberId: string, userId?: string) {
    await this.prisma
      .$executeRawUnsafe(
        `
      INSERT INTO public.training_attendees (training_id, member_id, user_id, joined_at, status)
      VALUES ('${id}'::uuid, '${memberId}', ${userId ? `'${userId}'::uuid` : 'NULL'}, now(), 'attended')
      ON CONFLICT (training_id, member_id) DO UPDATE SET joined_at = now(), status = 'attended';
    `,
      )
      .catch(() => null);

    // Update count
    await this.prisma.$executeRawUnsafe(`
      UPDATE public.trainings 
      SET attendee_count = (SELECT COUNT(*) FROM public.training_attendees WHERE training_id::text = '${id}')
      WHERE id::text = '${id}';
    `);

    return {
      success: true,
      message: 'Đã điểm danh vào phòng đào tạo',
    };
  }

  async deleteTraining(id: string) {
    await this.prisma.$executeRawUnsafe(`
      DELETE FROM public.trainings WHERE id::text = '${id.replace(/'/g, "''")}';
    `);
    return { success: true };
  }
}
