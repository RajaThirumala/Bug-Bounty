import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  createFeatureRequest,
  type FeatureRequestStatus,
} from "@/features/featureRequests";
import { useAuthStore } from "@/features/auth";

export default function CreateFeatureRequest() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bounty, setBounty] = useState("");
  const [status, setStatus] = useState<FeatureRequestStatus>("open");
  const [error, setError] = useState("");
  const mutation = useMutation({
    mutationFn: () =>
      createFeatureRequest(accessToken ?? "", {
        title,
        description,
        bounty: Number(bounty),
        status,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["organization-feature-requests"] });
      await queryClient.invalidateQueries({ queryKey: ["researcher-feature-requests"] });
      navigate("/organization/feature-requests");
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Unable to create feature request");
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
        title="Create Feature Request"
        description="Publish a request researchers can discover and contribute to."
      />

      <Card className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add passkey support" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the feature request and expected outcome."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bounty">Bounty</Label>
              <Input id="bounty" type="number" value={bounty} onChange={(e) => setBounty(e.target.value)} placeholder="1200" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as FeatureRequestStatus)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end">
              <Button type="submit" disabled={mutation.isPending || !title || !description || !bounty}>
                {mutation.isPending ? "Creating..." : "Create request"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
