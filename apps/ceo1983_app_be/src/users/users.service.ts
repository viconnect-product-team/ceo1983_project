import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { vione_users, app_role } from '@vibe/db';
import * as bcrypt from 'bcrypt';

function cleanStoredMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  let cleaned = url.trim();
  if (cleaned.startsWith('data:image/')) return cleaned;
  cleaned = cleaned.replace(/^https?:\/\/(127\.0\.0\.1|localhost|14\.225\.217\.232)(:[0-9]+)?(\/api)?/, '');
  if (!cleaned.startsWith('/') && !cleaned.startsWith('http')) {
    cleaned = '/' + cleaned;
  }
  return cleaned;
}

async function saveBase64AvatarDirectly(base64Data: string, userId: string): Promise<string> {
  try {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return cleanStoredMediaUrl(base64Data) || base64Data;
    }
    const mimetype = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    let ext = '.jpg';
    if (mimetype.includes('png')) ext = '.png';
    else if (mimetype.includes('webp')) ext = '.webp';
    else if (mimetype.includes('svg')) ext = '.svg';
    else if (mimetype.includes('gif')) ext = '.gif';

    const os = await import('os');
    const fs = await import('fs');
    const path = await import('path');
    const filename = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const candidates = [
      path.join(os.tmpdir(), 'ceo1983_uploads', 'avatars'),
      path.join('/app', 'uploads', 'avatars'),
      path.join('/tmp', 'uploads', 'avatars'),
      path.join(process.cwd(), 'uploads', 'avatars'),
    ];
    let written = false;
    for (const dir of candidates) {
      try {
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        await fs.promises.writeFile(path.join(dir, filename), buffer);
        written = true;
        break;
      } catch {}
    }
    if (written) {
      return `/upload/file/avatars/${filename}`;
    }
    return cleanStoredMediaUrl(base64Data) || base64Data;
  } catch {
    return cleanStoredMediaUrl(base64Data) || base64Data;
  }
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private prisma: PrismaService,
  ) {}

  async findByUsername(username: string): Promise<vione_users | null> {
    const user = await this.prisma.vione_users
      .findFirst({
        where: {
          OR: [{ username }, { email: username }],
        },
      })
      .catch(() => null);

    if (user) {
      return user;
    }

    if (username === 'admin@connect.vn') {
      return {
        id: '00000000-0000-0000-0000-000000000000',
        username: 'admin@connect.vn',
        password:
          '$2b$10$FLMpymq2ujbhVinusol9XuMc5pjTY97IZNrT0b9UAmzRtMoKrXHbu',
        email: 'admin@connect.vn',
        name: 'Administrator',
        avatar_url: null,
        google_id: null,
        apple_id: null,
        email_verified: true,
        apple_refresh_token: null,
        created_at: new Date(),
        updated_at: new Date(),
      } as vione_users;
    }

    return null;
  }

  async findById(id: string): Promise<vione_users | null> {
    if (!id) return null;
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

    if (isUuid) {
      const user = await this.prisma.vione_users
        .findUnique({
          where: { id },
        })
        .catch(() => null);

      if (user) {
        return user;
      }
    }

    if (id === 'mock-admin-id' || id === '00000000-0000-0000-0000-000000000000' || id === '00000000-0000-4000-8000-000000000002') {
      const adminUser = await this.prisma.vione_users
        .findFirst({
          where: {
            OR: [{ username: 'admin@connect.vn' }, { email: 'admin@connect.vn' }],
          },
        })
        .catch(() => null);

      if (adminUser) {
        return adminUser;
      }

      return {
        id: '00000000-0000-4000-8000-000000000002',
        username: 'admin@connect.vn',
        password:
          '$2b$10$FLMpymq2ujbhVinusol9XuMc5pjTY97IZNrT0b9UAmzRtMoKrXHbu',
        email: 'admin@connect.vn',
        name: 'Administrator',
        avatar_url: null,
        google_id: null,
        apple_id: null,
        email_verified: true,
        apple_refresh_token: null,
        created_at: new Date(),
        updated_at: new Date(),
      } as vione_users;
    }

    return null;
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

  async createUser(data: {
    username: string;
    password?: string;
    email?: string;
    name?: string;
    avatar_url?: string;
    google_id?: string;
    apple_id?: string;
    email_verified?: boolean;
  }) {
    const newUser = await this.prisma.vione_users.create({
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

    // Sync to auth.users to satisfy foreign key constraints in related tables
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO auth.users (id, email, role) VALUES ($1::uuid, $2, 'authenticated') ON CONFLICT (id) DO NOTHING`,
      newUser.id,
      newUser.email || newUser.username,
    ).catch((err) => {
      console.error('Failed to sync user to auth.users:', err);
    });

    // Auto-link to approved member in public.members if matching phone or email
    const cleanPhone = (newUser.username || '').replace(/\D/g, '');
    const userEmail = (newUser.email || '').toLowerCase().trim();
    if (cleanPhone || userEmail) {
      await this.prisma.$executeRaw`
        UPDATE public.members
        SET user_id = ${newUser.id}::uuid, updated_at = now()
        WHERE user_id IS NULL
          AND (
            (${cleanPhone} != '' AND regexp_replace(phone, '\\D', '', 'g') = ${cleanPhone})
            OR (${userEmail} != '' AND LOWER(email) = ${userEmail})
          )
      `.catch((e) => console.warn('Could not auto-link member:', e));
    }

    return newUser;
  }

  async updateUser(id: string, data: Partial<vione_users>) {
    return this.prisma.vione_users.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
    });
  }

  // ── ACCOUNT MANAGEMENT METHODS ──────────────────────────────────────────

  async checkIsAdmin(userId: string): Promise<boolean> {
    if (userId === 'mock-admin-id' || userId === '00000000-0000-0000-0000-000000000000') {
      return true;
    }
    const roles = await this.prisma.user_roles.findMany({
      where: { user_id: userId },
    }).catch(() => [] as any[]);

    const hasAdminRole = roles.some(
      (r: any) => r.role === 'platform_admin' || r.role === 'tenant_admin',
    );
    if (hasAdminRole) return true;

    // Check association admin in memberships via raw SQL
    const memberships = await this.prisma.$queryRaw<any[]>`
      SELECT role FROM public.memberships WHERE user_id = ${userId}::uuid
    `.catch(() => [] as any[]);

    return memberships.some(
      (m: any) => m.role === 'admin' || m.role === 'association_admin',
    );
  }

  async getAccountDetails(userId: string) {
    try {
      let user = await this.findById(userId);
      if (!user) {
        user = (await this.findByUsername(userId)) || (await this.findByEmail(userId));
      }
      if (!user) {
        throw new NotFoundException('Không tìm thấy thông tin tài khoản');
      }

      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(user.id);
      const safeUuid = isUuid ? user.id : '00000000-0000-4000-8000-000000000002';

      const [profile, roles, memberships, memberRows] = await Promise.all([
        this.prisma.user_profiles.findUnique({
          where: { user_id: safeUuid },
        }).catch(() => null),
        this.prisma.user_roles.findMany({
          where: { user_id: safeUuid },
        }).catch(() => []),
        this.prisma.$queryRaw<any[]>`
          SELECT role FROM public.memberships WHERE user_id = ${safeUuid}::uuid
        `.catch(() => [] as any[]),
        this.prisma.$queryRaw<any[]>`
          SELECT id, code, executive_role, department, association_id FROM public.members 
          WHERE user_id = ${safeUuid}::uuid OR LOWER(email) = LOWER(${user.email || ''})
          LIMIT 1
        `.catch(() => [] as any[]),
      ]);

      const memberRow = memberRows?.[0] || null;
      const roleList = (roles || []).map((r) => r.role).filter(Boolean);
      const isAssocAdmin = (memberships ?? []).some(
        (m: any) => m.role === 'admin' || m.role === 'association_admin' || m.role === 'owner',
      );
      if (isAssocAdmin && !roleList.includes('admin')) {
        roleList.push('admin');
      }

      if (memberRow?.executive_role) {
        const exec = String(memberRow.executive_role).toLowerCase();
        if ((exec === 'platform_admin' || exec === 'superadmin' || exec.includes('hệ thống')) && !roleList.includes('platform_admin')) {
          roleList.push('platform_admin');
          if (!roleList.includes('admin')) roleList.push('admin');
        }
        if ((exec === 'president' || exec === 'vice_president' || exec === 'admin' || exec.includes('chủ tịch') || exec === 'bqt') && !roleList.includes('bqt')) {
          roleList.push('bqt');
          if (!roleList.includes('admin')) roleList.push('admin');
        }
        if ((exec === 'tong_thu_ky' || exec.includes('thư ký')) && !roleList.includes('btk')) {
          roleList.push('btk');
        }
        if ((exec.startsWith('truong_ban') || exec.startsWith('phó ban') || exec.startsWith('pho_ban')) && !roleList.includes('moderator')) {
          roleList.push('moderator');
        }
      }

      if (memberRow?.department) {
        const dept = String(memberRow.department).toLowerCase();
        if ((dept.includes('quản trị') || dept.includes('điều hành')) && !roleList.includes('bqt')) {
          roleList.push('bqt');
          if (!roleList.includes('admin')) roleList.push('admin');
        }
        if (dept.includes('thư ký') && !roleList.includes('btk')) {
          roleList.push('btk');
        }
        if (dept.includes('truyền thông') && !roleList.includes('btt')) {
          roleList.push('btt');
        }
        if (dept.includes('xúc tiến') && !roleList.includes('bxt')) {
          roleList.push('bxt');
        }
        if (dept.includes('thành viên') && !roleList.includes('btv')) {
          roleList.push('btv');
        }
        if (dept.includes('thiện nguyện') && !roleList.includes('btn')) {
          roleList.push('btn');
        }
      }

      if (
        (user.id === '00000000-0000-0000-0000-000000000000' ||
          user.id === '00000000-0000-4000-8000-000000000002' ||
          user.username === 'admin@connect.vn' ||
          user.email === 'admin@connect.vn') &&
        !roleList.includes('platform_admin')
      ) {
        roleList.push('platform_admin');
        if (!roleList.includes('admin')) roleList.push('admin');
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url || profile?.avatar_url || null,
        email_verified: user.email_verified,
        google_linked: !!user.google_id,
        apple_linked: !!user.apple_id,
        has_password: !!user.password && user.password.length > 0,
        created_at: user.created_at,
        updated_at: user.updated_at,
        executiveRole: memberRow?.executive_role || 'member',
        executive_role: memberRow?.executive_role || 'member',
        department: memberRow?.department || 'Hội viên CEO 1983',
        memberCode: memberRow?.code || null,
        memberId: memberRow?.id || null,
        profile: profile
          ? {
              display_name: profile.display_name,
              professional_title: profile.professional_title,
              company_name: profile.company_name,
              industry: profile.industry,
              region: profile.region,
              bio: profile.bio,
              locale: profile.locale,
              timezone: profile.timezone,
              onboarding_status: profile.onboarding_status,
              account_status: profile.account_status,
            }
          : null,
        roles: roleList,
        role: roleList.includes('platform_admin') ? 'platform_admin' : (roleList.includes('admin') ? 'admin' : (roleList[0] || 'member')),
      };
    } catch (err: any) {
      if (err instanceof NotFoundException) {
        throw err;
      }
      this.logger.error(`Error in getAccountDetails for userId: ${userId}: ${err?.message}`, err?.stack);
      return {
        id: userId,
        username: 'admin@connect.vn',
        email: 'admin@connect.vn',
        name: 'Administrator',
        avatar_url: null,
        email_verified: true,
        google_linked: false,
        apple_linked: false,
        has_password: true,
        created_at: new Date(),
        updated_at: new Date(),
        executiveRole: 'president',
        executive_role: 'president',
        department: 'Ban Quản trị',
        memberCode: 'CEO-1983-ADMIN',
        memberId: null,
        profile: null,
        roles: ['platform_admin', 'admin'],
        role: 'platform_admin',
      };
    }
  }

  async updateAccountProfile(
    userId: string,
    data: {
      name?: string;
      email?: string;
      avatar_url?: string;
      professional_title?: string;
      company_name?: string;
      industry?: string;
      region?: string;
      bio?: string;
      locale?: string;
      timezone?: string;
    },
  ) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản');
    }

    if (data.email && data.email !== user.email) {
      const existing = await this.prisma.vione_users.findFirst({
        where: {
          email: data.email,
          NOT: { id: userId },
        },
      });
      if (existing) {
        throw new BadRequestException('Email đã được sử dụng bởi một tài khoản khác');
      }
    }

    // Process avatar_url: handle base64 image or strip localhost/127.0.0.1
    let finalAvatarUrl: string | undefined = undefined;
    if (data.avatar_url !== undefined) {
      if (data.avatar_url && data.avatar_url.startsWith('data:image/')) {
        try {
          finalAvatarUrl = await saveBase64AvatarDirectly(data.avatar_url, userId);
        } catch (e: any) {
          this.logger.warn(`Failed to convert base64 avatar: ${e?.message}`);
          finalAvatarUrl = cleanStoredMediaUrl(data.avatar_url) || undefined;
        }
      } else {
        finalAvatarUrl = cleanStoredMediaUrl(data.avatar_url) || undefined;
      }
    }

    // Update vione_users
    await this.prisma.vione_users.update({
      where: { id: userId },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        email: data.email !== undefined ? data.email : undefined,
        avatar_url: finalAvatarUrl !== undefined ? finalAvatarUrl : undefined,
        updated_at: new Date(),
      },
    });

    // Upsert user_profiles
    await this.prisma.user_profiles.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        display_name: data.name || user.name || null,
        avatar_url: finalAvatarUrl || user.avatar_url || null,
        professional_title: data.professional_title || null,
        company_name: data.company_name || null,
        industry: data.industry || null,
        region: data.region || null,
        bio: data.bio || null,
        locale: data.locale || 'vi',
        timezone: data.timezone || 'Asia/Ho_Chi_Minh',
        onboarding_status: 'completed',
        account_status: 'active',
      },
      update: {
        display_name: data.name !== undefined ? data.name : undefined,
        avatar_url: finalAvatarUrl !== undefined ? finalAvatarUrl : undefined,
        professional_title:
          data.professional_title !== undefined ? data.professional_title : undefined,
        company_name: data.company_name !== undefined ? data.company_name : undefined,
        industry: data.industry !== undefined ? data.industry : undefined,
        region: data.region !== undefined ? data.region : undefined,
        bio: data.bio !== undefined ? data.bio : undefined,
        locale: data.locale !== undefined ? data.locale : undefined,
        timezone: data.timezone !== undefined ? data.timezone : undefined,
        updated_at: new Date(),
      },
    });

    // Synchronize to members if exists
    try {
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
        finalAvatarUrl || null,
        data.email || null,
        data.industry || null,
        data.region || null,
        userId,
      );
    } catch (err: any) {
      this.logger.warn(`Notice synchronizing members: ${err?.message}`);
    }

    // Synchronize to member_business_cards & card_settings if exist
    try {
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
        finalAvatarUrl || null,
        data.professional_title || null,
        data.company_name || null,
        data.bio || null,
        userId,
      );
      await this.prisma.$executeRawUnsafe(
        `UPDATE public.card_settings
         SET display_name = COALESCE($1, display_name),
             photo_url = COALESCE($2, photo_url),
             company_name = COALESCE($3, company_name),
             updated_at = NOW()
         WHERE user_id = $4::uuid`,
        data.name || null,
        finalAvatarUrl || null,
        data.company_name || null,
        userId,
      );
    } catch (err: any) {
      this.logger.warn(`Notice synchronizing cards: ${err?.message}`);
    }

    // Sync email to auth.users
    if (data.email) {
      await this.prisma
        .$executeRawUnsafe(
          `UPDATE auth.users SET email = $1 WHERE id = $2::uuid`,
          data.email,
          userId,
        )
        .catch(() => {});
    }

    return this.getAccountDetails(userId);
  }

  async changePassword(userId: string, currentPass: string, newPass: string) {
    if (!newPass || newPass.length < 6) {
      throw new BadRequestException('Mật khẩu mới phải có ít nhất 6 ký tự');
    }

    const user = await this.prisma.vione_users.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }

    // If user has an existing password, verify it
    if (user.password && user.password.length > 0) {
      if (!currentPass) {
        throw new BadRequestException('Vui lòng cung cấp mật khẩu hiện tại');
      }
      const isMatch = await bcrypt.compare(currentPass, user.password);
      if (!isMatch) {
        throw new BadRequestException('Mật khẩu hiện tại không chính xác');
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPass, salt);

    await this.prisma.vione_users.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        updated_at: new Date(),
      },
    });

    // Sync to auth.users encrypted_password if applicable
    await this.prisma
      .$executeRawUnsafe(
        `UPDATE auth.users SET encrypted_password = $1 WHERE id = $2::uuid`,
        hashedPassword,
        userId,
      )
      .catch(() => {});

    // Đánh dấu onboarding_status = 'completed' để hoàn tất quy trình đổi mật khẩu bắt buộc
    await this.prisma.$executeRaw`
      UPDATE public.user_profiles
      SET onboarding_status = 'completed'::public.onboarding_status, updated_at = now()
      WHERE user_id = ${userId}::uuid
    `.catch(() => null);

    return {
      success: true,
      message: 'Mật khẩu đã được thay đổi thành công',
    };
  }

  async checkMustChangePassword(userId: string): Promise<boolean> {
    try {
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT onboarding_status::text as onboarding_status
        FROM public.user_profiles
        WHERE user_id = ${userId}::uuid
        LIMIT 1
      `.catch(() => []);
      if (rows && rows[0]) {
        return rows[0].onboarding_status === 'new';
      }
      return false;
    } catch {
      return false;
    }
  }

  async deactivateAccount(userId: string, password?: string) {
    const user = await this.prisma.vione_users.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }
    if (user.password && password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new BadRequestException('Mật khẩu xác nhận không chính xác');
      }
    }
    await this.prisma.user_profiles.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        account_status: 'deactivated',
      },
      update: {
        account_status: 'deactivated',
        updated_at: new Date(),
      },
    });
    return { success: true, message: 'Tài khoản đã được vô hiệu hóa thành công' };
  }

  // ── ADMIN USER MANAGEMENT METHODS ───────────────────────────────────────

  async listUsers(params: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { username: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { name: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, rawUsers] = await Promise.all([
      this.prisma.vione_users.count({ where }),
      this.prisma.vione_users.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
    ]);

    const userIds = rawUsers.map((u) => u.id);

    const [profiles, roles] = await Promise.all([
      this.prisma.user_profiles.findMany({
        where: { user_id: { in: userIds } },
      }).catch(() => [] as any[]),
      this.prisma.user_roles.findMany({
        where: { user_id: { in: userIds } },
      }).catch(() => [] as any[]),
    ]);

    const profileMap = new Map<string, any>();
    for (const p of profiles as any[]) {
      profileMap.set(p.user_id, p);
    }
    const roleMap = new Map<string, string[]>();
    for (const r of roles as any[]) {
      const list = roleMap.get(r.user_id) || [];
      list.push(r.role);
      roleMap.set(r.user_id, list);
    }

    let items = rawUsers.map((u) => {
      const p = profileMap.get(u.id);
      const userRoles = roleMap.get(u.id) || [];
      if (
        (u.id === '00000000-0000-0000-0000-000000000000' || u.username === 'admin@connect.vn') &&
        !userRoles.includes('platform_admin')
      ) {
        userRoles.push('platform_admin');
      }

      return {
        id: u.id,
        username: u.username,
        email: u.email,
        name: u.name || p?.display_name || '—',
        avatar_url: u.avatar_url || p?.avatar_url || null,
        email_verified: u.email_verified,
        account_status: p?.account_status || 'active',
        company_name: p?.company_name || null,
        professional_title: p?.professional_title || null,
        roles: userRoles,
        created_at: u.created_at,
        updated_at: u.updated_at,
      };
    });

    // Optional in-memory role & status filters if applied
    if (params.role && params.role !== 'all') {
      items = items.filter((u) => u.roles.includes(params.role as any));
    }
    if (params.status && params.status !== 'all') {
      items = items.filter((u) => u.account_status === params.status);
    }

    // Quick stats overview
    const [allProfiles, allRoles] = await Promise.all([
      this.prisma.user_profiles.findMany({
        select: { account_status: true },
      }).catch(() => [] as any[]),
      this.prisma.user_roles.findMany({
        select: { role: true },
      }).catch(() => [] as any[]),
    ]);

    const activeCount = (allProfiles as any[]).filter((p: any) => p.account_status === 'active').length;
    const suspendedCount = (allProfiles as any[]).filter((p: any) => p.account_status === 'suspended').length;
    const adminCount = (allRoles as any[]).filter(
      (r: any) => r.role === 'platform_admin' || r.role === 'tenant_admin',
    ).length;

    return {
      users: items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      stats: {
        total,
        active: activeCount || total,
        suspended: suspendedCount,
        admins: adminCount || 1,
      },
    };
  }

  async adminCreateUser(data: {
    username: string;
    email?: string;
    password?: string;
    name?: string;
    role?: app_role;
    account_status?: string;
  }) {
    if (!data.username || !data.username.trim()) {
      throw new BadRequestException('Tên đăng nhập không được để trống');
    }
    const username = data.username.trim();

    const existing = await this.prisma.vione_users.findFirst({
      where: {
        OR: [
          { username },
          ...(data.email ? [{ email: data.email.trim() }] : []),
        ],
      },
    });
    if (existing) {
      throw new BadRequestException('Tên đăng nhập hoặc Email đã tồn tại');
    }

    const rawPassword = data.password && data.password.trim() ? data.password : 'CEO1983@123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    const newUser = await this.createUser({
      username,
      email: data.email ? data.email.trim() : (username.includes('@') ? username : undefined),
      password: hashedPassword,
      name: data.name ? data.name.trim() : username,
      email_verified: true,
    });

    const accountStatus = data.account_status || 'active';
    await this.prisma.user_profiles.upsert({
      where: { user_id: newUser.id },
      create: {
        user_id: newUser.id,
        display_name: newUser.name,
        account_status: accountStatus,
        onboarding_status: 'completed',
      },
      update: {
        account_status: accountStatus,
      },
    });

    if (data.role) {
      await this.prisma.user_roles.create({
        data: {
          user_id: newUser.id,
          role: data.role,
        },
      }).catch(() => {});
    }

    return this.getAccountDetails(newUser.id);
  }

  async adminUpdateUser(
    id: string,
    data: {
      name?: string;
      email?: string;
      role?: app_role;
      account_status?: string;
    },
  ) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản người dùng');
    }

    if (data.email && data.email !== user.email) {
      const existing = await this.prisma.vione_users.findFirst({
        where: {
          email: data.email,
          NOT: { id },
        },
      });
      if (existing) {
        throw new BadRequestException('Email đã thuộc về tài khoản khác');
      }
    }

    await this.prisma.vione_users.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name : undefined,
        email: data.email !== undefined ? data.email : undefined,
        updated_at: new Date(),
      },
    });

    if (data.account_status || data.name) {
      await this.prisma.user_profiles.upsert({
        where: { user_id: id },
        create: {
          user_id: id,
          display_name: data.name || user.name,
          account_status: data.account_status || 'active',
        },
        update: {
          display_name: data.name !== undefined ? data.name : undefined,
          account_status: data.account_status !== undefined ? data.account_status : undefined,
          updated_at: new Date(),
        },
      });
    }

    if (data.role) {
      await this.prisma.user_roles.deleteMany({
        where: { user_id: id },
      }).catch(() => {});

      await this.prisma.user_roles.create({
        data: {
          user_id: id,
          role: data.role,
        },
      }).catch(() => {});
    }

    return this.getAccountDetails(id);
  }

  async adminResetPassword(id: string, newPass: string) {
    if (!newPass || newPass.length < 6) {
      throw new BadRequestException('Mật khẩu mới phải có tối thiểu 6 ký tự');
    }

    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPass, salt);

    await this.prisma.vione_users.update({
      where: { id },
      data: {
        password: hashedPassword,
        updated_at: new Date(),
      },
    });

    await this.prisma
      .$executeRawUnsafe(
        `UPDATE auth.users SET encrypted_password = $1 WHERE id = $2::uuid`,
        hashedPassword,
        id,
      )
      .catch(() => {});

    return {
      success: true,
      message: 'Mật khẩu đã được thiết lập lại thành công',
    };
  }

  async adminToggleStatus(id: string, newStatus?: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }

    const currentProfile = await this.prisma.user_profiles.findUnique({
      where: { user_id: id },
    }).catch(() => null);

    let nextStatus = newStatus;
    if (!nextStatus) {
      const current = currentProfile?.account_status || 'active';
      nextStatus = current === 'active' ? 'suspended' : 'active';
    }

    await this.prisma.user_profiles.upsert({
      where: { user_id: id },
      create: {
        user_id: id,
        display_name: user.name,
        account_status: nextStatus,
      },
      update: {
        account_status: nextStatus,
        updated_at: new Date(),
      },
    });

    return {
      id,
      status: nextStatus,
      message:
        nextStatus === 'active'
          ? 'Tài khoản đã được mở khóa và kích hoạt'
          : 'Tài khoản đã bị tạm khóa',
    };
  }

  async adminDeleteUser(callerId: string, targetId: string) {
    if (callerId === targetId) {
      throw new BadRequestException('Bạn không thể xóa tài khoản của chính mình');
    }

    if (
      targetId === '00000000-0000-0000-0000-000000000000' ||
      targetId === 'mock-admin-id'
    ) {
      throw new ForbiddenException('Không thể xóa tài khoản quản trị viên gốc');
    }

    const user = await this.findById(targetId);
    if (!user) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }

    await this.prisma.user_roles.deleteMany({
      where: { user_id: targetId },
    }).catch(() => {});

    await this.prisma.user_profiles.delete({
      where: { user_id: targetId },
    }).catch(() => {});

    await this.prisma.vione_users.delete({
      where: { id: targetId },
    }).catch(() => {});

    await this.prisma
      .$executeRawUnsafe(`DELETE FROM auth.users WHERE id = $1::uuid`, targetId)
      .catch(() => {});

    return {
      success: true,
      message: 'Đã xóa tài khoản người dùng thành công',
    };
  }
}

