import Link from "next/link";
import { getMessageThreads } from "@/lib/queries/messages";

export async function MessageThreadList({ userId }: { userId: string }) {
  const threads = await getMessageThreads(userId);

  if (threads.length === 0) {
    return (
      <p className="mt-12 text-center text-muted-foreground">
        No conversations yet. Browse the museum and request to continue something that resonates.
      </p>
    );
  }

  return (
    <ul className="mt-8 divide-y divide-border rounded-lg border border-border/70">
      {threads.map(({ conversation, exhibit, otherUser, lastMessage }) => (
        <li key={conversation.id}>
          <Link
            href={`/messages/${conversation.id}`}
            className="block px-4 py-4 hover:bg-muted/30"
          >
            <p className="font-medium">{exhibit.title}</p>
            <p className="text-sm text-muted-foreground">
              with {otherUser?.name ?? "Someone"}
              {otherUser?.username ? ` (@${otherUser.username})` : ""}
            </p>
            {lastMessage && (
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {lastMessage.content}
              </p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
