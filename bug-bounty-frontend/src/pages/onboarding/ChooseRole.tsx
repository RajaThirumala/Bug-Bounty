import { useState } from "react";
import { Building2, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/features/auth";

export default function ChooseRole() {
  const navigate = useNavigate();
  const chooseResearcher = useAuthStore((state) => state.chooseResearcher);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResearcher = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      await chooseResearcher();
      navigate("/researcher/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to finish onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-3xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Choose account type</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Select how you want to use BugBounty.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border/70 rounded-xl">
            <CardContent className="p-6 flex flex-col min-h-56">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Researcher</h2>
              <p className="text-sm text-muted-foreground mt-2 flex-1">
                Find programs, submit vulnerability reports, and track your research activity.
              </p>
              <Button onClick={handleResearcher} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Choose Researcher"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/70 rounded-xl">
            <CardContent className="p-6 flex flex-col min-h-56">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Organization Owner</h2>
              <p className="text-sm text-muted-foreground mt-2 flex-1">
                Create an organization, own its bounty program, and manage incoming reports.
              </p>
              <Button variant="outline" onClick={() => navigate("/onboarding/organization")}>
                Choose Organization Owner
              </Button>
            </CardContent>
          </Card>
        </div>

        {error && <p className="mt-4 text-sm text-destructive text-center">{error}</p>}
      </div>
    </div>
  );
}
