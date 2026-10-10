import { Module } from '@nestjs/common';
import { MeController, ProfileController } from './me.controller';
import { CommunityController } from './community.controller';
import { NetworkController } from './network.controller';
import { PublicController } from './public.controller';
import { MomentController } from './moment.controller';
import { NfcDeviceController } from './nfc-device.controller';
import { DmController } from './dm.controller';
import { CustomerController } from './customer.controller';
import { CardScanController } from './card-scan.controller';
import { OpportunityController } from './opportunity.controller';
import { ProductsController } from './products.controller';
import { MarketplaceController } from './marketplace.controller';
import { ContentController } from './content.controller';
import { ConnectAppService } from './connect-app.service';
import { ConnectAppGateway } from './connect-app.gateway';
import { ConnectMomentsService } from './services/moments.service';
import { ConnectMessengerService } from './services/messenger.service';
import { ConnectNfcService } from './services/nfc-device.service';
import { ConnectOpportunityService } from './services/opportunity.service';
import { ConnectMarketplaceService } from './services/marketplace.service';
import { ConnectCustomerService } from './services/customer.service';
import { ConnectCardScanService } from './services/card-scan.service';
import { ConnectIdentityService } from './services/identity.service';
import { ConnectCommunityService } from './services/community.service';
import { ConnectContentService } from './services/content.service';
import { ConnectPublicRegistrationService } from './services/public-registration.service';
import { ConnectNetworkService } from './services/network.service';
import { ConnectAppRepository } from './connect-app.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [
    MeController,
    ProfileController,
    CommunityController,
    OpportunityController,
    NetworkController,
    PublicController,
    MomentController,
    NfcDeviceController,
    DmController,
    CustomerController,
    CardScanController,
    ProductsController,
    MarketplaceController,
    ContentController,
  ],
  providers: [
    ConnectAppService,
    ConnectAppRepository,
    ConnectAppGateway,
    ConnectMomentsService,
    ConnectMessengerService,
    ConnectNfcService,
    ConnectOpportunityService,
    ConnectMarketplaceService,
    ConnectCustomerService,
    ConnectCardScanService,
    ConnectIdentityService,
    ConnectCommunityService,
    ConnectContentService,
    ConnectPublicRegistrationService,
    ConnectNetworkService,
  ],
  exports: [
    ConnectAppService,
    ConnectAppRepository,
    ConnectAppGateway,
    ConnectMomentsService,
    ConnectMessengerService,
    ConnectNfcService,
    ConnectOpportunityService,
    ConnectMarketplaceService,
    ConnectCustomerService,
    ConnectCardScanService,
    ConnectIdentityService,
    ConnectCommunityService,
    ConnectContentService,
    ConnectPublicRegistrationService,
    ConnectNetworkService,
  ],
})
export class ConnectAppModule {}
