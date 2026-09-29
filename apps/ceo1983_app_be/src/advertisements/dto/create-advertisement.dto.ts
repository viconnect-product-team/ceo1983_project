export class CreateAdvertisementDto {
  title!: string;
  companyName!: string;
  badgeText?: string;
  bannerUrl!: string;
  targetUrl?: string;
  animation?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  requestId?: string;
}

export class CreateAdRequestDto {
  companyName!: string;
  contactPerson!: string;
  phone!: string;
  email?: string;
  goal?: string;
  durationMonths?: number;
  budgetEst?: string;
  productLink?: string;
  notes?: string;
}
