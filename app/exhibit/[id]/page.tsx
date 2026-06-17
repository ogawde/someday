import { notFound } from "next/navigation";
import { ExhibitDetail } from "@/components/exhibit-detail";
import { getExhibitById } from "@/lib/queries/exhibits";
import { hasUserSentMessageForExhibit } from "@/lib/queries/messages";
import { getSession } from "@/lib/session";

export default async function ExhibitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const exhibit = await getExhibitById(id);

  if (!exhibit) notFound();

  const isOwner = session?.user.id === exhibit.owner.id;
  const hasSentMessage =
    session && !isOwner
      ? await hasUserSentMessageForExhibit(id, session.user.id)
      : false;

  return (
    <ExhibitDetail
      exhibit={exhibit}
      session={session}
      hasSentMessage={hasSentMessage}
    />
  );
}
