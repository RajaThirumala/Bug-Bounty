import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/common/PageHeader";
import { getResearcherPrograms } from "@/features/programs";
import { createReport, type ReportSeverity } from "@/features/reports";
import { useAuthStore } from "@/features/auth";

export default function SubmitReport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [title, setTitle] = useState("");
  const [programId, setProgramId] = useState(searchParams.get("programId") ?? "");
  const [severity, setSeverity] = useState<ReportSeverity | "">("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["researcher-programs"],
    queryFn: () => getResearcherPrograms(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });

  const mutation = useMutation({
    mutationFn: () =>
      createReport(accessToken ?? "", {
        title,
        programId,
        severity: severity as ReportSeverity,
        summary,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["researcher-reports"] });
      await queryClient.invalidateQueries({ queryKey: ["organization-reports"] });
      navigate("/researcher/reports");
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Unable to submit report");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    mutation.mutate();
  };

  return (
    <div>
      <PageHeader
        title="Submit a report"
        description="Provide a clear, reproducible vulnerability report. Quality wins bounties."
      />

      <Card className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Stored XSS in profile bio"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="program">Program</Label>
                <Select value={programId} onValueChange={setProgramId}>
                  <SelectTrigger id="program"><SelectValue placeholder="Select a program" /></SelectTrigger>
                  <SelectContent>
                    {(data?.programs ?? []).map((program) => (
                      <SelectItem key={program.id} value={program.id}>{program.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="severity">Severity</Label>
                <Select value={severity} onValueChange={(value) => setSeverity(value as ReportSeverity)}>
                  <SelectTrigger id="severity"><SelectValue placeholder="Select severity" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Description & steps to reproduce</Label>
              <Textarea
                id="description"
                rows={8}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Detail the vulnerability, impact, and reproduction steps..."
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost">Save draft</Button>
              <Button
                type="submit"
                disabled={mutation.isPending || isLoading || !title || !programId || !severity || !summary}
              >
                {mutation.isPending ? "Submitting..." : "Submit report"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
