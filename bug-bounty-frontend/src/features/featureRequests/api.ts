import { apiRequest } from "@/lib/api";
import type {
  FeatureRequest,
  FeatureRequestStatus,
  FeatureRequestSubmission,
  FeatureRequestSubmissionStatus,
  OrganizationFeatureRequestSubmission,
} from "@/features/featureRequests/types";

export interface CreateFeatureRequestInput {
  title: string;
  description: string;
  repositoryUrl: string;
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

export const getMyFeatureRequestSubmissions = (accessToken: string) =>
  apiRequest<{ submissions: FeatureRequestSubmission[] }>(
    "/api/researcher/feature-request-submissions",
    { accessToken },
  );

export const submitFeatureRequest = (
  accessToken: string,
  featureRequestId: string,
  submissionUrl: string,
) =>
  apiRequest<{ submission: FeatureRequestSubmission }>(
    `/api/researcher/feature-requests/${featureRequestId}/submissions`,
    {
      method: "POST",
      accessToken,
      body: JSON.stringify({ submissionUrl }),
    },
  );

export const getOrganizationFeatureRequestSubmissions = (accessToken: string) =>
  apiRequest<{ submissions: OrganizationFeatureRequestSubmission[] }>(
    "/api/organization/feature-request-submissions",
    { accessToken },
  );

export const reviewFeatureRequestSubmission = (
  accessToken: string,
  submissionId: string,
  status: Extract<FeatureRequestSubmissionStatus, "approved" | "rejected">,
) =>
  apiRequest<{ submission: FeatureRequestSubmission }>(
    `/api/organization/feature-request-submissions/${submissionId}`,
    {
      method: "PATCH",
      accessToken,
      body: JSON.stringify({ status }),
    },
  );
