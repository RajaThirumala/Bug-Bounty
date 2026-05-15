export type UserRole = "developer" | "organization";
export type BackendRole =
  | "researcher"
  | "organization_owner"
  | "organization_member"
  | "triager"
  | "platform_admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  handle: string | null;
  role: UserRole;
  backendRole: BackendRole;
  onboardingCompleted: boolean;
  title: string;
  initials: string;
}
