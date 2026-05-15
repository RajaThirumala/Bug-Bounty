import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProgram, type ProgramStatus } from "@/features/programs";
import { useAuthStore } from "@/features/auth";

export default function CreateProgram() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [minBounty, setMinBounty] = useState("");
  const [maxBounty, setMaxBounty] = useState("");
  const [status, setStatus] = useState<ProgramStatus>("private");
  const [scope, setScope] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      createProgram(accessToken ?? "", {
        name,
        description,
        minBounty: Number(minBounty),
        maxBounty: Number(maxBounty),
        status,
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
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="minBounty">Minimum bounty</Label>
                <Input id="minBounty" type="number" value={minBounty} onChange={(e) => setMinBounty(e.target.value)} placeholder="250" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maxBounty">Maximum bounty</Label>
                <Input id="maxBounty" type="number" value={maxBounty} onChange={(e) => setMaxBounty(e.target.value)} placeholder="10000" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as ProgramStatus)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
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
