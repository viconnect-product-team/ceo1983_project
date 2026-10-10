import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ConnectIdentityService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    const profileRows = await this.prisma.$queryRaw<any[]>`
      SELECT 
        user_id, display_name, avatar_url, professional_title, company_name, 
        industry, region, bio, locale, timezone, 
        onboarding_status::text as onboarding_status, 
        account_status::text as account_status, 
        created_at, updated_at, company_logo_url
      FROM public.user_profiles
      WHERE user_id = ${userId}::uuid
      LIMIT 1
    `.catch(() => []);
    const profile = profileRows[0] || null;

    const memberRows = await this.prisma.$queryRaw<any[]>`
      SELECT id, code, name, phone, email, avatar, company_name, executive_role, region, address, about, company_logo_url
      FROM public.members
      WHERE user_id = ${userId}::uuid OR id = ${userId}
      LIMIT 1
    `.catch(() => []);
    const member = memberRows[0] || null;

    const user = await this.prisma.vione_users.findUnique({
      where: { id: userId },
    }).catch(() => null);

    if (!profile && !member && !user) return null;

    const displayName = profile?.display_name || member?.name || user?.name || '';
    const phone = member?.phone || '';
    const professionalTitle = profile?.professional_title || member?.executive_role || '';
    const companyName = profile?.company_name || member?.company_name || '';
    const region = profile?.region || member?.region || member?.address || '';
    const bio = profile?.bio || member?.about || '';
    const avatarUrl = profile?.avatar_url || member?.avatar || user?.avatar_url || '';
    const companyLogoUrl = profile?.company_logo_url || member?.company_logo_url || '';

    return {
      user_id: userId,
      display_name: displayName,
      phone,
      professional_title: professionalTitle,
      company_name: companyName,
      region,
      bio,
      avatar_url: avatarUrl,
      company_logo_url: companyLogoUrl,
      email: member?.email || user?.email || '',
      member_id: member?.id || null,
      member_code: member?.code || null,
      onboarding_status: profile?.onboarding_status || 'completed',
      account_status: profile?.account_status || 'active',
      locale: profile?.locale || 'vi',
      timezone: profile?.timezone || 'Asia/Ho_Chi_Minh',
      created_at: profile?.created_at || member?.created_at || new Date(),
      updated_at: profile?.updated_at || member?.updated_at || new Date(),
    };
  }

  async updateMyProfile(userId: string, data: any) {
    const onboardingStatus = data.onboarding_status || 'completed';
    const accountStatus = data.account_status || 'active';
    const displayName = (data.display_name || data.name || data.full_name || '').trim();
    const phone = (data.phone || '').trim();
    const professionalTitle = (data.professional_title || data.title || '').trim();
    const companyName = (data.company_name || data.company || '').trim();
    const region = (data.region || data.location || '').trim();
    const bio = (data.bio || '').trim();
    const avatarUrl = (data.avatar_url || data.avatar || '').trim() || null;
    const companyLogoUrl = (data.company_logo_url || data.companyLogo || '').trim() || null;

    // 1. user_profiles
    await this.prisma.$executeRaw`
      INSERT INTO public.user_profiles (
        user_id, display_name, avatar_url, professional_title, company_name, 
        industry, region, bio, locale, timezone, onboarding_status, account_status, company_logo_url, updated_at
      )
      VALUES (
        ${userId}::uuid, 
        ${displayName || null}, 
        ${avatarUrl}, 
        ${professionalTitle || null}, 
        ${companyName || null}, 
        ${data.industry || null}, 
        ${region || null}, 
        ${bio || null}, 
        ${data.locale || 'vi'}, 
        ${data.timezone || 'Asia/Ho_Chi_Minh'}, 
        ${onboardingStatus}, 
        ${accountStatus},
        ${companyLogoUrl},
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        display_name = COALESCE(EXCLUDED.display_name, user_profiles.display_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, user_profiles.avatar_url),
        professional_title = COALESCE(EXCLUDED.professional_title, user_profiles.professional_title),
        company_name = COALESCE(EXCLUDED.company_name, user_profiles.company_name),
        industry = COALESCE(EXCLUDED.industry, user_profiles.industry),
        region = COALESCE(EXCLUDED.region, user_profiles.region),
        bio = COALESCE(EXCLUDED.bio, user_profiles.bio),
        locale = EXCLUDED.locale,
        timezone = EXCLUDED.timezone,
        onboarding_status = EXCLUDED.onboarding_status,
        account_status = EXCLUDED.account_status,
        company_logo_url = COALESCE(EXCLUDED.company_logo_url, user_profiles.company_logo_url),
        updated_at = NOW()
    `.catch(() => null);

    // 2. vione_users
    try {
      const vioneUpdate: any = { updated_at: new Date() };
      if (displayName) vioneUpdate.name = displayName;
      if (avatarUrl) vioneUpdate.avatar_url = avatarUrl;
      await this.prisma.vione_users.update({
        where: { id: userId },
        data: vioneUpdate,
      }).catch(() => null);
    } catch {}

    // 3. members (App Hiệp hội CEO 1983)
    try {
      await this.prisma.$executeRaw`
        UPDATE public.members
        SET
          name = COALESCE(${displayName || null}, name),
          contact = COALESCE(${displayName || null}, contact),
          phone = COALESCE(${phone || null}, phone),
          executive_role = COALESCE(${professionalTitle || null}, executive_role),
          company_name = COALESCE(${companyName || null}, company_name),
          region = COALESCE(${region || null}, region),
          address = COALESCE(${region || null}, address),
          about = COALESCE(${bio || null}, about),
          avatar = COALESCE(${avatarUrl}, avatar),
          company_logo_url = COALESCE(${companyLogoUrl}, company_logo_url),
          updated_at = NOW()
        WHERE user_id = ${userId}::uuid OR id = ${userId}
      `.catch(() => null);
    } catch {}

    // 4. card_settings & member_business_cards
    try {
      await this.prisma.$executeRaw`
        INSERT INTO public.card_settings (user_id, display_name, display_company, photo_url, company_logo_url, updated_at)
        VALUES (${userId}::uuid, ${displayName || null}, ${companyName || null}, ${avatarUrl}, ${companyLogoUrl}, NOW())
        ON CONFLICT (user_id) DO UPDATE SET
          display_name = COALESCE(${displayName || null}, card_settings.display_name),
          display_company = COALESCE(${companyName || null}, card_settings.display_company),
          photo_url = COALESCE(${avatarUrl}, card_settings.photo_url),
          company_logo_url = COALESCE(${companyLogoUrl}, card_settings.company_logo_url),
          updated_at = NOW()
      `.catch(() => null);
    } catch {}

    try {
      await this.prisma.$executeRaw`
        UPDATE public.member_business_cards
        SET
          display_name = COALESCE(${displayName || null}, display_name),
          professional_title = COALESCE(${professionalTitle || null}, professional_title),
          company_name = COALESCE(${companyName || null}, company_name),
          avatar_url = COALESCE(${avatarUrl}, avatar_url),
          company_logo_url = COALESCE(${companyLogoUrl}, company_logo_url),
          work_phone = COALESCE(${phone || null}, work_phone),
          address = COALESCE(${region || null}, address),
          bio = COALESCE(${bio || null}, bio),
          updated_at = NOW()
        WHERE owner_user_id = ${userId}::uuid
      `.catch(() => null);
    } catch {}

    return this.getMyProfile(userId);
  }

  async getMyIdentity(userId: string) {
    const identityRows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.business_identities WHERE owner_user_id = ${userId}::uuid LIMIT 1
    `.catch(() => []);
    let identity = identityRows.length > 0 ? identityRows[0] : null;

    // Fallback or augment from user_profiles if identity is missing or lacks avatar/details
    const profileRows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.user_profiles WHERE user_id = ${userId}::uuid LIMIT 1
    `.catch(() => []);
    const profile = profileRows.length > 0 ? profileRows[0] : null;

    const userRows = await this.prisma.$queryRaw<any[]>`
      SELECT email FROM auth.users WHERE id = ${userId}::uuid LIMIT 1
    `.catch(() => []);
    const userEmail = userRows.length > 0 ? userRows[0].email : null;

    if (!identity) {
      if (profile || userEmail) {
        identity = {
          id: profile?.id || userId,
          owner_user_id: userId,
          display_name: profile?.display_name || userEmail?.split('@')[0] || 'Hội viên CEO 1983',
          headline: profile?.professional_title || null,
          job_title: profile?.professional_title || null,
          company_name: profile?.company_name || null,
          bio: profile?.bio || null,
          avatar_url: profile?.avatar_url || null,
          primary_email: userEmail || null,
          primary_phone: null,
          website: null,
          linkedin_url: null,
          address: null,
          city: profile?.region || null,
          country_code: 'VN',
          preferred_locale: profile?.locale || 'vi',
          status: 'active',
          created_at: profile?.created_at || new Date(),
          updated_at: profile?.updated_at || new Date(),
        };
      }
    } else {
      if (!identity.avatar_url && profile?.avatar_url) {
        identity.avatar_url = profile.avatar_url;
      }
      if (!identity.display_name && profile?.display_name) {
        identity.display_name = profile.display_name;
      }
      if (!identity.job_title && profile?.professional_title) {
        identity.job_title = profile.professional_title;
      }
      if (!identity.company_name && profile?.company_name) {
        identity.company_name = profile.company_name;
      }
      if (!identity.bio && profile?.bio) {
        identity.bio = profile.bio;
      }
      if (!identity.primary_email && userEmail) {
        identity.primary_email = userEmail;
      }
    }

    const visibilityRows = await this.prisma.$queryRaw<any[]>`
      SELECT field_key, visibility FROM public.identity_field_visibility WHERE owner_user_id = ${userId}::uuid
    `.catch(() => []);
    const visibility = {};
    for (const row of visibilityRows) {
      visibility[row.field_key] = row.visibility;
    }

    return {
      identity: identity ? {
        id: identity.id,
        ownerUserId: identity.owner_user_id,
        displayName: identity.display_name,
        headline: identity.headline,
        jobTitle: identity.job_title,
        companyName: identity.company_name,
        bio: identity.bio,
        avatarUrl: identity.avatar_url,
        primaryEmail: identity.primary_email,
        primaryPhone: identity.primary_phone,
        website: identity.website,
        linkedinUrl: identity.linkedin_url,
        address: identity.address,
        city: identity.city,
        countryCode: identity.country_code,
        preferredLocale: identity.preferred_locale,
        status: identity.status,
        createdAt: identity.created_at,
        updatedAt: identity.updated_at,
      } : null,
      visibility,
    };
  }

  async upsertMyIdentity(userId: string, input: any) {
    const existingRows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.business_identities WHERE owner_user_id = ${userId}::uuid LIMIT 1
    `.catch(() => []);
    const now = new Date();

    if (existingRows.length === 0) {
      const id = crypto.randomUUID();
      const finalData = {
        id,
        owner_user_id: userId,
        display_name: input.displayName || null,
        headline: input.headline || null,
        job_title: input.jobTitle || null,
        company_name: input.companyName || null,
        bio: input.bio || null,
        avatar_url: input.avatarUrl || null,
        primary_email: input.primaryEmail || null,
        primary_phone: input.primaryPhone || null,
        website: input.website || null,
        linkedin_url: input.linkedinUrl || null,
        address: input.address || null,
        city: input.city || null,
        country_code: input.countryCode || null,
        preferred_locale: input.preferredLocale || null,
        status: 'active',
        created_at: now,
        updated_at: now,
      };

      await this.prisma.$executeRaw`
        INSERT INTO public.business_identities (
          id, owner_user_id, display_name, headline, job_title, company_name, bio, avatar_url,
          primary_email, primary_phone, website, linkedin_url, address, city, country_code,
          preferred_locale, status, created_at, updated_at
        ) VALUES (
          ${finalData.id}::uuid, ${finalData.owner_user_id}::uuid, ${finalData.display_name}, ${finalData.headline},
          ${finalData.job_title}, ${finalData.company_name}, ${finalData.bio},
          ${finalData.avatar_url}, ${finalData.primary_email}, ${finalData.primary_phone},
          ${finalData.website}, ${finalData.linkedin_url}, ${finalData.address},
          ${finalData.city}, ${finalData.country_code}, ${finalData.preferred_locale},
          ${finalData.status}, ${finalData.created_at}, ${finalData.updated_at}
        )
      `;

      await this.prisma.$executeRaw`
        UPDATE public.user_profiles SET
          avatar_url = ${finalData.avatar_url}
        WHERE user_id = ${userId}::uuid
      `;
    } else {
      const existing = existingRows[0];
      const finalData = {
        display_name: input.displayName !== undefined ? input.displayName : existing.display_name,
        headline: input.headline !== undefined ? input.headline : existing.headline,
        job_title: input.jobTitle !== undefined ? input.jobTitle : existing.job_title,
        company_name: input.companyName !== undefined ? input.companyName : existing.company_name,
        bio: input.bio !== undefined ? input.bio : existing.bio,
        avatar_url: input.avatarUrl !== undefined ? input.avatarUrl : existing.avatar_url,
        primary_email: input.primaryEmail !== undefined ? input.primaryEmail : existing.primary_email,
        primary_phone: input.primaryPhone !== undefined ? input.primaryPhone : existing.primary_phone,
        website: input.website !== undefined ? input.website : existing.website,
        linkedin_url: input.linkedinUrl !== undefined ? input.linkedinUrl : existing.linkedin_url,
        address: input.address !== undefined ? input.address : existing.address,
        city: input.city !== undefined ? input.city : existing.city,
        country_code: input.countryCode !== undefined ? input.countryCode : existing.country_code,
        preferred_locale: input.preferredLocale !== undefined ? input.preferredLocale : existing.preferred_locale,
      };

      await this.prisma.$executeRaw`
        UPDATE public.business_identities SET
          display_name = ${finalData.display_name},
          headline = ${finalData.headline},
          job_title = ${finalData.job_title},
          company_name = ${finalData.company_name},
          bio = ${finalData.bio},
          avatar_url = ${finalData.avatar_url},
          primary_email = ${finalData.primary_email},
          primary_phone = ${finalData.primary_phone},
          website = ${finalData.website},
          linkedin_url = ${finalData.linkedin_url},
          address = ${finalData.address},
          city = ${finalData.city},
          country_code = ${finalData.country_code},
          preferred_locale = ${finalData.preferred_locale},
          updated_at = ${now}
        WHERE id = ${existing.id}::uuid
      `;

      await this.prisma.$executeRaw`
        UPDATE public.user_profiles SET
          avatar_url = ${finalData.avatar_url}
        WHERE user_id = ${userId}::uuid
      `;
    }

    return this.getMyIdentity(userId);
  }

  async updateMyVisibility(userId: string, updates: any[]) {
    const identityRows = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_identities WHERE owner_user_id = ${userId}::uuid LIMIT 1
    `.catch(() => []);
    if (identityRows.length === 0) {
      throw new Error("identity_not_found");
    }
    const identityId = identityRows[0].id;
    const now = new Date();

    for (const update of updates) {
      await this.prisma.$executeRaw`
        INSERT INTO public.identity_field_visibility (identity_id, owner_user_id, field_key, visibility, updated_at)
        VALUES (${identityId}::uuid, ${userId}::uuid, ${update.fieldKey}, ${update.visibility}, ${now})
        ON CONFLICT (identity_id, field_key) DO UPDATE SET
          visibility = EXCLUDED.visibility,
          updated_at = EXCLUDED.updated_at
      `;
    }

    return this.getMyIdentity(userId);
  }

  async getOrCreateMyShareLink(userId: string) {
    const existingRows = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_identities WHERE owner_user_id = ${userId}::uuid LIMIT 1
    `.catch(() => []);
    let identityId: string;
    const now = new Date();

    if (existingRows.length === 0) {
      identityId = crypto.randomUUID();
      await this.prisma.$executeRaw`
        INSERT INTO public.business_identities (id, owner_user_id, status, created_at, updated_at)
        VALUES (${identityId}::uuid, ${userId}::uuid, 'active', ${now}, ${now})
      `;
    } else {
      identityId = existingRows[0].id;
    }

    const links = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.identity_share_links
      WHERE owner_user_id = ${userId}::uuid AND status = 'active'
      ORDER BY created_at DESC LIMIT 1
    `.catch(() => []);

    if (links.length > 0) {
      const link = links[0];
      return {
        token: link.public_token,
        status: link.status,
        createdAt: link.created_at,
        rotatedAt: link.rotated_at,
        lastUsedAt: link.last_used_at,
      };
    }

    const newLinkToken = crypto.randomBytes(32).toString('hex');
    const linkId = crypto.randomUUID();
    await this.prisma.$executeRaw`
      INSERT INTO public.identity_share_links (id, identity_id, owner_user_id, public_token, status, created_at)
      VALUES (${linkId}::uuid, ${identityId}::uuid, ${userId}::uuid, ${newLinkToken}, 'active', ${now})
    `;

    return {
      token: newLinkToken,
      status: 'active',
      createdAt: now,
      rotatedAt: null,
      lastUsedAt: null,
    };
  }

  async rotateMyShareLink(userId: string) {
    const existingRows = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.business_identities WHERE owner_user_id = ${userId}::uuid LIMIT 1
    `.catch(() => []);
    let identityId: string;
    const now = new Date();

    if (existingRows.length === 0) {
      identityId = crypto.randomUUID();
      await this.prisma.$executeRaw`
        INSERT INTO public.business_identities (id, owner_user_id, status, created_at, updated_at)
        VALUES (${identityId}::uuid, ${userId}::uuid, 'active', ${now}, ${now})
      `;
    } else {
      identityId = existingRows[0].id;
    }

    await this.prisma.$executeRaw`
      UPDATE public.identity_share_links
      SET status = 'revoked', revoked_at = ${now}, rotated_at = ${now}
      WHERE owner_user_id = ${userId}::uuid AND status = 'active'
    `;

    const newLinkToken = crypto.randomBytes(32).toString('hex');
    const linkId = crypto.randomUUID();
    await this.prisma.$executeRaw`
      INSERT INTO public.identity_share_links (id, identity_id, owner_user_id, public_token, status, created_at)
      VALUES (${linkId}::uuid, ${identityId}::uuid, ${userId}::uuid, ${newLinkToken}, 'active', ${now})
    `;

    return {
      token: newLinkToken,
      status: 'active',
      createdAt: now,
      rotatedAt: now,
      lastUsedAt: null,
    };
  }

  async getPublicIdentityByToken(token: string) {
    const links = await this.prisma.$queryRaw<any[]>`
      SELECT id, identity_id, status FROM public.identity_share_links
      WHERE public_token = ${token} AND status = 'active'
      LIMIT 1
    `.catch(() => []);

    if (links.length === 0) {
      return { state: 'unavailable' };
    }
    const link = links[0];

    const identities = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.business_identities
      WHERE id = ${link.identity_id}::uuid AND status = 'active'
      LIMIT 1
    `.catch(() => []);

    if (identities.length === 0) {
      return { state: 'unavailable' };
    }
    const identity = identities[0];

    const visibilityRows = await this.prisma.$queryRaw<any[]>`
      SELECT field_key, visibility FROM public.identity_field_visibility
      WHERE identity_id = ${identity.id}::uuid
    `.catch(() => []);

    const visibility = {};
    for (const row of visibilityRows) {
      visibility[row.field_key] = row.visibility;
    }

    // Update last used marker asynchronously
    this.prisma.$executeRaw`
      UPDATE public.identity_share_links
      SET last_used_at = ${new Date()}
      WHERE id = ${link.id}::uuid
    `.catch(() => {});

    // Projection mapping
    const isFieldVisible = (key: string) => {
      const v = visibility[key];
      return v === 'public' || v === undefined; // Default to public if not explicitly hidden
    };

    return {
      state: 'public',
      card: {
        id: identity.id,
        displayName: isFieldVisible('displayName') ? identity.display_name : null,
        headline: isFieldVisible('headline') ? identity.headline : null,
        jobTitle: isFieldVisible('jobTitle') ? identity.job_title : null,
        companyName: isFieldVisible('companyName') ? identity.company_name : null,
        bio: isFieldVisible('bio') ? identity.bio : null,
        avatarUrl: isFieldVisible('avatarUrl') ? identity.avatar_url : null,
        primaryEmail: isFieldVisible('primaryEmail') ? identity.primary_email : null,
        primaryPhone: isFieldVisible('primaryPhone') ? identity.primary_phone : null,
        website: isFieldVisible('website') ? identity.website : null,
        linkedinUrl: isFieldVisible('linkedinUrl') ? identity.linkedin_url : null,
        address: isFieldVisible('address') ? identity.address : null,
        city: isFieldVisible('city') ? identity.city : null,
        countryCode: isFieldVisible('countryCode') ? identity.country_code : null,
      }
    };
  }



  async getMyShowcase(userId: string) {
    const items = await this.prisma.$queryRaw<any[]>`
      SELECT id, kind, title, subtitle, logo_url AS "logoUrl"
      FROM public.business_identity_showcase_items
      WHERE owner_user_id = ${userId}::uuid
      ORDER BY sort_order ASC, created_at ASC
      LIMIT 120
    `;
    return {
      businessAreas: items.filter((i) => i.kind === 'business_area'),
      clients: items.filter((i) => i.kind === 'client'),
      metrics: items.filter((i) => i.kind === 'metric'),
      interests: items.filter((i) => i.kind === 'interest'),
      clientMetrics: items.filter((i) => i.kind === 'client_metric'),
    };
  }

  async addShowcaseItem(userId: string, data: any) {
    const { kind, title, subtitle, logoUrl, sortOrder } = data;
    await this.prisma.$executeRaw`
      INSERT INTO public.business_identity_showcase_items (
        owner_user_id, kind, title, subtitle, logo_url, sort_order
      ) VALUES (
        ${userId}::uuid, ${kind}, ${title}, ${subtitle || null}, ${logoUrl || null}, ${sortOrder || 0}
      )
    `;
    return { success: true };
  }

  async deleteShowcaseItem(userId: string, id: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.business_identity_showcase_items
      WHERE id = ${id}::uuid AND owner_user_id = ${userId}::uuid
    `;
    return { success: true };
  }
}
