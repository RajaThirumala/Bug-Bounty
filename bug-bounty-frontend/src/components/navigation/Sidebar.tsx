import { Link, useLocation } from "react-router-dom";
import {
  ClipboardList,
  FilePlus2,
  FileText,
  LayoutDashboard,
  Lightbulb,
  Send,
  ShieldCheck,
  Users,
  User,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth";
import { CoinLogo } from "@/components/common/CoinLogo";

const developerItems = [
  { to: "/researcher/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/researcher/programs", label: "Programs", icon: ShieldCheck },
  { to: "/researcher/reports", label: "My Reports", icon: FileText },
  { to: "/researcher/submit-report", label: "Submit Report", icon: Send },
  { to: "/researcher/feature-requests", label: "Feature Requests", icon: Lightbulb },
  { to: "/profile", label: "Profile", icon: User },
];

const organizationItems = [
  { to: "/organization/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/organization/programs", label: "Programs", icon: ShieldCheck },
  { to: "/organization/programs/new", label: "Create Program", icon: FilePlus2 },
  { to: "/organization/reports", label: "Reports", icon: ClipboardList },
  { to: "/organization/feature-requests", label: "Feature Requests", icon: Lightbulb },
  { to: "/organization/triagers", label: "Triagers", icon: Users },
  { to: "/profile", label: "Profile", icon: User },
];

const triagerItems = [
  { to: "/triager/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/triager/reports", label: "Reports", icon: ClipboardList },
  { to: "/triager/feature-requests", label: "Feature Reviews", icon: Lightbulb },
  { to: "/profile", label: "Profile", icon: User },
];

const adminItems = [
  { to: "/admin/dashboard", label: "Escrow", icon: Wallet },
  { to: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const { pathname } = useLocation();
  const role = useAuthStore((state) => state.user?.role ?? "developer");
  const homePath =
    role === "organization"
      ? "/organization/dashboard"
      : role === "triager"
        ? "/triager/dashboard"
        : role === "admin"
          ? "/admin/dashboard"
        : "/researcher/dashboard";
  const items =
    role === "organization"
      ? organizationItems
      : role === "triager"
        ? triagerItems
        : role === "admin"
          ? adminItems
        : developerItems;

  return (
    <aside className="hidden md:flex w-60 shrink-0 border-r border-sidebar-border bg-sidebar flex-col">
      <div className="px-5 py-5 border-b border-sidebar-border">
        <Link to={homePath} className="flex items-center gap-2">
          <div className="h-8 w-8 flex items-center justify-center">
            <CoinLogo className="h-6 w-6" />
          </div>
          <span className="font-semibold tracking-tight text-sidebar-foreground">BugBounty</span>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 text-xs text-muted-foreground border-t border-sidebar-border">
        v0.1.0 · Day 14
      </div>
    </aside>
  );
}
