import { httpClient, type RequestOptions } from "./http-client";

export interface MemberDTO {
  id: string;
  code: string;
  name: string;
  contact?: string;
  email: string;
  phone: string;
  type?: "company" | "individual";
  level?: string;
  industry?: string;
  region?: string;
  status: "active" | "pending" | "expired";
  joinedAt?: string;
  feeYear?: number;
  feePaid?: boolean;
  address?: string;
  website?: string;
  taxCode?: string;
  about?: string;
  company?: string;
  companyName?: string;
  executiveRole?: string;
  department?: string;
  avatar?: string | null;
}

export interface MemberSearchParams {
  search?: string;
  type?: string;
  status?: string;
  industry?: string;
  region?: string;
  page?: number;
  limit?: number;
}

export const membersApi = {
  list: (params?: MemberSearchParams, options?: RequestOptions) =>
    httpClient.get<MemberDTO[]>("/members", { ...options, params: params as any }),

  getById: (id: string, options?: RequestOptions) =>
    httpClient.get<MemberDTO>(`/members/${encodeURIComponent(id)}`, options),

  create: (data: Partial<MemberDTO>, options?: RequestOptions) =>
    httpClient.post<MemberDTO>("/members", data, options),

  update: (id: string, data: Partial<MemberDTO>, options?: RequestOptions) =>
    httpClient.put<MemberDTO>(`/members/${encodeURIComponent(id)}`, data, options),

  delete: (id: string, options?: RequestOptions) =>
    httpClient.delete<{ ok: boolean }>(`/members/${encodeURIComponent(id)}`, options),

  getDirectory: (search?: string, options?: RequestOptions) =>
    httpClient.get<MemberDTO[]>("/members/directory", { ...options, params: { search } }),

  getDepartments: (options?: RequestOptions) =>
    httpClient.get<any[]>("/members/departments", options),

  updateRoleAndDept: (
    memberId: string,
    data: { executiveRole: string; department: string },
    options?: RequestOptions
  ) =>
    httpClient.patch<{ ok: boolean }>(
      `/members/${encodeURIComponent(memberId)}/role-dept`,
      data,
      options
    ),

  getBenefits: (options?: RequestOptions) =>
    httpClient.get<any[]>("/members/benefits", options),

  getAdminBenefits: (options?: RequestOptions) =>
    httpClient.get<any[]>("/members/benefits/admin", options),

  createBenefit: (data: any, options?: RequestOptions) =>
    httpClient.post<any>("/members/benefits/admin", data, options),

  updateBenefit: (id: string, data: any, options?: RequestOptions) =>
    httpClient.put<any>(`/members/benefits/admin/${encodeURIComponent(id)}`, data, options),

  deleteBenefit: (id: string, options?: RequestOptions) =>
    httpClient.delete<{ ok: boolean }>(`/members/benefits/admin/${encodeURIComponent(id)}`, options),

  checkin: (code: string, options?: RequestOptions) =>
    httpClient.post<{ ok: boolean; member: any }>("/members/checkin", { code }, options),
};
