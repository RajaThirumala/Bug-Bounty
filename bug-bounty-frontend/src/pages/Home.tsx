import { Link } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Trophy,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuthStore } from "@/features/auth";
import { CoinLogo } from "@/components/common/CoinLogo";

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = useAuthStore((state) => state.user?.role);
  const dashboardPath =
    role === "organization"
      ? "/organization/dashboard"
      : role === "triager"
        ? "/triager/dashboard"
        : role === "admin"
          ? "/admin/dashboard"
          : "/researcher/dashboard";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 md:px-8">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight lg:ml-6 xl:ml-10">
            <span className="flex h-9 w-9 items-center justify-center">
              <CoinLogo className="h-7 w-7" />
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

      <main className="px-4 py-8 md:px-8 md:py-10">
        <section className="grid min-h-[calc(100vh-7rem)] grid-cols-1 items-start gap-8 pt-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-4 lg:pt-14">
          <div className="max-w-4xl lg:ml-6 xl:ml-10">
              <p className="mb-4 text-sm font-medium text-primary">Coordinated security testing</p>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
                Bug bounty programs for teams and researchers.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Launch programs, invite reports, assign triage, review feature implementations, and
                release rewards from one focused workspace.
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

          <aside className="lg:-ml-6 xl:-ml-10">
            <Card className="border-border/70 shadow-[var(--shadow-soft-md)]">
              <CardContent className="p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Program snapshot</p>
                    <h2 className="text-lg font-semibold">Web App Security</h2>
                  </div>
                  <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
                    Active
                  </span>
                </div>
                <div className="mb-5 grid grid-cols-3 gap-3">
                  {[
                    { label: "Triaged", value: "24" },
                    { label: "Validated", value: "18" },
                    { label: "Escrowed", value: "$12.4k" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-border bg-background p-3">
                      <p className="text-lg font-semibold tracking-tight">{item.value}</p>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
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
              </CardContent>
            </Card>
          </aside>
        </section>
      </main>

      <footer className="fixed bottom-0 z-40 flex w-full items-center justify-around border-t border-border bg-background/95 px-4 py-2 backdrop-blur md:hidden">
        {[
          { label: "Dashboard", icon: LayoutDashboard, to: dashboardPath },
          { label: "Programs", icon: ShieldCheck, to: "/researcher/programs" },
          { label: "Reports", icon: FileText, to: "/researcher/reports" },
          { label: "Profile", icon: User, to: "/profile" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={isAuthenticated ? item.to : "/login"}
              className="flex flex-col items-center justify-center rounded-md px-3 py-1 text-muted-foreground"
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </footer>
    </div>
  );
}
