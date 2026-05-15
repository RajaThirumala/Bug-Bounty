import { apiRequest } from "@/lib/api";
import type { FeatureRequest, FeatureRequestStatus } from "@/features/featureRequests/types";

export interface CreateFeatureRequestInput {
  title: string;
  description: string;
  bounty: number;
  status: FeatureRequestStatus;
}

export const getResearcherFeatureRequests = (accessToken: string) =>
  apiRequest<{ featureRequests: FeatureRequest[] }>("/api/researcher/feature-requests", {
    accessToken,
  });

export const getOrganizationFeatureRequests = (accessToken: string) =>
  apiRequest<{ featureRequests: FeatureRequest[] }>("/api/organization/feature-requests", {
    accessToken,
  });

export const createFeatureRequest = (accessToken: string, input: CreateFeatureRequestInput) =>
  apiRequest<{ featureRequest: FeatureRequest }>("/api/organization/feature-requests", {
    method: "POST",
    accessToken,
    body: JSON.stringify(input),
  });
