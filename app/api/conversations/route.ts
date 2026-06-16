import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { conversations, exhibits } from "@/lib/db/schema";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { exhibitId } = await request.json();
  if (!exhibitId || typeof exhibitId !== "string") {
    return NextResponse.json({ error: "Invalid exhibit" }, { status: 400 });
  }

  const [exhibit] = await db
    .select()
    .from(exhibits)
    .where(eq(exhibits.id, exhibitId))
    .limit(1);

  if (!exhibit || exhibit.status !== "published") {
    return NextResponse.json({ error: "Exhibit not found" }, { status: 404 });
  }

  if (exhibit.ownerId === session.user.id) {
    return NextResponse.json(
      { error: "You cannot request to continue your own exhibit" },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.exhibitId, exhibitId),
        eq(conversations.requesterId, session.user.id)
      )
    )
    .limit(1);

  if (existing) {
    return NextResponse.json({ conversationId: existing.id });
  }

  const conversationId = nanoid();
  await db.insert(conversations).values({
    id: conversationId,
    exhibitId,
    creatorId: exhibit.ownerId,
    requesterId: session.user.id,
  });

  return NextResponse.json({ conversationId });
}
