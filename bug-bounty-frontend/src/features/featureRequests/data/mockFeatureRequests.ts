import type { FeatureRequest } from "@/features/featureRequests/types";

// TODO: Replace mock feature requests with API data when backend integration starts.
export const mockFeatureRequests: FeatureRequest[] = [
  {
    id: "request-001",
    organizationId: "org-acme",
    title: "Add passkey support to account login",
    description: "Prototype a passkey-first sign-in flow with clear fallback behavior.",
    bounty: 1200,
    status: "open",
  },
  {
    id: "request-002",
    organizationId: "org-acme",
    title: "Improve audit log filtering",
    description: "Design filters for actor, event type, severity, and date range.",
    bounty: 800,
    status: "planned",
  },
  {
    id: "request-003",
    organizationId: "org-northwind",
    title: "Build webhook delivery diagnostics",
    description: "Create a lightweight diagnostics view for failed webhook deliveries.",
    bounty: 1500,
    status: "open",
  },
];
