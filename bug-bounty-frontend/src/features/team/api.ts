import { apiRequest } from "@/lib/api";

export interface Triager {
  id: string;
  email: string | null;
  fullName: string;
  username: string | null;
  role: "triager";
}

export const getOrganizationTriagers = (accessToken: string) =>
  apiRequest<{ triagers: Triager[] }>("/api/organization/triagers", { accessToken });

export const addOrganizationTriager = (accessToken: string, email: string) =>
  apiRequest<{ triager: Triager }>("/api/organization/triagers", {
    method: "POST",
    accessToken,
    body: JSON.stringify({ email }),
  });
