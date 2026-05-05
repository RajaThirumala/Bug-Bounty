import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";

export default function CreateProgram() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div>
      <PageHeader
        title="Create Program"
        description="Draft a bounty program. This stays local until backend integration is added."
      />

      <Card className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
            <div className="space-y-1.5">
              <Label htmlFor="name">Program name</Label>
              <Input id="name" placeholder="Acme Web Platform" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={5} placeholder="Describe the target, scope, and expectations." />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="minBounty">Minimum bounty</Label>
                <Input id="minBounty" type="number" placeholder="250" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maxBounty">Maximum bounty</Label>
                <Input id="maxBounty" type="number" placeholder="10000" />
              </div>
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
