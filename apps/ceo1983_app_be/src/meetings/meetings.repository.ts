import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MeetingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findConflictMeetings(date: string, time: string, venue: string): Promise<any[]> {
    return this.prisma.$queryRawUnsafe<any[]>(
      `SELECT code, title, date, time, location FROM public.meetings
       WHERE date = $1::date AND time = $2 AND status != 'cancelled' AND LOWER(TRIM(location)) = LOWER(TRIM($3))
       LIMIT 1`,
      date,
      time,
      venue,
    ).catch(() => []);
  }

  async insertMeetingRaw(
    code: string,
    title: string,
    date: string,
    time: string,
    location: string,
    notes: string,
    status: string,
    creatorId: string,
    associationId?: string | null,
  ): Promise<any[]> {
    return this.prisma.$queryRawUnsafe<any[]>(
      `INSERT INTO public.meetings (code, title, date, time, location, notes, status, created_by, association_id, created_at, updated_at)
       VALUES ($1, $2, $3::date, $4, $5, $6, $7, $8::uuid, $9::uuid, NOW(), NOW())
       RETURNING *`,
      code,
      title,
      date,
      time,
      location,
      notes,
      status,
      creatorId,
      associationId || null,
    ).catch(() => []);
  }

  async findUserByPhoneOrName(phone?: string, name?: string): Promise<any[]> {
    if (phone && phone.trim()) {
      const byPhone = await this.prisma.$queryRawUnsafe<any[]>(
        `SELECT user_id, name, phone FROM public.members WHERE phone = $1 OR phone = $2 LIMIT 1`,
        phone.trim(),
        phone.trim().replace(/^0/, '+84'),
      ).catch(() => []);
      if (byPhone.length > 0) return byPhone;
    }

    if (name && name.trim()) {
      return this.prisma.$queryRawUnsafe<any[]>(
        `SELECT user_id, name, phone FROM public.members WHERE LOWER(name) LIKE $1 LIMIT 1`,
        `%${name.trim().toLowerCase()}%`,
      ).catch(() => []);
    }

    return [];
  }

  async listMeetingsRaw(query: string, params: any[]): Promise<any[]> {
    return this.prisma.$queryRawUnsafe<any[]>(query, ...params).catch(() => []);
  }

  async executeRaw(query: string, ...params: any[]): Promise<any> {
    return this.prisma.$executeRawUnsafe(query, ...params).catch(() => {});
  }
}
