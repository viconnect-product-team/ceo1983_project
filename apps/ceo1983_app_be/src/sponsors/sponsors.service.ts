import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type SponsorTier = 'platinum' | 'gold' | 'silver' | 'bronze';
export type SponsorType = 'regular' | 'new';
export type PackageType = 'cash' | 'in_kind';

export class CreateSponsorPackageDto {
  tier!: SponsorTier;
  price!: number;
  benefits?: string[];
  available?: number;
  sold?: number;
  packageType?: PackageType;
  inKindDescription?: string;
}

export class UpdateSponsorPackageDto {
  tier?: SponsorTier;
  price?: number;
  benefits?: string[];
  available?: number;
  sold?: number;
  packageType?: PackageType;
  inKindDescription?: string;
}

export class CreateSponsorDto {
  name!: string;
  tier!: SponsorTier;
  contact?: string;
  email?: string;
  phone?: string;
  amount?: number;
  events?: number;
  since?: string;
  status?: 'active' | 'expired';
  sponsorType?: SponsorType;
  packageType?: PackageType;
  inKindDescription?: string;
}

export class OnboardSponsorDto {
  packageId!: string;
  name!: string;
  contact?: string;
  email?: string;
  phone?: string;
}

export type PrizeTargetType = 'PRODUCT' | 'SPONSOR_PACKAGE' | 'CUSTOM' | 'VOUCHER' | 'CASH';

export class CreateEventPrizeDto {
  eventId!: string;
  rankName!: string;
  title!: string;
  value?: string;
  amount?: number;
  quantity?: number;
  targetType!: PrizeTargetType;
  targetId?: string;
  sponsorName?: string;
  sponsorPackageId?: string;
  description?: string;
  iconName?: string;
  imageUrl?: string;
  highlightColor?: string;
}

export class UpdateEventPrizeDto {
  eventId?: string;
  rankName?: string;
  title?: string;
  value?: string;
  amount?: number;
  quantity?: number;
  targetType?: PrizeTargetType;
  targetId?: string;
  sponsorName?: string;
  sponsorPackageId?: string;
  description?: string;
  iconName?: string;
  imageUrl?: string;
  highlightColor?: string;
  status?: string;
}

@Injectable()
export class SponsorsService {
  constructor(private prisma: PrismaService) {}

