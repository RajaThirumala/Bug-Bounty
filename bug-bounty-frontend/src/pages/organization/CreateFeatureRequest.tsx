import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
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
import { fieldErrorsFromZod, type FieldErrors } from "@/lib/validation";

const featureRequestSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  repositoryUrl: z.string().trim().url("Enter a valid GitHub repository URL").includes("github.com", {
    message: "Repository URL must be a GitHub link",
  }),
  bounty: z.coerce.number().int("Bounty must be a whole number").min(1, "Bounty must be greater than zero"),
  status: z.enum(["open", "planned", "in_progress", "completed"]),
});

type FeatureRequestField = keyof z.infer<typeof featureRequestSchema>;

export default function CreateFeatureRequest() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [bounty, setBounty] = useState("");
  const [status, setStatus] = useState<FeatureRequestStatus>("open");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<FeatureRequestField>>({});
  const mutation = useMutation({
    mutationFn: () =>
      createFeatureRequest(accessToken ?? "", {
        title,
        description,
        repositoryUrl,
        bounty: Number(bounty),
        status,
    }),
    onSuccess: async () => {
      toast.success("Feature request created");
      await queryClient.invalidateQueries({ queryKey: ["organization-feature-requests"] });
      await queryClient.invalidateQueries({ queryKey: ["researcher-feature-requests"] });
      navigate("/organization/feature-requests");
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Unable to create feature request";
      setError(message);
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    const result = featureRequestSchema.safeParse({
      title,
      description,
      repositoryUrl,
      bounty,
      status,
    });
    if (!result.success) {
      setFieldErrors(fieldErrorsFromZod<FeatureRequestField>(result.error));
      return;
    }

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
              {fieldErrors.title && <p className="text-sm text-destructive">{fieldErrors.title}</p>}
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
              {fieldErrors.description && <p className="text-sm text-destructive">{fieldErrors.description}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="repositoryUrl">GitHub repository</Label>
              <Input
                id="repositoryUrl"
                type="url"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                placeholder="https://github.com/acme/web-app"
              />
              {fieldErrors.repositoryUrl && <p className="text-sm text-destructive">{fieldErrors.repositoryUrl}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bounty">Bounty</Label>
              <Input id="bounty" type="number" value={bounty} onChange={(e) => setBounty(e.target.value)} placeholder="1200" />
              {fieldErrors.bounty && <p className="text-sm text-destructive">{fieldErrors.bounty}</p>}
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
              <Button
                type="submit"
                disabled={mutation.isPending || !title || !description || !repositoryUrl || !bounty}
              >
                {mutation.isPending ? "Creating..." : "Create request"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
