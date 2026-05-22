import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore, type UserRole } from "@/features/auth";

interface RoleGuardProps {
  allow: UserRole[];
  children: ReactNode;
}

export function RoleGuard({ allow, children }: RoleGuardProps) {
  const userRole = useAuthStore((state) => state.user?.role);
  const onboardingCompleted = useAuthStore((state) => state.user?.onboardingCompleted);

  if (!onboardingCompleted) {
    return <>{children}</>;
  }

  if (!userRole || !allow.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
}
