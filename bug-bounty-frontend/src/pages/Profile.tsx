import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuthStore } from "@/features/auth";

export default function Profile() {
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      <PageHeader title="Profile" description="Manage your account and public platform profile." />

      <Card className="border-border/70 shadow-[var(--shadow-soft)] rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-lg">{user.initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.title}</p>
            </div>
          </div>

          <form className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <div className="space-y-1.5">
              <Label htmlFor="name">Display name</Label>
              <Input id="name" defaultValue={user.name} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="handle">Handle</Label>
              <Input id="handle" defaultValue={user.handle} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue={user.email} />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button type="button">Save changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
