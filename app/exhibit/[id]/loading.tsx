import { Skeleton } from "@/components/ui/skeleton";

export default function ExhibitLoading() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-10 w-full max-w-xl" />
      <div className="mt-10 space-y-8 border-l-2 border-border pl-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="mt-12 flex items-center gap-3 border-t border-border pt-8">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </article>
  );
}
