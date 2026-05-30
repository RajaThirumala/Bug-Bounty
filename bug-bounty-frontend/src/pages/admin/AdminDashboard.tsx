import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuthStore } from "@/features/auth";
import { getAdminEscrows, releaseEscrow, type EscrowFund } from "@/features/admin/api";

export default function AdminDashboard() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-escrows"],
    queryFn: () => getAdminEscrows(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });
  const mutation = useMutation({
    mutationFn: ({
      escrowId,
      recipientId,
      releaseReason,
    }: {
      escrowId: string;
      recipientId: string;
      releaseReason: string;
    }) => releaseEscrow(accessToken ?? "", escrowId, recipientId, releaseReason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-escrows"] });
    },
  });
  const escrows = data?.escrows ?? [];
  const heldEscrows = escrows.filter((escrow) => escrow.status === "held");

  const findCandidate = (escrow: EscrowFund) => {
    if (escrow.sourceType === "feature_request") {
      return data?.approvedFeatureSubmissions.find(
        (submission) => submission.featureRequestId === escrow.sourceId,
      );
    }

    return data?.resolvedReports.find((report) => report.programId === escrow.sourceId);
  };

  return (
    <div>
      <PageHeader
        title="Admin Escrow"
        description="Hold organization-funded rewards and release them to approved researchers."
      />

      {isLoading && <p className="text-sm text-muted-foreground">Loading escrows...</p>}
      {error && <p className="text-sm text-destructive">Unable to load escrow dashboard.</p>}
      {!isLoading && !error && heldEscrows.length === 0 && (
        <EmptyState title="No held escrow funds" description="New funded programs and feature requests will appear here." />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {heldEscrows.map((escrow) => {
          const candidate = findCandidate(escrow);

          return (
            <Card key={escrow.id} className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold tracking-tight">{escrow.organizationName}</h3>
                    <p className="text-sm text-muted-foreground capitalize">
                      {escrow.sourceType.replace("_", " ")} escrow
                    </p>
                  </div>
                  <Badge variant="outline">${escrow.amount.toLocaleString()}</Badge>
                </div>

                {candidate ? (
                  <div className="mt-4 rounded-md border p-3">
                    <p className="text-sm font-medium">{candidate.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Winner: {candidate.researcherName}
                    </p>
                    <Button
                      className="mt-3 w-full"
                      disabled={mutation.isPending}
                      onClick={() =>
                        mutation.mutate({
                          escrowId: escrow.id,
                          recipientId: candidate.researcherId,
                          releaseReason: `Reward released for ${candidate.title}`,
                        })
                      }
                    >
                      Release reward
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-4">
                    Waiting for an approved feature implementation or resolved report.
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
