export type PrizeTargetType = 'PRODUCT' | 'SPONSOR_PACKAGE' | 'CUSTOM' | 'VOUCHER' | 'CASH';

export class CreateEventPrizeDto {
  eventId!: string;
  rankName!: string;
  title!: string;
  value?: string;
  amount?: number;
  quantity?: number;
  targetType!: PrizeTargetType;
  targetId?: string;
  sponsorName?: string;
  sponsorPackageId?: string;
  description?: string;
  iconName?: string;
  imageUrl?: string;
  highlightColor?: string;
}

export class UpdateEventPrizeDto {
  eventId?: string;
  rankName?: string;
  title?: string;
  value?: string;
  amount?: number;
  quantity?: number;
  targetType?: PrizeTargetType;
  targetId?: string;
  sponsorName?: string;
  sponsorPackageId?: string;
  description?: string;
  iconName?: string;
  imageUrl?: string;
  highlightColor?: string;
  status?: string;
}
