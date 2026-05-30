import { Bug } from "lucide-react";
import { cn } from "@/lib/utils";

interface CoinLogoProps {
  className?: string;
}

export function CoinLogo({ className }: CoinLogoProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex items-center justify-center rounded-full border border-yellow-500/60 bg-[linear-gradient(135deg,#fff4a8_0%,#facc15_38%,#d49400_72%,#ffe082_100%)] text-yellow-950 shadow-[0_0_14px_rgba(250,204,21,0.28),inset_0_1px_0_rgba(255,255,255,0.65),inset_0_-3px_0_rgba(120,70,0,0.28)] after:absolute after:left-[18%] after:top-[14%] after:h-[22%] after:w-[22%] after:rounded-full after:bg-white/45 after:blur-[1px]",
        className,
      )}
    >
      <Bug className="relative z-10 h-[62%] w-[62%]" strokeWidth={2.4} />
    </span>
  );
}
