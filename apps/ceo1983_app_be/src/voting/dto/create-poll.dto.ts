export class CreatePollDto {
  title!: string;
  description?: string;
  associationId?: string;
  options!: string[];
  startDate?: string;
  endDate?: string;
  targetAudience?: string; // 'all' | 'members' | 'non_members'
  eventId?: string;
}
