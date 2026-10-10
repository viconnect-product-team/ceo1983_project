import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { vione_users, app_role } from '@vibe/db';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUsername(username: string): Promise<vione_users | null> {
    return this.prisma.vione_users
      .findFirst({
        where: {
          OR: [{ username }, { email: username }],
        },
      })
      .catch(() => null);
  }

  async findById(id: string): Promise<vione_users | null> {
    return this.prisma.vione_users
      .findUnique({
        where: { id },
      })
      .catch(() => null);
  }

  async findByGoogleId(googleId: string): Promise<vione_users | null> {
    return this.prisma.vione_users
      .findUnique({
        where: { google_id: googleId },
      })
      .catch(() => null);
  }

  async findByAppleId(appleId: string): Promise<vione_users | null> {
    return this.prisma.vione_users
      .findUnique({
        where: { apple_id: appleId },
      })
      .catch(() => null);
  }

  async findByEmail(email: string): Promise<vione_users | null> {
    return this.prisma.vione_users
      .findUnique({
        where: { email },
      })
      .catch(() => null);
  }

  async findFirst(where: any): Promise<vione_users | null> {
    return this.prisma.vione_users.findFirst({ where }).catch(() => null);
  }

  async createUser(data: {
    username: string;
    password?: string;
    email?: string | null;
    name?: string | null;
    avatar_url?: string | null;
    google_id?: string | null;
    apple_id?: string | null;
    email_verified?: boolean;
  }): Promise<vione_users> {
    return this.prisma.vione_users.create({
      data: {
        username: data.username,
        password: data.password || '',
        email: data.email || null,
        name: data.name || null,
        avatar_url: data.avatar_url || null,
        google_id: data.google_id || null,
        apple_id: data.apple_id || null,
        email_verified: data.email_verified || false,
      },
    });
  }

  async syncToAuthUsers(id: string, email: string): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO auth.users (id, email, role) VALUES ($1::uuid, $2, 'authenticated') ON CONFLICT (id) DO NOTHING`,
      id,
      email,
    ).catch((err) => {
      console.error('Failed to sync user to auth.users:', err);
    });
  }

  async autoLinkMember(userId: string, cleanPhone: string, userEmail: string): Promise<void> {
    if (cleanPhone || userEmail) {
      await this.prisma.$executeRaw`
        UPDATE public.members
        SET user_id = ${userId}::uuid, updated_at = now()
        WHERE user_id IS NULL
          AND (
            (${cleanPhone} != '' AND regexp_replace(phone, '\\D', '', 'g') = ${cleanPhone})
            OR (${userEmail} != '' AND LOWER(email) = ${userEmail})
          )
      `.catch((e) => console.warn('Could not auto-link member:', e));
    }
  }

  async updateUser(id: string, data: Partial<vione_users>): Promise<vione_users> {
    return this.prisma.vione_users.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
  }

  async getUserRoles(userId: string): Promise<any[]> {
    return this.prisma.user_roles.findMany({
      where: { user_id: userId },
    }).catch(() => []);
  }

  async getMemberships(userId: string): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT role FROM public.memberships WHERE user_id = ${userId}::uuid
    `.catch(() => []);
  }

  async getUserProfile(userId: string): Promise<any> {
    return this.prisma.user_profiles.findUnique({
      where: { user_id: userId },
    }).catch(() => null);
  }

  async getMemberInfo(userId: string, email?: string | null): Promise<any | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, code, executive_role, department, association_id FROM public.members 
      WHERE user_id = ${userId}::uuid OR LOWER(email) = LOWER(${email || ''})
      LIMIT 1
    `.catch(() => []);
    return rows?.[0] || null;
  }

  async upsertProfile(userId: string, createData: any, updateData: any): Promise<any> {
    return this.prisma.user_profiles.upsert({
      where: { user_id: userId },
      create: createData,
      update: updateData,
    });
  }

  async syncMemberDetails(userId: string, data: { name?: string | null; avatar?: string | null; email?: string | null; industry?: string | null; region?: string | null }): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `UPDATE public.members 
       SET name = COALESCE($1, name),
           avatar = COALESCE($2, avatar),
           email = COALESCE($3, email),
           industry = COALESCE($4, industry),
           region = COALESCE($5, region),
           updated_at = NOW()
       WHERE user_id = $6::uuid OR id = $6::text`,
      data.name || null,
      data.avatar || null,
      data.email || null,
      data.industry || null,
      data.region || null,
      userId,
    ).catch(() => {});
  }

  async syncCardsDetails(userId: string, data: { name?: string | null; avatar?: string | null; professional_title?: string | null; company_name?: string | null; bio?: string | null }): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `UPDATE public.member_business_cards
       SET display_name = COALESCE($1, display_name),
           avatar_url = COALESCE($2, avatar_url),
           professional_title = COALESCE($3, professional_title),
           company_name = COALESCE($4, company_name),
           bio = COALESCE($5, bio),
           updated_at = NOW()
       WHERE owner_user_id = $6::uuid`,
      data.name || null,
      data.avatar || null,
      data.professional_title || null,
      data.company_name || null,
      data.bio || null,
      userId,
    ).catch(() => {});

    await this.prisma.$executeRawUnsafe(
      `UPDATE public.card_settings
       SET display_name = COALESCE($1, display_name),
           photo_url = COALESCE($2, photo_url),
           company_name = COALESCE($3, company_name),
           updated_at = NOW()
       WHERE user_id = $4::uuid`,
      data.name || null,
      data.avatar || null,
      data.company_name || null,
      userId,
    ).catch(() => {});
  }

  async syncAuthUserEmail(userId: string, email: string): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `UPDATE auth.users SET email = $1 WHERE id = $2::uuid`,
      email,
      userId,
    ).catch(() => {});
  }

  async syncAuthUserPassword(userId: string, hashedPassword: string): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `UPDATE auth.users SET encrypted_password = $1 WHERE id = $2::uuid`,
      hashedPassword,
      userId,
    ).catch(() => {});
  }

  async completeOnboardingStatus(userId: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE public.user_profiles
      SET onboarding_status = 'completed'::public.onboarding_status, updated_at = now()
      WHERE user_id = ${userId}::uuid
    `.catch(() => null);
  }

  async getOnboardingStatus(userId: string): Promise<string | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT onboarding_status::text as onboarding_status
      FROM public.user_profiles
      WHERE user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);
    return rows?.[0]?.onboarding_status || null;
  }

  async countUsers(where: any): Promise<number> {
    return this.prisma.vione_users.count({ where });
  }

  async findUsers(where: any, skip: number, take: number): Promise<vione_users[]> {
    return this.prisma.vione_users.findMany({
      where,
      skip,
      take,
      orderBy: { created_at: 'desc' },
    });
  }

  async findProfilesByUserIds(userIds: string[]): Promise<any[]> {
    return this.prisma.user_profiles.findMany({
      where: { user_id: { in: userIds } },
    }).catch(() => []);
  }

  async findRolesByUserIds(userIds: string[]): Promise<any[]> {
    return this.prisma.user_roles.findMany({
      where: { user_id: { in: userIds } },
    }).catch(() => []);
  }

  async getAllProfileStatuses(): Promise<{ account_status: any }[]> {
    return this.prisma.user_profiles.findMany({
      select: { account_status: true },
    }).catch(() => []);
  }

  async getAllRoles(): Promise<{ role: any }[]> {
    return this.prisma.user_roles.findMany({
      select: { role: true },
    }).catch(() => []);
  }

  async createUserRole(userId: string, role: app_role): Promise<void> {
    await this.prisma.user_roles.create({
      data: {
        user_id: userId,
        role,
      },
    }).catch(() => {});
  }

  async deleteUserRoles(userId: string): Promise<void> {
    await this.prisma.user_roles.deleteMany({
      where: { user_id: userId },
    }).catch(() => {});
  }

  async deleteUserProfile(userId: string): Promise<void> {
    await this.prisma.user_profiles.delete({
      where: { user_id: userId },
    }).catch(() => {});
  }

  async deleteUser(id: string): Promise<void> {
    await this.prisma.vione_users.delete({
      where: { id },
    }).catch(() => {});
  }

  async deleteAuthUser(id: string): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `DELETE FROM auth.users WHERE id = $1::uuid`,
      id,
    ).catch(() => {});
  }
}
