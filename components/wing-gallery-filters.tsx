"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export function WingGalleryFilters({
  wingSlug,
  initialSearch,
  openOnly,
}: {
  wingSlug: string;
  initialSearch: string;
  openOnly: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilters(next: { q?: string; open?: boolean }) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    if (next.q !== undefined) {
      if (next.q) params.set("q", next.q);
      else params.delete("q");
    }

    if (next.open !== undefined) {
      if (next.open) params.set("open", "1");
      else params.delete("open");
    }

    const query = params.toString();
    router.push(query ? `/wings/${wingSlug}?${query}` : `/wings/${wingSlug}`);
  }

  return (
    <div className="mt-8 rounded-lg border border-border/70 p-4">
      <Label htmlFor="search">Search exhibits</Label>
      <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-center">
        <form
          className="flex min-w-0 flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const q = new FormData(form).get("q") as string;
            updateFilters({ q });
          }}
        >
          <Input
            id="search"
            name="q"
            defaultValue={initialSearch}
            placeholder="Search titles and stories…"
            className="min-w-0 flex-1"
          />
          <Button type="submit" variant="secondary" className="shrink-0">
            Search
          </Button>
        </form>

        <div className="flex h-8 shrink-0 items-center gap-2 lg:border-l lg:border-border/70 lg:pl-4">
          <Switch
            id="open-only"
            checked={openOnly}
            onCheckedChange={(checked) => updateFilters({ open: checked })}
          />
          <Label htmlFor="open-only" className="whitespace-nowrap font-normal">
            Open to collaboration only
          </Label>
        </div>
      </div>
    </div>
  );
}
