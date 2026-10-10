import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SponsorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async resolveDefaultAssociationId(): Promise<string | null> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.associations 
      ORDER BY landing_published DESC, created_at DESC 
      LIMIT 1
    `.catch(() => []);
    return rows[0]?.id || null;
  }

  // ── PACKAGES ──────────────────────────────────────────────────────────

  async listPackagesRaw(): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.sponsor_packages
      ORDER BY created_at DESC
    `;
  }

  async getPackageByIdRaw(id: string): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.sponsor_packages WHERE id = ${id} LIMIT 1
    `;
  }

  async getLastPackageId(): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.sponsor_packages WHERE id ~ '^[0-9]+$' ORDER BY CAST(id AS BIGINT) DESC LIMIT 1
    `.catch(() => []);
  }

  async insertPackage(id: string, tier: string, price: bigint, benefits: string[], available: number, sold: number, associationId: string, packageType: string, inKindDescription: string | null): Promise<void> {
    await this.prisma.$executeRaw`
      INSERT INTO public.sponsor_packages (id, tier, price, benefits, available, sold, association_id, package_type, in_kind_description, created_at, updated_at)
      VALUES (${id}, ${tier}, ${price}, ${benefits}::text[], ${available}, ${sold}, ${associationId}::uuid, ${packageType}, ${inKindDescription}, NOW(), NOW())
    `;
  }

  async updatePackageRaw(id: string, tier: string, price: bigint, benefits: string[], available: number, sold: number, packageType: string, inKindDescription: string | null): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE public.sponsor_packages
      SET tier = ${tier}, price = ${price}, benefits = ${benefits}::text[], available = ${available}, sold = ${sold},
          package_type = ${packageType}, in_kind_description = ${inKindDescription}, updated_at = NOW()
      WHERE id = ${id}
    `;
  }

  async deletePackageRaw(id: string): Promise<void> {
    await this.prisma.$executeRaw`
      DELETE FROM public.sponsor_packages WHERE id = ${id}
    `;
  }

  async incrementPackageSold(packageId: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE public.sponsor_packages
      SET sold = sold + 1, updated_at = NOW()
      WHERE id = ${packageId}
    `;
  }

  // ── SPONSORS ──────────────────────────────────────────────────────────

  async listSponsorsRaw(): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.sponsors
      ORDER BY amount DESC, created_at DESC
    `;
  }

  async listEventsWithSponsors(): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT id, name, date, sponsors, status FROM public.events
      WHERE sponsors IS NOT NULL
    `.catch(() => []);
  }

  async getSponsorByIdRaw(id: string): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.sponsors WHERE id = ${id} LIMIT 1
    `;
  }

  async getLastSponsorId(): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.sponsors WHERE id ~ '^[0-9]+$' ORDER BY CAST(id AS BIGINT) DESC LIMIT 1
    `.catch(() => []);
  }

  async insertSponsor(id: string, name: string, tier: string, sponsorType: string, packageType: string, inKindDescription: string | null, contact: string, email: string, phone: string, amount: bigint, events: number, since: string, status: string, associationId: string): Promise<void> {
    await this.prisma.$executeRaw`
      INSERT INTO public.sponsors (id, name, tier, sponsor_type, package_type, in_kind_description, contact, email, phone, amount, events, since, status, association_id, created_at, updated_at)
      VALUES (${id}, ${name}, ${tier}, ${sponsorType}, ${packageType}, ${inKindDescription}, ${contact}, ${email}, ${phone}, ${amount}, ${events}, ${since}::date, ${status}, ${associationId}::uuid, NOW(), NOW())
    `;
  }

  async updateSponsorRaw(id: string, name: string, tier: string, sponsorType: string, packageType: string, inKindDescription: string | null, contact: string, email: string, phone: string, amount: bigint, events: number, since: string, status: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE public.sponsors
      SET name = ${name}, tier = ${tier}, sponsor_type = ${sponsorType}, package_type = ${packageType}, in_kind_description = ${inKindDescription},
          contact = ${contact}, email = ${email}, phone = ${phone},
          amount = ${amount}, events = ${events}, since = ${since}::date, status = ${status}, updated_at = NOW()
      WHERE id = ${id}
    `;
  }

  async deleteSponsorRaw(id: string): Promise<void> {
    await this.prisma.$executeRaw`
      DELETE FROM public.sponsors WHERE id = ${id}
    `;
  }

  // ── PRIZES ────────────────────────────────────────────────────────────

  async listPrizesRaw(eventId?: string): Promise<any[]> {
    if (eventId) {
      return this.prisma.$queryRaw<any[]>`
        SELECT ep.*, p.name as prod_name, p.company as prod_company, p.price as prod_price, p.image_url as prod_image,
               sp.tier as pkg_tier, sp.price as pkg_price
        FROM public.event_prizes ep
        LEFT JOIN public.products p ON ep.target_id = p.id
        LEFT JOIN public.sponsor_packages sp ON ep.target_id = sp.id
        WHERE ep.event_id = ${eventId}
        ORDER BY ep.created_at ASC
      `;
    }
    return this.prisma.$queryRaw<any[]>`
      SELECT ep.*, p.name as prod_name, p.company as prod_company, p.price as prod_price, p.image_url as prod_image,
             sp.tier as pkg_tier, sp.price as pkg_price
      FROM public.event_prizes ep
      LEFT JOIN public.products p ON ep.target_id = p.id
      LEFT JOIN public.sponsor_packages sp ON ep.target_id = sp.id
      ORDER BY ep.created_at ASC
    `;
  }

  async getPrizeByIdRaw(id: string): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT ep.*, p.name as prod_name, p.company as prod_company, p.price as prod_price, p.image_url as prod_image
      FROM public.event_prizes ep
      LEFT JOIN public.products p ON ep.target_id = p.id
      WHERE ep.id = ${id}
      LIMIT 1
    `;
  }

  async findProductForPrize(productId: string): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT name, title, company, price, image_url, description FROM public.products WHERE id = ${productId} LIMIT 1
    `.catch(() => []);
  }

  async findPackageForPrize(packageId: string): Promise<any[]> {
    return this.prisma.$queryRaw<any[]>`
      SELECT tier, price, in_kind_description FROM public.sponsor_packages WHERE id = ${packageId} LIMIT 1
    `.catch(() => []);
  }

  async insertPrize(id: string, eventId: string, rankName: string, title: string, value: string, amount: bigint, quantity: number, targetType: string, targetId: string | null, sponsorName: string, sponsorPackageId: string | null, description: string, iconName: string, imageUrl: string | null, highlightColor: string): Promise<void> {
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
  }

  async updatePrizeRaw(id: string, eventId: string, rankName: string, title: string, value: string, amount: bigint, quantity: number, targetType: string, targetId: string | null, sponsorName: string, sponsorPackageId: string | null, description: string, iconName: string, imageUrl: string | null, highlightColor: string, status: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE public.event_prizes
      SET event_id = ${eventId}, rank_name = ${rankName}, title = ${title}, value = ${value},
          amount = ${amount}, quantity = ${quantity}, target_type = ${targetType}, target_id = ${targetId},
          sponsor_name = ${sponsorName}, sponsor_package_id = ${sponsorPackageId}, description = ${description},
          icon_name = ${iconName}, image_url = ${imageUrl}, highlight_color = ${highlightColor},
          status = ${status}, updated_at = NOW()
      WHERE id = ${id}
    `;
  }

  async deletePrizeRaw(id: string): Promise<void> {
    await this.prisma.$executeRaw`
      DELETE FROM public.event_prizes WHERE id = ${id}
    `;
  }
}
