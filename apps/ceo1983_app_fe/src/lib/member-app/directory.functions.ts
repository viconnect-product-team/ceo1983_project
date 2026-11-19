import { createServerFn } from "@tanstack/react-start";
import { optionalNestAuth } from "@/lib/auth-middleware";

// ---------- Member directory ----------
export type DirectoryMember = {
  code: string;
  name: string;
  company?: string | null;
  companyName?: string | null;
  contact?: string | null;
  personName?: string | null;
  personTitle?: string | null;
  email?: string | null;
  phone?: string | null;
  about?: string | null;
  address?: string | null;
  website?: string | null;
  industry: string;
  region: string;
  type: "company" | "individual";
  verified: boolean;
  userId?: string | null;
  avatar?: string | null;
};

import { fetchNestApiFromServer } from "@/lib/api-client";

export const listMembers = createServerFn({ method: "GET" })
  .middleware([optionalNestAuth])
  .handler(async ({ context }): Promise<DirectoryMember[]> => {
    let data: any = null;
    try {
      data = await fetchNestApiFromServer("/members/directory", context?.token);
    } catch {
      // ignore
    }

    if (!Array.isArray(data) || data.length === 0) {
      try {
        data = await fetchNestApiFromServer("/members", context?.token);
      } catch {
        // ignore
      }
    }

    if (Array.isArray(data)) {
      return data;
    }

    return [];
  });

export const listConnectedMembers = createServerFn({ method: "GET" })
  .middleware([optionalNestAuth])
  .handler(async ({ context }): Promise<DirectoryMember[]> => {
    let data: any = null;
    try {
      data = await fetchNestApiFromServer("/members/directory?connectedOnly=true", context?.token);
    } catch {
      // ignore
    }

    if (Array.isArray(data) && data.length > 0) {
      return data;
    }

    // Nếu chưa có kết nối nào hoặc backend chưa trả về, lấy danh sách hội viên chung
    return listMembers();
  });
