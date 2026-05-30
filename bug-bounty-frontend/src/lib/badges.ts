import type { FeatureRequestStatus, FeatureRequestSubmissionStatus } from "@/features/featureRequests";
import type { ProgramStatus } from "@/features/programs";
import type { ReportSeverity, ReportStatus } from "@/features/reports";
import { cn } from "@/lib/utils";

export function severityBadgeClass(severity: ReportSeverity, className?: string) {
  const classes: Record<ReportSeverity, string> = {
    low: "border-emerald-200 bg-emerald-50 text-emerald-700",
    medium: "border-amber-200 bg-amber-50 text-amber-700",
    high: "border-orange-200 bg-orange-50 text-orange-700",
    critical: "border-red-200 bg-red-50 text-red-700",
  };

  return cn(classes[severity], className);
}

export function reportStatusBadgeClass(status: ReportStatus, className?: string) {
  const classes: Record<ReportStatus, string> = {
    submitted: "border-sky-200 bg-sky-50 text-sky-700",
    triaged: "border-violet-200 bg-violet-50 text-violet-700",
    resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rejected: "border-zinc-200 bg-zinc-50 text-zinc-700",
  };

  return cn(classes[status], className);
}

export function programStatusBadgeClass(status: ProgramStatus, className?: string) {
  const classes: Record<ProgramStatus, string> = {
    active: "border-emerald-200 bg-emerald-50 text-emerald-700",
    paused: "border-amber-200 bg-amber-50 text-amber-700",
    private: "border-zinc-200 bg-zinc-50 text-zinc-700",
  };

  return cn(classes[status], className);
}

export function featureStatusBadgeClass(status: FeatureRequestStatus, className?: string) {
  const classes: Record<FeatureRequestStatus, string> = {
    open: "border-sky-200 bg-sky-50 text-sky-700",
    planned: "border-violet-200 bg-violet-50 text-violet-700",
    in_progress: "border-amber-200 bg-amber-50 text-amber-700",
    completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return cn(classes[status], className);
}

export function submissionStatusBadgeClass(
  status: FeatureRequestSubmissionStatus,
  className?: string,
) {
  const classes: Record<FeatureRequestSubmissionStatus, string> = {
    submitted: "border-sky-200 bg-sky-50 text-sky-700",
    approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rejected: "border-red-200 bg-red-50 text-red-700",
  };

  return cn(classes[status], className);
}
