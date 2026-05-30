import { Link } from "react-router-dom";
import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getOrganizationPrograms, updateProgram, type ProgramStatus } from "@/features/programs";
import { useAuthStore } from "@/features/auth";
import { fieldErrorsFromZod, type FieldErrors } from "@/lib/validation";

const updateProgramSchema = z.object({
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  status: z.enum(["active", "paused", "private"]),
  scope: z.array(z.string()).min(1, "Add at least one in-scope asset"),
});

type UpdateProgramField = keyof z.infer<typeof updateProgramSchema>;

export default function OrganizationPrograms() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, {
    description: string;
    status: ProgramStatus;
    scope: string;
  }>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, FieldErrors<UpdateProgramField>>>({});
  const [updateError, setUpdateError] = useState("");
  const { data, isLoading, error: loadError } = useQuery({
    queryKey: ["organization-programs"],
    queryFn: () => getOrganizationPrograms(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });
  const mutation = useMutation({
    mutationFn: ({
      programId,
      description,
      status,
      scope,
    }: {
      programId: string;
      description: string;
      status: ProgramStatus;
      scope: string[];
    }) => updateProgram(accessToken ?? "", programId, { description, status, scope }),
    onSuccess: async () => {
      setEditingProgramId(null);
      setUpdateError("");
      await queryClient.invalidateQueries({ queryKey: ["organization-programs"] });
      await queryClient.invalidateQueries({ queryKey: ["researcher-programs"] });
    },
    onError: (err) => {
      setUpdateError(err instanceof Error ? err.message : "Unable to update program");
    },
  });

  const programs = data?.programs ?? [];

  const startEditing = (program: (typeof programs)[number]) => {
    setEditingProgramId(program.id);
    setUpdateError("");
    setFieldErrors((current) => ({ ...current, [program.id]: {} }));
    setDrafts((current) => ({
      ...current,
      [program.id]: {
        description: program.description,
        status: program.status,
        scope: program.scope.join(", "),
      },
    }));
  };

  const saveProgram = (programId: string) => {
    const draft = drafts[programId];
    if (!draft) {
      return;
    }

    setUpdateError("");
    const result = updateProgramSchema.safeParse({
      description: draft.description,
      status: draft.status,
      scope: draft.scope
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean),
    });
    if (!result.success) {
      setFieldErrors((current) => ({
        ...current,
        [programId]: fieldErrorsFromZod<UpdateProgramField>(result.error),
      }));
      return;
    }

    mutation.mutate({ programId, ...result.data });
  };

  return (
    <div>
      <PageHeader
        title="Manage Programs"
        description="Create and maintain your organization's bounty programs."
        actions={
          <Button asChild>
            <Link to="/organization/programs/new"><Plus className="h-4 w-4 mr-2" />Create program</Link>
          </Button>
        }
      />

      {isLoading && <p className="text-sm text-muted-foreground">Loading programs...</p>}
      {loadError && <p className="text-sm text-destructive">Unable to load programs.</p>}
      {updateError && <p className="text-sm text-destructive">{updateError}</p>}

      {!isLoading && !loadError && programs.length === 0 && (
        <EmptyState
          title="No programs yet"
          description="Create your first bounty program for researchers to view."
          action={
            <Button asChild>
              <Link to="/organization/programs/new">Create program</Link>
            </Button>
          }
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {programs.map((program) => {
          const isEditing = editingProgramId === program.id;
          const draft = drafts[program.id];
          const errors = fieldErrors[program.id] ?? {};

          return (
            <Card key={program.id} className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold tracking-tight">{program.name}</h3>
                    {!isEditing && (
                      <p className="text-sm text-muted-foreground mt-1">{program.description}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="capitalize">{program.status}</Badge>
                </div>

                {isEditing && draft ? (
                  <div className="mt-4 space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor={`description-${program.id}`}>Description</Label>
                      <Textarea
                        id={`description-${program.id}`}
                        value={draft.description}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [program.id]: { ...draft, description: event.target.value },
                          }))
                        }
                      />
                      {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`status-${program.id}`}>Status</Label>
                      <Select
                        value={draft.status}
                        onValueChange={(value) =>
                          setDrafts((current) => ({
                            ...current,
                            [program.id]: { ...draft, status: value as ProgramStatus },
                          }))
                        }
                      >
                        <SelectTrigger id={`status-${program.id}`}>
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
                      <Label htmlFor={`scope-${program.id}`}>Scope</Label>
                      <Input
                        id={`scope-${program.id}`}
                        value={draft.scope}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [program.id]: { ...draft, scope: event.target.value },
                          }))
                        }
                      />
                      {errors.scope && <p className="text-sm text-destructive">{errors.scope}</p>}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="ghost" onClick={() => setEditingProgramId(null)}>
                        Cancel
                      </Button>
                      <Button type="button" disabled={mutation.isPending} onClick={() => saveProgram(program.id)}>
                        {mutation.isPending ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium mt-4">
                      ${program.minBounty.toLocaleString()} - ${program.maxBounty.toLocaleString()}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {program.scope.map((item) => (
                        <Badge key={item} variant="secondary">{item}</Badge>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button type="button" variant="outline" size="sm" onClick={() => startEditing(program)}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
