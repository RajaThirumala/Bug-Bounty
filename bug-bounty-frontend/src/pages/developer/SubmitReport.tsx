import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
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
import { fieldErrorsFromZod, type FieldErrors } from "@/lib/validation";

const reportSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters"),
  programId: z.string().min(1, "Select a program"),
  severity: z.enum(["low", "medium", "high", "critical"], {
    message: "Select a severity",
  }),
  summary: z.string().trim().min(20, "Description must be at least 20 characters"),
});

type ReportField = keyof z.infer<typeof reportSchema>;

export default function SubmitReport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const userId = useAuthStore((state) => state.user?.id);
  const [title, setTitle] = useState("");
  const [programId, setProgramId] = useState(searchParams.get("programId") ?? "");
  const [severity, setSeverity] = useState<ReportSeverity | "">("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<ReportField>>({});
  const [draftMessage, setDraftMessage] = useState("");
  const draftKey = userId ? `bug-bounty.report-draft.${userId}` : "";
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
      if (draftKey) {
        window.localStorage.removeItem(draftKey);
      }
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
    setFieldErrors({});
    setDraftMessage("");
    const result = reportSchema.safeParse({ title, programId, severity, summary });
    if (!result.success) {
      setFieldErrors(fieldErrorsFromZod<ReportField>(result.error));
      return;
    }

    mutation.mutate();
  };

  const handleSaveDraft = () => {
    if (!draftKey) {
      return;
    }

    window.localStorage.setItem(
      draftKey,
      JSON.stringify({ title, programId, severity, summary }),
    );
    setError("");
    setDraftMessage("Draft saved in this browser.");
  };

  useEffect(() => {
    if (!draftKey) {
      return;
    }

    const savedDraft = window.localStorage.getItem(draftKey);
    if (!savedDraft) {
      return;
    }

    try {
      const parsed = JSON.parse(savedDraft) as {
        title?: string;
        programId?: string;
        severity?: ReportSeverity | "";
        summary?: string;
      };
      setTitle(parsed.title ?? "");
      setProgramId(searchParams.get("programId") ?? parsed.programId ?? "");
      setSeverity(parsed.severity ?? "");
      setSummary(parsed.summary ?? "");
    } catch {
      window.localStorage.removeItem(draftKey);
    }
  }, [draftKey, searchParams]);

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
              {fieldErrors.title && <p className="text-sm text-destructive">{fieldErrors.title}</p>}
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
                {fieldErrors.programId && <p className="text-sm text-destructive">{fieldErrors.programId}</p>}
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
                {fieldErrors.severity && <p className="text-sm text-destructive">{fieldErrors.severity}</p>}
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
              {fieldErrors.summary && <p className="text-sm text-destructive">{fieldErrors.summary}</p>}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {draftMessage && <p className="text-sm text-muted-foreground">{draftMessage}</p>}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={!title && !programId && !severity && !summary}
                onClick={handleSaveDraft}
              >
                Save draft
              </Button>
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
