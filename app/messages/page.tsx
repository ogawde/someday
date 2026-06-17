import { Suspense } from "react";
import { redirect } from "next/navigation";
import { MessageThreadList } from "@/components/message-thread-list";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/lib/session";

export default async function MessagesPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-heading text-3xl">Messages</h1>
      <p className="mt-2 text-muted-foreground">
        Conversations started by &quot;Request to Continue.&quot;
      </p>

      <Suspense fallback={<MessageListSkeleton />}>
        <MessageThreadList userId={session.user.id} />
      </Suspense>
    </div>
  );
}

function MessageListSkeleton() {
  return (
    <ul className="mt-8 divide-y divide-border rounded-lg border border-border/70">
      {Array.from({ length: 4 }).map((_, index) => (
        <li key={index} className="px-4 py-4">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="mt-2 h-4 w-1/2" />
          <Skeleton className="mt-2 h-4 w-full" />
        </li>
      ))}
    </ul>
  );
}
