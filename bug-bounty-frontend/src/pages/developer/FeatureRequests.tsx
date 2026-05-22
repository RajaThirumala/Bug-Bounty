import { ExternalLink, GitBranch, Lightbulb, Send } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import {
  getMyFeatureRequestSubmissions,
  getResearcherFeatureRequests,
  submitFeatureRequest,
  type FeatureRequestStatus,
  type FeatureRequestSubmissionStatus,
} from "@/features/featureRequests";
import { useAuthStore } from "@/features/auth";

const statusLabel: Record<FeatureRequestStatus, string> = {
  open: "Open",
  planned: "Planned",
  in_progress: "In Progress",
  completed: "Completed",
};

const submissionStatusLabel: Record<FeatureRequestSubmissionStatus, string> = {
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
};

export default function DeveloperFeatureRequests() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [submissionUrls, setSubmissionUrls] = useState<Record<string, string>>({});
  const [submissionError, setSubmissionError] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["researcher-feature-requests"],
    queryFn: () => getResearcherFeatureRequests(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });
  const { data: submissionsData } = useQuery({
    queryKey: ["researcher-feature-request-submissions"],
    queryFn: () => getMyFeatureRequestSubmissions(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });
  const mutation = useMutation({
    mutationFn: ({ requestId, submissionUrl }: { requestId: string; submissionUrl: string }) =>
      submitFeatureRequest(accessToken ?? "", requestId, submissionUrl),
    onSuccess: async (_data, variables) => {
      setSubmissionError("");
      setSubmissionUrls((current) => ({ ...current, [variables.requestId]: "" }));
      await queryClient.invalidateQueries({ queryKey: ["researcher-feature-request-submissions"] });
      await queryClient.invalidateQueries({ queryKey: ["organization-feature-request-submissions"] });
    },
    onError: (err) => {
      setSubmissionError(err instanceof Error ? err.message : "Unable to submit repository");
    },
  });
  const requests = data?.featureRequests ?? [];
  const submissions = submissionsData?.submissions ?? [];
  const submissionByRequest = Object.fromEntries(
    submissions.map((submission) => [submission.featureRequestId, submission]),
  );

  const handleSubmit = (requestId: string) => {
    const submissionUrl = submissionUrls[requestId]?.trim();
    if (!submissionUrl) {
      return;
    }
    setSubmissionError("");
    mutation.mutate({ requestId, submissionUrl });
  };

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
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={request.repositoryUrl} target="_blank" rel="noreferrer">
                    <GitBranch className="h-4 w-4" />
                    Source repo
                  </a>
                </Button>
                {submissionByRequest[request.id] && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={submissionByRequest[request.id].submissionUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Your repo
                    </a>
                  </Button>
                )}
              </div>
              <p className="text-sm font-medium mt-4">${request.bounty.toLocaleString()} bounty</p>
              {submissionByRequest[request.id] && (
                <Badge variant="secondary" className="mt-3">
                  {submissionStatusLabel[submissionByRequest[request.id].status]}
                </Badge>
              )}
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <Input
                  type="url"
                  value={submissionUrls[request.id] ?? ""}
                  onChange={(event) =>
                    setSubmissionUrls((current) => ({
                      ...current,
                      [request.id]: event.target.value,
                    }))
                  }
                  placeholder="https://github.com/you/feature-implementation"
                />
                <Button
                  type="button"
                  disabled={mutation.isPending || !submissionUrls[request.id]?.trim()}
                  onClick={() => handleSubmit(request.id)}
                >
                  <Send className="h-4 w-4" />
                  Submit
                </Button>
              </div>
              {submissionError && <p className="text-sm text-destructive mt-3">{submissionError}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
