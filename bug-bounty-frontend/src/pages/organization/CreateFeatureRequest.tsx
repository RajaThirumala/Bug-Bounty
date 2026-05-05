import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";

export default function CreateFeatureRequest() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div>
      <PageHeader
        title="Create Feature Request"
        description="Draft a request developers can discover and contribute to."
      />

      <Card className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Add passkey support" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={6} placeholder="Describe the feature request and expected outcome." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bounty">Bounty</Label>
              <Input id="bounty" type="number" placeholder="1200" />
            </div>
            <div className="flex justify-end">
              <Button type="submit">Save draft</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
