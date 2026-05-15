export type FeatureRequestStatus = "open" | "planned" | "in_progress" | "completed";

export interface FeatureRequest {
  id: string;
  organizationId: string;
  organizationName?: string;
  title: string;
  description: string;
  bounty: number;
  status: FeatureRequestStatus;
}
