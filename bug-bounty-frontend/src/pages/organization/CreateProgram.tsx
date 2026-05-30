import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { createProgram } from "@/features/programs";
import { useAuthStore } from "@/features/auth";
import { fieldErrorsFromZod, type FieldErrors } from "@/lib/validation";

const programSchema = z
  .object({
    name: z.string().trim().min(2, "Program name must be at least 2 characters"),
    description: z.string().trim().min(10, "Description must be at least 10 characters"),
    minBounty: z.coerce.number().int("Minimum bounty must be a whole number").min(0, "Minimum bounty cannot be negative"),
    maxBounty: z.coerce.number().int("Maximum bounty must be a whole number").min(0, "Maximum bounty cannot be negative"),
    scope: z.array(z.string()).min(1, "Add at least one in-scope asset"),
  })
  .refine((input) => input.maxBounty >= input.minBounty, {
    message: "Maximum bounty must be greater than or equal to minimum bounty",
    path: ["maxBounty"],
  });

type ProgramField = keyof z.infer<typeof programSchema>;

export default function CreateProgram() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [minBounty, setMinBounty] = useState("");
  const [maxBounty, setMaxBounty] = useState("");
  const [scope, setScope] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<ProgramField>>({});

  const mutation = useMutation({
    mutationFn: () =>
      createProgram(accessToken ?? "", {
        name,
        description,
        minBounty: Number(minBounty),
        maxBounty: Number(maxBounty),
        scope: scope
          .split(/[\n,]/)
          .map((item) => item.trim())
          .filter(Boolean),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organization-programs"] });
      navigate("/organization/programs");
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Unable to create program");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    const result = programSchema.safeParse({
      name,
      description,
      minBounty,
      maxBounty,
      scope: scope
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean),
    });
    if (!result.success) {
      setFieldErrors(fieldErrorsFromZod<ProgramField>(result.error));
      return;
    }

    mutation.mutate();
  };

  return (
    <div>
      <PageHeader
        title="Create Program"
        description="Create a bounty program linked to your organization."
      />

      <Card className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
            <div className="space-y-1.5">
              <Label htmlFor="name">Program name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Web Platform" />
              {fieldErrors.name && <p className="text-sm text-destructive">{fieldErrors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the target, scope, and expectations."
              />
              {fieldErrors.description && <p className="text-sm text-destructive">{fieldErrors.description}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="minBounty">Minimum bounty</Label>
                <Input id="minBounty" type="number" value={minBounty} onChange={(e) => setMinBounty(e.target.value)} placeholder="250" />
                {fieldErrors.minBounty && <p className="text-sm text-destructive">{fieldErrors.minBounty}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maxBounty">Maximum bounty</Label>
                <Input id="maxBounty" type="number" value={maxBounty} onChange={(e) => setMaxBounty(e.target.value)} placeholder="10000" />
                {fieldErrors.maxBounty && <p className="text-sm text-destructive">{fieldErrors.maxBounty}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scope">Scope</Label>
              <Textarea
                id="scope"
                rows={4}
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                placeholder="*.example.com, api.example.com"
              />
              {fieldErrors.scope && <p className="text-sm text-destructive">{fieldErrors.scope}</p>}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end">
              <Button type="submit" disabled={mutation.isPending || !accessToken}>
                {mutation.isPending ? "Creating..." : "Create program"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
