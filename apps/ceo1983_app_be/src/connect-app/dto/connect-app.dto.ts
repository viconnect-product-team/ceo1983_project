export class SendMemberMessageDto {
  peerCode!: string;
  text!: string;
}

export class OpenDmThreadDto {
  counterpartUserId?: string;
  personId?: string;
}

export class SendDmMessageDto {
  content?: string;
  text?: string;
  mediaUrl?: string;
  attachments?: any[];
}

export class CreateMomentDto {
  content!: string;
  mediaUrls?: string[];
  audience?: string;
  tags?: string[];
  [key: string]: any;
}

export class CreateMomentCommentDto {
  content!: string;
  parentId?: string;
  mentions?: string[];
}

export class ReactMomentDto {
  reactionType?: string;
}

export class CreateListingDto {
  title!: string;
  price?: number;
  description?: string;
  images?: string[];
  category?: string;
  [key: string]: any;
}

export class UpdateListingDto {
  title?: string;
  price?: number;
  description?: string;
  images?: string[];
  category?: string;
  status?: string;
  [key: string]: any;
}

export class CreateOpportunityDto {
  title!: string;
  dealValue?: number;
  stage?: string;
  partnerId?: string;
  notes?: string;
  [key: string]: any;
}

export class UpdateOpportunityDto {
  title?: string;
  dealValue?: number;
  stage?: string;
  partnerId?: string;
  notes?: string;
  status?: string;
  [key: string]: any;
}

export class CreateCustomerDto {
  fullName!: string;
  phone?: string;
  email?: string;
  company?: string;
  notes?: string;
  [key: string]: any;
}

export class UpdateCustomerDto {
  fullName?: string;
  phone?: string;
  email?: string;
  company?: string;
  notes?: string;
  status?: string;
  [key: string]: any;
}

export class CreateCommunityPostDto {
  title?: string;
  content!: string;
  channelId?: string;
  mediaUrls?: string[];
  [key: string]: any;
}

export class UpdateCommunityPostDto {
  title?: string;
  content?: string;
  mediaUrls?: string[];
  [key: string]: any;
}
