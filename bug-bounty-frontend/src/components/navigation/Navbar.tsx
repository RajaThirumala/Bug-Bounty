import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="h-full px-4 md:px-6 flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search programs, reports..."
            className="pl-9 h-9 bg-muted/40 border-transparent focus-visible:bg-card"
          />
        </div>
        <div className="flex items-center gap-1 ml-auto">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
          <Avatar className="h-8 w-8 ml-1">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">JR</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
