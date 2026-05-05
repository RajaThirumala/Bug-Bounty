import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockAuthUsers, mockPassword, useAuthStore, type UserRole } from "@/features/auth";

export default function Login() {
  const navigate = useNavigate();
  const signIn = useAuthStore((state) => state.signIn);
  const role = useAuthStore((state) => state.user.role);
  const setRole = useAuthStore((state) => state.setRole);
  const selectedUser = mockAuthUsers.find((user) => user.role === role) ?? mockAuthUsers[0];
  const [email, setEmail] = useState(selectedUser.email);
  const [password, setPassword] = useState(mockPassword);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const didSignIn = signIn(email, password);

    if (!didSignIn) {
      setError("Use one of the mock accounts shown below.");
      return;
    }

    const nextRole = mockAuthUsers.find(
      (user) => user.email.toLowerCase() === email.trim().toLowerCase(),
    )?.role;

    navigate(nextRole === "organization" ? "/organization/dashboard" : "/developer/dashboard", {
      replace: true,
    });
  };

  const handleRoleChange = (value: UserRole) => {
    const nextUser = mockAuthUsers.find((user) => user.role === value);
    setRole(value);
    setEmail(nextUser?.email ?? "");
    setPassword(mockPassword);
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border/70 shadow-[var(--shadow-soft-md)] rounded-2xl">
        <CardContent className="p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
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
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value) => handleRoleChange(value as UserRole)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
          <div className="mt-5 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
            <p>Developer: developer@bugbounty.test / password123</p>
            <p>Organization: organization@bugbounty.test / password123</p>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">Register</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
