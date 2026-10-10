import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SponsorsRepository } from './sponsors.repository';
import {
  SponsorTier,
  SponsorType,
  PackageType,
  PrizeTargetType,
  CreateSponsorPackageDto,
  UpdateSponsorPackageDto,
  CreateSponsorDto,
  OnboardSponsorDto,
  CreateEventPrizeDto,
  UpdateEventPrizeDto,
} from './dto';

export type {
  SponsorTier,
  SponsorType,
  PackageType,
  PrizeTargetType,
};
export {
  CreateSponsorPackageDto,
  UpdateSponsorPackageDto,
  CreateSponsorDto,
  OnboardSponsorDto,
  CreateEventPrizeDto,
  UpdateEventPrizeDto,
};

@Injectable()
export class SponsorsService {
  constructor(private readonly sponsorsRepo: SponsorsRepository) {}

  private async resolveAssociationId(assocId?: string): Promise<string> {
    if (assocId) return assocId;
    const defaultId = await this.sponsorsRepo.resolveDefaultAssociationId();
    if (defaultId) return defaultId;
    return 'ba000000-0000-4000-8000-000000000001';
  }

  // ── SPONSOR PACKAGES ────────────────────────────────────────────────────────

  async listPackages() {
    try {
      const rows = await this.sponsorsRepo.listPackagesRaw();
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
    const rows = await this.sponsorsRepo.getPackageByIdRaw(id);
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
    const lastPkg = await this.sponsorsRepo.getLastPackageId();
    const id = lastPkg.length > 0 ? (BigInt(lastPkg[0].id) + 1n).toString() : '30001';
    const tier = dto.tier || 'bronze';
    const price = BigInt(Math.round(dto.price || 0));
    const benefits = dto.benefits || [];
    const available = Math.round(dto.available ?? 0);
    const sold = Math.round(dto.sold ?? 0);
    const packageType = dto.packageType || 'cash';
    const inKindDescription = dto.inKindDescription || null;
    const associationId = await this.resolveAssociationId(dto.associationId);

    await this.sponsorsRepo.insertPackage(id, tier, price, benefits, available, sold, associationId, packageType, inKindDescription);
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

    await this.sponsorsRepo.updatePackageRaw(id, tier, price, benefits, available, sold, packageType, inKindDescription);
    return this.getPackageById(id);
  }

  async deletePackage(id: string) {
    await this.sponsorsRepo.deletePackageRaw(id);
    return { ok: true };
  }

  // ── SPONSORS ────────────────────────────────────────────────────────────────

  async listSponsors() {
    try {
      const [rows, events] = await Promise.all([
        this.sponsorsRepo.listSponsorsRaw(),
        this.sponsorsRepo.listEventsWithSponsors(),
      ]);

      return (rows || []).map((r) => {
        let assignedEvent: any = null;

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
    const rows = await this.sponsorsRepo.getSponsorByIdRaw(id);
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
    const lastSp = await this.sponsorsRepo.getLastSponsorId();
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

    await this.sponsorsRepo.insertSponsor(
      id, name, tier, sponsorType, packageType, inKindDescription,
      contact, email, phone, amount, events, safeSince, status, associationId,
    );

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

    await this.sponsorsRepo.updateSponsorRaw(
      id, name, tier, sponsorType, packageType, inKindDescription,
      contact, email, phone, amount, events, since, status,
    );

    return this.getSponsorById(id);
  }

  async deleteSponsor(id: string) {
    await this.sponsorsRepo.deleteSponsorRaw(id);
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

    if (dto.packageId) {
      await this.sponsorsRepo.incrementPackageSold(dto.packageId);
    }
    return sponsor;
  }

  // ── EVENT PRIZES / AWARDS ──────────────────────────────────────────────────

  async listPrizes(eventId?: string) {
    try {
      const rows = await this.sponsorsRepo.listPrizesRaw(eventId);

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
    const rows = await this.sponsorsRepo.getPrizeByIdRaw(id);
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

    if (dto.targetType === 'PRODUCT' && dto.targetId) {
      const prodRows = await this.sponsorsRepo.findProductForPrize(dto.targetId);
      if (prodRows.length > 0) {
        const prod = prodRows[0];
        if (!title) title = prod.name || prod.title;
        if (!sponsorName) sponsorName = prod.company;
        if (!amount && prod.price) amount = BigInt(prod.price);
        if (!imageUrl) imageUrl = prod.image_url;
        if (!description) description = prod.description || '';
      }
    } else if (dto.targetType === 'SPONSOR_PACKAGE' && dto.targetId) {
      const pkgRows = await this.sponsorsRepo.findPackageForPrize(dto.targetId);
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

    await this.sponsorsRepo.insertPrize(
      id, eventId, rankName, title || 'Giải thưởng sự kiện', value, amount, quantity,
      targetType, targetId, sponsorName || 'Nhà tài trợ CEO 1983', sponsorPackageId,
      description, iconName, imageUrl, highlightColor,
    );

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

    await this.sponsorsRepo.updatePrizeRaw(
      id, eventId, rankName, title, value, amount, quantity,
      targetType, targetId, sponsorName, sponsorPackageId,
      description, iconName, imageUrl, highlightColor, status,
    );

    return this.getPrizeById(id);
  }

  async deletePrize(id: string) {
    await this.sponsorsRepo.deletePrizeRaw(id);
    return { ok: true, id };
  }
}
