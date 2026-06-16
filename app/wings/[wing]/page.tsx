import { Suspense } from "react";
import { notFound } from "next/navigation";
import { WingGallery } from "@/components/wing-gallery";
import { WINGS, wingSlugToDb } from "@/lib/constants";
import { getPublishedExhibits } from "@/lib/queries/exhibits";

export const dynamic = "force-dynamic";

export default async function WingPage({
  params,
  searchParams,
}: {
  params: Promise<{ wing: string }>;
  searchParams: Promise<{ q?: string; open?: string }>;
}) {
  const { wing: wingSlug } = await params;
  const { q, open } = await searchParams;
  const wingDb = wingSlugToDb(wingSlug);

  if (!wingDb) notFound();

  const wingMeta = WINGS.find((w) => w.slug === wingSlug)!;
  const exhibits = await getPublishedExhibits({
    wing: wingDb,
    search: q,
    openOnly: open === "1",
  });

  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-12">Loading…</div>}>
      <WingGallery
        wingSlug={wingSlug}
        wingLabel={wingMeta.label}
        wingDescription={wingMeta.description}
        exhibits={exhibits}
        initialSearch={q ?? ""}
        openOnly={open === "1"}
      />
    </Suspense>
  );
}
