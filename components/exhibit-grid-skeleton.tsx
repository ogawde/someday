import { Skeleton } from "@/components/ui/skeleton";

function ExhibitCardSkeleton() {
  return (
    <div className="rounded-xl border border-border/70 p-0">
      <Skeleton className="aspect-[16/9] rounded-b-none rounded-t-xl" />
      <div className="space-y-3 p-6">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

export function ExhibitGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <ExhibitCardSkeleton key={index} />
      ))}
    </div>
  );
}
