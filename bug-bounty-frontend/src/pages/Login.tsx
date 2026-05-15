import { Link, useNavigate } from "react-router-dom";
import { Bug, Github } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/features/auth";

export default function Login() {
  const navigate = useNavigate();
  const signIn = useAuthStore((state) => state.signIn);
  const signInWithOAuth = useAuthStore((state) => state.signInWithOAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectForRole = (role: "developer" | "organization") => {
    navigate(role === "organization" ? "/organization/dashboard" : "/researcher/dashboard", {
      replace: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user = await signIn(email, password);
      if (!user.onboardingCompleted) {
        navigate("/onboarding", { replace: true });
        return;
      }
      redirectForRole(user.role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setError("");
    try {
      await signInWithOAuth(provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start OAuth");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border/70 shadow-[var(--shadow-soft-md)] rounded-2xl">
        <CardContent className="p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Bug className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <Button type="button" variant="outline" onClick={() => handleOAuth("google")}>
              Google
            </Button>
            <Button type="button" variant="outline" onClick={() => handleOAuth("github")}>
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">Register</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
