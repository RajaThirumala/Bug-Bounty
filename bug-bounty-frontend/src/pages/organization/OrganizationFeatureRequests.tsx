import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { mockFeatureRequests } from "@/features/featureRequests";

export default function OrganizationFeatureRequests() {
  const requests = mockFeatureRequests.filter((request) => request.organizationId === "org-acme");

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requests.map((request) => (
          <Card key={request.id} className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold tracking-tight">{request.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
                </div>
                <Badge variant="outline" className="capitalize">{request.status}</Badge>
              </div>
              <p className="text-sm font-medium mt-4">${request.bounty.toLocaleString()} bounty</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
