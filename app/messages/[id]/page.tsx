import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { ChatThread } from "@/components/chat-thread";
import { db } from "@/lib/db";
import { conversations, exhibits, user } from "@/lib/db/schema";
import { getConversationForUser } from "@/lib/queries/exhibits";
import { getSession } from "@/lib/session";

export default async function MessageThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const conversation = await getConversationForUser(id, session.user.id);
  if (!conversation) notFound();

  const [exhibit] = await db
    .select({ id: exhibits.id, title: exhibits.title })
    .from(exhibits)
    .where(eq(exhibits.id, conversation.exhibitId))
    .limit(1);

  const otherUserId =
    conversation.creatorId === session.user.id
      ? conversation.requesterId
      : conversation.creatorId;

  const [otherUser] = await db
    .select({ name: user.name, username: user.username })
    .from(user)
    .where(eq(user.id, otherUserId))
    .limit(1);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-6">
        <Link
          href={`/exhibit/${exhibit?.id}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to exhibit: {exhibit?.title}
        </Link>
        <h1 className="font-heading mt-2 text-2xl">{exhibit?.title}</h1>
      </div>
      <ChatThread
        conversationId={conversation.id}
        currentUserId={session.user.id}
        otherUserName={otherUser?.name ?? "Someone"}
      />
    </div>
  );
}
