// src/shared/components/BugTreasureAnimation.tsx

import { Bug, Gem } from "lucide-react";

export function BugTreasureAnimation() {
  return (
    <div className="relative h-12 w-44 overflow-hidden rounded-full border bg-muted/40 px-3">
      <Bug
        className="absolute left-2 top-3 h-6 w-6 animate-bug-run text-foreground"
      />

      <Gem className="absolute right-3 top-3 h-6 w-6 text-yellow-500" />
    </div>
  );
}