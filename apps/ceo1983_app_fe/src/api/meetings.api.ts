import { httpClient, type RequestOptions } from "./http-client";

export interface MeetingDTO {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  meetingUrl?: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  meetingType?: "b2b" | "internal" | "committee";
  hostId?: string;
  hostName?: string;
  hostAvatar?: string;
  partnerId?: string;
  partnerName?: string;
  partnerAvatar?: string;
  partnerCompany?: string;
  notes?: string;
}

export interface ConnectionAppointmentPayload {
  partnerId: string;
  opportunityId?: string;
  title?: string;
  scheduledTime: string;
  location?: string;
  notes?: string;
}

export const meetingsApi = {
  list: (options?: RequestOptions) =>
    httpClient.get<MeetingDTO[]>("/meetings", options),

  getConnectionAppointments: (options?: RequestOptions) =>
    httpClient.get<any[]>("/meetings/connection-appointments", options),

  /**
   * Schedule a B2B meeting connection with a member.
   */
  scheduleConnection: (data: ConnectionAppointmentPayload, options?: RequestOptions) =>
    httpClient.post<any>("/meetings/connection-appointments", data, options),

  /**
   * Accept or decline a B2B connection appointment.
   * When accepted, sets to confirmed, synchronizes to calendar & activity feed.
   */
  respondAppointment: (
    id: string,
    action: "accept" | "decline" | string,
    options?: RequestOptions
  ) =>
    httpClient.post<{ ok: boolean; status: string }>(
      `/meetings/connection-appointments/${encodeURIComponent(id)}/respond`,
      { action, status: action === "accept" ? "confirmed" : "declined" },
      options
    ),

  cancelAppointment: (id: string, reason?: string, options?: RequestOptions) =>
    httpClient.post<{ ok: boolean }>(
      `/meetings/connection-appointments/${encodeURIComponent(id)}/cancel`,
      { reason },
      options
    ),

  getWorkspaceDetail: (id: string, options?: RequestOptions) =>
    httpClient.get<any>(`/meetings/${encodeURIComponent(id)}/workspace-detail`, options),

  getOutcome: (id: string, options?: RequestOptions) =>
    httpClient.get<any>(`/meetings/${encodeURIComponent(id)}/outcome`, options),

  saveOutcome: (
    id: string,
    data: { notes?: string; rating?: number; nextSteps?: string },
    options?: RequestOptions
  ) =>
    httpClient.post<{ ok: boolean }>(`/meetings/${encodeURIComponent(id)}/outcome`, data, options),

  /**
   * Trigger email reminder for an upcoming B2B meeting.
   */
  sendEmailReminder: (id: string, options?: RequestOptions) =>
    httpClient.post<{ ok: boolean; sentTo: string }>(
      `/meetings/${encodeURIComponent(id)}/send-email-reminder`,
      {},
      options
    ),
};
