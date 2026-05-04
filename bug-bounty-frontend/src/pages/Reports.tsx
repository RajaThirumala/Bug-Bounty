import { FileText } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Reports() {
  return (
    <div>
      <PageHeader
        title="Your reports"
        description="Track the status of every report you've submitted."
      />
      <EmptyState
        icon={<FileText className="h-5 w-5" />}
        title="No reports yet"
        description="When you submit a vulnerability report, it'll show up here."
        action={
          <Button asChild>
            <Link to="/submit-report">Submit your first report</Link>
          </Button>
        }
      />
    </div>
  );
}
