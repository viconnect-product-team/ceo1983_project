import { Module } from '@nestjs/common';
import { VotingController } from './voting.controller';
import { VotingService } from './voting.service';
import { VotingRepository } from './voting.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VotingController],
  providers: [VotingService, VotingRepository],
  exports: [VotingService, VotingRepository],
})
export class VotingModule {}
