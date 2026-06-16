import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { EditExhibitForm } from "@/components/edit-exhibit-form";
import { db } from "@/lib/db";
import { exhibits } from "@/lib/db/schema";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function EditExhibitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const [exhibit] = await db
    .select()
    .from(exhibits)
    .where(eq(exhibits.id, id))
    .limit(1);

  if (!exhibit || exhibit.ownerId !== session.user.id) notFound();
  if (exhibit.status === "unpublished") notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link
        href={`/exhibit/${id}`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to exhibit
      </Link>
      <div className="mt-6">
        <EditExhibitForm exhibit={exhibit} />
      </div>
    </div>
  );
}
