import { Module } from '@nestjs/common';
import { MeetingsController } from './meetings.controller';
import { MeetingsService } from './meetings.service';
import { MeetingsRepository } from './meetings.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ConnectAppModule } from '../connect-app/connect-app.module';

@Module({
  imports: [PrismaModule, AuthModule, ConnectAppModule],
  controllers: [MeetingsController],
  providers: [MeetingsService, MeetingsRepository],
  exports: [MeetingsService, MeetingsRepository],
})
export class MeetingsModule {}

