import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiCrmAnalyticsService } from './ai-crm-analytics.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';

import { AiEventService } from './services/ai-event.service';
import { AiTrainingService } from './services/ai-training.service';
import { AiFinanceService } from './services/ai-finance.service';
import { AiMemberService } from './services/ai-member.service';
import { AiB2bService } from './services/ai-b2b.service';
import { AiDocumentService } from './services/ai-document.service';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [AiController],
  providers: [
    AiService,
    AiCrmAnalyticsService,
    AiEventService,
    AiTrainingService,
    AiFinanceService,
    AiMemberService,
    AiB2bService,
    AiDocumentService,
  ],
  exports: [
    AiService,
    AiCrmAnalyticsService,
    AiEventService,
    AiTrainingService,
    AiFinanceService,
    AiMemberService,
    AiB2bService,
    AiDocumentService,
  ],
})
export class AiModule {}
