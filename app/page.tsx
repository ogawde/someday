import Link from "next/link";
import { Suspense } from "react";
import { ExhibitGridSkeleton } from "@/components/exhibit-grid-skeleton";
import { HomeHero, HomeHeroSkeleton } from "@/components/home-hero";
import { RecentExhibits } from "@/components/recent-exhibits";
import { WINGS } from "@/lib/constants";

export default function HomePage() {
  return (
    <div>
      <Suspense fallback={<HomeHeroSkeleton />}>
        <HomeHero />
      </Suspense>

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

      <Suspense fallback={<RecentExhibitsSkeleton />}>
        <RecentExhibits />
      </Suspense>
    </div>
  );
}

function RecentExhibitsSkeleton() {
  return (
    <section className="border-t border-border/60 bg-muted/10">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-heading text-2xl">Recent exhibits</h2>
        <div className="mt-8">
          <ExhibitGridSkeleton count={6} />
        </div>
      </div>
    </section>
  );
}
