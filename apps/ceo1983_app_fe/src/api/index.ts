/**
 * Unified Domain-Driven API Client Layer
 * Centralizes all functional API calls for CEO 1983 CRM & Member Mobile App.
 */

import { authApi } from "./auth.api";
import { membersApi } from "./members.api";
import { opportunitiesApi } from "./opportunities.api";
import { eventsApi } from "./events.api";
import { meetingsApi } from "./meetings.api";
import { financeApi } from "./finance.api";
import { marketplaceApi } from "./marketplace.api";
import { documentsApi } from "./documents.api";
import { notificationsApi } from "./notifications.api";
import { httpClient } from "./http-client";

export {
  httpClient,
  authApi,
  membersApi,
  opportunitiesApi,
  eventsApi,
  meetingsApi,
  financeApi,
  marketplaceApi,
  documentsApi,
  notificationsApi,
};

export const api = {
  http: httpClient,
  auth: authApi,
  members: membersApi,
  opportunities: opportunitiesApi,
  events: eventsApi,
  meetings: meetingsApi,
  finance: financeApi,
  marketplace: marketplaceApi,
  documents: documentsApi,
  notifications: notificationsApi,
};

export default api;
