import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdvertisementsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async ensureTables(): Promise<void> {
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
  }

  async findAll(activeOnly: boolean = false): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT 
        id, request_id, title, company_name, badge_text, banner_url, 
        target_url, animation, start_date, end_date, status, 
        impressions, clicks, created_at
      FROM public.advertisements
      WHERE (${!activeOnly} OR status = 'active')
      ORDER BY created_at DESC
    `;
  }

  async findById(id: string): Promise<any | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.advertisements WHERE id = ${id} LIMIT 1
    `;
    return rows[0] || null;
  }

  async insertAdvertisement(data: {
    id: string;
    requestId?: string | null;
    title: string;
    companyName: string;
    badgeText: string;
    bannerUrl: string;
    targetUrl: string;
    animation: string;
    startDate: string;
    endDate: string;
    status: string;
  }): Promise<void> {
    await this.prisma.$executeRaw`
      INSERT INTO public.advertisements (
        id, request_id, title, company_name, badge_text, banner_url, 
        target_url, animation, start_date, end_date, status, impressions, clicks, created_at, updated_at
      ) VALUES (
        ${data.id}, ${data.requestId || null}, ${data.title}, ${data.companyName},
        ${data.badgeText}, ${data.bannerUrl}, ${data.targetUrl}, ${data.animation},
        ${data.startDate}, ${data.endDate}, ${data.status}, 1, 0, NOW(), NOW()
      )
    `;
  }

  async updateAdvertisement(
    id: string,
    data: {
      title: string;
      companyName: string;
      badgeText: string;
      bannerUrl: string;
      targetUrl: string;
      animation: string;
      status: string;
      startDate: string;
      endDate: string;
    },
  ): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE public.advertisements
      SET 
        title = ${data.title},
        company_name = ${data.companyName},
        badge_text = ${data.badgeText},
        banner_url = ${data.bannerUrl},
        target_url = ${data.targetUrl},
        animation = ${data.animation},
        status = ${data.status},
        start_date = ${data.startDate},
        end_date = ${data.endDate},
        updated_at = NOW()
      WHERE id = ${id}
    `;
  }

  async deleteAdvertisement(id: string): Promise<void> {
    await this.prisma.$executeRaw`
      DELETE FROM public.advertisements WHERE id = ${id}
    `;
  }

  async incrementImpressions(id: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE public.advertisements SET impressions = impressions + 1 WHERE id = ${id}
    `.catch(() => {});
  }

  async incrementClicks(id: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE public.advertisements SET clicks = clicks + 1 WHERE id = ${id}
    `.catch(() => {});
  }

  async findAllRequests(): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.ad_requests ORDER BY created_at DESC
    `;
  }

  async insertAdRequest(data: {
    id: string;
    companyName: string;
    contactPerson: string;
    phone: string;
    email?: string | null;
    goal?: string | null;
    durationMonths: number;
    budgetEst: string;
    productLink?: string | null;
    notes?: string | null;
    paymentAmount: number;
    paymentCode: string;
  }): Promise<void> {
    await this.prisma.$executeRaw`
      INSERT INTO public.ad_requests (
        id, company_name, contact_person, phone, email, goal, duration_months,
        budget_est, product_link, notes, status, payment_amount, payment_code, created_at
      ) VALUES (
        ${data.id}, ${data.companyName}, ${data.contactPerson}, ${data.phone},
        ${data.email || null}, ${data.goal || null}, ${data.durationMonths},
        ${data.budgetEst}, ${data.productLink || null}, ${data.notes || null},
        'pending', ${data.paymentAmount}, ${data.paymentCode}, NOW()
      )
    `;
  }

  async updateRequestStatus(id: string, status: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE public.ad_requests SET status = ${status} WHERE id = ${id}
    `;
  }
}
