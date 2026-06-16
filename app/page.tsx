import Link from "next/link";
import { Button, ButtonLink } from "@/components/ui/button";
import { ExhibitCard } from "@/components/exhibit-card";
import { WINGS } from "@/lib/constants";
import { getExhibitCount, getPublishedExhibits } from "@/lib/queries/exhibits";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [recentExhibits, count, session] = await Promise.all([
    getPublishedExhibits({ limit: 6 }),
    getExhibitCount(),
    getSession(),
  ]);

  return (
    <div>
      <section className="border-b border-border/60 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">
            A museum of unfinished things
          </p>
          <h1 className="font-heading mx-auto mt-4 max-w-3xl text-4xl leading-tight md:text-5xl">
            Someday, you&apos;ll finish it.
            <br />
            Until then, it belongs here.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
            Half-built apps, abandoned novels, unrecorded songs — a calm gallery where
            incomplete work is preserved with dignity. And sometimes, given a second life.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/wings/products" size="lg">
              Enter the museum
            </ButtonLink>
            {session ? (
              <ButtonLink href="/submit" variant="outline" size="lg">
                Submit an exhibit
              </ButtonLink>
            ) : (
              <ButtonLink href="/sign-up" variant="outline" size="lg">
                Join and submit
              </ButtonLink>
            )}
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            {count} unfinished {count === 1 ? "thing" : "things"} preserved
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-heading text-2xl">Wings</h2>
        <p className="mt-2 text-muted-foreground">
          Browse by category — each wing holds a different kind of abandoned work.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WINGS.map((wing) => (
            <Link
              key={wing.slug}
              href={`/wings/${wing.slug}`}
              className="rounded-xl border border-border/70 p-6 transition-shadow hover:shadow-md"
            >
              <h3 className="font-heading text-lg">{wing.label}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{wing.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {recentExhibits.length > 0 && (
        <section className="border-t border-border/60 bg-muted/10">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="font-heading text-2xl">Recent exhibits</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentExhibits.map((exhibit) => (
                <ExhibitCard key={exhibit.id} exhibit={exhibit} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
