export type UserRole = "developer" | "organization" | "triager" | "admin";
export type BackendRole =
  | "researcher"
  | "organization_owner"
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
