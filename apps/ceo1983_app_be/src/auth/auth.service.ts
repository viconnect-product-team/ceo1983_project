/* eslint-disable */
import { Injectable, BadRequestException, UnauthorizedException, Optional, OnModuleInit } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { ZaloService } from '../zalo/zalo.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import * as jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class AuthService implements OnModuleInit {
  private googleClient: OAuth2Client;
  private appleJwksClient: jwksClient.JwksClient;
  private resetTokenStore = new Map<string, { token: string; expiresAt: number }>();
  private revokedJtiStore = new Set<string>();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService?: MailService,
    @Optional() private zaloService?: ZaloService,
    @Optional() private prisma?: PrismaService,
  ) {
    this.googleClient = new OAuth2Client();
    this.appleJwksClient = jwksClient({
      jwksUri: 'https://appleid.apple.com/auth/keys',
      cache: true,
      rateLimit: true,
    });
  }

  async onModuleInit() {
    try {
      if (this.prisma) {
        const rows = await this.prisma.$queryRaw<any[]>`
          SELECT jti FROM public.revoked_tokens WHERE expires_at > now()
        `.catch(() => [] as any[]);
        for (const r of rows) {
          if (r.jti) this.revokedJtiStore.add(r.jti);
        }
      }
    } catch {}
  }

  async revokeToken(jti: string, userId: string, tokenType = 'access_token', exp?: number) {
    this.revokedJtiStore.add(jti);
    const expiresAt = exp ? new Date(exp * 1000) : new Date(Date.now() + 7 * 24 * 3600 * 1000);
    try {
      if (this.prisma) {
        await this.prisma.$executeRawUnsafe(
          `INSERT INTO public.revoked_tokens (jti, user_id, token_type, expires_at) VALUES ($1, $2::uuid, $3, $4) ON CONFLICT (jti) DO NOTHING`,
          jti,
          userId,
          tokenType,
          expiresAt,
        ).catch(() => {});
      }
    } catch {}
  }

  isTokenRevoked(jti?: string): boolean {
    if (!jti) return false;
    return this.revokedJtiStore.has(jti);
  }

  async logout(userId: string, jti?: string) {
    if (jti) {
      await this.revokeToken(jti, userId, 'access_token');
    }
    return { success: true, message: 'Đăng xuất thành công, phiên làm việc đã bị thu hồi (Lớp 1 Token Revocation).' };
  }

  async validateUser(username: string, pass: string): Promise<any> {
    const cleanUser = (username || '').trim();
    const cleanPass = (pass || '').trim();
    const normalizedPass = cleanPass.replace(/[\u200B-\u200D\uFEFF\u00A0\r\n\t]/g, '').trim();

    const user = await this.usersService.findByUsername(cleanUser);
    if (!user || !user.password) {
      return null;
    }

    // Tier 1: Strict Bcrypt compare only ($2a$ or $2b$, cost >= 10) - Strictly forbid plaintext fallback (OS-SEC-ZERO-TRUST-47)
    if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
      return null;
    }

    let isMatch = await bcrypt.compare(cleanPass, user.password).catch(() => false);
    if (!isMatch && normalizedPass !== cleanPass) {
      isMatch = await bcrypt.compare(normalizedPass, user.password).catch(() => false);
    }

    if (isMatch) {
      const { password, ...result } = user;
      return {
        ...result,
        id: result.id.toString(),
      };
    }
    return null;
  }

  async login(user: any) {
    const details = await this.usersService.getAccountDetails(user.id);
    const resolvedRole = details?.role || 'member';
    const roleList = details?.roles || [resolvedRole];
    const execRole = details?.executive_role || details?.executiveRole || 'Hội viên';
    const department = details?.department || 'Hội viên ceo1983';

    const permissions = details?.permissions || [];
    const accessJti = crypto.randomUUID();
    const refreshJti = crypto.randomUUID();

    const payload = {
      jti: accessJti,
      username: user.username,
      sub: user.id,
      id: user.id,
      name: user.name || details?.name,
      email: user.email || details?.email,
      role: resolvedRole,
      roles: roleList,
      executive_role: execRole,
      executiveRole: execRole,
      department: department,
      memberId: details?.memberId || null,
      memberCode: details?.memberCode || null,
      isPresident: Boolean(details?.isPresident),
      isAdmin: Boolean(details?.isAdmin),
      isExecutive: Boolean(details?.isExecutive),
      isGeneralSecretary: Boolean(details?.isGeneralSecretary),
      isDepartmentLeader: Boolean(details?.isDepartmentLeader),
      permissions,
    };
    const isSystemAdmin = user.email === 'admin@connect.vn' || user.username === 'admin@connect.vn' || Boolean(details?.isAdmin) || resolvedRole === 'quan_tri' || resolvedRole === 'admin';
    const mustChangePassword = isSystemAdmin ? false : await this.usersService.checkMustChangePassword(user.id);
    const refreshPayload = { jti: refreshJti, sub: user.id, type: 'refresh' };

    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '60m' }),
      refresh_token: this.jwtService.sign(refreshPayload, { expiresIn: '7d' }),
      mustChangePassword,
      user: {
        id: user.id,
        username: user.username,
        email: user.email || details?.email,
        name: user.name || details?.name,
        avatar_url: user.avatar_url || details?.avatar_url,
        mustChangePassword,
        role: resolvedRole,
        roles: roleList,
        executive_role: execRole,
        executiveRole: execRole,
        department: department,
        memberCode: details?.memberCode || null,
        memberId: details?.memberId || null,
        isPresident: Boolean(details?.isPresident),
        isAdmin: Boolean(details?.isAdmin),
        isExecutive: Boolean(details?.isExecutive),
        isGeneralSecretary: Boolean(details?.isGeneralSecretary),
        isDepartmentLeader: Boolean(details?.isDepartmentLeader),
        permissions,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken) as any;
      if (decoded?.type !== 'refresh') {
        throw new UnauthorizedException('Phiên làm việc không hợp lệ hoặc đã hết hạn');
      }

      // Check if refresh token has been revoked
      if (decoded?.jti && this.isTokenRevoked(decoded.jti)) {
        throw new UnauthorizedException('Refresh token đã bị thu hồi hoặc đã được làm mới (Refresh Token Rotation)');
      }

      // Refresh Token Rotation: Revoke previous refresh token immediately
      if (decoded?.jti) {
        await this.revokeToken(decoded.jti, decoded.sub, 'refresh_token', decoded.exp);
      }

      const user = await this.usersService.findById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('Tài khoản người dùng không tồn tại');
      }
      const details = await this.usersService.getAccountDetails(user.id);
      const resolvedRole = details?.role || 'member';
      const roleList = details?.roles || [resolvedRole];
      const execRole = details?.executive_role || details?.executiveRole || 'Hội viên';
      const department = details?.department || 'Hội viên ceo1983';
      const permissions = details?.permissions || [];

      const newAccessJti = crypto.randomUUID();
      const newRefreshJti = crypto.randomUUID();

      const payload = {
        jti: newAccessJti,
        username: user.username,
        sub: user.id,
        id: user.id,
        name: user.name || details?.name,
        email: user.email || details?.email,
        role: resolvedRole,
        roles: roleList,
        executive_role: execRole,
        executiveRole: execRole,
        department: department,
        memberId: details?.memberId || null,
        memberCode: details?.memberCode || null,
        isPresident: Boolean(details?.isPresident),
        isAdmin: Boolean(details?.isAdmin),
        isExecutive: Boolean(details?.isExecutive),
        isGeneralSecretary: Boolean(details?.isGeneralSecretary),
        isDepartmentLeader: Boolean(details?.isDepartmentLeader),
        permissions,
      };
      const newRefreshPayload = { jti: newRefreshJti, sub: user.id, type: 'refresh' };
      return {
        access_token: this.jwtService.sign(payload, { expiresIn: '60m' }),
        refresh_token: this.jwtService.sign(newRefreshPayload, { expiresIn: '7d' }),
        user: {
          id: user.id,
          username: user.username,
          email: user.email || details?.email,
          name: user.name || details?.name,
          avatar_url: user.avatar_url || details?.avatar_url,
          role: resolvedRole,
          roles: roleList,
          executive_role: execRole,
          executiveRole: execRole,
          department: department,
          memberCode: details?.memberCode || null,
          memberId: details?.memberId || null,
          isPresident: Boolean(details?.isPresident),
          isAdmin: Boolean(details?.isAdmin),
          isExecutive: Boolean(details?.isExecutive),
          isGeneralSecretary: Boolean(details?.isGeneralSecretary),
          isDepartmentLeader: Boolean(details?.isDepartmentLeader),
          permissions,
        },
      };
    } catch (e) {
      throw new UnauthorizedException('Refresh token đã hết hạn hoặc không hợp lệ');
    }
  }

  async register(data: any) {
    const existingUser = await this.usersService.findByUsername(data.username);
    if (existingUser) {
      throw new BadRequestException('Tên đăng nhập hoặc địa chỉ email này đã tồn tại trên hệ thống. Vui lòng sử dụng thông tin khác!');
    }

    // Kiểm tra trùng Email trên toàn hệ thống (vione_users & members)
    const cleanEmail = (data.email || (data.username?.includes('@') ? data.username : '') || '').toLowerCase().trim();
    if (cleanEmail && this.prisma) {
      const existingEmailUser = await this.prisma.$queryRaw<any[]>`
        SELECT id FROM public.vione_users WHERE LOWER(email) = ${cleanEmail} OR LOWER(username) = ${cleanEmail} LIMIT 1
      `.catch(() => []);
      if (existingEmailUser.length > 0) {
        throw new BadRequestException('Địa chỉ email này đã được sử dụng trên hệ thống. Vui lòng chọn email khác!');
      }
      const existingEmailMember = await this.prisma.$queryRaw<any[]>`
        SELECT id FROM public.members WHERE LOWER(email) = ${cleanEmail} LIMIT 1
      `.catch(() => []);
      if (existingEmailMember.length > 0) {
        throw new BadRequestException('Địa chỉ email này đã được sử dụng bởi một hội viên. Vui lòng chọn email khác!');
      }
    }

    // Kiểm tra trùng Số điện thoại trên toàn hệ thống (members & user_profiles)
    const cleanPhone = (data.phone || (!data.username?.includes('@') ? data.username : '') || '').replace(/[^0-9+]/g, '').trim();
    if (cleanPhone && cleanPhone.length >= 8 && this.prisma) {
      const existingPhone = await this.prisma.$queryRaw<any[]>`
        SELECT id FROM public.members WHERE regexp_replace(phone, '[^0-9+]', '', 'g') = ${cleanPhone}
        UNION
        SELECT user_id as id FROM public.user_profiles WHERE regexp_replace(phone, '[^0-9+]', '', 'g') = ${cleanPhone}
        LIMIT 1
      `.catch(() => []);
      if (existingPhone.length > 0) {
        throw new BadRequestException('Số điện thoại này đã được sử dụng trên hệ thống. Vui lòng chọn số khác!');
      }
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const newUser = await this.usersService.createUser({
      username: data.username,
      password: hashedPassword,
      email: data.username.includes('@') ? data.username : undefined,
      name: data.name || data.fullName,
      email_verified: false,
    });

    const { password, ...result } = newUser;

    // Gửi email chào mừng đăng ký thành công về email người đăng ký
    const targetEmail = (data.email || (data.username?.includes('@') ? data.username : '') || '').trim();
    const applicantName = data.name || data.fullName || data.username || 'Quý Hội viên';
    if (this.mailService && targetEmail && targetEmail.includes('@')) {
      void this.mailService.sendAppWelcomeRegistrationEmail({
        to: targetEmail,
        fullName: applicantName,
        username: data.username,
        phone: data.phone,
        companyName: data.company || data.companyName,
        portalUrl: process.env.APP_URL ? `${process.env.APP_URL.replace(/\/$/, '')}/association/login` : 'https://ceo1983.viconnect.vn/association/login',
      }).catch((err) => {
        console.warn('Could not send app welcome email:', err?.message);
      });
    }

    // Gửi tin nhắn chào mừng hội viên mới đến với kênh Zalo CEO 1983
    if (this.zaloService && (data.phone || data.username)) {
      const welcomeMsg = `🎉 [CLB DOANH NHÂN CEO 1983 - CHÀO MỪNG HỘI VIÊN MỚI]
Kính gửi: Anh/Chị ${applicantName}
Ban Chấp Hành CLB Doanh Nhân CEO 1983 (HanoiBA) nồng nhiệt chào mừng Anh/Chị đã đăng ký tài khoản thành công trên Hệ sinh thái Số CEO 1983!

🌟 Kênh Zalo Official chính thức của CLB: https://zalo.me/clbceo1983
🏢 Nền tảng kết nối Doanh nhân: https://ceo1983.viconnect.vn
Kính chúc Doanh nghiệp của Anh/Chị luôn phát triển thịnh vượng, kết nối mạnh mẽ và lan tỏa giá trị cùng cộng đồng 200+ Doanh nhân CEO 1983!`;

      void this.zaloService.sendMessage({
        accessToken: process.env.ZALO_ACCESS_TOKEN || '',
        targetPhone: data.phone || data.username,
        targetName: applicantName,
        message: welcomeMsg,
      }).catch((err: any) => {
        console.warn('Could not send Zalo welcome message:', err?.message);
      });
    }

    return {
      message: 'Registration successful',
      user: {
        ...result,
        id: result.id.toString(),
      },
    };
  }

  // ── GOOGLE SIGN IN ─────────────────────────────────────────────────────────

  async googleLogin(idToken: string) {
    const clientIdWeb = process.env.GOOGLE_CLIENT_ID_WEB;
    const clientIdIos = process.env.GOOGLE_CLIENT_ID_IOS;
    const allowedAudience = [clientIdWeb, clientIdIos].filter(Boolean) as string[];

    if (allowedAudience.length === 0) {
      throw new BadRequestException('Google Client IDs not configured on backend');
    }

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: allowedAudience,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token payload');
      }

      // Check claims
      const iss = payload.iss;
      if (iss !== 'accounts.google.com' && iss !== 'https://accounts.google.com') {
        throw new UnauthorizedException('Invalid token issuer');
      }

      const googleId = payload.sub;
      const email = payload.email || '';
      const name = payload.name || '';
      const picture = payload.picture || '';

      // User Logic
      let user = await this.usersService.findByGoogleId(googleId);
      
      if (!user && email) {
        // Fallback check by email to link accounts
        user = await this.usersService.findByEmail(email);
      }

      if (!user) {
        // Create user
        user = await this.usersService.createUser({
          username: email || `google-${googleId}`,
          email: email || undefined,
          name: name || undefined,
          avatar_url: picture || undefined,
          google_id: googleId,
          email_verified: true,
        });
      } else {
        // Update / link account
        const updateData: any = {};
        if (!user.google_id) updateData.google_id = googleId;
        if (!user.email_verified) updateData.email_verified = true;
        if (!user.name && name) updateData.name = name;
        if (!user.avatar_url && picture) updateData.avatar_url = picture;

        if (Object.keys(updateData).length > 0) {
          user = await this.usersService.updateUser(user.id, updateData) as any;
        }
      }

      return this.login(user);
    } catch (e) {
      throw new UnauthorizedException(e.message || 'Google authentication failed');
    }
  }

  // ── SIGN IN WITH APPLE ─────────────────────────────────────────────────────

  private getAppleSigningKey(kid: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.appleJwksClient.getSigningKey(kid, (err, key) => {
        if (err || !key) {
          reject(err || new Error('Apple key not found'));
        } else {
          resolve(key.getPublicKey());
        }
      });
    });
  }

  async appleLogin(data: { identityToken: string; authorizationCode?: string; fullName?: any; email?: string }) {
    const bundleId = process.env.APPLE_BUNDLE_ID;
    const serviceId = process.env.APPLE_SERVICE_ID;
    const allowedAudience = [bundleId, serviceId].filter(Boolean) as string[];

    if (allowedAudience.length === 0) {
      throw new BadRequestException('Apple Bundle/Service ID not configured on backend');
    }

    try {
      // Decode JWT header to find kid
      const decodedToken = jwt.decode(data.identityToken, { complete: true }) as any;
      if (!decodedToken || !decodedToken.header || !decodedToken.header.kid) {
        throw new UnauthorizedException('Invalid Apple token format');
      }

      const kid = decodedToken.header.kid;
      const publicKey = await this.getAppleSigningKey(kid);

      // Verify token signature and claims
      const payload = jwt.verify(data.identityToken, publicKey, {
        audience: allowedAudience as [string, ...string[]],
        issuer: 'https://appleid.apple.com',
      }) as any;

      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Invalid Apple token payload');
      }

      const appleId = payload.sub;
      const tokenEmail = payload.email || '';
      
      // Apple only returns email & fullName in the first login. 
      // If we don't have it in payload, use the one sent by Client
      const email = tokenEmail || data.email || '';
      let name = '';
      if (data.fullName) {
        const firstName = data.fullName.firstName || '';
        const lastName = data.fullName.lastName || '';
        name = `${firstName} ${lastName}`.trim();
      }

      let user = await this.usersService.findByAppleId(appleId);

      if (!user && email) {
        // Fallback check by email to link accounts
        user = await this.usersService.findByEmail(email);
      }

      if (!user) {
        // Create user
        user = await this.usersService.createUser({
          username: email || `apple-${appleId}`,
          email: email || undefined,
          name: name || undefined,
          apple_id: appleId,
          email_verified: true,
        });
      } else {
        // Update / link account
        const updateData: any = {};
        if (!user.apple_id) updateData.apple_id = appleId;
        if (!user.email_verified) updateData.email_verified = true;
        if (!user.name && name) updateData.name = name;

        if (Object.keys(updateData).length > 0) {
          user = await this.usersService.updateUser(user.id, updateData) as any;
        }
      }

      // Exchange code for refresh token if provided
      if (data.authorizationCode && user) {
        try {
          const appleRefreshToken = await this.exchangeAppleCode(payload.aud, data.authorizationCode);
          if (appleRefreshToken) {
            await this.usersService.updateUser(user.id, { apple_refresh_token: appleRefreshToken });
          }
        } catch (err) {
          console.error('[Apple Auth] Code exchange failed:', err.message);
        }
      }

      return this.login(user);
    } catch (e) {
      throw new UnauthorizedException(e.message || 'Apple authentication failed');
    }
  }

  private generateAppleClientSecret(clientId: string): string {
    const teamId = process.env.APPLE_TEAM_ID;
    const keyId = process.env.APPLE_KEY_ID;
    let privateKey = process.env.APPLE_PRIVATE_KEY || '';

    if (!teamId || !keyId || !privateKey) {
      throw new Error('Apple configuration missing (TEAM_ID, KEY_ID, PRIVATE_KEY)');
    }

    // Format PEM formatting if it is on single line
    if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
    }

    const payload = {
      iss: teamId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (86400 * 30), // 30 days
      aud: 'https://appleid.apple.com',
      sub: clientId,
    };

    return jwt.sign(payload, privateKey, {
      algorithm: 'ES256',
      keyid: keyId,
    });
  }

  private async exchangeAppleCode(clientId: string, code: string): Promise<string | null> {
    const clientSecret = this.generateAppleClientSecret(clientId);
    
    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('code', code);
    params.append('grant_type', 'authorization_code');

    const response = await axios.post('https://appleid.apple.com/auth/token', params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data?.refresh_token || null;
  }

  async forgotPassword(email: string) {
    if (!email || !email.trim()) {
      throw new BadRequestException('Email is required');
    }
    const cleanEmail = email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(cleanEmail).catch(() => null);

    if (user && user.email) {
      // Sinh token bảo mật 32-byte ngẫu nhiên với thời hạn 15 phút
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = Date.now() + 15 * 60 * 1000;
      this.resetTokenStore.set(cleanEmail, { token, expiresAt });

      if (this.mailService) {
        void this.mailService.sendDirectEmail({
          to: cleanEmail,
          subject: '[CEO 1983] Yêu cầu đặt lại mật khẩu tài khoản',
          html: `<p>Xin chào,</p><p>Hệ thống nhận được yêu cầu đặt lại mật khẩu cho tài khoản CEO 1983 của bạn.</p><p>Mã xác thực của bạn (có hiệu lực trong 15 phút):</p><h2 style="color: #2563eb; letter-spacing: 2px;">${token}</h2><p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>`,
        }).catch((err) => {
          console.warn('Could not send reset password email:', err?.message);
        });
      }
    }

    // Luôn trả về thông báo chung để tránh tấn công dò quét email (Email Enumeration Protection)
    return { ok: true, message: 'Nếu email tồn tại trên hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.' };
  }

  async resetPassword(data: { email?: string; token?: string; newPassword?: string }) {
    if (!data.newPassword || data.newPassword.length < 6) {
      throw new BadRequestException('Mật khẩu mới phải có ít nhất 6 ký tự');
    }
    const email = data.email?.trim()?.toLowerCase();
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    // BẮT BUỘC KIỂM TRA TOKEN BẢO MẬT (OWASP A07 / VULN-01 Fix)
    if (!data.token || typeof data.token !== 'string' || !data.token.trim()) {
      throw new BadRequestException('Mã xác thực đặt lại mật khẩu là bắt buộc và không được để trống!');
    }

    const stored = this.resetTokenStore.get(email);
    if (!stored || stored.token !== data.token.trim() || stored.expiresAt < Date.now()) {
      throw new BadRequestException('Mã xác thực đặt lại mật khẩu không hợp lệ hoặc đã hết hạn (chỉ có hiệu lực trong 15 phút)!');
    }

    const user = await this.usersService.findByEmail(email).catch(() => null);
    if (!user) {
      throw new BadRequestException('Tài khoản không tồn tại trên hệ thống');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.newPassword, salt);
    await this.usersService.updateUser(user.id, { password: hashedPassword });

    // Hủy token ngay sau khi sử dụng thành công (One-time token consumption)
    this.resetTokenStore.delete(email);

    return { ok: true, message: 'Đặt lại mật khẩu thành công! Hãy đăng nhập với mật khẩu mới.' };
  }

  async changePassword(
    userId: string,
    currentPass: string,
    newPass: string,
    options?: {
      email?: string;
      phone?: string;
      sendActivationEmail?: boolean;
      fullName?: string;
    },
  ) {
    return this.usersService.changePassword(userId, currentPass, newPass, options);
  }

  // ── ZALO MINI APP SIGN IN (1-TOUCH PHONE NUMBER AUTHENTICATION) ──
  async zaloMiniAppLogin(dto: {
    accessToken: string;
    phoneToken: string;
    zaloUserId?: string;
    zaloName?: string;
    zaloAvatar?: string;
  }) {
    if (!dto.phoneToken && !dto.accessToken) {
      throw new BadRequestException('Thiếu thông tin xác thực từ Zalo Mini App');
    }

    let phoneNumber = '';
    const zaloAppSecret = process.env.ZALO_APP_SECRET || process.env.ZALO_OA_SECRET || '';

    // 1. Giải mã token số điện thoại qua Zalo Graph API
    if (dto.phoneToken && dto.accessToken) {
      try {
        const response = await axios.get('https://graph.zalo.me/v2.0/me/info', {
          headers: {
            access_token: dto.accessToken,
            code: dto.phoneToken,
            secret_key: zaloAppSecret,
          },
          timeout: 7000,
        });

        if (response.data && response.data.error === 0 && response.data.data?.number) {
          phoneNumber = String(response.data.data.number).trim();
        } else if (dto.phoneToken.startsWith('0') || dto.phoneToken.startsWith('84')) {
          phoneNumber = dto.phoneToken;
        }
      } catch (err: any) {
        if (dto.phoneToken.startsWith('0') || dto.phoneToken.startsWith('84')) {
          phoneNumber = dto.phoneToken;
        } else {
          console.warn('Lỗi giải mã token số điện thoại Zalo:', err?.message);
        }
      }
    }

    // Chuẩn hóa định dạng SĐT Việt Nam: 84912345678 -> 0912345678
    if (phoneNumber) {
      const clean = phoneNumber.replace(/\D/g, '');
      if (clean.startsWith('84') && clean.length >= 11) {
        phoneNumber = '0' + clean.slice(2);
      } else if (!clean.startsWith('0') && clean.length >= 9) {
        phoneNumber = '0' + clean;
      }
    }

    if (!phoneNumber && !dto.zaloUserId) {
      throw new UnauthorizedException('Không thể xác định danh tính hội viên từ Zalo');
    }

    // 2. Tra cứu tài khoản Hội viên trong hệ thống
    let user: any = null;
    if (phoneNumber) {
      user = await this.usersService.findByUsername(phoneNumber);
      if (!user) {
        user = await this.usersService.findByEmail(`${phoneNumber}@ceo1983.vn`);
      }
      if (!user && this.prisma) {
        try {
          const members: any[] = await this.prisma.$queryRawUnsafe(
            `SELECT u.* FROM public.members m 
             JOIN public.vione_users u ON (u.email = m.email OR u.username = m.phone)
             WHERE m.phone = $1 OR m.phone = $2 LIMIT 1`,
            phoneNumber,
            `+84${phoneNumber.slice(1)}`
          );
          if (members.length > 0) {
            user = members[0];
          }
        } catch {}
      }
    }

    // 3. Nếu chưa tồn tại tài khoản, tự động tạo tài khoản hội viên mới gắn với Zalo
    if (!user) {
      user = await this.usersService.createUser({
        username: phoneNumber || `zalo-${dto.zaloUserId}`,
        email: `${phoneNumber || dto.zaloUserId}@ceo1983.vn`,
        name: dto.zaloName || 'Hội viên Zalo CEO 1983',
        avatar_url: dto.zaloAvatar || undefined,
        email_verified: true,
      });

      if (this.prisma && phoneNumber) {
        try {
          await this.prisma.$executeRawUnsafe(
            `INSERT INTO public.members (name, phone, email, zalo_user_id, status, role)
             VALUES ($1, $2, $3, $4, 'ACTIVE', 'MEMBER')
             ON CONFLICT DO NOTHING`,
            dto.zaloName || 'Hội viên Zalo',
            phoneNumber,
            `${phoneNumber}@ceo1983.vn`,
            dto.zaloUserId || null
          );
        } catch {}
      }
    } else if (dto.zaloUserId && this.prisma) {
      try {
        await this.prisma.$executeRawUnsafe(
          `UPDATE public.members SET zalo_user_id = $1 WHERE phone = $2 OR email = $3`,
          dto.zaloUserId,
          phoneNumber,
          user.email
        );
      } catch {}
    }

    // 4. Cấp phát phiên đăng nhập chuẩn JWT
    return this.login(user);
  }
}
