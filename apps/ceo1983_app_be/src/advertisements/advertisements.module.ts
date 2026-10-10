import { Module } from '@nestjs/common';
import { AdvertisementsController } from './advertisements.controller';
import { AdvertisementsService } from './advertisements.service';
import { AdvertisementsRepository } from './advertisements.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdvertisementsController],
  providers: [AdvertisementsService, AdvertisementsRepository],
  exports: [AdvertisementsService, AdvertisementsRepository],
})
export class AdvertisementsModule {}
