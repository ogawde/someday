import { NextResponse } from "next/server";
import { generateExhibitDraft } from "@/lib/ai";
import { generateExhibitInputSchema } from "@/lib/validations/exhibit";
import { getSession } from "@/lib/session";

const rateLimit = new Map<string, number>();

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lastCall = rateLimit.get(session.user.id);
  if (lastCall && Date.now() - lastCall < 60_000) {
    return NextResponse.json(
      { error: "Please wait a moment before generating again." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = generateExhibitInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  try {
    rateLimit.set(session.user.id, Date.now());
    const draft = await generateExhibitDraft(
      parsed.data.textDump,
      parsed.data.wing
    );
    return NextResponse.json({ draft });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate exhibit";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
