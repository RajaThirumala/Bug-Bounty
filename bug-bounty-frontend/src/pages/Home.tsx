import { Link } from "react-router-dom";
import { ArrowRight, Bug, FileText, ShieldCheck, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuthStore } from "@/features/auth";

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.user?.role);
  const dashboardPath = role === "organization" ? "/organization/dashboard" : "/researcher/dashboard";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Bug className="h-5 w-5 text-primary" />
            </span>
            BugBounty
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button asChild>
                <Link to={dashboardPath}>Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-[1.05fr_0.95fr] md:px-8 md:py-24">
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-sm font-medium text-primary">Coordinated security testing</p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
              Bug bounty programs for teams and researchers.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              Launch programs, invite reports, triage vulnerabilities, and track rewards from one
              focused workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to={isAuthenticated ? dashboardPath : "/register"}>
                  {isAuthenticated ? "Open dashboard" : "Start now"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to={isAuthenticated ? "/researcher/programs" : "/login"}>Browse programs</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft-md)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Program snapshot</p>
                <h2 className="text-lg font-semibold">Web App Security</h2>
              </div>
              <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                Active
              </span>
            </div>
            <div className="grid gap-3">
              {[
                { label: "Open reports", value: "24", icon: FileText },
                { label: "Validated findings", value: "18", icon: ShieldCheck },
                { label: "Rewards issued", value: "$12.4k", icon: Trophy },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg border border-border bg-background p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <span className="text-xl font-semibold">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
