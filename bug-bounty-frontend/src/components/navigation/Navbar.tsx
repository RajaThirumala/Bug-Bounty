import { Bell, LogOut, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuthStore } from "@/features/auth";
import {
  getOrganizationFeatureRequests,
  getResearcherFeatureRequests,
} from "@/features/featureRequests";
import { getOrganizationPrograms, getResearcherPrograms } from "@/features/programs";
import { getOrganizationReports, getResearcherReports } from "@/features/reports";
import { BugTreasureAnimation } from "../ui/BugTreasureAnimation";

export function Navbar() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const signOut = useAuthStore((state) => state.signOut);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { data: notificationsData } = useQuery({
    queryKey: ["navbar-notifications", user?.role],
    queryFn: () =>
      user?.role === "developer"
        ? getResearcherReports(accessToken ?? "")
        : getOrganizationReports(accessToken ?? ""),
    enabled: Boolean(accessToken && user),
  });
  const { data: programsData } = useQuery({
    queryKey: ["navbar-programs", user?.role],
    queryFn: () =>
      user?.role === "organization"
        ? getOrganizationPrograms(accessToken ?? "")
        : getResearcherPrograms(accessToken ?? ""),
    enabled: Boolean(accessToken && user?.role !== "triager"),
  });
  const { data: featureRequestsData } = useQuery({
    queryKey: ["navbar-feature-requests", user?.role],
    queryFn: () =>
      user?.role === "organization"
        ? getOrganizationFeatureRequests(accessToken ?? "")
        : getResearcherFeatureRequests(accessToken ?? ""),
    enabled: Boolean(accessToken && user?.role !== "triager"),
  });
  const notifications = (notificationsData?.reports ?? []).slice(0, 4);
  const reportsPath =
    user?.role === "developer"
      ? "/researcher/reports"
      : user?.role === "triager"
        ? "/triager/reports"
        : "/organization/reports";
  const programsPath = user?.role === "organization" ? "/organization/programs" : "/researcher/programs";
  const featureRequestsPath =
    user?.role === "organization" ? "/organization/feature-requests" : "/researcher/feature-requests";
  const normalizedSearch = debouncedSearchTerm.trim().toLowerCase();
  const searchResults = normalizedSearch
    ? [
        ...(notificationsData?.reports ?? [])
          .filter((report) =>
            [report.title, report.programName, report.organizationName]
              .filter(Boolean)
              .some((value) => value?.toLowerCase().includes(normalizedSearch)),
          )
          .slice(0, 4)
          .map((report) => ({
            id: `report-${report.id}`,
            title: report.title,
            meta: `Report - ${report.status}`,
            path: `${reportsPath}/${report.id}`,
          })),
        ...((programsData && "programs" in programsData ? programsData.programs : []) ?? [])
          .filter((program) =>
            [program.name, program.organization]
              .filter(Boolean)
              .some((value) => value?.toLowerCase().includes(normalizedSearch)),
          )
          .slice(0, 3)
          .map((program) => ({
            id: `program-${program.id}`,
            title: program.name,
            meta: `Program - ${program.status}`,
            path:
              user?.role === "organization"
                ? programsPath
                : `${programsPath}/${program.id}`,
          })),
        ...(featureRequestsData?.featureRequests ?? [])
          .filter((request) =>
            [request.title, request.organizationName]
              .filter(Boolean)
              .some((value) => value?.toLowerCase().includes(normalizedSearch)),
          )
          .slice(0, 3)
          .map((request) => ({
            id: `feature-${request.id}`,
            title: request.title,
            meta: `Feature request - ${request.status.replace("_", " ")}`,
            path: featureRequestsPath,
          })),
      ].slice(0, 8)
    : [];

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      navigate("/login", { replace: true });
    } finally {
      setIsSigningOut(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearchOpen(Boolean(searchTerm.trim()));
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  const openSearchResult = (path: string) => {
    navigate(path);
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setIsSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="h-full px-4 md:px-6 flex items-center gap-3">
        <form
          className="relative flex-1 max-w-md"
          onSubmit={(event) => {
            event.preventDefault();
            if (searchResults[0]) {
              openSearchResult(searchResults[0].path);
            }
          }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
            }}
            onFocus={() => setIsSearchOpen(Boolean(debouncedSearchTerm.trim()))}
            onBlur={() => window.setTimeout(() => setIsSearchOpen(false), 120)}
            placeholder="Search programs, reports, requests..."
            className="pl-9 h-9 bg-muted/40 border-transparent focus-visible:bg-card"
          />
          {isSearchOpen && debouncedSearchTerm.trim() && (
            <div className="absolute left-0 right-0 top-11 z-50 rounded-md border bg-popover p-2 text-popover-foreground shadow-md">
              {searchResults.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">No results found.</p>
              ) : (
                <div className="space-y-1">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      className="w-full rounded-md px-3 py-2 text-left hover:bg-muted/60"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => openSearchResult(result.path)}
                    >
                      <p className="text-sm font-medium line-clamp-1">{result.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{result.meta}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </form>
        <div className="flex items-center gap-1 ml-auto">
          <BugTreasureAnimation />
          <ThemeToggle />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="Notifications">
                <Bell className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Notifications</p>
                  <p className="text-xs text-muted-foreground">Recent report updates</p>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No notifications yet.</p>
                ) : (
                  <div className="space-y-2">
                    {notifications.map((report) => (
                      <Link
                        key={report.id}
                        to={`${reportsPath}/${report.id}`}
                        className="block rounded-md border p-3 hover:bg-muted/40"
                      >
                        <p className="text-sm font-medium line-clamp-1">{report.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {report.status} - {report.severity}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to={reportsPath}>View reports</Link>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Log out"
            disabled={isSigningOut}
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full ml-1"
            aria-label="Open profile"
            onClick={() => navigate("/profile")}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {user?.initials ?? "U"}
              </AvatarFallback>
            </Avatar>
          </Button>
        </div>
      </div>
    </header>
  );
}
