export type UserRole = "developer" | "organization";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  handle: string;
  role: UserRole;
  title: string;
  initials: string;
}
