import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MembersRepository {
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
      SELECT role::text FROM public.user_roles WHERE user_id::text = ${userId}::text
    `.catch(() => []);
  }

  async findMemberships(userId: string, assocId?: string): Promise<any[]> {
    if (assocId) {
      return this.prisma.$queryRaw<any[]>`
        SELECT role FROM public.memberships 
        WHERE user_id = ${userId}::uuid AND association_id = ${assocId}::uuid
      `.catch(() => []);
    }
    return this.prisma.$queryRaw<any[]>`
      SELECT role FROM public.memberships 
      WHERE user_id = ${userId}::uuid
    `.catch(() => []);
  }

  async findMemberById(id: string): Promise<any | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.members WHERE id = ${id} LIMIT 1
    `.catch(() => []);
    return rows[0] || null;
  }

  async findMemberByUserId(userId: string): Promise<any | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.members 
      WHERE user_id = ${userId}::uuid OR id = ${userId}
      LIMIT 1
    `.catch(() => []);
    return rows[0] || null;
  }

  async findVioneUserById(id: string): Promise<any | null> {
    return this.prisma.vione_users.findUnique({
      where: { id },
    }).catch(() => null);
  }

  async findFirstAssociation(): Promise<any | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.associations LIMIT 1
    `.catch(() => []);
    return rows[0] || null;
  }

  async findDirectoryMembers(assocId: string | null, userId?: string, connectedOnly?: boolean): Promise<any[]> {
    if (connectedOnly && userId) {
      if (assocId) {
        return this.prisma.$queryRaw<any[]>`
          SELECT m.id, m.code, m.name, m.contact, m.phone, m.email, m.about, m.address, m.website,
                 m.industry, m.region, m.type, m.status, m.user_id, m.executive_role,
                 COALESCE(up.avatar_url, bi.avatar_url, vu.avatar_url) as avatar,
                 COALESCE(up.display_name, vu.name, bi.display_name, m.contact, m.name) as person_name,
                 COALESCE(m.executive_role, up.professional_title, bi.job_title, bi.headline, m.industry) as person_title
          FROM public.members m
          INNER JOIN public.user_connections uc ON (
            (uc.requester_user_id = ${userId}::uuid AND (uc.recipient_user_id = m.user_id OR uc.recipient_user_id = m.id::uuid)) OR
            (uc.recipient_user_id = ${userId}::uuid AND (uc.requester_user_id = m.user_id OR uc.requester_user_id = m.id::uuid))
          ) AND uc.status = 'accepted'::public.global_connection_status
          LEFT JOIN public.user_profiles up ON up.user_id = m.user_id
          LEFT JOIN public.business_identities bi ON bi.owner_user_id = m.user_id AND bi.status = 'active'
          LEFT JOIN public.vione_users vu ON vu.id = m.user_id
          WHERE m.association_id = ${assocId}::uuid AND m.status = 'active'
          ORDER BY m.name ASC
        `.catch((err) => {
          console.error('findDirectoryMembers connected assoc query error:', err);
          return [];
        });
      } else {
        return this.prisma.$queryRaw<any[]>`
          SELECT m.id, m.code, m.name, m.contact, m.phone, m.email, m.about, m.address, m.website,
                 m.industry, m.region, m.type, m.status, m.user_id, m.executive_role,
                 COALESCE(up.avatar_url, bi.avatar_url, vu.avatar_url) as avatar,
                 COALESCE(up.display_name, vu.name, bi.display_name, m.contact, m.name) as person_name,
                 COALESCE(m.executive_role, up.professional_title, bi.job_title, bi.headline, m.industry) as person_title
          FROM public.members m
          INNER JOIN public.user_connections uc ON (
            (uc.requester_user_id = ${userId}::uuid AND (uc.recipient_user_id = m.user_id OR uc.recipient_user_id = m.id::uuid)) OR
            (uc.recipient_user_id = ${userId}::uuid AND (uc.requester_user_id = m.user_id OR uc.requester_user_id = m.id::uuid))
          ) AND uc.status = 'accepted'::public.global_connection_status
          LEFT JOIN public.user_profiles up ON up.user_id = m.user_id
          LEFT JOIN public.business_identities bi ON bi.owner_user_id = m.user_id AND bi.status = 'active'
          LEFT JOIN public.vione_users vu ON vu.id = m.user_id
          WHERE m.status = 'active'
          ORDER BY m.name ASC
        `.catch((err) => {
          console.error('findDirectoryMembers connected all query error:', err);
          return [];
        });
      }
    }

    if (assocId) {
      return this.prisma.$queryRaw<any[]>`
        SELECT m.id, m.code, m.name, m.contact, m.phone, m.email, m.about, m.address, m.website,
               m.industry, m.region, m.type, m.status, m.user_id, m.executive_role,
               COALESCE(up.avatar_url, bi.avatar_url, vu.avatar_url) as avatar,
               COALESCE(up.display_name, vu.name, bi.display_name, m.contact, m.name) as person_name,
               COALESCE(m.executive_role, up.professional_title, bi.job_title, bi.headline, m.industry) as person_title
        FROM public.members m
        LEFT JOIN public.user_profiles up ON up.user_id = m.user_id
        LEFT JOIN public.business_identities bi ON bi.owner_user_id = m.user_id AND bi.status = 'active'
        LEFT JOIN public.vione_users vu ON vu.id = m.user_id
        WHERE m.association_id = ${assocId}::uuid AND m.status = 'active'
        ORDER BY m.name ASC
      `.catch((err) => {
        console.error('findDirectoryMembers assoc query error:', err);
        return [];
      });
    }

    return this.prisma.$queryRaw<any[]>`
      SELECT m.id, m.code, m.name, m.contact, m.phone, m.email, m.about, m.address, m.website,
             m.industry, m.region, m.type, m.status, m.user_id, m.executive_role,
             COALESCE(up.avatar_url, bi.avatar_url, vu.avatar_url) as avatar,
             COALESCE(up.display_name, vu.name, bi.display_name, m.contact, m.name) as person_name,
             COALESCE(m.executive_role, up.professional_title, bi.job_title, bi.headline, m.industry) as person_title
      FROM public.members m
      LEFT JOIN public.user_profiles up ON up.user_id = m.user_id
      LEFT JOIN public.business_identities bi ON bi.owner_user_id = m.user_id AND bi.status = 'active'
      LEFT JOIN public.vione_users vu ON vu.id = m.user_id
      WHERE m.status = 'active'
      ORDER BY m.name ASC
    `.catch((err) => {
      console.error('findDirectoryMembers all query error:', err);
      return [];
    });
  }

  async deleteMember(id: string): Promise<void> {
    await this.prisma.$executeRaw`
      DELETE FROM public.members WHERE id = ${id}
    `;
  }
}
