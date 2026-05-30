import { apiRequest } from "@/lib/api";

export interface EscrowFund {
  id: string;
  organizationId: string;
  organizationName: string;
  sourceType: "program" | "feature_request";
  sourceId: string;
  amount: number;
  status: "held" | "released";
  recipientId: string | null;
  releaseReason: string | null;
  releasedAt: string | null;
  createdAt: string;
}

export interface ApprovedFeatureSubmission {
  submissionId: string;
  featureRequestId: string;
  title: string;
  researcherId: string;
  researcherName: string;
  submissionUrl: string;
  amount: number;
}

export interface ResolvedReport {
  reportId: string;
  programId: string;
  title: string;
  researcherId: string;
  researcherName: string;
  amount: number;
}

export const getAdminEscrows = (accessToken: string) =>
  apiRequest<{
    escrows: EscrowFund[];
    approvedFeatureSubmissions: ApprovedFeatureSubmission[];
    resolvedReports: ResolvedReport[];
  }>("/api/admin/escrows", { accessToken });

export const releaseEscrow = (
  accessToken: string,
  escrowId: string,
  recipientId: string,
  releaseReason: string,
) =>
  apiRequest<{ escrow: EscrowFund }>(`/api/admin/escrows/${escrowId}/release`, {
    method: "PATCH",
    accessToken,
    body: JSON.stringify({ recipientId, releaseReason }),
  });
