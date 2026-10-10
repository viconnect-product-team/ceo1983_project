import { SponsorTier, PackageType } from './sponsor-package.dto';

export type SponsorType = 'regular' | 'new';

export class CreateSponsorDto {
  name!: string;
  tier!: SponsorTier;
  contact?: string;
  email?: string;
  phone?: string;
  amount?: number;
  events?: number;
  since?: string;
  status?: 'active' | 'expired';
  sponsorType?: SponsorType;
  packageType?: PackageType;
  inKindDescription?: string;
}

export class OnboardSponsorDto {
  packageId!: string;
  name!: string;
  contact?: string;
  email?: string;
  phone?: string;
}
