import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async queryRaw<T = any>(query: TemplateStringsArray, ...values: any[]): Promise<T[]> {
    return this.prisma.$queryRaw<T[]>(query, ...values).catch(() => [] as T[]);
  }

  async executeRaw(query: TemplateStringsArray, ...values: any[]): Promise<number> {
    return this.prisma.$executeRaw(query, ...values).catch(() => 0);
  }

  async queryRawUnsafe<T = any>(query: string, ...values: any[]): Promise<T[]> {
    return this.prisma.$queryRawUnsafe<T[]>(query, ...values).catch(() => [] as T[]);
  }

  async executeRawUnsafe(query: string, ...values: any[]): Promise<number> {
    return this.prisma.$executeRawUnsafe(query, ...values).catch(() => 0);
  }

  async findUserRoles(userId: string): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT role FROM public.user_roles WHERE user_id = ${userId}
    `.catch(() => []);
  }

  async findVioneUser(userId: string): Promise<any | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, username, email FROM public.vione_users WHERE id = ${userId}::uuid
    `.catch(() => []);
    return rows[0] || null;
  }

  async findMemberships(userId: string): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT association_id, role FROM public.memberships WHERE user_id = ${userId}::uuid
    `.catch(() => []);
  }

  async findMemberByUserId(userId: string): Promise<any | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT association_id, role, executive_role, department, code, name, phone, email, avatar
      FROM public.members 
      WHERE user_id = ${userId}::uuid OR id = ${userId}
      LIMIT 1
    `.catch(() => []);
    return rows[0] || null;
  }

  async findFirstAssociation(): Promise<any | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.associations LIMIT 1
    `.catch(() => []);
    return rows[0] || null;
  }

  async findEventById(id: string): Promise<any | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.events WHERE id = ${id} LIMIT 1
    `.catch(() => []);
    return rows[0] || null;
  }

  async findTicketsByEventId(eventId: string): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.event_tickets WHERE event_id = ${eventId}
    `.catch(() => []);
  }

  async deleteEvent(id: string): Promise<void> {
    await this.prisma.$executeRaw`
      DELETE FROM public.event_registrations WHERE event_id = ${id}
    `.catch(() => {});
    await this.prisma.$executeRaw`
      DELETE FROM public.event_tickets WHERE event_id = ${id}
    `.catch(() => {});
    await this.prisma.$executeRaw`
      DELETE FROM public.events WHERE id = ${id}
    `;
  }
}
