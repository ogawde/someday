import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { EditExhibitForm } from "@/components/edit-exhibit-form";
import { getExhibitById } from "@/lib/queries/exhibits";
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

  const exhibit = await getExhibitById(id, true);

  if (!exhibit || exhibit.owner.id !== session.user.id) notFound();
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
        <EditExhibitForm
          exhibit={{
            id: exhibit.id,
            wing: exhibit.wing,
            title: exhibit.title,
            whatItWas: exhibit.whatItWas,
            whyItStopped: exhibit.whyItStopped,
            whatItCouldHaveBeen: exhibit.whatItCouldHaveBeen,
            openToCollaboration: exhibit.openToCollaboration,
            imageUrls: exhibit.media
              .filter((item) => item.type === "image")
              .map((item) => item.url),
            links: exhibit.media
              .filter((item) => item.type === "link")
              .map((item) => item.url),
          }}
        />
      </div>
    </div>
  );
}
