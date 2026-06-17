import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2Icon
      className={cn("size-5 animate-spin text-muted-foreground", className)}
      aria-hidden
    />
  );
}

export function PageSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
      <Spinner className="size-8" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
