import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ExhibitGridSkeleton } from "@/components/exhibit-grid-skeleton";
import { WingExhibitResults } from "@/components/wing-exhibit-results";
import { WingGalleryFilters } from "@/components/wing-gallery-filters";
import { WINGS, wingSlugToDb } from "@/lib/constants";

export default async function WingPage({
  params,
  searchParams,
}: {
  params: Promise<{ wing: string }>;
  searchParams: Promise<{ q?: string; open?: string; page?: string }>;
}) {
  const { wing: wingSlug } = await params;
  const { q, open, page: pageParam } = await searchParams;
  const wingDb = wingSlugToDb(wingSlug);

  if (!wingDb) notFound();

  const wingMeta = WINGS.find((wing) => wing.slug === wingSlug)!;
  const page = Math.max(1, Number(pageParam) || 1);
  const openOnly = open === "1";
  const suspenseKey = `${wingSlug}-${q ?? ""}-${openOnly}-${page}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="max-w-2xl">
        <p className="text-sm text-muted-foreground">Wing</p>
        <h1 className="font-heading mt-1 text-3xl">{wingMeta.label}</h1>
        <p className="mt-2 text-muted-foreground">{wingMeta.description}</p>
      </div>

      <WingGalleryFilters
        wingSlug={wingSlug}
        initialSearch={q ?? ""}
        openOnly={openOnly}
      />

      <Suspense key={suspenseKey} fallback={<ExhibitGridSkeleton />}>
        <WingExhibitResults
          wingSlug={wingSlug}
          wingDb={wingDb}
          search={q}
          openOnly={openOnly}
          page={page}
        />
      </Suspense>
    </div>
  );
}
