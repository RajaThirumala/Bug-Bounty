import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { getResearcherPrograms } from "@/features/programs";
import { useAuthStore } from "@/features/auth";
import { programStatusBadgeClass } from "@/lib/badges";

export default function Programs() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data, isLoading, error } = useQuery({
    queryKey: ["researcher-programs"],
    queryFn: () => getResearcherPrograms(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });
  const programs = data?.programs ?? [];

  return (
    <div>
      <PageHeader
        title="Programs"
        description="Browse public and private bug bounty programs you can contribute to."
      />

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search programs..." className="pl-9 bg-card" />
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading programs...</p>}
      {error && <p className="text-sm text-destructive">Unable to load programs.</p>}

      {!isLoading && !error && programs.length === 0 && (
        <EmptyState
          title="No programs available"
          description="Active organization programs will appear here."
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {programs.map((p) => (
            <Card
              key={p.id}
              className="border-border/70 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-soft-md)] transition-shadow rounded-xl"
            >
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold tracking-tight truncate">{p.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.organization}</p>
                  </div>
                  <Badge variant="outline" className={programStatusBadgeClass(p.status, "capitalize")}>{p.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{p.description}</p>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/60">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Bounty</p>
                    <p className="text-sm font-medium">
                      ${p.minBounty.toLocaleString()} – ${p.maxBounty.toLocaleString()}
                    </p>
                  </div>
                  <Button asChild size="sm" variant="secondary">
                    <Link to={`/researcher/programs/${p.id}`}>View details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
