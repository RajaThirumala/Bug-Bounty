import { Lightbulb } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { getResearcherFeatureRequests, type FeatureRequestStatus } from "@/features/featureRequests";
import { useAuthStore } from "@/features/auth";

const statusLabel: Record<FeatureRequestStatus, string> = {
  open: "Open",
  planned: "Planned",
  in_progress: "In Progress",
  completed: "Completed",
};

export default function DeveloperFeatureRequests() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data, isLoading, error } = useQuery({
    queryKey: ["researcher-feature-requests"],
    queryFn: () => getResearcherFeatureRequests(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });
  const requests = data?.featureRequests ?? [];

  return (
    <div>
      <PageHeader
        title="Feature Requests"
        description="Browse product work that organizations have opened for developer contributions."
      />

      {isLoading && <p className="text-sm text-muted-foreground">Loading feature requests...</p>}
      {error && <p className="text-sm text-destructive">Unable to load feature requests.</p>}
      {!isLoading && !error && requests.length === 0 && (
        <EmptyState
          title="No feature requests available"
          description="Organization feature requests will appear here."
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requests.map((request) => (
          <Card key={request.id} className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold tracking-tight">{request.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{request.description}</p>
                  {request.organizationName && (
                    <p className="text-xs text-muted-foreground mt-2">{request.organizationName}</p>
                  )}
                </div>
                <Badge variant="outline">{statusLabel[request.status]}</Badge>
              </div>
              <p className="text-sm font-medium mt-4">${request.bounty.toLocaleString()} bounty</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
