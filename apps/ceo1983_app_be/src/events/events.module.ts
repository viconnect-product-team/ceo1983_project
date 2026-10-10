import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { CheckinController } from './checkin.controller';
import { EventsService } from './events.service';
import { EventsRepository } from './events.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, AuthModule, MailModule],
  controllers: [EventsController, CheckinController],
  providers: [EventsService, EventsRepository],
  exports: [EventsService, EventsRepository],
})
export class EventsModule {}

