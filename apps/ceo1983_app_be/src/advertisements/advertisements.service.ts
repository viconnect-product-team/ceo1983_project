import { Injectable, NotFoundException, BadRequestException, Logger, OnModuleInit } from '@nestjs/common';
import { AdvertisementsRepository } from './advertisements.repository';
import { CreateAdvertisementDto, CreateAdRequestDto } from './dto';

export interface AdvertisementItem {
  id: string;
  requestId?: string;
  title: string;
  companyName: string;
  badgeText: string;
  bannerUrl: string;
  targetUrl: string;
  animation: string;
  startDate: string;
  endDate: string;
  status: string;
  impressions: number;
  clicks: number;
  createdAt: string;
}

@Injectable()
export class AdvertisementsService implements OnModuleInit {
  private readonly logger = new Logger(AdvertisementsService.name);

  constructor(private readonly adsRepo: AdvertisementsRepository) {}

  async onModuleInit() {
    try {
      await this.adsRepo.ensureTables();
    } catch (e: any) {
      this.logger.warn(`Could not ensure advertisements tables: ${e?.message}`);
    }
  }

  async findAll(activeOnly: boolean = false): Promise<AdvertisementItem[]> {
    try {
      const rows = await this.adsRepo.findAll(activeOnly);

      return rows.map((r) => ({
        id: r.id,
        requestId: r.request_id || undefined,
        title: r.title,
        companyName: r.company_name,
        badgeText: r.badge_text || 'ĐỐI TÁC CHIẾN LƯỢC',
        bannerUrl: r.banner_url,
        targetUrl: r.target_url || 'https://ceo1983.vn',
        animation: r.animation || 'gradient-wave',
        startDate: r.start_date || new Date().toISOString().split('T')[0],
        endDate: r.end_date || new Date(Date.now() + 864e5 * 90).toISOString().split('T')[0],
        status: r.status || 'active',
        impressions: Number(r.impressions || 0),
        clicks: Number(r.clicks || 0),
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      }));
    } catch (err: any) {
      this.logger.error(`Error in findAll: ${err?.message}`, err?.stack);
      return [];
    }
  }

  async findById(id: string): Promise<AdvertisementItem> {
    const r = await this.adsRepo.findById(id);
    if (!r) {
      throw new NotFoundException(`Không tìm thấy quảng cáo với ID: ${id}`);
    }
    return {
      id: r.id,
      requestId: r.request_id || undefined,
      title: r.title,
      companyName: r.company_name,
      badgeText: r.badge_text || 'ĐỐI TÁC CHIẾN LƯỢC',
      bannerUrl: r.banner_url,
      targetUrl: r.target_url || 'https://ceo1983.vn',
      animation: r.animation || 'gradient-wave',
      startDate: r.start_date,
      endDate: r.end_date,
      status: r.status || 'active',
      impressions: Number(r.impressions || 0),
      clicks: Number(r.clicks || 0),
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    };
  }

  async create(dto: CreateAdvertisementDto): Promise<AdvertisementItem> {
    const id = `ad_${Date.now()}`;
    const badgeText = dto.badgeText?.trim() || 'ĐỐI TÁC CHIẾN LƯỢC';
    const animation = dto.animation?.trim() || 'gradient-wave';
    const status = dto.status || 'active';
    const startDate = dto.startDate || new Date().toISOString().split('T')[0];
    const endDate = dto.endDate || new Date(Date.now() + 864e5 * 90).toISOString().split('T')[0];
    const targetUrl = dto.targetUrl?.trim() || 'https://ceo1983.vn/marketplace';

    await this.adsRepo.insertAdvertisement({
      id,
      requestId: dto.requestId || null,
      title: dto.title.trim(),
      companyName: dto.companyName.trim(),
      badgeText,
      bannerUrl: dto.bannerUrl.trim(),
      targetUrl,
      animation,
      startDate,
      endDate,
      status,
    });

    if (dto.requestId) {
      await this.adsRepo.updateRequestStatus(dto.requestId, 'active').catch(() => {});
    }

    return this.findById(id);
  }

  async update(id: string, data: Partial<CreateAdvertisementDto>): Promise<AdvertisementItem> {
    const ad = await this.findById(id);
    const title = data.title !== undefined ? data.title.trim() : ad.title;
    const companyName = data.companyName !== undefined ? data.companyName.trim() : ad.companyName;
    const badgeText = data.badgeText !== undefined ? data.badgeText.trim() : ad.badgeText;
    const bannerUrl = data.bannerUrl !== undefined ? data.bannerUrl.trim() : ad.bannerUrl;
    const targetUrl = data.targetUrl !== undefined ? data.targetUrl.trim() : ad.targetUrl;
    const animation = data.animation !== undefined ? data.animation.trim() : ad.animation;
    const status = data.status !== undefined ? data.status : ad.status;
    const startDate = data.startDate !== undefined ? data.startDate : ad.startDate;
    const endDate = data.endDate !== undefined ? data.endDate : ad.endDate;

    await this.adsRepo.updateAdvertisement(id, {
      title,
      companyName,
      badgeText,
      bannerUrl,
      targetUrl,
      animation,
      status,
      startDate,
      endDate,
    });

    return this.findById(id);
  }

  async delete(id: string): Promise<{ success: boolean }> {
    await this.findById(id);
    await this.adsRepo.deleteAdvertisement(id);
    return { success: true };
  }

  async trackImpression(id: string): Promise<void> {
    await this.adsRepo.incrementImpressions(id);
  }

  async trackClick(id: string): Promise<void> {
    await this.adsRepo.incrementClicks(id);
  }

  // --- Requests ---
  async findAllRequests(): Promise<any[]> {
    try {
      const rows = await this.adsRepo.findAllRequests();
      return rows.map((r) => ({
        id: r.id,
        companyName: r.company_name,
        contactPerson: r.contact_person,
        phone: r.phone,
        email: r.email || '',
        goal: r.goal || '',
        durationMonths: Number(r.duration_months || 3),
        budgetEst: r.budget_est || '15.000.000 đ',
        productLink: r.product_link || '',
        notes: r.notes || '',
        status: r.status || 'pending',
        paymentAmount: Number(r.payment_amount || 15000000),
        paymentCode: r.payment_code || `QC-CEO1983-${r.id}`,
        createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      }));
    } catch (err: any) {
      this.logger.error(`Error in findAllRequests: ${err?.message}`, err?.stack);
      return [];
    }
  }

  async createRequest(dto: CreateAdRequestDto): Promise<any> {
    const id = `req_ad_${Date.now()}`;
    const paymentAmount = (dto.durationMonths || 3) * 5000000;
    const paymentCode = `QC-CEO1983-${Date.now().toString().slice(-6)}`;

    await this.adsRepo.insertAdRequest({
      id,
      companyName: dto.companyName.trim(),
      contactPerson: dto.contactPerson.trim(),
      phone: dto.phone.trim(),
      email: dto.email || null,
      goal: dto.goal || null,
      durationMonths: dto.durationMonths || 3,
      budgetEst: dto.budgetEst || '15.000.000 đ',
      productLink: dto.productLink || null,
      notes: dto.notes || null,
      paymentAmount,
      paymentCode,
    });

    return { id, success: true };
  }

  async updateRequestStatus(id: string, status: string): Promise<any> {
    await this.adsRepo.updateRequestStatus(id, status);
    return { id, status, success: true };
  }
}
