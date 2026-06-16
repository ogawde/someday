import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { exhibits, reports } from "@/lib/db/schema";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if ((session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { reportId, action } = await request.json();

  if (!reportId || action !== "hide") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const [report] = await db
    .select()
    .from(reports)
    .where(eq(reports.id, reportId))
    .limit(1);

  if (!report) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  await db
    .update(exhibits)
    .set({ status: "hidden", updatedAt: new Date() })
    .where(eq(exhibits.id, report.exhibitId));

  await db
    .update(reports)
    .set({ status: "resolved" })
    .where(eq(reports.id, reportId));

  return NextResponse.json({ success: true });
}
