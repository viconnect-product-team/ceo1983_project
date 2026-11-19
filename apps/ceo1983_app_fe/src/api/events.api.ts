import { httpClient, type RequestOptions } from "./http-client";

export interface EventDTO {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string;
  type?: string;
  status: "draft" | "published" | "cancelled" | "completed";
  maxAttendees?: number;
  currentAttendees?: number;
  price?: number;
  image?: string;
  speaker?: string;
  speakerRole?: string;
  speakerAvatar?: string;
  qrCodeUrl?: string;
  registrationsCount?: number;
}

export interface GuestRegistrationItem {
  name: string;
  email: string;
  phone: string;
  company?: string;
  position?: string;
}

export const eventsApi = {
  list: (params?: { status?: string; type?: string }, options?: RequestOptions) =>
    httpClient.get<EventDTO[]>("/events", { ...options, params: params as any }),

  getById: (id: string, options?: RequestOptions) =>
    httpClient.get<EventDTO>(`/events/${encodeURIComponent(id)}`, options),

  create: (data: Partial<EventDTO>, options?: RequestOptions) =>
    httpClient.post<EventDTO>("/events", data, options),

  update: (id: string, data: Partial<EventDTO>, options?: RequestOptions) =>
    httpClient.put<EventDTO>(`/events/${encodeURIComponent(id)}`, data, options),

  delete: (id: string, options?: RequestOptions) =>
    httpClient.delete<{ ok: boolean }>(`/events/${encodeURIComponent(id)}`, options),

  register: (id: string, data?: { ticketType?: string; notes?: string }, options?: RequestOptions) =>
    httpClient.post<{ ok: boolean; registrationId: string }>(`/events/${encodeURIComponent(id)}/register`, data ?? {}, options),

  guestRegister: (id: string, data: GuestRegistrationItem, options?: RequestOptions) =>
    httpClient.post<{ ok: boolean; ticket: any }>(`/events/${encodeURIComponent(id)}/guest-register`, data, options),

  cancelRegistration: (id: string, options?: RequestOptions) =>
    httpClient.post<{ ok: boolean }>(`/events/${encodeURIComponent(id)}/cancel`, {}, options),

  checkinAttendee: (id: string, data: { codeOrId: string }, options?: RequestOptions) =>
    httpClient.post<{ ok: boolean; attendee: any }>(`/events/${encodeURIComponent(id)}/attendees/add-or-checkin`, data, options),

  /**
   * Import guest list from parsed Excel file.
   * Creates guest records and triggers invitation email.
   */
  importGuestsFromExcel: async (
    eventId: string,
    guests: GuestRegistrationItem[],
    options?: RequestOptions
  ) => {
    return httpClient.post<{ ok: boolean; importedCount: number; emailsSent: number }>(
      `/events/${encodeURIComponent(eventId)}/import-guests`,
      { guests },
      options
    );
  },

  sendPaymentReminder: (registrationId: string, options?: RequestOptions) =>
    httpClient.post<{ ok: boolean; reminderCount: number }>(
      `/events/registrations/${encodeURIComponent(registrationId)}/send-payment-reminder`,
      {},
      options
    ),
};
