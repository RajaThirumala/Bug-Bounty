export type ProgramStatus = "active" | "paused" | "private";

export interface Program {
  id: string;
  organizationId: string;
  name: string;
  organization: string;
  description: string;
  minBounty: number;
  maxBounty: number;
  status: ProgramStatus;
  scope: string[];
}
