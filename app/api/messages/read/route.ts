import { NextResponse } from "next/server";
import { z } from "zod";
import { markConversationRead } from "@/lib/queries/messages";
import { getSession } from "@/lib/session";

const bodySchema = z.object({
  conversationId: z.string(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const ok = await markConversationRead(
    parsed.data.conversationId,
    session.user.id
  );

  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
