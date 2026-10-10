import { Module } from '@nestjs/common';
import { SponsorsController } from './sponsors.controller';
import { SponsorsService } from './sponsors.service';
import { SponsorsRepository } from './sponsors.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [SponsorsController],
  providers: [SponsorsService, SponsorsRepository],
  exports: [SponsorsService, SponsorsRepository],
})
export class SponsorsModule {}
