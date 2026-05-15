import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/common/PageHeader";
import { getResearcherProgram } from "@/features/programs";
import { useAuthStore } from "@/features/auth";

export default function ProgramDetails() {
  const { programId } = useParams<{ programId: string }>();
  const accessToken = useAuthStore((state) => state.accessToken);
  const { data, isLoading, error } = useQuery({
    queryKey: ["researcher-program", programId],
    queryFn: () => getResearcherProgram(accessToken ?? "", programId ?? ""),
    enabled: Boolean(accessToken && programId),
  });
  const program = data?.program;

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading program...</p>;
  }

  if (error || !program) {
    return (
      <div>
        <PageHeader title="Program not found" description="We couldn't find that program." />
        <Button asChild variant="secondary">
          <Link to="/researcher/programs"><ArrowLeft className="h-4 w-4 mr-2" />Back to programs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/researcher/programs"><ArrowLeft className="h-4 w-4 mr-2" />Back to programs</Link>
      </Button>

      <PageHeader
        title={program.name}
        description={program.organization}
        actions={
          <Button asChild>
            <Link to={`/researcher/submit-report?programId=${program.id}`}>Submit a report</Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-border/70 shadow-[var(--shadow-soft)] rounded-xl">
          <CardContent className="p-6">
            <h3 className="text-sm font-medium mb-2">About this program</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{program.description}</p>

            <h3 className="text-sm font-medium mt-6 mb-2">In scope</h3>
            <div className="flex flex-wrap gap-2">
              {program.scope.map((s) => (
                <Badge key={s} variant="secondary" className="font-normal">{s}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl h-fit">
          <CardContent className="p-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Bounty range</p>
              <p className="text-lg font-semibold mt-1">
                ${program.minBounty.toLocaleString()} – ${program.maxBounty.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
              <p className="text-sm font-medium mt-1 capitalize">{program.status}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
