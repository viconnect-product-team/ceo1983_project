import { Injectable, NotFoundException, BadRequestException, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdvertisementDto, CreateAdRequestDto } from './dto/create-advertisement.dto';

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

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS public.advertisements (
          id VARCHAR(64) PRIMARY KEY,
          request_id VARCHAR(64),
          title VARCHAR(255) NOT NULL,
          company_name VARCHAR(255) NOT NULL,
          badge_text VARCHAR(100) DEFAULT 'ĐỐI TÁC CHIẾN LƯỢC',
          banner_url TEXT NOT NULL,
          target_url TEXT,
          animation VARCHAR(50) DEFAULT 'gradient-wave',
          start_date VARCHAR(50),
          end_date VARCHAR(50),
          status VARCHAR(20) DEFAULT 'active',
          impressions BIGINT DEFAULT 0,
          clicks BIGINT DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS public.ad_requests (
          id VARCHAR(64) PRIMARY KEY,
          company_name VARCHAR(255) NOT NULL,
          contact_person VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          email VARCHAR(100),
          goal TEXT,
          duration_months INT DEFAULT 3,
          budget_est VARCHAR(100) DEFAULT '15.000.000 đ',
          product_link TEXT,
          notes TEXT,
          status VARCHAR(20) DEFAULT 'pending',
          payment_amount BIGINT DEFAULT 15000000,
          payment_code VARCHAR(100),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
    } catch (e: any) {
      this.logger.warn(`Could not ensure advertisements tables: ${e?.message}`);
    }
  }

  async findAll(activeOnly: boolean = false): Promise<AdvertisementItem[]> {
    try {
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT 
          id, request_id, title, company_name, badge_text, banner_url, 
          target_url, animation, start_date, end_date, status, 
          impressions, clicks, created_at
        FROM public.advertisements
        WHERE (${!activeOnly} OR status = 'active')
        ORDER BY created_at DESC
      `;

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
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.advertisements WHERE id = ${id} LIMIT 1
    `;
    if (!rows.length) {
      throw new NotFoundException(`Không tìm thấy quảng cáo với ID: ${id}`);
    }
    const r = rows[0];
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

    await this.prisma.$executeRaw`
      INSERT INTO public.advertisements (
        id, request_id, title, company_name, badge_text, banner_url, 
        target_url, animation, start_date, end_date, status, impressions, clicks, created_at, updated_at
      ) VALUES (
        ${id}, ${dto.requestId || null}, ${dto.title.trim()}, ${dto.companyName.trim()},
        ${badgeText}, ${dto.bannerUrl.trim()}, ${targetUrl}, ${animation},
        ${startDate}, ${endDate}, ${status}, 1, 0, NOW(), NOW()
      )
    `;

    if (dto.requestId) {
      await this.prisma.$executeRaw`
        UPDATE public.ad_requests SET status = 'active' WHERE id = ${dto.requestId}
      `.catch(() => {});
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

    await this.prisma.$executeRaw`
      UPDATE public.advertisements
      SET 
        title = ${title},
        company_name = ${companyName},
        badge_text = ${badgeText},
        banner_url = ${bannerUrl},
        target_url = ${targetUrl},
        animation = ${animation},
        status = ${status},
        start_date = ${startDate},
        end_date = ${endDate},
        updated_at = NOW()
      WHERE id = ${id}
    `;

    return this.findById(id);
  }

  async delete(id: string): Promise<{ success: boolean }> {
    await this.findById(id);
    await this.prisma.$executeRaw`
      DELETE FROM public.advertisements WHERE id = ${id}
    `;
    return { success: true };
  }

  async trackImpression(id: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE public.advertisements SET impressions = impressions + 1 WHERE id = ${id}
    `.catch(() => {});
  }

  async trackClick(id: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE public.advertisements SET clicks = clicks + 1 WHERE id = ${id}
    `.catch(() => {});
  }

  // --- Requests ---
  async findAllRequests(): Promise<any[]> {
    try {
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT * FROM public.ad_requests ORDER BY created_at DESC
      `;
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

    await this.prisma.$executeRaw`
      INSERT INTO public.ad_requests (
        id, company_name, contact_person, phone, email, goal, duration_months,
        budget_est, product_link, notes, status, payment_amount, payment_code, created_at
      ) VALUES (
        ${id}, ${dto.companyName.trim()}, ${dto.contactPerson.trim()}, ${dto.phone.trim()},
        ${dto.email || null}, ${dto.goal || null}, ${dto.durationMonths || 3},
        ${dto.budgetEst || '15.000.000 đ'}, ${dto.productLink || null}, ${dto.notes || null},
        'pending', ${paymentAmount}, ${paymentCode}, NOW()
      )
    `;

    return { id, success: true };
  }

  async updateRequestStatus(id: string, status: string): Promise<any> {
    await this.prisma.$executeRaw`
      UPDATE public.ad_requests SET status = ${status} WHERE id = ${id}
    `;
    return { id, status, success: true };
  }
}
