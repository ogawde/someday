"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ExhibitCard } from "@/components/exhibit-card";
import type { ExhibitWithOwner } from "@/lib/queries/exhibits";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export function WingGallery({
  wingSlug,
  wingLabel,
  wingDescription,
  exhibits,
  initialSearch,
  openOnly,
}: {
  wingSlug: string;
  wingLabel: string;
  wingDescription: string;
  exhibits: ExhibitWithOwner[];
  initialSearch: string;
  openOnly: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilters(next: { q?: string; open?: boolean }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.q !== undefined) {
      if (next.q) params.set("q", next.q);
      else params.delete("q");
    }
    if (next.open !== undefined) {
      if (next.open) params.set("open", "1");
      else params.delete("open");
    }
    router.push(`/wings/${wingSlug}?${params.toString()}`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="max-w-2xl">
        <p className="text-sm text-muted-foreground">Wing</p>
        <h1 className="font-heading mt-1 text-3xl">{wingLabel}</h1>
        <p className="mt-2 text-muted-foreground">{wingDescription}</p>
      </div>

      <div className="mt-8 flex flex-col gap-4 rounded-lg border border-border/70 p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Label htmlFor="search">Search exhibits</Label>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const q = new FormData(form).get("q") as string;
              updateFilters({ q });
            }}
          >
            <div className="mt-2 flex gap-2">
              <Input
                id="search"
                name="q"
                defaultValue={initialSearch}
                placeholder="Search titles and stories…"
              />
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </div>
          </form>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="open-only"
            checked={openOnly}
            onCheckedChange={(checked) => updateFilters({ open: checked })}
          />
          <Label htmlFor="open-only">Open to collaboration only</Label>
        </div>
      </div>

      {exhibits.length === 0 ? (
        <div className="mt-16 text-center text-muted-foreground">
          <p className="font-heading text-xl">This wing is quiet for now.</p>
          <p className="mt-2 text-sm">
            Be the first to preserve something unfinished here.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {exhibits.map((exhibit) => (
            <ExhibitCard key={exhibit.id} exhibit={exhibit} />
          ))}
        </div>
      )}
    </div>
  );
}
