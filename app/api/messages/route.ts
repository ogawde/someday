import { NextResponse } from "next/server";
import { and, eq, gt } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { conversations, messages } from "@/lib/db/schema";
import { sendMessageSchema } from "@/lib/validations/exhibit";
import { getConversationForUser } from "@/lib/queries/exhibits";
import { getSession } from "@/lib/session";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");
  const since = searchParams.get("since");

  if (!conversationId) {
    return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
  }

  const conversation = await getConversationForUser(
    conversationId,
    session.user.id
  );

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const conditions = [eq(messages.conversationId, conversationId)];
  if (since) {
    const sinceDate = new Date(since);
    if (!Number.isNaN(sinceDate.getTime())) {
      conditions.push(gt(messages.createdAt, sinceDate));
    }
  }

  const rows = await db
    .select()
    .from(messages)
    .where(and(...conditions))
    .orderBy(messages.createdAt);

  return NextResponse.json({ messages: rows });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = sendMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  const conversation = await getConversationForUser(
    parsed.data.conversationId,
    session.user.id
  );

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const message = {
    id: nanoid(),
    conversationId: parsed.data.conversationId,
    senderId: session.user.id,
    content: parsed.data.content,
    createdAt: new Date(),
  };

  await db.insert(messages).values(message);

  return NextResponse.json({ message });
}
