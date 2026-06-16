import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import { reportSchema } from "@/lib/validations/exhibit";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = reportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid report" }, { status: 400 });
  }

  await db.insert(reports).values({
    id: nanoid(),
    exhibitId: parsed.data.exhibitId,
    reporterId: session.user.id,
    reason: parsed.data.reason,
    status: "open",
  });

  return NextResponse.json({ success: true });
}
