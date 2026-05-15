import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { getOrganizationPrograms } from "@/features/programs";
import { useAuthStore } from "@/features/auth";

export default function OrganizationPrograms() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data, isLoading, error } = useQuery({
    queryKey: ["organization-programs"],
    queryFn: () => getOrganizationPrograms(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });

  const programs = data?.programs ?? [];

  return (
    <div>
      <PageHeader
        title="Manage Programs"
        description="Create and maintain your organization's bounty programs."
        actions={
          <Button asChild>
            <Link to="/organization/programs/new"><Plus className="h-4 w-4 mr-2" />Create program</Link>
          </Button>
        }
      />

      {isLoading && <p className="text-sm text-muted-foreground">Loading programs...</p>}
      {error && <p className="text-sm text-destructive">Unable to load programs.</p>}

      {!isLoading && !error && programs.length === 0 && (
        <EmptyState
          title="No programs yet"
          description="Create your first bounty program for researchers to view."
          action={
            <Button asChild>
              <Link to="/organization/programs/new">Create program</Link>
            </Button>
          }
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {programs.map((program) => (
          <Card key={program.id} className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold tracking-tight">{program.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{program.description}</p>
                </div>
                <Badge variant="outline" className="capitalize">{program.status}</Badge>
              </div>
              <p className="text-sm font-medium mt-4">
                ${program.minBounty.toLocaleString()} - ${program.maxBounty.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
