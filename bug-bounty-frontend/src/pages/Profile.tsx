import { useEffect, useState } from "react";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuthStore } from "@/features/auth";
import { fieldErrorsFromZod, type FieldErrors } from "@/lib/validation";

const profileSchema = z.object({
  displayName: z.string().trim().min(2, "Display name must be at least 2 characters"),
  username: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9_]*$/, "Handle can only contain letters, numbers, and underscores"),
});

type ProfileField = keyof z.infer<typeof profileSchema>;

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const name = user?.name ?? "";
  const handle = user?.handle?.replace(/^@/, "") ?? "";
  const email = user?.email ?? "";
  const [displayName, setDisplayName] = useState(name);
  const [username, setUsername] = useState(handle);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<ProfileField>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDisplayName(name);
    setUsername(handle);
  }, [name, handle]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setFieldErrors({});
    const result = profileSchema.safeParse({ displayName, username });
    if (!result.success) {
      setFieldErrors(fieldErrorsFromZod<ProfileField>(result.error));
      return;
    }

    setIsSaving(true);

    try {
      await updateProfile({
        fullName: result.data.displayName,
        username: result.data.username ? result.data.username : null,
      });
      setMessage("Profile updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Profile" description="Manage your account and public platform profile." />

      <Card className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">
                {user?.initials ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{name}</h3>
              <p className="text-sm text-muted-foreground">{user?.title ?? "Account"}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <div className="space-y-1.5">
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
              {fieldErrors.displayName && <p className="text-sm text-destructive">{fieldErrors.displayName}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="handle">Handle</Label>
              <Input
                id="handle"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="your_handle"
              />
              {fieldErrors.username && <p className="text-sm text-destructive">{fieldErrors.username}</p>}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled />
            </div>
            {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
            {message && <p className="text-sm text-muted-foreground sm:col-span-2">{message}</p>}
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" disabled={isSaving || !displayName.trim()}>
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
