import { ExhibitCard } from "@/components/exhibit-card";
import { ExhibitPagination } from "@/components/exhibit-pagination";
import type { WingDbValue } from "@/lib/constants";
import { getPublishedExhibitsPaginated } from "@/lib/queries/exhibits";

function buildWingPageHref(
  wingSlug: string,
  options: { q?: string; open?: boolean; page: number }
) {
  const params = new URLSearchParams();
  if (options.q) params.set("q", options.q);
  if (options.open) params.set("open", "1");
  if (options.page > 1) params.set("page", String(options.page));
  const query = params.toString();
  return query ? `/wings/${wingSlug}?${query}` : `/wings/${wingSlug}`;
}

export async function WingExhibitResults({
  wingSlug,
  wingDb,
  search,
  openOnly,
  page,
}: {
  wingSlug: string;
  wingDb: WingDbValue;
  search?: string;
  openOnly: boolean;
  page: number;
}) {
  const result = await getPublishedExhibitsPaginated({
    wing: wingDb,
    search,
    openOnly,
    page,
  });

  const start = result.total === 0 ? 0 : (result.page - 1) * result.pageSize + 1;
  const end = Math.min(result.page * result.pageSize, result.total);

  if (result.items.length === 0) {
    return (
      <div className="mt-16 text-center text-muted-foreground">
        <p className="font-heading text-xl">This wing is quiet for now.</p>
        <p className="mt-2 text-sm">
          Be the first to preserve something unfinished here.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="mt-8 text-sm text-muted-foreground">
        Showing {start}-{end} of {result.total} exhibits
      </p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {result.items.map((exhibit) => (
          <ExhibitCard key={exhibit.id} exhibit={exhibit} />
        ))}
      </div>
      <ExhibitPagination
        page={result.page}
        totalPages={result.totalPages}
        buildHref={(nextPage) =>
          buildWingPageHref(wingSlug, {
            q: search,
            open: openOnly,
            page: nextPage,
          })
        }
      />
    </>
  );
}
