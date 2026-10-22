export class CreateEventDto {
  name!: string;
  tagline?: string;
  date!: string;
  location?: string;
  capacity?: number;
  type?: 'forum' | 'workshop' | 'networking' | 'training';
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  associationId?: string;
  qrFields?: string[];
  image?: string;
  banner?: string;
  ticketPrice?: number;
  fee?: number;
  qrStaff?: any;
  qrScanners?: any;
  sponsors?: any;
  description?: string;
  photoGalleryUrl?: string;
  startTime?: string;
  endTime?: string;
  time?: string;
  agenda?: any;
  checkinQr?: string;
  tickets?: {
    name: string;
    price?: number;
    quantity?: number;
    description?: string;
  }[];
}

export class UpdateEventDto {
  name?: string;
  tagline?: string;
  date?: string;
  location?: string;
  capacity?: number;
  type?: 'forum' | 'workshop' | 'networking' | 'training';
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  image?: string;
  banner?: string;
  ticketPrice?: number;
  fee?: number;
  qrStaff?: any;
  qrScanners?: any;
  sponsors?: any;
  description?: string;
  photoGalleryUrl?: string;
  startTime?: string;
  endTime?: string;
  time?: string;
  agenda?: any;
  checkinQr?: string;
}

export class RegisterEventDto {
  ticketId?: string;
  ticketCount?: number;
  guestCount?: number;
  notes?: string;
  [key: string]: any;
}

export class CheckinAttendeeDto {
  attendeeId!: string;
}

export class RecordMemberCheckinDto {
  payload!: string;
  method?: 'qr' | 'nfc';
  currentEventId?: string;
  [key: string]: any;
}

export class ScanTicketDto {
  payload!: string;
  currentEventId?: string;
  confirm?: boolean;
  method?: 'qr' | 'nfc';
}
