import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth";

export function RootRedirect() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <Navigate
      to={
        user.role === "organization"
          ? "/organization/dashboard"
          : user.role === "triager"
            ? "/triager/dashboard"
            : user.role === "admin"
              ? "/admin/dashboard"
            : "/researcher/dashboard"
      }
      replace
    />
  );
}
