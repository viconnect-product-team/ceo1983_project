import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SponsorsRepository } from './sponsors.repository';
import { MailService } from '../mail/mail.service';
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
  constructor(
    private readonly sponsorsRepo: SponsorsRepository,
    private readonly mailService: MailService,
  ) {}

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

    const createdSponsor = await this.getSponsorById(id);

    // Tự động gửi email tri ân tới Nhà tài trợ nếu có địa chỉ email
    if (createdSponsor.email && createdSponsor.email.includes('@')) {
      this.sendSponsorThankYouEmail(createdSponsor).catch((err) => {
        console.error(`[SponsorsService] Auto send thank-you email failed for sponsor ${id} (${createdSponsor.email}):`, err);
      });
    }

    return createdSponsor;
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

  // ── SPONSOR THANK-YOU EMAIL ────────────────────────────────────────────────

  async sendSponsorThankYouEmailById(id: string) {
    const sponsor = await this.getSponsorById(id);
    if (!sponsor.email || !sponsor.email.includes('@')) {
      throw new BadRequestException('Nhà tài trợ chưa có thông tin email hợp lệ để nhận thư tri ân.');
    }
    return this.sendSponsorThankYouEmail(sponsor);
  }

  async sendSponsorThankYouEmail(sponsor: {
    id: string;
    name: string;
    contact?: string;
    email: string;
    phone?: string;
    tier?: string;
    packageType?: string;
    inKindDescription?: string;
    amount?: number;
    since?: string;
  }) {
    const to = (sponsor.email || '').trim();
    if (!to || !to.includes('@')) {
      return { ok: false, message: 'Invalid recipient email' };
    }

    const tierLabels: Record<string, { label: string; color: string; bg: string; border: string }> = {
      diamond: { label: 'KIM CƯƠNG', color: '#4338ca', bg: '#e0e7ff', border: '#a5b4fc' },
      platinum: { label: 'BẠCH KIM', color: '#0369a1', bg: '#e0f2fe', border: '#7dd3fc' },
      gold: { label: 'VÀNG (GOLD)', color: '#b45309', bg: '#fef3c7', border: '#fcd34d' },
      silver: { label: 'BẠC (SILVER)', color: '#475569', bg: '#f1f5f9', border: '#cbd5e1' },
      bronze: { label: 'ĐỒNG (BRONZE)', color: '#9a3412', bg: '#ffedd5', border: '#fdba74' },
    };
    const currentTier = tierLabels[sponsor.tier?.toLowerCase() || 'bronze'] || tierLabels.bronze;

    const formattedAmount = Number(sponsor.amount || 0) > 0
      ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(sponsor.amount))
      : (sponsor.packageType === 'in_kind' ? 'Tài trợ Hiện vật' : '0 đ');

    const packageTypeLabel = sponsor.packageType === 'in_kind' ? 'Tài trợ Hiện vật / Sản phẩm dịch vụ' : 'Tài trợ Tài chính (Tiền mặt)';
    const safeSince = sponsor.since ? String(sponsor.since).slice(0, 10) : new Date().toISOString().slice(0, 10);
    const greetingName = sponsor.contact ? `${sponsor.contact} (Đại diện ${sponsor.name})` : sponsor.name;

    const subject = `[CLB CEO 1983] Thư Tri Ân & Vinh Danh Nhà Tài Trợ — ${sponsor.name}`;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b; }
    .email-wrapper { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 36px rgba(0, 27, 84, 0.12); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #001B54 0%, #002B7A 50%, #001238 100%); padding: 40px 32px; text-align: center; color: #ffffff; position: relative; }
    .gold-badge { display: inline-block; background: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; color: #fbbf24; padding: 5px 16px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 14px; }
    .brand-title { font-size: 23px; font-weight: 900; margin: 0 0 8px 0; color: #ffffff; letter-spacing: 0.5px; }
    .brand-sub { font-size: 13px; color: rgba(255, 255, 255, 0.85); margin: 0; line-height: 1.5; font-weight: 400; }
    .body-content { padding: 36px 32px; }
    .greeting { font-size: 16px; font-weight: 700; color: #001B54; margin-bottom: 16px; line-height: 1.5; }
    .paragraph { font-size: 14px; line-height: 1.7; color: #334155; margin-bottom: 16px; text-align: justify; }
    .card-highlight { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; margin: 24px 0; border-top: 4px solid #f59e0b; }
    .card-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #001B54; margin-bottom: 16px; letter-spacing: 0.8px; }
    .info-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
    .info-table td { padding: 9px 0; vertical-align: top; border-bottom: 1px dashed #e2e8f0; }
    .info-table tr:last-child td { border-bottom: none; }
    .info-label { color: #64748b; font-weight: 500; width: 38%; }
    .info-val { color: #0f172a; font-weight: 700; text-align: right; }
    .tier-pill { display: inline-block; padding: 3px 12px; border-radius: 9999px; font-weight: 800; font-size: 12px; }
    .benefits-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 14px; padding: 20px; margin: 24px 0; }
    .benefits-title { font-size: 13px; font-weight: 800; color: #1e40af; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    .benefit-item { font-size: 13px; color: #1e3a8a; margin-bottom: 6px; line-height: 1.5; }
    .signature { margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: right; }
    .sign-role { font-size: 13px; font-weight: 700; color: #001B54; text-transform: uppercase; margin-bottom: 4px; }
    .sign-org { font-size: 12px; color: #64748b; margin-bottom: 8px; }
    .sign-rep { font-size: 14px; font-weight: 800; color: #d97706; }
    .footer { background: #001338; padding: 26px; text-align: center; color: rgba(255, 255, 255, 0.6); font-size: 11.5px; line-height: 1.6; }
    .footer strong { color: #f59e0b; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div class="gold-badge">✦ ĐỐI TÁC CHIẾN LƯỢC — CEO 1983 ✦</div>
      <h1 class="brand-title">CLB DOANH NHÂN CEO 1983</h1>
      <p class="brand-sub">Trực thuộc Hội Doanh nghiệp Trẻ Hà Nội (HanoiBA)<br>Kết nối bền vững — Kiến tạo thịnh vượng — Vươn tầm doanh nhân</p>
    </div>

    <div class="body-content">
      <div class="greeting">Kính gửi: ${greetingName},</div>

      <p class="paragraph">
        Ban Chấp hành <strong>CLB Doanh Nhân CEO 1983</strong> và Ban Tổ chức xin trân trọng gửi tới Quý Doanh nghiệp lời chào trân trọng, lời tri ân sâu sắc cùng lời chúc sức khỏe, thịnh vượng và ngày càng phát triển vững bền.
      </p>

      <p class="paragraph">
        Chúng tôi vô cùng vinh hạnh và trân quý khi nhận được sự đồng hành, tài trợ quý báu từ Quý Đơn vị trong các hoạt động, sự kiện và chương trình kết nối giao thương chiến lược của Hiệp hội. Sự chung tay, tin tưởng của Quý Nhà tài trợ chính là động lực to lớn tạo nên sự thành công rực rỡ và giá trị lan tỏa mạnh mẽ trong cộng đồng doanh nhân.
      </p>

      <div class="card-highlight">
        <div class="card-title">✦ THÔNG TIN GÓI TÀI TRỢ GHI NHẬN</div>
        <table class="info-table">
          <tr>
            <td class="info-label">Đơn vị tài trợ:</td>
            <td class="info-val">${sponsor.name}</td>
          </tr>
          ${sponsor.contact ? `<tr><td class="info-label">Đại diện liên hệ:</td><td class="info-val">${sponsor.contact}</td></tr>` : ''}
          <tr>
            <td class="info-label">Hạng tài trợ:</td>
            <td class="info-val">
              <span class="tier-pill" style="color: ${currentTier.color}; background-color: ${currentTier.bg}; border: 1px solid ${currentTier.border};">
                ${currentTier.label}
              </span>
            </td>
          </tr>
          <tr>
            <td class="info-label">Hình thức:</td>
            <td class="info-val">${packageTypeLabel}</td>
          </tr>
          ${sponsor.packageType === 'in_kind' && sponsor.inKindDescription ? `
          <tr>
            <td class="info-label">Mô tả hiện vật:</td>
            <td class="info-val">${sponsor.inKindDescription}</td>
          </tr>
          ` : ''}
          <tr>
            <td class="info-label">Giá trị tài trợ:</td>
            <td class="info-val" style="color: #001B54; font-size: 15px; font-weight: 800;">${formattedAmount}</td>
          </tr>
          <tr>
            <td class="info-label">Thời gian đồng hành:</td>
            <td class="info-val">${safeSince}</td>
          </tr>
        </table>
      </div>

      <div class="benefits-box">
        <div class="benefits-title">★ CAM KẾT QUYỀN LỢI ĐẶC QUYỀN</div>
        <div class="benefit-item">✓ Vinh danh trang trọng thương hiệu trên toàn bộ backdrop, kỷ yếu, ấn phẩm và truyền thông số của CLB.</div>
        <div class="benefit-item">✓ Bố trí gian hàng / vị trí trưng bày VIP giới thiệu giải pháp sản phẩm trực tiếp đến hàng trăm CEO đối tác.</div>
        <div class="benefit-item">✓ Quyền lợi kết nối giao thương 1-1 độc quyền cùng Ban Lãnh đạo và mạng lưới Hội viên HanoiBA.</div>
        <div class="benefit-item">✓ Trao kỷ niệm chương và thư tri ân trang trọng tại Gala sự kiện chính thức.</div>
      </div>

      <p class="paragraph">
        Đại diện Ban Vận động Tài trợ và Ban Thư ký CLB sẽ chủ động liên hệ trực tiếp với Anh/Chị để thống nhất các tài liệu thiết kế thương hiệu, video clip trình chiếu và các khâu chuẩn bị nhằm mang lại hiệu quả nhận diện cao nhất cho Quý Đơn vị.
      </p>

      <p class="paragraph" style="margin-bottom: 0;">
        Một lần nữa, xin kính chúc Quý Doanh nghiệp ngày càng bứt phá mạnh mẽ, liên tục mở rộng thị phần và đạt được những bước tiến rực rỡ trong tương lai!
      </p>

      <div class="signature">
        <div class="sign-role">TM. BAN CHẤP HÀNH CLB DOANH NHÂN CEO 1983</div>
        <div class="sign-org">Hội Doanh nghiệp Trẻ Hà Nội (HanoiBA)</div>
        <div class="sign-rep">Ban Vận động Tài trợ & Đối ngoại</div>
      </div>
    </div>

    <div class="footer">
      <strong>CLB DOANH NHÂN CEO 1983 — HANOIBA</strong><br>
      Tòa nhà Hội Doanh nghiệp Trẻ Hà Nội, Cung Trí Thức, Cầu Giấy, Hà Nội<br>
      Email: bch@ceo1983.vn | Website: ceo1983.vn | Hotline VIP: 0983.198.383
    </div>
  </div>
</body>
</html>
    `.trim();

    return this.mailService.dispatchSmtpEmail({
      to,
      subject,
      html,
      fromName: 'CLB Doanh Nhân CEO 1983',
      auditContext: `[SPONSOR_THANK_YOU] SponsorId: ${sponsor.id} | Tier: ${sponsor.tier}`,
    });
  }
}
