import { Module } from '@nestjs/common';
import { SyndicationController } from './syndication.controller';
import { SyndicationService } from './syndication.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SyndicationController],
  providers: [SyndicationService],
  exports: [SyndicationService],
})
export class SyndicationModule {}
