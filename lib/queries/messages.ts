import { and, desc, eq, gt, inArray, ne, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { conversations, exhibits, messages, user } from "@/lib/db/schema";

export async function getUnreadMessageCount(userId: string) {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(messages)
    .innerJoin(conversations, eq(messages.conversationId, conversations.id))
    .where(
      or(
        and(
          eq(conversations.creatorId, userId),
          ne(messages.senderId, userId),
          gt(
            messages.createdAt,
            sql`coalesce(${conversations.creatorLastReadAt}, to_timestamp(0))`
          )
        ),
        and(
          eq(conversations.requesterId, userId),
          ne(messages.senderId, userId),
          gt(
            messages.createdAt,
            sql`coalesce(${conversations.requesterLastReadAt}, to_timestamp(0))`
          )
        )
      )
    );

  return result?.count ?? 0;
}

export async function markConversationRead(
  conversationId: string,
  userId: string
) {
  const [conversation] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  if (!conversation) return false;
  if (
    conversation.creatorId !== userId &&
    conversation.requesterId !== userId
  ) {
    return false;
  }

  const now = new Date();

  if (conversation.creatorId === userId) {
    await db
      .update(conversations)
      .set({ creatorLastReadAt: now })
      .where(eq(conversations.id, conversationId));
  } else {
    await db
      .update(conversations)
      .set({ requesterLastReadAt: now })
      .where(eq(conversations.id, conversationId));
  }

  return true;
}

export async function hasUserSentMessageForExhibit(
  exhibitId: string,
  userId: string
) {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(messages)
    .innerJoin(conversations, eq(messages.conversationId, conversations.id))
    .where(
      and(
        eq(conversations.exhibitId, exhibitId),
        or(
          eq(conversations.creatorId, userId),
          eq(conversations.requesterId, userId)
        ),
        eq(messages.senderId, userId)
      )
    );

  return (result?.count ?? 0) > 0;
}

export async function getMessageThreads(userId: string) {
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

  if (threads.length === 0) return [];

  const conversationIds = threads.map((thread) => thread.conversation.id);
  const otherUserIds = threads.map((thread) =>
    thread.conversation.creatorId === userId
      ? thread.conversation.requesterId
      : thread.conversation.creatorId
  );

  const [otherUsers, lastMessages] = await Promise.all([
    db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
      })
      .from(user)
      .where(inArray(user.id, otherUserIds)),
    db
      .selectDistinctOn([messages.conversationId], {
        conversationId: messages.conversationId,
        content: messages.content,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(inArray(messages.conversationId, conversationIds))
      .orderBy(messages.conversationId, desc(messages.createdAt)),
  ]);

  const usersById = new Map(otherUsers.map((entry) => [entry.id, entry]));
  const lastMessageByConversation = new Map(
    lastMessages.map((message) => [message.conversationId, message])
  );

  return threads.map((thread) => {
    const otherUserId =
      thread.conversation.creatorId === userId
        ? thread.conversation.requesterId
        : thread.conversation.creatorId;

    return {
      ...thread,
      otherUser: usersById.get(otherUserId),
      lastMessage: lastMessageByConversation.get(thread.conversation.id),
    };
  });
}
