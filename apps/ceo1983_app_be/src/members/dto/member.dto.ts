export class CreateMemberDto {
  name!: string;
  contact?: string;
  email?: string;
  phone?: string;
  type?: 'company' | 'individual';
  level?: string;
  industry?: string;
  region?: string;
  status?: 'active' | 'pending' | 'expired';
  address?: string;
  website?: string;
  taxCode?: string;
  employees?: number;
  about?: string;
  associationId?: string;
  executiveRole?: string;
  department?: string;
  code?: string;
  avatar?: string;
}

export class UpdateMemberDto {
  name?: string;
  contact?: string;
  email?: string;
  phone?: string;
  type?: 'company' | 'individual';
  level?: string;
  industry?: string;
  region?: string;
  status?: 'active' | 'pending' | 'expired';
  address?: string;
  website?: string;
  taxCode?: string;
  employees?: number;
  about?: string;
  feePaid?: boolean;
  feeYear?: number;
  paymentStatus?: string;
  executiveRole?: string;
  department?: string;
  code?: string;
  avatar?: string;
  coverUrl?: string;
}

export class UpdateMemberContactDto {
  email?: string;
  phone?: string;
  address?: string;
}

export class PublicRegisterDto {
  fullName!: string;
  phone!: string;
  email!: string;
  companyName!: string;
  position?: string;
  birthYear?: string | number;
  taxCode?: string;
  industry?: string;
  address?: string;
  website?: string;
  staffSize?: string;
  boardWish?: string;
  needs?: string;
  offers?: string;
  notes?: string;
  associationId?: string;
  [key: string]: any;
}

export class UpdateMemberProfileDto {
  name?: string;
  avatar?: string;
  coverUrl?: string;
  company?: string;
  position?: string;
  industry?: string;
  bio?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  [key: string]: any;
}

export class UpdateMemberExecutiveDto {
  executiveRole?: string;
  department?: string;
}

export class RenewMembershipDto {
  months?: number;
  feeAmount?: number;
  paymentMethod?: string;
  notes?: string;
}
