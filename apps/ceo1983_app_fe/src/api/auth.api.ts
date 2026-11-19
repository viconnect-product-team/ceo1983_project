import { httpClient, type RequestOptions } from "./http-client";

export interface LoginCredentials {
  username: string; // email or phone or username
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  user: {
    id: string;
    email: string;
    name?: string;
    role?: string;
    memberId?: string;
    avatar_url?: string;
  };
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  phone: string;
  company?: string;
}

export const authApi = {
  login: (credentials: LoginCredentials, options?: RequestOptions) =>
    httpClient.post<AuthResponse>("/auth/login", credentials, options),

  logout: (options?: RequestOptions) =>
    httpClient.post<{ ok: boolean }>("/auth/logout", {}, options),

  refresh: (refreshToken: string, options?: RequestOptions) =>
    httpClient.post<AuthResponse>("/auth/refresh", { refresh_token: refreshToken }, options),

  register: (payload: RegisterPayload, options?: RequestOptions) =>
    httpClient.post<AuthResponse>("/auth/register", payload, options),

  getMe: (token?: string, options?: RequestOptions) =>
    httpClient.get<any>("/users/me", { ...options, token }),

  changePassword: (data: { oldPassword: string; newPassword: string }, options?: RequestOptions) =>
    httpClient.post<{ ok: boolean }>("/auth/change-password", data, options),

  forgotPassword: (email: string, options?: RequestOptions) =>
    httpClient.post<{ message: string }>("/auth/forgot-password", { email }, options),
};
