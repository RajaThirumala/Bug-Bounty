import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/common/PageHeader";

export default function SubmitReport() {
  // TODO: Replace placeholder submit with backend submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
              <Input id="title" placeholder="Stored XSS in profile bio" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="program">Program</Label>
                <Select>
                  <SelectTrigger id="program"><SelectValue placeholder="Select a program" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="acme-web">Acme Web Platform</SelectItem>
                    <SelectItem value="northwind-api">Northwind Public API</SelectItem>
                    <SelectItem value="lumen-mobile">Lumen Mobile Apps</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="severity">Severity</Label>
                <Select>
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
              <Textarea id="description" rows={8} placeholder="Detail the vulnerability, impact, and reproduction steps..." />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost">Save draft</Button>
              <Button type="submit">Submit report</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
