import { ExhibitCard } from "@/components/exhibit-card";
import { getPublishedExhibits } from "@/lib/queries/exhibits";

export async function RecentExhibits() {
  const exhibits = await getPublishedExhibits({ limit: 6 });

  if (exhibits.length === 0) return null;

  return (
    <section className="border-t border-border/60 bg-muted/10">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-heading text-2xl">Recent exhibits</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {exhibits.map((exhibit) => (
            <ExhibitCard key={exhibit.id} exhibit={exhibit} />
          ))}
        </div>
      </div>
    </section>
  );
}
