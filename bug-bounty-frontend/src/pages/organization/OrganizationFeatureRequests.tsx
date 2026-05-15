import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { getOrganizationFeatureRequests } from "@/features/featureRequests";
import { useAuthStore } from "@/features/auth";

export default function OrganizationFeatureRequests() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data, isLoading, error } = useQuery({
    queryKey: ["organization-feature-requests"],
    queryFn: () => getOrganizationFeatureRequests(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });
  const requests = data?.featureRequests ?? [];

  return (
    <div>
      <PageHeader
        title="Manage Feature Requests"
        description="Publish and manage feature work available to developers."
        actions={
          <Button asChild>
            <Link to="/organization/feature-requests/new"><Plus className="h-4 w-4 mr-2" />Create request</Link>
          </Button>
        }
      />

      {isLoading && <p className="text-sm text-muted-foreground">Loading feature requests...</p>}
      {error && <p className="text-sm text-destructive">Unable to load feature requests.</p>}
      {!isLoading && !error && requests.length === 0 && (
        <EmptyState
          title="No feature requests yet"
          description="Create feature requests for researchers to discover."
          action={
            <Button asChild>
              <Link to="/organization/feature-requests/new">Create request</Link>
            </Button>
          }
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requests.map((request) => (
          <Card key={request.id} className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold tracking-tight">{request.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
                </div>
                <Badge variant="outline" className="capitalize">
                  {request.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-sm font-medium mt-4">${request.bounty.toLocaleString()} bounty</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
