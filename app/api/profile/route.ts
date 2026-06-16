import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { getSession } from "@/lib/session";

const profileSchema = z.object({
  bio: z.string().max(500),
});

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = profileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid bio" }, { status: 400 });
  }

  await db
    .update(user)
    .set({ bio: parsed.data.bio, updatedAt: new Date() })
    .where(eq(user.id, session.user.id));

  return NextResponse.json({ success: true });
}
