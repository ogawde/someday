import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { conversations, exhibits, messages, user } from "@/lib/db/schema";
import { getSession } from "@/lib/session";

export default async function MessagesPage() {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const userId = session.user.id;

  const threads = await db
    .select({
      conversation: conversations,
      exhibit: { id: exhibits.id, title: exhibits.title },
    })
    .from(conversations)
    .innerJoin(exhibits, eq(conversations.exhibitId, exhibits.id))
    .where(
      or(
        eq(conversations.creatorId, userId),
        eq(conversations.requesterId, userId)
      )
    )
    .orderBy(desc(conversations.createdAt));

  const enriched = await Promise.all(
    threads.map(async (thread) => {
      const otherUserId =
        thread.conversation.creatorId === userId
          ? thread.conversation.requesterId
          : thread.conversation.creatorId;

      const [otherUser] = await db
        .select({
          name: user.name,
          username: user.username,
        })
        .from(user)
        .where(eq(user.id, otherUserId))
        .limit(1);

      const [lastMessage] = await db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, thread.conversation.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      return {
        ...thread,
        otherUser,
        lastMessage,
      };
    })
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-heading text-3xl">Messages</h1>
      <p className="mt-2 text-muted-foreground">
        Conversations started by &quot;Request to Continue.&quot;
      </p>

      {enriched.length === 0 ? (
        <p className="mt-12 text-center text-muted-foreground">
          No conversations yet. Browse the museum and request to continue something that resonates.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-border rounded-lg border border-border/70">
          {enriched.map(({ conversation, exhibit, otherUser, lastMessage }) => (
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
      )}
    </div>
  );
}
