import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiCrmAnalyticsService } from './ai-crm-analytics.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AiController],
  providers: [AiService, AiCrmAnalyticsService],
  exports: [AiService, AiCrmAnalyticsService],
})
export class AiModule {}
