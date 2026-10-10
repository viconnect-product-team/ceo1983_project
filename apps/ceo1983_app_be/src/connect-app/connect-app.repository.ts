import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConnectAppRepository {
  constructor(private readonly prisma: PrismaService) {}

  async ensureSchema(): Promise<void> {
    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public.business_relationship_moment_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        moment_id UUID NOT NULL,
        user_id UUID NOT NULL,
        parent_id UUID,
        content TEXT NOT NULL,
        mentions JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `).catch(() => {});
  }

  async queryRaw<T = any>(query: TemplateStringsArray, ...values: any[]): Promise<T[]> {
    return this.prisma.$queryRaw<T[]>(query, ...values).catch(() => [] as T[]);
  }

  async executeRaw(query: TemplateStringsArray, ...values: any[]): Promise<number> {
    return this.prisma.$executeRaw(query, ...values).catch(() => 0);
  }

  async queryRawUnsafe<T = any>(query: string, ...values: any[]): Promise<T[]> {
    return this.prisma.$queryRawUnsafe<T[]>(query, ...values).catch(() => [] as T[]);
  }

  async executeRawUnsafe(query: string, ...values: any[]): Promise<number> {
    return this.prisma.$executeRawUnsafe(query, ...values).catch(() => 0);
  }
}
