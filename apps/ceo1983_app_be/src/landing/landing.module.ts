import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LandingService } from './landing.service';
import { LandingAdminController, LandingPublicController } from './landing.controller';

@Module({
  imports: [PrismaModule],
  controllers: [LandingAdminController, LandingPublicController],
  providers: [LandingService],
  exports: [LandingService],
})
export class LandingModule {}

