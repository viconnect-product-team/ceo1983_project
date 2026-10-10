export class CreateMeetingDto {
  title?: string;
  hostName?: string;
  partnerName?: string;
  partnerPhone?: string;
  partnerCompany?: string;
  date?: string;
  time?: string;
  venueType?: 'online' | 'offline';
  venue?: string;
  location?: string;
  notes?: string;
  participantIds?: string[];
  associationId?: string;
}

export class UpdateMeetingDto {
  title?: string;
  date?: string;
  time?: string;
  venueType?: 'online' | 'offline';
  venue?: string;
  location?: string;
  notes?: string;
  status?: string;
}

export class ConnectionAppointmentDto {
  partnerUserId?: string;
  partnerName?: string;
  partnerPhone?: string;
  title?: string;
  date?: string;
  time?: string;
  notes?: string;
  venue?: string;
}

export class UpdateMeetingStatusDto {
  status!: string;
  reason?: string;
}

export class ListWorkspaceMeetingsDto {
  status?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
  type?: string;
}

export class SaveOutcomeDto {
  notes?: string;
  actionItems?: string[];
  agreedNextStep?: string;
  potentialDealValue?: number;
  rating?: number;
  status?: string;
}

export class CreateFollowUpDto {
  title!: string;
  dueDate?: string;
  notes?: string;
  assignedToId?: string;
}

export class CreateTimeProposalDto {
  meetingId?: string;
  proposedTimes!: string[];
  note?: string;
}

export class CancelMeetingDto {
  reason!: string;
}
