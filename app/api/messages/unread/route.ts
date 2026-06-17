import { NextResponse } from "next/server";
import { getUnreadMessageCount } from "@/lib/queries/messages";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const count = await getUnreadMessageCount(session.user.id);
  return NextResponse.json({ count });
}
