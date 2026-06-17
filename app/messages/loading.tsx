import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="mt-2 h-5 w-72" />
      <ul className="mt-8 divide-y divide-border rounded-lg border border-border/70">
        {Array.from({ length: 4 }).map((_, index) => (
          <li key={index} className="px-4 py-4">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="mt-2 h-4 w-1/2" />
            <Skeleton className="mt-2 h-4 w-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}
