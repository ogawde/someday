import { ExhibitGridSkeleton } from "@/components/exhibit-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-start gap-6">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-2 h-5 w-32" />
          <Skeleton className="mt-3 h-16 w-full max-w-xl" />
        </div>
      </div>
      <section className="mt-12">
        <Skeleton className="h-8 w-32" />
        <div className="mt-8">
          <ExhibitGridSkeleton />
        </div>
      </section>
    </div>
  );
}
