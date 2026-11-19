import { httpClient, type RequestOptions } from "./http-client";

export interface OpportunityDTO {
  id: string;
  posterId: string;
  posterName?: string;
  posterAvatar?: string;
  title: string;
  description: string;
  type: string;
  budgetMin?: number;
  budgetMax?: number;
  region?: string;
  industry?: string;
  deadline?: string;
  status: "open" | "closed";
  createdAt: string;
  views: number;
  emoji?: string;
  contactName?: string;
  contactPhone?: string;
  contactTitle?: string;
  company?: string;
  image?: string;
  claimedById?: string;
  claimedByName?: string;
  claimedAt?: string;
  targetScope?: "all" | "targeted" | "group";
  targetRecipients?: string[];
  targetGroups?: string[];
  commissionPercent?: number;
}

export interface OpportunityInterestDTO {
  id: string;
  opportunityId: string;
  memberId: string;
  memberName?: string;
  memberAvatar?: string;
  memberPhone?: string;
  memberEmail?: string;
  memberCompany?: string;
  message?: string;
  contact?: string;
  interestLevel?: "high" | "low" | string;
  dealValue?: number;
  dealPercent?: number;
  createdAt: string;
}

export const opportunitiesApi = {
  list: (params?: { scope?: string; status?: string }, options?: RequestOptions) =>
    httpClient.get<OpportunityDTO[]>("/opportunities", { ...options, params: params as any }),

  listMy: (options?: RequestOptions) =>
    httpClient.get<OpportunityDTO[]>("/opportunities/my-opportunities", options),

  getById: (id: string, options?: RequestOptions) =>
    httpClient.get<OpportunityDTO>(`/opportunities/${encodeURIComponent(id)}`, options),

  create: (data: Partial<OpportunityDTO>, options?: RequestOptions) =>
    httpClient.post<OpportunityDTO>("/opportunities", data, options),

  update: (id: string, data: Partial<OpportunityDTO>, options?: RequestOptions) =>
    httpClient.patch<OpportunityDTO>(`/opportunities/${encodeURIComponent(id)}`, data, options),

  delete: (id: string, options?: RequestOptions) =>
    httpClient.delete<{ ok: boolean }>(`/opportunities/${encodeURIComponent(id)}`, options),

  toggleStatus: (id: string, options?: RequestOptions) =>
    httpClient.patch<{ ok: boolean; status: string }>(`/opportunities/${encodeURIComponent(id)}/toggle-status`, {}, options),

  /**
   * Submit a deal on an opportunity (e.g. negotiation/quote).
   */
  submitDeal: (id: string, data: { dealValue: number; message?: string }, options?: RequestOptions) =>
    httpClient.post<{ ok: boolean }>(`/opportunities/${encodeURIComponent(id)}/deal`, data, options),

  /**
   * Express interest in an opportunity.
   */
  submitInterest: (
    id: string,
    data: { interestLevel?: "high" | "low"; dealValue?: number; message?: string },
    options?: RequestOptions
  ) =>
    httpClient.post<{ ok: boolean }>(`/opportunities/${encodeURIComponent(id)}/interests`, data, options),

  withdrawInterest: (id: string, options?: RequestOptions) =>
    httpClient.delete<{ ok: boolean }>(`/opportunities/${encodeURIComponent(id)}/interests`, options),

  /**
   * Get all interests/deals on an opportunity, sorted by highest dealValue descending.
   */
  getInterests: (id: string, options?: RequestOptions) =>
    httpClient.get<{ ok: boolean; interests: OpportunityInterestDTO[] }>(
      `/opportunities/${encodeURIComponent(id)}/interests`,
      options
    ),

  claim: (id: string, options?: RequestOptions) =>
    httpClient.post<{ ok: boolean }>(`/opportunities/${encodeURIComponent(id)}/claim`, {}, options),

  updateDealStatus: (
    id: string,
    data: { status: string; note?: string },
    options?: RequestOptions
  ) =>
    httpClient.post<{ ok: boolean }>(`/opportunities/${encodeURIComponent(id)}/deal-status`, data, options),

  view: (id: string, options?: RequestOptions) =>
    httpClient.post<{ ok: boolean }>(`/opportunities/${encodeURIComponent(id)}/view`, {}, options),
};
