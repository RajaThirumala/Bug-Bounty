import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addOrganizationTriager, getOrganizationTriagers } from "@/features/team/api";
import { useAuthStore } from "@/features/auth";

const triagerSchema = z.object({
  email: z.string().trim().email("Enter a valid researcher email"),
});

export default function OrganizationTriagers() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["organization-triagers"],
    queryFn: () => getOrganizationTriagers(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });
  const mutation = useMutation({
    mutationFn: () => addOrganizationTriager(accessToken ?? "", email),
    onSuccess: async () => {
      setEmail("");
      setError("");
      toast.success("Triager added");
      await queryClient.invalidateQueries({ queryKey: ["organization-triagers"] });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Unable to add triager";
      setError(message);
      toast.error(message);
    },
  });
  const triagers = data?.triagers ?? [];

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const result = triagerSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Enter a valid researcher email");
      return;
    }

    mutation.mutate();
  };

  return (
    <div>
      <PageHeader
        title="Triagers"
        description="Grant researchers access to review reports and verify severity."
      />

      <Card className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl mb-6">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="space-y-1.5 flex-1">
              <Label htmlFor="triagerEmail">Researcher email</Label>
              <Input
                id="triagerEmail"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="researcher@example.com"
              />
            </div>
            <Button type="submit" disabled={mutation.isPending || !email.trim()}>
              {mutation.isPending ? "Adding..." : "Add triager"}
            </Button>
          </form>
          {error && <p className="text-sm text-destructive mt-3">{error}</p>}
        </CardContent>
      </Card>

      {isLoading && <p className="text-sm text-muted-foreground">Loading triagers...</p>}
      {!isLoading && triagers.length === 0 && (
        <EmptyState
          icon={<ShieldCheck className="h-5 w-5" />}
          title="No triagers yet"
          description="Add a researcher by email to give them report review access."
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {triagers.map((triager) => (
          <Card key={triager.id} className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl">
            <CardContent className="p-5">
              <h3 className="font-semibold tracking-tight">{triager.fullName}</h3>
              <p className="text-sm text-muted-foreground mt-1">{triager.email}</p>
              <p className="text-xs text-muted-foreground mt-3 uppercase tracking-wide">Triager</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
