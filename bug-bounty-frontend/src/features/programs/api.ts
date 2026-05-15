import { apiRequest } from "@/lib/api";
import type { Program, ProgramStatus } from "@/features/programs/types";

export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface CreateProgramInput {
  name: string;
  description: string;
  minBounty: number;
  maxBounty: number;
  status: ProgramStatus;
  scope: string[];
}

export const getMyOrganization = (accessToken: string) =>
  apiRequest<{ organization: Organization | null }>("/api/organization/me", { accessToken });

export const getOrganizationPrograms = (accessToken: string) =>
  apiRequest<{ organization: Organization; programs: Program[] }>("/api/organization/programs", {
    accessToken,
  });

export const createProgram = (accessToken: string, input: CreateProgramInput) =>
  apiRequest<{ program: Program }>("/api/organization/programs", {
    method: "POST",
    accessToken,
    body: JSON.stringify(input),
  });

export const getResearcherPrograms = (accessToken: string) =>
  apiRequest<{ programs: Program[] }>("/api/researcher/programs", { accessToken });

export const getResearcherProgram = (accessToken: string, programId: string) =>
  apiRequest<{ program: Program }>(`/api/researcher/programs/${programId}`, { accessToken });
