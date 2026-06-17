import { Button, ButtonLink } from "@/components/ui/button";

export function ExhibitPagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(page, totalPages);

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2"
      aria-label="Exhibit pages"
    >
      {page > 1 ? (
        <ButtonLink href={buildHref(page - 1)} variant="outline" size="sm">
          Previous
        </ButtonLink>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Previous
        </Button>
      )}

      {pages.map((item, index) =>
        item === "…" ? (
          <span key={`ellipsis-${index}`} className="px-2 text-sm text-muted-foreground">
            …
          </span>
        ) : item === page ? (
          <Button key={item} size="sm">
            {item}
          </Button>
        ) : (
          <ButtonLink key={item} href={buildHref(item)} variant="outline" size="sm">
            {item}
          </ButtonLink>
        )
      )}

      {page < totalPages ? (
        <ButtonLink href={buildHref(page + 1)} variant="outline" size="sm">
          Next
        </ButtonLink>
      ) : (
        <Button variant="outline" size="sm" disabled>
          Next
        </Button>
      )}
    </nav>
  );
}

function getPageNumbers(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages: (number | "…")[] = [1];

  if (current > 3) pages.push("…");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let page = start; page <= end; page++) {
    pages.push(page);
  }

  if (current < total - 2) pages.push("…");

  pages.push(total);
  return pages;
}