  private async resolveAssociationId(assocId?: string): Promise<string> {
    if (assocId) return assocId;
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.associations 
      ORDER BY landing_published DESC, created_at DESC 
      LIMIT 1
    `.catch(() => []);
    if (rows.length > 0 && rows[0]?.id) return rows[0].id;
    return 'ba000000-0000-4000-8000-000000000001';
  }

  // ── SPONSOR PACKAGES ────────────────────────────────────────────────────────

  async listPackages() {
    try {
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM public.sponsor_packages
        ORDER BY created_at DESC
      `;
      const tierOrder = ['platinum', 'gold', 'silver', 'bronze'];
      return (rows || []).map((r) => ({
        id: r.id,
        tier: r.tier || 'bronze',
        price: Number(r.price ?? 0),
        benefits: Array.isArray(r.benefits) ? r.benefits : [],
        available: Number(r.available ?? 0),
        sold: Number(r.sold ?? 0),
        packageType: (r.package_type || 'cash') as PackageType,
        inKindDescription: r.in_kind_description || '',
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      })).sort((a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier));
    } catch (err: any) {
      console.error('[SponsorsService] listPackages error:', err);
      return [];
    }
  }

  async getPackageById(id: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.sponsor_packages WHERE id = ${id} LIMIT 1
    `;
    if (!rows || rows.length === 0) {
      throw new NotFoundException(`Sponsor package ${id} not found`);
    }
    const r = rows[0];
    return {
      id: r.id,
      tier: r.tier || 'bronze',
      price: Number(r.price ?? 0),
      benefits: Array.isArray(r.benefits) ? r.benefits : [],
      available: Number(r.available ?? 0),
      sold: Number(r.sold ?? 0),
      packageType: (r.package_type || 'cash') as PackageType,
      inKindDescription: r.in_kind_description || '',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  async createPackage(dto: CreateSponsorPackageDto & { associationId?: string }) {
    const lastPkg = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.sponsor_packages WHERE id ~ '^[0-9]+$' ORDER BY CAST(id AS BIGINT) DESC LIMIT 1
    `.catch(() => []);
    const id = lastPkg.length > 0 ? (BigInt(lastPkg[0].id) + 1n).toString() : '30001';
    const tier = dto.tier || 'bronze';
    const price = BigInt(Math.round(dto.price || 0));
    const benefits = dto.benefits || [];
    const available = Math.round(dto.available ?? 0);
    const sold = Math.round(dto.sold ?? 0);
    const packageType = dto.packageType || 'cash';
    const inKindDescription = dto.inKindDescription || null;
    const associationId = await this.resolveAssociationId(dto.associationId);

    await this.prisma.$executeRaw`
      INSERT INTO public.sponsor_packages (id, tier, price, benefits, available, sold, association_id, package_type, in_kind_description, created_at, updated_at)
      VALUES (${id}, ${tier}, ${price}, ${benefits}::text[], ${available}, ${sold}, ${associationId}::uuid, ${packageType}, ${inKindDescription}, NOW(), NOW())
    `;

    return this.getPackageById(id);
  }

  async updatePackage(id: string, dto: UpdateSponsorPackageDto) {
    const existing = await this.getPackageById(id);
    const tier = dto.tier ?? existing.tier;
    const price = BigInt(Math.round(dto.price !== undefined ? dto.price : existing.price));
    const benefits = dto.benefits ?? existing.benefits;
    const available = Math.round(dto.available !== undefined ? dto.available : existing.available);
    const sold = Math.round(dto.sold !== undefined ? dto.sold : existing.sold);
    const packageType = dto.packageType ?? existing.packageType;
    const inKindDescription = dto.inKindDescription !== undefined ? dto.inKindDescription : existing.inKindDescription;

    await this.prisma.$executeRaw`
      UPDATE public.sponsor_packages
      SET tier = ${tier}, price = ${price}, benefits = ${benefits}::text[], available = ${available}, sold = ${sold},
          package_type = ${packageType}, in_kind_description = ${inKindDescription}, updated_at = NOW()
      WHERE id = ${id}
    `;

    return this.getPackageById(id);
  }

  async deletePackage(id: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.sponsor_packages WHERE id = ${id}
    `;
    return { ok: true };
  }

  // ── SPONSORS ────────────────────────────────────────────────────────────────

  async listSponsors() {
    try {
      const [rows, events] = await Promise.all([
        this.prisma.$queryRaw<any[]>`
          SELECT * FROM public.sponsors
          ORDER BY amount DESC, created_at DESC
        `,
        this.prisma.$queryRaw<any[]>`
          SELECT id, name, date, sponsors, status FROM public.events
          WHERE sponsors IS NOT NULL
        `.catch(() => []),
      ]);

      return (rows || []).map((r) => {
        let assignedEvent: any = null;
        let matchedItem: any = null;

        for (const evt of events) {
          const rawSponsors = evt.sponsors;
          let spList: any[] = [];
          if (Array.isArray(rawSponsors)) {
            spList = rawSponsors;
          } else if (typeof rawSponsors === 'string') {
            try {
              spList = JSON.parse(rawSponsors);
            } catch {}
          }
          if (Array.isArray(spList)) {
            const found = spList.find(
              (s: any) =>
                s.sponsorId === r.id ||
                s.id === r.id ||
                (s.sponsorName && s.sponsorName.trim().toLowerCase() === r.name?.trim().toLowerCase()) ||
                (s.name && s.name.trim().toLowerCase() === r.name?.trim().toLowerCase()),
            );
            if (found) {
              matchedItem = found;
              assignedEvent = {
                id: evt.id,
                name: evt.name,
                date: evt.date instanceof Date ? evt.date.toISOString().slice(0, 10) : String(evt.date || '').slice(0, 10),
                status: evt.status || 'upcoming',
                packageId: found.packageId || null,
                packageName: found.packageName || null,
                tier: found.tier || r.tier,
                packageType: found.packageType || r.package_type,
                amount: Number(found.amount ?? r.amount ?? 0),
              };
              break;
            }
          }
        }

        return {
          id: r.id,
          name: r.name,
          tier: r.tier || 'bronze',
          sponsorType: (r.sponsor_type || 'new') as SponsorType,
          packageType: (r.package_type || 'cash') as PackageType,
          inKindDescription: r.in_kind_description || '',
          contact: r.contact || '',
          email: r.email || '',
          phone: r.phone || '',
          amount: Number(r.amount ?? 0),
          events: assignedEvent ? Math.max(Number(r.events ?? 0), 1) : Number(r.events ?? 0),
          since: r.since instanceof Date ? r.since.toISOString().slice(0, 10) : String(r.since || ''),
          status: r.status || 'active',
          assignedEvent,
          isAssigned: Boolean(assignedEvent),
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        };
      });
    } catch (err: any) {
      console.error('[SponsorsService] listSponsors error:', err);
      return [];
    }
  }

  async getSponsorById(id: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.sponsors WHERE id = ${id} LIMIT 1
    `;
    if (!rows || rows.length === 0) {
      throw new NotFoundException(`Sponsor ${id} not found`);
    }
    const r = rows[0];
    return {
      id: r.id,
      name: r.name,
      tier: r.tier || 'bronze',
      sponsorType: (r.sponsor_type || 'new') as SponsorType,
      packageType: (r.package_type || 'cash') as PackageType,
      inKindDescription: r.in_kind_description || '',
      contact: r.contact || '',
      email: r.email || '',
      phone: r.phone || '',
      amount: Number(r.amount ?? 0),
      events: Number(r.events ?? 0),
      since: r.since instanceof Date ? r.since.toISOString().slice(0, 10) : String(r.since || ''),
      status: r.status || 'active',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  async createSponsor(dto: CreateSponsorDto) {
    const lastSp = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.sponsors WHERE id ~ '^[0-9]+$' ORDER BY CAST(id AS BIGINT) DESC LIMIT 1
    `.catch(() => []);
    const id = lastSp.length > 0 ? (BigInt(lastSp[0].id) + 1n).toString() : '20001';
    const name = dto.name;
    const tier = dto.tier || 'bronze';
    const sponsorType = dto.sponsorType || 'new';
    const packageType = dto.packageType || 'cash';
    const inKindDescription = dto.inKindDescription || null;
    const contact = dto.contact || '';
    const email = dto.email || '';
    const phone = dto.phone || '';
    const amount = BigInt(Math.round(dto.amount || 0));
    const events = Math.round(dto.events || 0);
    let safeSince = dto.since?.trim() || new Date().toISOString().slice(0, 10);
    if (isNaN(new Date(safeSince).getTime())) {
      safeSince = new Date().toISOString().slice(0, 10);
    }
    const status = dto.status || 'active';
    const associationId = await this.resolveAssociationId((dto as any).associationId);

    await this.prisma.$executeRaw`
      INSERT INTO public.sponsors (id, name, tier, sponsor_type, package_type, in_kind_description, contact, email, phone, amount, events, since, status, association_id, created_at, updated_at)
      VALUES (${id}, ${name}, ${tier}, ${sponsorType}, ${packageType}, ${inKindDescription}, ${contact}, ${email}, ${phone}, ${amount}, ${events}, ${safeSince}::date, ${status}, ${associationId}::uuid, NOW(), NOW())
    `;

    return this.getSponsorById(id);
  }

  async updateSponsor(id: string, dto: Partial<CreateSponsorDto>) {
    const existing = await this.getSponsorById(id);
    const name = dto.name ?? existing.name;
    const tier = dto.tier ?? existing.tier;
    const sponsorType = dto.sponsorType ?? existing.sponsorType;
    const packageType = dto.packageType ?? existing.packageType;
    const inKindDescription = dto.inKindDescription !== undefined ? dto.inKindDescription : existing.inKindDescription;
    const contact = dto.contact ?? existing.contact;
    const email = dto.email ?? existing.email;
    const phone = dto.phone ?? existing.phone;
    const amount = BigInt(Math.round(dto.amount !== undefined ? dto.amount : existing.amount));
    const events = Math.round(dto.events !== undefined ? dto.events : existing.events);
    const since = dto.since ?? existing.since;
    const status = dto.status ?? existing.status;

    await this.prisma.$executeRaw`
      UPDATE public.sponsors
      SET name = ${name}, tier = ${tier}, sponsor_type = ${sponsorType}, package_type = ${packageType}, in_kind_description = ${inKindDescription},
          contact = ${contact}, email = ${email}, phone = ${phone},
          amount = ${amount}, events = ${events}, since = ${since}::date, status = ${status}, updated_at = NOW()
      WHERE id = ${id}
    `;

    return this.getSponsorById(id);
  }

  async deleteSponsor(id: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.sponsors WHERE id = ${id}
    `;
    return { ok: true };
  }

  async onboardSponsor(dto: OnboardSponsorDto) {
    const pkg = await this.getPackageById(dto.packageId);
    if (pkg.sold >= pkg.available && pkg.available > 0) {
      throw new BadRequestException('Gói tài trợ này đã hết lượt phát hành');
    }

    const sponsor = await this.createSponsor({
      name: dto.name,
      tier: pkg.tier,
      sponsorType: 'new',
      packageType: pkg.packageType,
      inKindDescription: pkg.inKindDescription,
      contact: dto.contact,
      email: dto.email,
      phone: dto.phone,
      amount: pkg.price,
      events: 0,
      since: new Date().toISOString().slice(0, 10),
      status: 'active',
    });

    await this.prisma.$executeRaw`
      UPDATE public.sponsor_packages
      SET sold = sold + 1, updated_at = NOW()
      WHERE id = ${dto.packageId}
    `;

    return sponsor;
  }

  // ── EVENT PRIZES / AWARDS (DYNAMIC DATABASE BACKED) ───────────────────────

  async listPrizes(eventId?: string) {
    try {
      const rows = eventId
        ? await this.prisma.$queryRaw<any[]>`
            SELECT ep.*, p.name as prod_name, p.company as prod_company, p.price as prod_price, p.image_url as prod_image,
                   sp.tier as pkg_tier, sp.price as pkg_price
            FROM public.event_prizes ep
            LEFT JOIN public.products p ON ep.target_id = p.id
            LEFT JOIN public.sponsor_packages sp ON ep.target_id = sp.id
            WHERE ep.event_id = ${eventId}
            ORDER BY ep.created_at ASC
          `
        : await this.prisma.$queryRaw<any[]>`
            SELECT ep.*, p.name as prod_name, p.company as prod_company, p.price as prod_price, p.image_url as prod_image,
                   sp.tier as pkg_tier, sp.price as pkg_price
            FROM public.event_prizes ep
            LEFT JOIN public.products p ON ep.target_id = p.id
            LEFT JOIN public.sponsor_packages sp ON ep.target_id = sp.id
            ORDER BY ep.created_at ASC
          `;

      return (rows || []).map((r) => ({
        id: r.id,
        eventId: r.event_id,
        rankName: r.rank_name,
        title: r.title || r.prod_name || 'Giải thưởng sự kiện',
        value: r.value || (r.amount ? `${Number(r.amount).toLocaleString('vi-VN')} VNĐ` : 'Giá trị liên hệ'),
        amount: Number(r.amount ?? r.prod_price ?? r.pkg_price ?? 0),
        quantity: Number(r.quantity ?? 1),
        targetType: (r.target_type || 'PRODUCT') as PrizeTargetType,
        targetId: r.target_id || null,
        sponsorName: r.sponsor_name || r.prod_company || 'Nhà tài trợ CEO 1983',
        sponsorPackageId: r.sponsor_package_id || null,
        description: r.description || '',
        iconName: r.icon_name || 'Gift',
        imageUrl: r.image_url || r.prod_image || null,
        highlightColor: r.highlight_color || 'from-amber-500 to-yellow-600',
        status: r.status || 'active',
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
    } catch (err: any) {
      console.error('[SponsorsService] listPrizes error:', err);
      return [];
    }
  }

  async getPrizeById(id: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT ep.*, p.name as prod_name, p.company as prod_company, p.price as prod_price, p.image_url as prod_image
      FROM public.event_prizes ep
      LEFT JOIN public.products p ON ep.target_id = p.id
      WHERE ep.id = ${id}
      LIMIT 1
    `;
    if (!rows || rows.length === 0) {
      throw new NotFoundException(`Prize ${id} not found`);
    }
    const r = rows[0];
    return {
      id: r.id,
      eventId: r.event_id,
      rankName: r.rank_name,
      title: r.title || r.prod_name,
      value: r.value || (r.amount ? `${Number(r.amount).toLocaleString('vi-VN')} VNĐ` : 'Giá trị liên hệ'),
      amount: Number(r.amount ?? r.prod_price ?? 0),
      quantity: Number(r.quantity ?? 1),
      targetType: (r.target_type || 'PRODUCT') as PrizeTargetType,
      targetId: r.target_id || null,
      sponsorName: r.sponsor_name || r.prod_company,
      sponsorPackageId: r.sponsor_package_id || null,
      description: r.description || '',
      iconName: r.icon_name || 'Gift',
      imageUrl: r.image_url || r.prod_image || null,
      highlightColor: r.highlight_color || 'from-amber-500 to-yellow-600',
      status: r.status || 'active',
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }

  async createPrize(dto: CreateEventPrizeDto) {
    const id = `PRZ-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
    const eventId = dto.eventId;
    let title = dto.title?.trim();
    let sponsorName = dto.sponsorName?.trim();
    let amount = dto.amount ? BigInt(Math.round(dto.amount)) : 0n;
    let imageUrl = dto.imageUrl || null;
    let description = dto.description?.trim() || '';

    // If targetType is PRODUCT and targetId is provided, pull product info if not provided
    if (dto.targetType === 'PRODUCT' && dto.targetId) {
      const prodRows = await this.prisma.$queryRaw<any[]>`
        SELECT name, title, company, price, image_url, description FROM public.products WHERE id = ${dto.targetId} LIMIT 1
      `.catch(() => []);
      if (prodRows.length > 0) {
        const prod = prodRows[0];
        if (!title) title = prod.name || prod.title;
        if (!sponsorName) sponsorName = prod.company;
        if (!amount && prod.price) amount = BigInt(prod.price);
        if (!imageUrl) imageUrl = prod.image_url;
        if (!description) description = prod.description || '';
      }
    } else if (dto.targetType === 'SPONSOR_PACKAGE' && dto.targetId) {
      const pkgRows = await this.prisma.$queryRaw<any[]>`
        SELECT tier, price, in_kind_description FROM public.sponsor_packages WHERE id = ${dto.targetId} LIMIT 1
      `.catch(() => []);
      if (pkgRows.length > 0) {
        const pkg = pkgRows[0];
        if (!title) title = `Gói tài trợ ${String(pkg.tier).toUpperCase()}`;
        if (!amount && pkg.price) amount = BigInt(pkg.price);
        if (!description) description = pkg.in_kind_description || '';
      }
    }

    const rankName = dto.rankName?.trim() || 'Giải Thưởng';
    const value = dto.value?.trim() || (amount > 0n ? `${Number(amount).toLocaleString('vi-VN')} VNĐ` : 'Đang cập nhật');
    const quantity = Math.max(1, Math.round(dto.quantity ?? 1));
    const targetType = dto.targetType || 'PRODUCT';
    const targetId = dto.targetId || null;
    const sponsorPackageId = dto.sponsorPackageId || null;
    const iconName = dto.iconName || 'Gift';
    const highlightColor = dto.highlightColor || 'from-amber-500 to-yellow-600';

    await this.prisma.$executeRaw`
      INSERT INTO public.event_prizes (
        id, event_id, rank_name, title, value, amount, quantity,
        target_type, target_id, sponsor_name, sponsor_package_id,
        description, icon_name, image_url, highlight_color, status,
        created_at, updated_at
      ) VALUES (
        ${id}, ${eventId}, ${rankName}, ${title}, ${value}, ${amount}, ${quantity},
        ${targetType}, ${targetId}, ${sponsorName}, ${sponsorPackageId},
        ${description}, ${iconName}, ${imageUrl}, ${highlightColor}, 'active',
        NOW(), NOW()
      )
    `;

    return this.getPrizeById(id);
  }

  async updatePrize(id: string, dto: UpdateEventPrizeDto) {
    const existing = await this.getPrizeById(id);
    const eventId = dto.eventId ?? existing.eventId;
    const rankName = dto.rankName ?? existing.rankName;
    const title = dto.title ?? existing.title;
    const value = dto.value ?? existing.value;
    const amount = BigInt(Math.round(dto.amount !== undefined ? dto.amount : existing.amount));
    const quantity = Math.round(dto.quantity !== undefined ? dto.quantity : existing.quantity);
    const targetType = dto.targetType ?? existing.targetType;
    const targetId = dto.targetId !== undefined ? dto.targetId : existing.targetId;
    const sponsorName = dto.sponsorName !== undefined ? dto.sponsorName : existing.sponsorName;
    const sponsorPackageId = dto.sponsorPackageId !== undefined ? dto.sponsorPackageId : existing.sponsorPackageId;
    const description = dto.description !== undefined ? dto.description : existing.description;
    const iconName = dto.iconName ?? existing.iconName;
    const imageUrl = dto.imageUrl !== undefined ? dto.imageUrl : existing.imageUrl;
    const highlightColor = dto.highlightColor ?? existing.highlightColor;
    const status = dto.status ?? existing.status;

    await this.prisma.$executeRaw`
      UPDATE public.event_prizes
      SET event_id = ${eventId}, rank_name = ${rankName}, title = ${title}, value = ${value},
          amount = ${amount}, quantity = ${quantity}, target_type = ${targetType}, target_id = ${targetId},
          sponsor_name = ${sponsorName}, sponsor_package_id = ${sponsorPackageId}, description = ${description},
          icon_name = ${iconName}, image_url = ${imageUrl}, highlight_color = ${highlightColor},
          status = ${status}, updated_at = NOW()
      WHERE id = ${id}
    `;

    return this.getPrizeById(id);
  }

  async deletePrize(id: string) {
    await this.prisma.$executeRaw`
      DELETE FROM public.event_prizes WHERE id = ${id}
    `;
    return { ok: true, id };
  }
}
