import { ShieldCheck, FileText, CheckCircle2, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";

export default function Dashboard() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome back, Jane. Here's a snapshot of your bug bounty activity."
      />

      <Card className="mb-6 border-border/70 shadow-[var(--shadow-soft)] rounded-xl bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold tracking-tight">Hey Jane 👋</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            You have 12 active programs you can hunt on. Stay focused, document well, and good luck.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Active Programs" value={12} icon={<ShieldCheck className="h-4 w-4" />} trend="+2 this week" />
        <StatCard label="Submitted Reports" value={8} icon={<FileText className="h-4 w-4" />} trend="3 under review" />
        <StatCard label="Accepted Reports" value={5} icon={<CheckCircle2 className="h-4 w-4" />} trend="62% acceptance" />
      </div>

      <div className="mb-3 flex items-center gap-2">
        <Activity className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Recent activity</h3>
      </div>
      <EmptyState
        title="No recent activity yet"
        description="Once you submit your first report, you'll see updates here."
      />
    </div>
  );
}
