export class CreateLandingWebDto {
  name!: string;
  slug!: string;
  subdomain?: string;
  template?:
    | 'timed_cards_opening'
    | 'ceo1983_executive'
    | 'startup_mobile_showcase';
}

export class ApplySubdomainDto {
  subdomain!: string;
}

export class TestApiConnectorDto {
  enabled!: boolean;
  endpointUrl!: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  rootPath?: string;
  fieldMapping?: {
    place?: string;
    title1?: string;
    title2?: string;
    description?: string;
    image?: string;
    ctaText?: string;
    ctaLink?: string;
  };
}
