import { Module } from '@nestjs/common';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ConnectAppModule } from '../connect-app/connect-app.module';

@Module({
  imports: [PrismaModule, ConnectAppModule],
  controllers: [FeedController],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}
