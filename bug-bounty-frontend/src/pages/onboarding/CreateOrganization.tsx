import { useState } from "react";
import { Building2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/features/auth";

export default function CreateOrganization() {
  const navigate = useNavigate();
  const createOrganization = useAuthStore((state) => state.createOrganization);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await createOrganization(name);
      navigate("/organization/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create organization");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md border-border/70 shadow-[var(--shadow-soft-md)] rounded-2xl">
        <CardContent className="p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Create organization</h1>
            <p className="text-sm text-muted-foreground mt-1">
              This organization will be linked to you as owner.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="organizationName">Organization name</Label>
              <Input
                id="organizationName"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Acme Security"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? "Creating..." : "Create organization"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/onboarding" className="text-primary hover:underline">
              Back to account type
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
