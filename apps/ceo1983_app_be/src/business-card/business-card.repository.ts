import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BusinessCardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listCardsByOwner(userId: string): Promise<any[]> {
    return this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM public.member_business_cards WHERE owner_user_id = $1::uuid ORDER BY updated_at DESC`,
      userId,
    );
  }

  async findCardById(id: string): Promise<any | null> {
    const cards = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM public.member_business_cards WHERE id = $1::uuid`,
      id,
    ).catch(() => []);
    return cards[0] || null;
  }

  async findCardBySlug(slug: string): Promise<any | null> {
    const cards = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM public.member_business_cards WHERE slug = $1`,
      slug,
    ).catch(() => []);
    return cards[0] || null;
  }

  async findCardByCode(code: string): Promise<any | null> {
    const cards = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM public.member_business_cards WHERE card_code = $1 OR slug = $1 LIMIT 1`,
      code,
    ).catch(() => []);
    return cards[0] || null;
  }

  async findCardSkills(cardId: string): Promise<any[]> {
    return this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM public.business_card_skills WHERE card_id = $1::uuid ORDER BY sort_order ASC`,
      cardId,
    ).catch(() => []);
  }

  async findCardServices(cardId: string): Promise<any[]> {
    return this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM public.business_card_services WHERE card_id = $1::uuid ORDER BY sort_order ASC`,
      cardId,
    ).catch(() => []);
  }

  async findCardNeeds(cardId: string): Promise<any[]> {
    return this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM public.business_card_needs WHERE card_id = $1::uuid ORDER BY sort_order ASC`,
      cardId,
    ).catch(() => []);
  }

  async upsertCard(query: string, params: any[]): Promise<any[]> {
    return this.prisma.$queryRawUnsafe<any[]>(query, ...params);
  }

  async clearSkills(cardId: string): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `DELETE FROM public.business_card_skills WHERE card_id = $1::uuid`,
      cardId,
    ).catch(() => {});
  }

  async insertSkill(cardId: string, skill: string, sortOrder: number): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO public.business_card_skills (id, card_id, skill, sort_order) VALUES (gen_random_uuid(), $1::uuid, $2, $3)`,
      cardId,
      skill,
      sortOrder,
    ).catch(() => {});
  }

  async clearServices(cardId: string): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `DELETE FROM public.business_card_services WHERE card_id = $1::uuid`,
      cardId,
    ).catch(() => {});
  }

  async insertService(cardId: string, title: string, description: string, sortOrder: number): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO public.business_card_services (id, card_id, title, description, sort_order) VALUES (gen_random_uuid(), $1::uuid, $2, $3, $4)`,
      cardId,
      title,
      description,
      sortOrder,
    ).catch(() => {});
  }

  async clearNeeds(cardId: string): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `DELETE FROM public.business_card_needs WHERE card_id = $1::uuid`,
      cardId,
    ).catch(() => {});
  }

  async insertNeed(cardId: string, title: string, description: string, sortOrder: number): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO public.business_card_needs (id, card_id, title, description, sort_order) VALUES (gen_random_uuid(), $1::uuid, $2, $3, $4)`,
      cardId,
      title,
      description,
      sortOrder,
    ).catch(() => {});
  }

  async deleteCard(userId: string, id: string): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `DELETE FROM public.member_business_cards WHERE id = $1::uuid AND owner_user_id = $2::uuid`,
      id,
      userId,
    );
  }

  async getCardSettings(userId: string): Promise<any[]> {
    return this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM public.business_card_settings WHERE user_id = $1::uuid LIMIT 1`,
      userId,
    ).catch(() => []);
  }

  async saveCardSettings(userId: string, settings: any): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO public.business_card_settings (user_id, settings, updated_at)
       VALUES ($1::uuid, $2::jsonb, NOW())
       ON CONFLICT (user_id) DO UPDATE SET settings = $2::jsonb, updated_at = NOW()`,
      userId,
      JSON.stringify(settings),
    ).catch(() => {});
  }

  async saveCardAiHistory(userId: string, action: string, prompt: string, response: string, metadata: any): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `INSERT INTO public.business_card_ai_history (id, user_id, action, prompt, response, metadata, created_at)
       VALUES (gen_random_uuid(), $1::uuid, $2, $3, $4, $5::jsonb, NOW())`,
      userId,
      action,
      prompt,
      response,
      JSON.stringify(metadata || {}),
    ).catch(() => {});
  }

  async listCardAiHistory(userId: string): Promise<any[]> {
    return this.prisma.$queryRawUnsafe<any[]>(
      `SELECT * FROM public.business_card_ai_history WHERE user_id = $1::uuid ORDER BY created_at DESC LIMIT 50`,
      userId,
    ).catch(() => []);
  }

  async deleteCardAiHistory(userId: string, id: string): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `DELETE FROM public.business_card_ai_history WHERE id = $1::uuid AND user_id = $2::uuid`,
      id,
      userId,
    ).catch(() => {});
  }
}
