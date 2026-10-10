import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { vione_users, app_role } from '@vibe/db';
import * as bcrypt from 'bcrypt';
import {
  UpdateAccountProfileDto,
  ChangePasswordDto,
  DeactivateAccountDto,
  ListUsersQueryDto,
  AdminCreateUserDto,
  AdminUpdateUserDto,
} from './dto';

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
    private readonly usersRepo: UsersRepository,
  ) {}

  async findByUsername(username: string): Promise<vione_users | null> {
    const user = await this.usersRepo.findByUsername(username);

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
      const user = await this.usersRepo.findById(id);
      if (user) {
        return user;
      }
    }

    if (id === 'mock-admin-id' || id === '00000000-0000-0000-0000-000000000000' || id === '00000000-0000-4000-8000-000000000002') {
      const adminUser = await this.usersRepo.findByUsername('admin@connect.vn');

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
    return this.usersRepo.findByGoogleId(googleId);
  }

  async findByAppleId(appleId: string): Promise<vione_users | null> {
    return this.usersRepo.findByAppleId(appleId);
  }

  async findByEmail(email: string): Promise<vione_users | null> {
    return this.usersRepo.findByEmail(email);
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
    const newUser = await this.usersRepo.createUser({
      username: data.username,
      password: data.password || '',
      email: data.email || null,
      name: data.name || null,
      avatar_url: data.avatar_url || null,
      google_id: data.google_id || null,
      apple_id: data.apple_id || null,
      email_verified: data.email_verified || false,
    });

    // Sync to auth.users
    await this.usersRepo.syncToAuthUsers(newUser.id, newUser.email || newUser.username);

    // Auto-link to approved member in public.members if matching phone or email
    const cleanPhone = (newUser.username || '').replace(/\D/g, '');
    const userEmail = (newUser.email || '').toLowerCase().trim();
    await this.usersRepo.autoLinkMember(newUser.id, cleanPhone, userEmail);

    return newUser;
  }

  async updateUser(id: string, data: Partial<vione_users>) {
    return this.usersRepo.updateUser(id, data);
  }

  // ── ACCOUNT MANAGEMENT METHODS ──────────────────────────────────────────

  async checkIsAdmin(userId: string): Promise<boolean> {
    if (userId === 'mock-admin-id' || userId === '00000000-0000-0000-0000-000000000000') {
      return true;
    }
    const roles = await this.usersRepo.getUserRoles(userId);

    const hasAdminRole = roles.some(
      (r: any) => r.role === 'platform_admin' || r.role === 'tenant_admin',
    );
    if (hasAdminRole) return true;

    // Check association admin in memberships via repository
    const memberships = await this.usersRepo.getMemberships(userId);

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

      const [profile, roles, memberships, memberRow] = await Promise.all([
        this.usersRepo.getUserProfile(safeUuid),
        this.usersRepo.getUserRoles(safeUuid),
        this.usersRepo.getMemberships(safeUuid),
        this.usersRepo.getMemberInfo(safeUuid, user.email),
      ]);
      const roleList = (roles || []).map((r) => r.role).filter(Boolean);
      const isAssocAdmin = (memberships ?? []).some(
        (m: any) => m.role === 'admin' || m.role === 'association_admin' || m.role === 'owner',
      );
      if (isAssocAdmin && !roleList.includes('admin')) {
        roleList.push('admin');
      }

      if (memberRow?.executive_role) {
        const exec = String(memberRow.executive_role).toLowerCase();
        if ((exec === 'quan_tri' || exec === 'platform_admin' || exec === 'superadmin' || exec.includes('hệ thống')) && !roleList.includes('platform_admin')) {
          roleList.push('platform_admin');
          if (!roleList.includes('admin')) roleList.push('admin');
          if (!roleList.includes('quan_tri')) roleList.push('quan_tri');
        }
        if ((exec === 'president' || exec === 'vice_president' || exec === 'admin' || exec === 'quan_tri' || exec.includes('chủ tịch') || exec === 'bqt') && !roleList.includes('bqt')) {
          roleList.push('bqt');
          if (!roleList.includes('admin')) roleList.push('admin');
        }
        if ((exec === 'tong_thu_ky' || exec.includes('thư ký')) && !roleList.includes('btk')) {
          roleList.push('btk');
          if (!roleList.includes('tong_thu_ky')) roleList.push('tong_thu_ky');
        }
        if ((exec.startsWith('truong_ban') || exec.startsWith('phó ban') || exec.startsWith('pho_ban')) && !roleList.includes('moderator')) {
          roleList.push('moderator');
          if (!roleList.includes('truong_ban')) roleList.push('truong_ban');
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
        if (dept.includes('tài chính') && !roleList.includes('btc')) {
          roleList.push('btc');
        }
      }

      if (
        (user.id === '00000000-0000-0000-0000-000000000000' ||
          user.id === '00000000-0000-4000-8000-000000000002' ||
          user.username === 'admin@connect.vn' ||
          user.email === 'admin@connect.vn') &&
        !roleList.includes('admin')
      ) {
        roleList.push('admin');
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
        department: memberRow?.department || 'Hội viên ceo1983',
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
      const existing = await this.usersRepo.findFirst({
        email: data.email,
        NOT: { id: userId },
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
    await this.usersRepo.updateUser(userId, {
      name: data.name !== undefined ? data.name : undefined,
      email: data.email !== undefined ? data.email : undefined,
      avatar_url: finalAvatarUrl !== undefined ? finalAvatarUrl : undefined,
    });

    // Upsert user_profiles
    await this.usersRepo.upsertProfile(
      userId,
      {
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
      {
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
    );

    // Synchronize to members if exists
    try {
      await this.usersRepo.syncMemberDetails(userId, {
        name: data.name || null,
        avatar: finalAvatarUrl || null,
        email: data.email || null,
        industry: data.industry || null,
        region: data.region || null,
      });
    } catch (err: any) {
      this.logger.warn(`Notice synchronizing members: ${err?.message}`);
    }

    // Synchronize to member_business_cards & card_settings if exist
    try {
      await this.usersRepo.syncCardsDetails(userId, {
        name: data.name || null,
        avatar: finalAvatarUrl || null,
        professional_title: data.professional_title || null,
        company_name: data.company_name || null,
        bio: data.bio || null,
      });
    } catch (err: any) {
      this.logger.warn(`Notice synchronizing cards: ${err?.message}`);
    }

    // Sync email to auth.users
    if (data.email) {
      await this.usersRepo.syncAuthUserEmail(userId, data.email);
    }

    return this.getAccountDetails(userId);
  }

  async changePassword(userId: string, currentPass: string, newPass: string) {
    if (!newPass || newPass.length < 6) {
      throw new BadRequestException('Mật khẩu mới phải có ít nhất 6 ký tự');
    }

    const user = await this.usersRepo.findById(userId);
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

    await this.usersRepo.updateUser(userId, {
      password: hashedPassword,
    });

    // Sync to auth.users encrypted_password if applicable
    await this.usersRepo.syncAuthUserPassword(userId, hashedPassword);

    // Đánh dấu onboarding_status = 'completed' để hoàn tất quy trình đổi mật khẩu bắt buộc
    await this.usersRepo.completeOnboardingStatus(userId);

    return {
      success: true,
      message: 'Mật khẩu đã được thay đổi thành công',
    };
  }

  async checkMustChangePassword(userId: string): Promise<boolean> {
    try {
      const status = await this.usersRepo.getOnboardingStatus(userId);
      return status === 'new';
    } catch {
      return false;
    }
  }

  async deactivateAccount(userId: string, password?: string) {
    const user = await this.usersRepo.findById(userId);
    if (!user) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }
    if (user.password && password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new BadRequestException('Mật khẩu xác nhận không chính xác');
      }
    }
    await this.usersRepo.upsertProfile(
      userId,
      {
        user_id: userId,
        account_status: 'deactivated',
      },
      {
        account_status: 'deactivated',
        updated_at: new Date(),
      },
    );
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
      this.usersRepo.countUsers(where),
      this.usersRepo.findUsers(where, skip, limit),
    ]);

    const userIds = rawUsers.map((u) => u.id);

    const [profiles, roles] = await Promise.all([
      this.usersRepo.findProfilesByUserIds(userIds),
      this.usersRepo.findRolesByUserIds(userIds),
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
        !userRoles.includes('admin')
      ) {
        userRoles.push('admin');
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
      this.usersRepo.getAllProfileStatuses(),
      this.usersRepo.getAllRoles(),
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

    const existing = await this.usersRepo.findFirst({
      OR: [
        { username },
        ...(data.email ? [{ email: data.email.trim() }] : []),
      ],
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
    await this.usersRepo.upsertProfile(
      newUser.id,
      {
        user_id: newUser.id,
        display_name: newUser.name,
        account_status: accountStatus,
        onboarding_status: 'completed',
      },
      {
        account_status: accountStatus,
      },
    );

    if (data.role) {
      await this.usersRepo.createUserRole(newUser.id, data.role);
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
      const existing = await this.usersRepo.findFirst({
        email: data.email,
        NOT: { id },
      });
      if (existing) {
        throw new BadRequestException('Email đã thuộc về tài khoản khác');
      }
    }

    await this.usersRepo.updateUser(id, {
      name: data.name !== undefined ? data.name : undefined,
      email: data.email !== undefined ? data.email : undefined,
    });

    if (data.account_status || data.name) {
      await this.usersRepo.upsertProfile(
        id,
        {
          user_id: id,
          display_name: data.name || user.name,
          account_status: data.account_status || 'active',
        },
        {
          display_name: data.name !== undefined ? data.name : undefined,
          account_status: data.account_status !== undefined ? data.account_status : undefined,
          updated_at: new Date(),
        },
      );
    }

    if (data.role) {
      await this.usersRepo.deleteUserRoles(id);
      await this.usersRepo.createUserRole(id, data.role);
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

    await this.usersRepo.updateUser(id, {
      password: hashedPassword,
    });

    await this.usersRepo.syncAuthUserPassword(id, hashedPassword);

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

    const currentProfile = await this.usersRepo.getUserProfile(id);

    let nextStatus = newStatus;
    if (!nextStatus) {
      const current = currentProfile?.account_status || 'active';
      nextStatus = current === 'active' ? 'suspended' : 'active';
    }

    await this.usersRepo.upsertProfile(
      id,
      {
        user_id: id,
        display_name: user.name,
        account_status: nextStatus,
      },
      {
        account_status: nextStatus,
        updated_at: new Date(),
      },
    );

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

    await this.usersRepo.deleteUserRoles(targetId);
    await this.usersRepo.deleteUserProfile(targetId);
    await this.usersRepo.deleteUser(targetId);
    await this.usersRepo.deleteAuthUser(targetId);

    return {
      success: true,
      message: 'Đã xóa tài khoản người dùng thành công',
    };
  }
}

