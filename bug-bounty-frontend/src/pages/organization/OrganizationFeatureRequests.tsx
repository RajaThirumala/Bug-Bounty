import { Link } from "react-router-dom";
import { ExternalLink, GitBranch, Plus } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import {
  assignFeatureRequestSubmissionTriager,
  getOrganizationFeatureRequests,
  getOrganizationFeatureRequestSubmissions,
  reviewFeatureRequestSubmission,
} from "@/features/featureRequests";
import { useAuthStore } from "@/features/auth";
import { getOrganizationTriagers } from "@/features/team/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function OrganizationFeatureRequests() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const role = useAuthStore((state) => state.user?.role);
  const userId = useAuthStore((state) => state.user?.id);
  const queryClient = useQueryClient();
  const [draftAssignments, setDraftAssignments] = useState<Record<string, string>>({});
  const { data, isLoading, error } = useQuery({
    queryKey: ["organization-feature-requests"],
    queryFn: () => getOrganizationFeatureRequests(accessToken ?? ""),
    enabled: Boolean(accessToken && role === "organization"),
  });
  const { data: submissionsData } = useQuery({
    queryKey: ["organization-feature-request-submissions"],
    queryFn: () => getOrganizationFeatureRequestSubmissions(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });
  const { data: triagersData } = useQuery({
    queryKey: ["organization-triagers"],
    queryFn: () => getOrganizationTriagers(accessToken ?? ""),
    enabled: Boolean(accessToken && role === "organization"),
  });
  const reviewMutation = useMutation({
    mutationFn: ({ submissionId, status }: { submissionId: string; status: "approved" | "rejected" }) =>
      reviewFeatureRequestSubmission(accessToken ?? "", submissionId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organization-feature-request-submissions"] });
      await queryClient.invalidateQueries({ queryKey: ["researcher-feature-request-submissions"] });
    },
  });
  const assignmentMutation = useMutation({
    mutationFn: ({ submissionId, triagerId }: { submissionId: string; triagerId: string | null }) =>
      assignFeatureRequestSubmissionTriager(accessToken ?? "", submissionId, triagerId),
    onSuccess: async () => {
      setDraftAssignments({});
      await queryClient.invalidateQueries({ queryKey: ["organization-feature-request-submissions"] });
    },
  });
  const requests = data?.featureRequests ?? [];
  const submissions = submissionsData?.submissions ?? [];
  const triagers = triagersData?.triagers ?? [];

  return (
    <div>
      <PageHeader
        title="Manage Feature Requests"
        description={
          role === "triager"
            ? "Review feature implementations assigned to you."
            : "Publish and manage feature work available to developers."
        }
        actions={
          role === "organization" ? (
            <Button asChild>
              <Link to="/organization/feature-requests/new"><Plus className="h-4 w-4 mr-2" />Create request</Link>
            </Button>
          ) : undefined
        }
      />

      {role === "organization" && isLoading && <p className="text-sm text-muted-foreground">Loading feature requests...</p>}
      {role === "organization" && error && <p className="text-sm text-destructive">Unable to load feature requests.</p>}
      {role === "organization" && !isLoading && !error && requests.length === 0 && (
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

      {role === "organization" && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>}

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
                        {submission.researcherEmail ? ` - ${submission.researcherEmail}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className="capitalize">{submission.status}</Badge>
                      {role === "triager" && submission.assignedTriagerId === userId && (
                        <Badge variant="secondary">Assigned to me</Badge>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild className="mt-4">
                    <a href={submission.submissionUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      Submitted repo
                    </a>
                  </Button>
                  <div className="mt-4">
                    {role === "organization" ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Select
                          value={
                            draftAssignments[submission.id] ??
                            submission.assignedTriagerId ??
                            "unassigned"
                          }
                          onValueChange={(value) =>
                            setDraftAssignments((current) => ({
                              ...current,
                              [submission.id]: value,
                            }))
                          }
                        >
                          <SelectTrigger aria-label="Assigned triager">
                            <SelectValue placeholder="Assign triager" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {triagers.map((triager) => (
                              <SelectItem key={triager.id} value={triager.id}>
                                {triager.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={
                            assignmentMutation.isPending ||
                            (draftAssignments[submission.id] ?? submission.assignedTriagerId ?? "unassigned") ===
                              (submission.assignedTriagerId ?? "unassigned")
                          }
                          onClick={() => {
                            const selected =
                              draftAssignments[submission.id] ??
                              submission.assignedTriagerId ??
                              "unassigned";
                            assignmentMutation.mutate({
                              submissionId: submission.id,
                              triagerId: selected === "unassigned" ? null : selected,
                            });
                          }}
                        >
                          Assign
                        </Button>
                      </div>
                    ) : null}
                  </div>
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
