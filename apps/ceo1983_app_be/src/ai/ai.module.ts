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

// DYNAMIC AUTONOMOUS AI AGENT MODULES
import { DynamicAgentController } from './dynamic-agent/dynamic-agent.controller';
import { AiToolRegistryService } from './dynamic-agent/ai-tool-registry.service';
import { DynamicTaskPlannerService } from './dynamic-agent/dynamic-task-planner.service';
import { ConversationalRevisionService } from './dynamic-agent/conversational-revision.service';
import { ApprovalService } from './dynamic-agent/approval.service';
import { TaskExecutionService } from './dynamic-agent/task-execution.service';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [AiController, DynamicAgentController],
  providers: [
    AiService,
    AiCrmAnalyticsService,
    AiEventService,
    AiTrainingService,
    AiFinanceService,
    AiMemberService,
    AiB2bService,
    AiDocumentService,
    // Dynamic Agent Services
    AiToolRegistryService,
    DynamicTaskPlannerService,
    ConversationalRevisionService,
    ApprovalService,
    TaskExecutionService,
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
    // Dynamic Agent Services
    AiToolRegistryService,
    DynamicTaskPlannerService,
    ConversationalRevisionService,
    ApprovalService,
    TaskExecutionService,
  ],
})
export class AiModule {}
