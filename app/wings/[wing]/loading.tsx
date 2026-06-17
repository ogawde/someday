import { ExhibitGridSkeleton } from "@/components/exhibit-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function WingLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="mt-2 h-9 w-48" />
      <Skeleton className="mt-2 h-5 w-full max-w-xl" />
      <Skeleton className="mt-8 h-24 w-full rounded-lg" />
      <div className="mt-10">
        <ExhibitGridSkeleton />
      </div>
    </div>
  );
}
