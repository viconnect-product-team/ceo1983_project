export class UpdateDemoLeadDto {
  status?: string;
  adminNotes?: string | null;
}

export class ListDemoLeadsDto {
  status?: string;
  search?: string;
  from?: string;
  to?: string;
}

export class CreateInvoiceDto {
  memberId!: string;
  year?: number;
  amount?: number;
  dueDate?: string;
}

export class AddInvoiceReminderDto {
  channel!: string;
  byName?: string;
  note?: string;
}

export class UpdateInvoiceMethodDto {
  method!: 'bank' | 'card' | 'cash' | 'ewallet';
}

export class CreateAdminNotificationDto {
  title!: string;
  content!: string;
  type?: string;
  target?: string;
  associationId?: string;
  appScope?: string;
  [key: string]: any;
}

export class UpdateAdminNotificationDto {
  title?: string;
  content?: string;
  type?: string;
  target?: string;
  status?: string;
  [key: string]: any;
}

export class CreateCampaignDto {
  title!: string;
  subject!: string;
  content!: string;
  recipientGroup?: string;
  [key: string]: any;
}

export class CreateTransactionDto {
  type!: string;
  amount!: number;
  description?: string;
  date?: string;
  category?: string;
  referenceId?: string;
  [key: string]: any;
}

export class UpdateTransactionDto {
  type?: string;
  amount?: number;
  description?: string;
  date?: string;
  category?: string;
  status?: string;
  [key: string]: any;
}
