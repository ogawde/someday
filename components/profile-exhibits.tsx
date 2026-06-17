import { ExhibitCard } from "@/components/exhibit-card";
import { ExhibitPagination } from "@/components/exhibit-pagination";
import { getPublishedExhibitsPaginated } from "@/lib/queries/exhibits";

function buildProfilePageHref(username: string, page: number) {
  return page > 1 ? `/u/${username}?page=${page}` : `/u/${username}`;
}

export async function ProfileExhibits({
  username,
  ownerId,
  page,
}: {
  username: string;
  ownerId: string;
  page: number;
}) {
  const result = await getPublishedExhibitsPaginated({
    ownerId,
    page,
  });

  if (result.items.length === 0) {
    return (
      <p className="mt-4 text-muted-foreground">
        No exhibits yet.
      </p>
    );
  }

  const start = (result.page - 1) * result.pageSize + 1;
  const end = Math.min(result.page * result.pageSize, result.total);

  return (
    <>
      <p className="mt-4 text-sm text-muted-foreground">
        Showing {start}-{end} of {result.total} exhibits
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {result.items.map((exhibit) => (
          <ExhibitCard key={exhibit.id} exhibit={exhibit} />
        ))}
      </div>
      <ExhibitPagination
        page={result.page}
        totalPages={result.totalPages}
        buildHref={(nextPage) => buildProfilePageHref(username, nextPage)}
      />
    </>
  );
}
