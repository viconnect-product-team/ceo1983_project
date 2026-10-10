export class SaveCardDto {
  id?: string;
  slug?: string;
  cardKind?: string;
  card_kind?: string;
  publicMode?: string;
  public_mode?: string;
  status?: string;
  displayName?: string;
  display_name?: string;
  professionalTitle?: string;
  professional_title?: string;
  companyName?: string;
  company_name?: string;
  companyLogoUrl?: string;
  company_logo_url?: string;
  avatarUrl?: string;
  avatar_url?: string;
  coverUrl?: string;
  cover_url?: string;
  headline?: string;
  bio?: string;
  website?: string;
  workEmail?: string;
  work_email?: string;
  workPhone?: string;
  work_phone?: string;
  zaloUrl?: string;
  zalo_url?: string;
  linkedinUrl?: string;
  linkedin_url?: string;
  facebookUrl?: string;
  facebook_url?: string;
  youtubeUrl?: string;
  youtube_url?: string;
  tiktokUrl?: string;
  tiktok_url?: string;
  address?: string;
  mapUrl?: string;
  map_url?: string;
  themeId?: string;
  theme_id?: string;
  skills?: any[];
  services?: any[];
  needs?: any[];
}

export class CardSettingsDto {
  theme?: string;
  privacy?: string;
  notificationPreferences?: any;
  customDomain?: string;
}

export class CardExchangeDto {
  cardId!: string;
  targetUserId!: string;
  note?: string;
}

export class CardAiHistoryDto {
  action!: string;
  prompt?: string;
  response?: string;
  metadata?: any;
}
