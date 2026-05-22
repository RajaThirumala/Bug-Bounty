export type FeatureRequestStatus = "open" | "planned" | "in_progress" | "completed";

export interface FeatureRequest {
  id: string;
  organizationId: string;
  organizationName?: string;
  title: string;
  description: string;
  repositoryUrl: string;
  bounty: number;
  status: FeatureRequestStatus;
}

export type FeatureRequestSubmissionStatus = "submitted" | "approved" | "rejected";

export interface FeatureRequestSubmission {
  id: string;
  featureRequestId: string;
  researcherId: string;
  submissionUrl: string;
  status: FeatureRequestSubmissionStatus;
  submittedAt: string;
}

export interface OrganizationFeatureRequestSubmission extends FeatureRequestSubmission {
  featureRequestTitle: string;
  researcherName: string;
  researcherEmail: string | null;
}
