import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth";

export default function AuthCallback() {
  const navigate = useNavigate();
  const completeOAuthSignIn = useAuthStore((state) => state.completeOAuthSignIn);
  const [error, setError] = useState("");

  useEffect(() => {
    void completeOAuthSignIn()
      .then((user) => {
        navigate(user.role === "organization" ? "/organization/dashboard" : "/developer/dashboard", {
          replace: true,
        });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "OAuth sign in failed");
      });
  }, [completeOAuthSignIn, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <p className="text-sm text-muted-foreground">
        {error || "Completing sign in..."}
      </p>
    </div>
  );
}
