import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

export type UserRole = "researcher" | "organization" | "admin";

// TODO: Replace mock role with backend user role
const mockUser: { role: UserRole } = {
  role: "researcher",
};

interface RoleGuardProps {
  allow: UserRole[];
  children: ReactNode;
}

export function RoleGuard({ allow, children }: RoleGuardProps) {
  if (!allow.includes(mockUser.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
}
