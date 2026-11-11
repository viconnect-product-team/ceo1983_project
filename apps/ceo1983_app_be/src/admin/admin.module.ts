import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { NotificationsController } from './notifications.controller';
import { AdminService } from './admin.service';
import { AdminRepository } from './admin.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ConnectAppModule } from '../connect-app/connect-app.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, AuthModule, ConnectAppModule, MailModule],
  controllers: [AdminController, NotificationsController],
  providers: [AdminService, AdminRepository],
  exports: [AdminService, AdminRepository],
})
export class AdminModule {}
