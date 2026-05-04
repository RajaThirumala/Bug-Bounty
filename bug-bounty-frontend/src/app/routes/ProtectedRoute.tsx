import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

// TODO: Replace mock auth with backend auth
const mockAuth = {
  isAuthenticated: true,
};

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();

  if (!mockAuth.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}