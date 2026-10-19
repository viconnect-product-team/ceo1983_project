export type SponsorTier = 'platinum' | 'gold' | 'silver' | 'bronze';
export type PackageType = 'bank_transfer' | 'cash' | 'in_kind';

export class CreateSponsorPackageDto {
  tier!: SponsorTier;
  price!: number;
  benefits?: string[];
  available?: number;
  sold?: number;
  packageType?: PackageType;
  inKindDescription?: string;
}

export class UpdateSponsorPackageDto {
  tier?: SponsorTier;
  price?: number;
  benefits?: string[];
  available?: number;
  sold?: number;
  packageType?: PackageType;
  inKindDescription?: string;
}
