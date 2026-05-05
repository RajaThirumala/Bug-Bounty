export type FeatureRequestStatus = "open" | "planned" | "in-progress" | "completed";

export interface FeatureRequest {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  bounty: number;
  status: FeatureRequestStatus;
}
