import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth";

export function RootRedirect() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const role = useAuthStore((state) => state.user?.role);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={role === "organization" ? "/organization/dashboard" : "/developer/dashboard"}
      replace
    />
  );
}
