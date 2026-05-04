export type ProgramStatus = "active" | "paused" | "private";

export interface Program {
  id: string;
  name: string;
  organization: string;
  description: string;
  minBounty: number;
  maxBounty: number;
  status: ProgramStatus;
  scope: string[];
}

// TODO: Replace mock programs with API data
export const mockPrograms: Program[] = [
  {
    id: "acme-web",
    name: "Acme Web Platform",
    organization: "Acme Corp",
    description:
      "Find vulnerabilities in our public web platform, including authentication and payment flows.",
    minBounty: 250,
    maxBounty: 10000,
    status: "active",
    scope: ["*.acme.com", "api.acme.com"],
  },
  {
    id: "northwind-api",
    name: "Northwind Public API",
    organization: "Northwind Logistics",
    description: "Bug bounty program covering our public REST API and partner integrations.",
    minBounty: 100,
    maxBounty: 5000,
    status: "active",
    scope: ["api.northwind.io"],
  },
  {
    id: "lumen-mobile",
    name: "Lumen Mobile Apps",
    organization: "Lumen Health",
    description: "Private program for mobile (iOS/Android) clients handling sensitive health data.",
    minBounty: 500,
    maxBounty: 15000,
    status: "private",
    scope: ["iOS app", "Android app"],
  },
];
