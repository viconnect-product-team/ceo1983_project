import { Module } from '@nestjs/common';
import { BusinessCardController } from './business-card.controller';
import { BusinessCardService } from './business-card.service';
import { BusinessCardRepository } from './business-card.repository';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [BusinessCardController],
  providers: [BusinessCardService, BusinessCardRepository],
  exports: [BusinessCardService, BusinessCardRepository],
})
export class BusinessCardModule {}
