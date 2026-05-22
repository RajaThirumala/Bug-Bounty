import { Link } from "react-router-dom";
import { ExternalLink, GitBranch, Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import {
  getOrganizationFeatureRequests,
  getOrganizationFeatureRequestSubmissions,
  reviewFeatureRequestSubmission,
} from "@/features/featureRequests";
import { useAuthStore } from "@/features/auth";

export default function OrganizationFeatureRequests() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["organization-feature-requests"],
    queryFn: () => getOrganizationFeatureRequests(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });
  const { data: submissionsData } = useQuery({
    queryKey: ["organization-feature-request-submissions"],
    queryFn: () => getOrganizationFeatureRequestSubmissions(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });
  const reviewMutation = useMutation({
    mutationFn: ({ submissionId, status }: { submissionId: string; status: "approved" | "rejected" }) =>
      reviewFeatureRequestSubmission(accessToken ?? "", submissionId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organization-feature-request-submissions"] });
      await queryClient.invalidateQueries({ queryKey: ["researcher-feature-request-submissions"] });
    },
  });
  const requests = data?.featureRequests ?? [];
  const submissions = submissionsData?.submissions ?? [];

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
              <Button variant="outline" size="sm" asChild className="mt-4">
                <a href={request.repositoryUrl} target="_blank" rel="noreferrer">
                  <GitBranch className="h-4 w-4" />
                  Source repo
                </a>
              </Button>
              <p className="text-sm font-medium mt-4">${request.bounty.toLocaleString()} bounty</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <PageHeader
          title="Researcher Submissions"
          description="Verify submitted implementation repositories."
        />
        {submissions.length === 0 ? (
          <EmptyState
            title="No submissions yet"
            description="Researcher GitHub submissions will appear here for review."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submissions.map((submission) => (
              <Card key={submission.id} className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold tracking-tight">{submission.featureRequestTitle}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {submission.researcherName}
                        {submission.researcherEmail ? ` · ${submission.researcherEmail}` : ""}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">{submission.status}</Badge>
                  </div>
                  <Button variant="outline" size="sm" asChild className="mt-4">
                    <a href={submission.submissionUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      Submitted repo
                    </a>
                  </Button>
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      disabled={reviewMutation.isPending || submission.status === "approved"}
                      onClick={() => reviewMutation.mutate({ submissionId: submission.id, status: "approved" })}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={reviewMutation.isPending || submission.status === "rejected"}
                      onClick={() => reviewMutation.mutate({ submissionId: submission.id, status: "rejected" })}
                    >
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
