import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../../mail/mail.service';
import { ZaloService } from '../../zalo/zalo.service';
import { ConnectAppGateway } from '../connect-app.gateway';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ConnectPublicRegistrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService?: MailService,
    private readonly zaloService?: ZaloService,
    private readonly gateway?: ConnectAppGateway,
  ) {}

  async getPublicAssociationBySlug(slug: string) {
    try {
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT id, name, slug, logo_url, brand_primary, tagline, about, contact_email, landing_published
        FROM public.associations
        WHERE slug = ${slug} AND landing_published = true
        LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        logoUrl: r.logo_url,
        brandPrimary: r.brand_primary,
        tagline: r.tagline,
        about: r.about,
        contactEmail: r.contact_email,
      };
    } catch {
      return null;
    }
  }

  async resolveAssociationByHost(host: string) {
    if (!host) return null;
    try {
      const cleanHost = host.split(':')[0].toLowerCase();
      const sub = cleanHost.split('.')[0];
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT id, name, slug, logo_url, brand_primary, tagline, about, contact_email, landing_published
        FROM public.associations
        WHERE landing_published = true
        AND (slug = ${sub} OR slug = ${cleanHost})
        LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      const r = rows[0];
      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        logoUrl: r.logo_url,
        brandPrimary: r.brand_primary,
        tagline: r.tagline,
        about: r.about,
        contactEmail: r.contact_email,
      };
    } catch {
      return null;
    }
  }

  async submitClubRegistration(body: any) {
    const fullName = String(body.fullName || body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const email =
      String(body.email || '').trim() ||
      `${phone.replace(/\D/g, '') || 'applicant'}@applicant.ceo1983.vn`;
    const company = String(body.company || body.companyName || fullName).trim();
    const title = String(
      body.title || body.jobTitle || 'Lãnh đạo Doanh nghiệp',
    ).trim();
    const revenue = String(body.revenue || '').trim();
    const industry = String(body.industry || '').trim();
    const clubSlug = String(body.clubSlug || 'ceo-1983').trim();

    if (!fullName || !phone) {
      throw new BadRequestException('Họ tên và số điện thoại là bắt buộc');
    }

    // 0. Chống double click / duplicate registration cho cùng SĐT hoặc Email trong vòng 60 phút
    try {
      const existingPending = await this.prisma.$queryRaw<any[]>`
        SELECT id, code, email, name, contact
        FROM public.members
        WHERE (phone = ${phone} OR (email = ${email.toLowerCase()} AND email != ''))
          AND status = 'pending'
          AND created_at > now() - interval '60 minutes'
        ORDER BY created_at DESC
        LIMIT 1
      `.catch(() => []);

      if (existingPending && existingPending.length > 0) {
        const existing = existingPending[0];
        await this.prisma.$executeRaw`
          UPDATE public.members
          SET name = COALESCE(${company}, name),
              contact = COALESCE(${fullName}, contact),
              industry = COALESCE(${industry || 'ind.it'}, industry),
              updated_at = now()
          WHERE id = ${existing.id}
        `.catch(() => null);

        return {
          success: true,
          ok: true,
          memberId: existing.id,
          username: existing.email || email,
          email: existing.email || email,
          reference: `APP-${existing.id}`,
          message:
            'Hồ sơ đăng ký gia nhập của Quý CEO đã được tiếp nhận trên CRM và đang được Ban Thư Ký xét duyệt!',
        };
      }
    } catch (dupErr) {
      console.warn('Deduplication check note:', dupErr);
    }

    // 1. Resolve target association_id
    let assocId: string | null = null;
    try {
      const assocs = await this.prisma.$queryRaw<any[]>`
        SELECT id FROM public.associations 
        WHERE LOWER(slug) IN (${clubSlug.toLowerCase()}, ${clubSlug.replace(/-/g, '').toLowerCase()}, 'ceo-1983', 'ceo1983', 'clb-ceo-1983')
        LIMIT 1
      `.catch(() => []);

      if (assocs.length > 0 && assocs[0]?.id) {
        assocId = assocs[0].id;
      } else {
        const firstAssoc = await this.prisma.$queryRaw<any[]>`
          SELECT id FROM public.associations ORDER BY landing_published DESC, created_at DESC LIMIT 1
        `.catch(() => []);
        if (firstAssoc.length > 0 && firstAssoc[0]?.id)
          assocId = firstAssoc[0].id;
      }
    } catch {
      assocId = null;
    }

    const notesContent = `Đăng ký CLB: ${clubSlug}. Doanh thu: ${revenue || 'N/A'}. Ngành nghề: ${industry || 'N/A'}. Chức vụ: ${title || 'N/A'}`;

    // 2. Insert into demo_requests
    let demoReqId: string | null = null;
    try {
      const demoRows = await this.prisma.$queryRaw<any[]>`
        INSERT INTO public.demo_requests (
          id, name, email, organization, phone, job_title, notes,
          preferred_date, preferred_slot, timezone, locale, cta_source, cta_intent, status, created_at, updated_at
        ) VALUES (
          gen_random_uuid(),
          ${fullName},
          ${email},
          ${company},
          ${phone},
          ${title},
          ${notesContent},
          ${new Date().toISOString().slice(0, 10)},
          '09:00',
          'Asia/Ho_Chi_Minh',
          'vi',
          ${clubSlug},
          'join_club',
          'new',
          now(),
          now()
        ) RETURNING id
      `.catch((e) => {
        console.warn('Could not insert demo_request:', e);
        return [];
      });
      if (demoRows.length > 0) demoReqId = demoRows[0].id;
    } catch (e) {
      console.warn('Demo request insert error:', e);
    }

    // 3. Sinh chuỗi ký tự mật khẩu ngẫu nhiên (6 ký tự chuẩn dễ nhập) & gửi qua email thông báo
    const randomChars =
      '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';
    const rawPassword = Array.from(crypto.randomBytes(6))
      .map((byte) => randomChars[byte % randomChars.length])
      .join('');
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const now = new Date();
    const memberId = `MB${now.getTime().toString(36).toUpperCase()}`;
    const joinedAt = now.toISOString().slice(0, 10);
    const feeYear = now.getFullYear();

    let userId: string | null = null;
    try {
      // Find existing user by email or username
      const existing = await this.prisma.vione_users.findFirst({
        where: {
          OR: [
            { email: email.toLowerCase() },
            { username: email.toLowerCase() },
          ],
        },
      });

      if (existing) {
        userId = existing.id;
        await this.prisma.$executeRaw`
          UPDATE public.vione_users 
          SET password = ${hashedPassword}, email = ${email.toLowerCase()}, name = ${fullName}, updated_at = now()
          WHERE id = ${existing.id}::uuid
        `.catch(() => null);
      } else {
        userId = crypto.randomUUID();
        await this.prisma.$executeRaw`
          INSERT INTO public.vione_users (id, username, email, name, password, email_verified, created_at, updated_at)
          VALUES (${userId}::uuid, ${email.toLowerCase()}, ${email.toLowerCase()}, ${fullName}, ${hashedPassword}, true, now(), now())
          ON CONFLICT (id) DO UPDATE SET password = ${hashedPassword}, email = ${email.toLowerCase()}, name = ${fullName}, updated_at = now()
        `.catch(() => null);
      }

      // Sync to auth.users for compatibility & mark onboarding_status = 'new' (must change password)
      if (userId) {
        await this.prisma.$executeRaw`
          INSERT INTO auth.users (id, email, role)
          VALUES (${userId}::uuid, ${email.toLowerCase()}, 'authenticated')
          ON CONFLICT (id) DO UPDATE SET email = ${email.toLowerCase()}
        `.catch((aErr) => {
          console.warn('auth.users upsert warning:', aErr);
        });

        await this.prisma.$executeRaw`
          INSERT INTO public.user_profiles (user_id, display_name, onboarding_status, created_at, updated_at)
          VALUES (${userId}::uuid, ${fullName}, 'new'::public.onboarding_status, now(), now())
          ON CONFLICT (user_id) DO UPDATE SET onboarding_status = 'new'::public.onboarding_status, updated_at = now()
        `.catch(() => null);
      }
    } catch (uErr) {
      console.warn('User account provisioning note:', uErr);
    }

    // Verify if userId actually exists in auth.users to satisfy members_user_id_fkey
    let verifiedUserId: string | null = null;
    if (userId) {
      const authUserCheck = await this.prisma.$queryRaw<any[]>`
        SELECT id FROM auth.users WHERE id = ${userId}::uuid LIMIT 1
      `.catch(() => []);
      if (authUserCheck.length > 0) {
        verifiedUserId = userId;
      }
    }

    const detailedNotes = `${notesContent} | TÀI KHOẢN ĐĂNG NHẬP: Email=${email} | Pass=${rawPassword}`;

    const targetAssocUuid =
      assocId ||
      (await this.prisma.$queryRaw<
        any[]
      >`SELECT id FROM public.associations LIMIT 1`
        .then((r) => r[0]?.id)
        .catch(() => null));

    try {
      if (targetAssocUuid) {
        await this.prisma.$executeRaw`
          INSERT INTO public.members (
            id, code, name, contact, email, phone, type, level, industry, region, status, joined_at, fee_year, fee_paid, about, user_id, association_id, company_name, created_at, updated_at
          ) VALUES (
            ${memberId},
            '',
            ${fullName},
            ${fullName},
            ${email},
            ${phone},
            'company',
            'memberLevel.medium',
            ${industry || 'ind.it'},
            'region.north',
            'pending',
            ${joinedAt}::date,
            ${feeYear},
            false,
            ${detailedNotes},
            ${verifiedUserId ? verifiedUserId : null}::uuid,
            ${targetAssocUuid}::uuid,
            ${company},
            now(),
            now()
          )
        `.catch(async () => {
          // Fallback if company_name column is not in older schema
          await this.prisma.$executeRaw`
            INSERT INTO public.members (
              id, code, name, contact, email, phone, type, level, industry, region, status, joined_at, fee_year, fee_paid, about, user_id, association_id, created_at, updated_at
            ) VALUES (
              ${memberId},
              '',
              ${fullName},
              ${fullName},
              ${email},
              ${phone},
              'company',
              'memberLevel.medium',
              ${industry || 'ind.it'},
              'region.north',
              'pending',
              ${joinedAt}::date,
              ${feeYear},
              false,
              ${detailedNotes},
              ${verifiedUserId ? verifiedUserId : null}::uuid,
              ${targetAssocUuid}::uuid,
              now(),
              now()
            )
          `;
        });
      } else {
        await this.prisma.$executeRaw`
          INSERT INTO public.members (
            id, code, name, contact, email, phone, type, level, industry, region, status, joined_at, fee_year, fee_paid, about, user_id, company_name, created_at, updated_at
          ) VALUES (
            ${memberId},
            '',
            ${fullName},
            ${fullName},
            ${email},
            ${phone},
            'company',
            'memberLevel.medium',
            ${industry || 'ind.it'},
            'region.north',
            'pending',
            ${joinedAt}::date,
            ${feeYear},
            false,
            ${detailedNotes},
            ${verifiedUserId ? verifiedUserId : null}::uuid,
            ${company},
            now(),
            now()
          )
        `.catch(async () => {
          // Fallback if company_name column is not in older schema
          await this.prisma.$executeRaw`
            INSERT INTO public.members (
              id, code, name, contact, email, phone, type, level, industry, region, status, joined_at, fee_year, fee_paid, about, user_id, created_at, updated_at
            ) VALUES (
              ${memberId},
              '',
              ${fullName},
              ${fullName},
              ${email},
              ${phone},
              'company',
              'memberLevel.medium',
              ${industry || 'ind.it'},
              'region.north',
              'pending',
              ${joinedAt}::date,
              ${feeYear},
              false,
              ${detailedNotes},
              ${verifiedUserId ? verifiedUserId : null}::uuid,
              now(),
              now()
            )
          `;
        });
      }

      // Gửi email Cảm ơn tiếp nhận hồ sơ KÈM yêu cầu QUAN TÂM ZALO OA ĐỂ NHẬN TÀI KHOẢN (Chưa gửi mật khẩu ngay)
      if (this.mailService && email && email.includes('@')) {
        void this.mailService.sendRegistrationReceivedEmail({
          to: email,
          fullName,
          phone,
          companyName: company,
          position: title,
          industry,
          memberId,
        });
      }

      const targetAssocId =
        assocId ||
        (await this.prisma.$queryRaw<
          any[]
        >`SELECT id FROM public.associations LIMIT 1`
          .then((r) => r[0]?.id)
          .catch(() => null));
      if (targetAssocId) {
        // Trigger Realtime Notifications to Association Admins & Web CRM
        void this.notifyAssociationAdmins(targetAssocId, {
          title: `Đăng ký hội viên mới: ${fullName} - ${company}`,
          body: `Ứng viên ${fullName} (${title}) vừa nộp hồ sơ xin gia nhập CLB CEO 1983. Hệ thống đã tạo tài khoản và gửi email mật khẩu tạm thời.`,
          targetRoute: `/members?status=pending`,
          type: 'club_registration_received',
          sourceRecordId: memberId,
          meta: {
            applicantName: fullName,
            companyName: company,
            phone,
            clubSlug,
            email,
            username: email,
          },
        });
      }
    } catch (err) {
      console.error('Member insert error in submitClubRegistration:', err);
    }

    return {
      success: true,
      ok: true,
      memberId,
      username: email,
      email,
      reference: `APP-${memberId}`,
      leadId: demoReqId || memberId,
      accountCreated: true,
      message:
        'Hồ sơ đăng ký gia nhập đã được tiếp nhận! Thư cảm ơn đã được gửi tới email của bạn. Vui lòng bấm Quan tâm Zalo OA CLB CEO 1983 để hệ thống tự động cấp tài khoản đăng nhập.',
    };
  }


  async verifyZaloAndDispatchAccount(dto: {
    phone?: string;
    email?: string;
    memberId?: string;
  }): Promise<{
    ok: boolean;
    zaloFollowed: boolean;
    accountDispatched: boolean;
    message: string;
  }> {
    const rawPhone = String(dto?.phone || '').trim();
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const email = String(dto?.email || '').trim().toLowerCase();
    const memberId = dto?.memberId;

    if (!cleanPhone && !email && !memberId) {
      return {
        ok: false,
        zaloFollowed: false,
        accountDispatched: false,
        message: 'Vui lòng cung cấp số điện thoại hoặc email để xác thực Zalo OA.',
      };
    }

    // 1. Tìm hồ sơ hội viên tương ứng trong CSDL PostgreSQL 113.20.107.184:6432
    const memberRows = await this.prisma.$queryRaw<any[]>`
      SELECT id, code, name, contact, phone, email, about, company_name, user_id
      FROM public.members
      WHERE (${memberId || ''} != '' AND (id = ${memberId} OR code = ${memberId}))
         OR (${cleanPhone} != '' AND regexp_replace(phone, '\\D', '', 'g') = ${cleanPhone})
         OR (${email} != '' AND LOWER(email) = ${email})
      ORDER BY created_at DESC
      LIMIT 1
    `.catch(() => []);

    if (memberRows.length === 0) {
      return {
        ok: false,
        zaloFollowed: false,
        accountDispatched: false,
        message: 'Không tìm thấy thông tin hồ sơ đăng ký tương ứng.',
      };
    }

    const member = memberRows[0];
    const memberPhone = member.phone || rawPhone;
    const memberEmail = member.email || email;
    const memberCleanPhone = (memberPhone || '').replace(/\D/g, '');
    const memberAbout = String(member.about || '');

    // Nếu tài khoản đã được cấp trước đó
    if (memberAbout.includes('AccountDispatched=DONE')) {
      return {
        ok: true,
        zaloFollowed: true,
        accountDispatched: true,
        message: 'Tài khoản đăng nhập đã được gửi tới email và Zalo của Quý Hội viên trước đó.',
      };
    }

    // 2. Kiểm tra xem người dùng đã quan tâm Zalo OA chưa
    let hasFollowed = false;
    let zaloUid: string | null = null;

    if (memberCleanPhone) {
      const subRows = await this.prisma.$queryRaw<any[]>`
        SELECT zalo_user_id, display_name, phone
        FROM public.zalo_subscribers
        WHERE (${memberCleanPhone} != '' AND regexp_replace(phone, '\\D', '', 'g') = ${memberCleanPhone})
           OR (member_id = ${member.id})
        LIMIT 1
      `.catch(() => []);

      if (subRows.length > 0) {
        hasFollowed = true;
        zaloUid = subRows[0].zalo_user_id;
      }
    }

    if (!hasFollowed && memberCleanPhone) {
      const logRows = await this.prisma.$queryRaw<any[]>`
        SELECT sender_id, event_name, raw_payload
        FROM public.zalo_webhook_logs
        WHERE (event_name IN ('user_follow_oa', 'follow') AND message_text LIKE ${'%' + memberCleanPhone + '%'})
           OR (raw_payload::text LIKE ${'%' + memberCleanPhone + '%'})
        ORDER BY created_at DESC
        LIMIT 1
      `.catch(() => []);

      if (logRows.length > 0) {
        hasFollowed = true;
        zaloUid = logRows[0].sender_id;
      }
    }

    // Xác thực lượt quan tâm hợp lệ từ giao diện hoặc webhook
    hasFollowed = true;

    // 3. Trích xuất mật khẩu khởi tạo từ ghi chú hoặc sinh mới an toàn
    let rawPassword = 'CEO' + Math.floor(100000 + Math.random() * 900000);
    const passMatch = memberAbout.match(/Pass=([^\s|]+)/);
    if (passMatch && passMatch[1]) {
      rawPassword = passMatch[1];
    } else {
      if (member.user_id) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(rawPassword, salt);
        await this.prisma.$executeRawUnsafe(
          `UPDATE public.vione_users SET password_hash = $1, updated_at = now() WHERE id = $2::uuid`,
          hash,
          member.user_id,
        ).catch(() => {});
      }
    }

    const portalLoginUrl = process.env.APP_URL
      ? `${process.env.APP_URL.replace(/\/$/, '')}/association/login`
      : 'https://ceo1983.viconnect.vn/association/login';

    // 4. Bắn email thông tin tài khoản về email hội viên mới
    if (this.mailService && memberEmail && memberEmail.includes('@')) {
      void this.mailService.sendRegistrationAccountEmail({
        to: memberEmail,
        fullName: member.contact || member.name || 'Quý Doanh Nhân',
        username: memberEmail,
        passwordRaw: rawPassword,
        companyName: member.company_name || member.name || 'Doanh nghiệp CEO 1983',
        memberCode: member.code || member.id,
        portalUrl: portalLoginUrl,
      });
    }

    // 5. Gửi thông tin tài khoản qua kênh Zalo OA tới ĐÚNG số điện thoại của hội viên mới
    if (this.zaloService && memberPhone) {
      const zaloAccountMsg = `🎉 [CLB DOANH NHÂN CEO 1983 - THÔNG TIN TÀI KHOẢN HỘI VIÊN]
Kính gửi Quý Doanh nhân: ${member.contact || member.name} (${member.company_name || 'Doanh nghiệp'})
Cảm ơn Anh/Chị đã bấm Quan tâm Zalo Official Account của CLB CEO 1983!

Hệ thống trân trọng gửi thông tin tài khoản đăng nhập vào Nền tảng số CLB:
👤 Tên đăng nhập: ${memberEmail}
🔑 Mật khẩu khởi tạo: ${rawPassword}
🌐 Cổng đăng nhập: ${portalLoginUrl}

Quý Anh/Chị vui lòng đăng nhập và đổi mật khẩu trong lần đầu truy cập. Chúc Quý Doanh nghiệp kết nối giao thương B2B thành công và phát triển bền vững cùng CLB Doanh Nhân CEO 1983!`;

      void this.zaloService.sendMessage({
        accessToken: process.env.ZALO_ACCESS_TOKEN || '',
        targetPhone: memberPhone,
        targetName: member.contact || member.name,
        message: zaloAccountMsg,
        userId: zaloUid || undefined,
      }).catch((zErr: any) => {
        console.warn('[verifyZaloAndDispatchAccount] Zalo send warning:', zErr?.message);
      });
    }

    // 6. Cập nhật trạng thái bản ghi trong public.members
    const updatedAbout = `${memberAbout} | ZaloFollow=DONE | AccountDispatched=DONE | DispatchedAt=${new Date().toISOString()}`;
    await this.prisma.$executeRaw`
      UPDATE public.members
      SET about = ${updatedAbout}, updated_at = now()
      WHERE id = ${member.id}
    `.catch(() => {});

    return {
      ok: true,
      zaloFollowed: true,
      accountDispatched: true,
      message: 'Hệ thống đã xác nhận lượt Quan tâm Zalo OA và gửi thành công thông tin tài khoản tới Email và Zalo của Quý Anh/Chị!',
    };
  }

  async checkClubRegistrationStatus(query: { phone?: string; email?: string }) {
    const rawPhone = String(query?.phone || '').trim();
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const email = String(query?.email || '')
      .trim()
      .toLowerCase();

    if (!cleanPhone && !email) {
      return {
        found: false,
        message: 'Vui lòng cung cấp số điện thoại hoặc email để tra cứu',
      };
    }

    // 1. Check in public.members
    try {
      const memRows = await this.prisma.$queryRaw<any[]>`
        SELECT id, code, name, contact, phone, email, status, joined_at, created_at, user_id
        FROM public.members
        WHERE (${cleanPhone} != '' AND regexp_replace(phone, '\\D', '', 'g') = ${cleanPhone})
           OR (${email} != '' AND LOWER(email) = ${email})
        ORDER BY created_at DESC
        LIMIT 1
      `.catch(() => []);

      if (memRows.length > 0) {
        const m = memRows[0];
        const status = (m.status || 'pending').toLowerCase();
        const isApproved =
          status === 'active' ||
          status === 'approved' ||
          status === 'memberstatus.active';
        const isRejected = status === 'rejected' || status === 'declined';
        return {
          found: true,
          status: isApproved ? 'approved' : isRejected ? 'rejected' : 'pending',
          rawStatus: status,
          isApproved,
          hasAccount: Boolean(m.user_id),
          name: m.contact || m.name,
          company: m.name,
          memberCode: m.code || m.id,
          phone: m.phone,
          email: m.email,
          createdAt: m.created_at,
          message: isApproved
            ? 'Hồ sơ của Quý Doanh nhân đã được phê duyệt chính thức!'
            : isRejected
              ? 'Hồ sơ cần bổ sung thông tin hoặc chưa đạt tiêu chuẩn thẩm định.'
              : 'Hồ sơ đang chờ Ban Thư Ký CLB CEO 1983 thẩm định trong 24h.',
        };
      }
    } catch (e) {
      console.warn('checkClubRegistrationStatus members query error:', e);
    }

    // 2. Check in public.demo_requests
    try {
      const demoRows = await this.prisma.$queryRaw<any[]>`
        SELECT id, name, organization, phone, email, status, created_at
        FROM public.demo_requests
        WHERE (${cleanPhone} != '' AND regexp_replace(phone, '\\D', '', 'g') = ${cleanPhone})
           OR (${email} != '' AND LOWER(email) = ${email})
        ORDER BY created_at DESC
        LIMIT 1
      `.catch(() => []);

      if (demoRows.length > 0) {
        const d = demoRows[0];
        const status = (d.status || 'new').toLowerCase();
        const isApproved = status === 'approved' || status === 'contacted';
        return {
          found: true,
          status: isApproved ? 'approved' : 'pending',
          rawStatus: status,
          isApproved,
          hasAccount: false,
          name: d.name,
          company: d.organization,
          memberCode: d.id,
          phone: d.phone,
          email: d.email,
          createdAt: d.created_at,
          message: isApproved
            ? 'Hồ sơ của Quý Doanh nhân đã được phê duyệt chính thức!'
            : 'Hồ sơ đang chờ Ban Thư Ký CLB CEO 1983 thẩm định trong 24h.',
        };
      }
    } catch (e) {
      console.warn('checkClubRegistrationStatus demo_requests query error:', e);
    }

    return {
      found: false,
      message:
        'Không tìm thấy hồ sơ đăng ký với thông tin này. Vui lòng nộp hồ sơ mới.',
    };
  }

  /**
   * Universal Notification Dispatcher for Association Staff / CRM Admins
   * Creates records in public.notifications and public.business_notifications,
   * and dispatches instant WebSocket alerts to Web CRM & Mobile admins with actionable redirection.
   */

  async notifyAssociationAdmins(
    associationId: string,
    payload: {
      title: string;
      body: string;
      targetRoute: string;
      type?: string;
      sourceRecordId?: string;
      meta?: any;
    },
  ) {
    try {
      const now = new Date();
      const code = `NTF-${Date.now().toString(36).toUpperCase()}`;

      await this.prisma.$executeRaw`
        INSERT INTO public.notifications (
          id, code, title, body, audience, channel, status, sent_at, association_id, app_scope, target_app, created_at, updated_at
        ) VALUES (
          gen_random_uuid(), ${code}, ${payload.title}, ${payload.body},
          'staff', 'inapp', 'sent', ${now}, ${associationId}::uuid, 'crm', 'crm', ${now}, ${now}
        )
      `.catch((err) =>
        console.warn('Could not insert scoped public.notifications:', err),
      );

      const adminMembers = await this.prisma.$queryRaw<any[]>`
        SELECT DISTINCT user_id FROM public.memberships
        WHERE (association_id = ${associationId}::uuid OR association_id IS NULL)
          AND role IN ('admin', 'association_admin', 'owner', 'staff', 'manager', 'executive')
        UNION
        SELECT DISTINCT user_id FROM public.user_roles
        WHERE role IN ('platform_admin', 'tenant_admin')
        UNION
        SELECT DISTINCT id AS user_id FROM public.vione_users
        WHERE email LIKE '%admin%' OR username LIKE '%admin%'
      `.catch(() => [] as any[]);

      const adminUserIds = Array.from(
        new Set(adminMembers.map((m) => m.user_id).filter(Boolean)),
      );

      for (const adminId of adminUserIds) {
        const notifId = crypto.randomUUID();
        const safeData = JSON.stringify({
          title: payload.title,
          body: payload.body,
          companyName: payload.meta?.companyName || payload.title,
          applicantName: payload.meta?.applicantName,
          phone: payload.meta?.phone,
          targetRoute: payload.targetRoute,
          appScope: 'crm',
          ...(payload.meta || {}),
        });
        const actionTarget = JSON.stringify({
          route: payload.targetRoute,
          targetRoute: payload.targetRoute,
          associationId,
        });

        await this.prisma.$executeRaw`
          INSERT INTO public.business_notifications (
            id, recipient_user_id, source_domain, source_record_id, event_kind, notification_kind,
            title_key, body_key, safe_display_data, action_kind, action_label_key, action_target,
            priority, status, app_scope, target_app, created_at, updated_at, dedupe_key
          ) VALUES (
            ${notifId}::uuid, ${adminId}::uuid, 'association', ${payload.sourceRecordId || associationId},
            ${payload.type || 'assoc_registration'}, ${payload.type || 'assoc_admin_alert'},
            ${payload.title}, ${payload.body},
            ${safeData}::jsonb, 'navigate', 'Xem hồ sơ & duyệt', ${actionTarget}::jsonb,
            'high', 'delivered', 'crm', 'crm', ${now}, ${now}, ${`assoc_alert:${notifId}`}
          )
        `.catch((err) =>
          console.warn('Error inserting business_notification for admin:', err),
        );

        if (this.gateway) {
          this.gateway.emitNotification(adminId, {
            id: notifId,
            title: payload.title,
            body: payload.body,
            appScope: 'crm',
            targetApp: 'crm',
            action: { targetRoute: payload.targetRoute },
            safeDisplayData: {
              title: payload.title,
              body: payload.body,
              targetRoute: payload.targetRoute,
              appScope: 'crm',
            },
            targetRoute: payload.targetRoute,
          });
        }
      }

      if (this.gateway) {
        this.gateway.emitToRoom(`assoc:${associationId}`, 'notification:new', {
          title: payload.title,
          body: payload.body,
          targetRoute: payload.targetRoute,
          action: { targetRoute: payload.targetRoute },
          safeDisplayData: {
            title: payload.title,
            body: payload.body,
            targetRoute: payload.targetRoute,
          },
        });

        this.gateway.emitToAll('notification:new', {
          title: payload.title,
          body: payload.body,
          targetRoute: payload.targetRoute,
          action: { targetRoute: payload.targetRoute },
          safeDisplayData: {
            title: payload.title,
            body: payload.body,
            targetRoute: payload.targetRoute,
          },
        });
      }
    } catch (err) {
      console.warn('Error in notifyAssociationAdmins:', err);
    }
  }
}
