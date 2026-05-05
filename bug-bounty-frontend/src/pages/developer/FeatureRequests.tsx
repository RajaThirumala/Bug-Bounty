import { Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { mockFeatureRequests, type FeatureRequestStatus } from "@/features/featureRequests";

const statusLabel: Record<FeatureRequestStatus, string> = {
  open: "Open",
  planned: "Planned",
  "in-progress": "In Progress",
  completed: "Completed",
};

export default function DeveloperFeatureRequests() {
  return (
    <div>
      <PageHeader
        title="Feature Requests"
        description="Browse product work that organizations have opened for developer contributions."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockFeatureRequests.map((request) => (
          <Card key={request.id} className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold tracking-tight">{request.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{request.description}</p>
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
