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
        <h2 className="font-heading text-2xl">Explore by wing</h2>
        <p className="mt-2 text-muted-foreground">
          Pick the kind of unfinished work you want to wander through.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WINGS.map((wing) => (
            <Link
              key={wing.slug}
              href={`/wings/${wing.slug}`}
              className="subtle-hover group rounded-xl border border-border/70 bg-card p-6 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
            >
              <h3 className="font-heading text-lg">{wing.label}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{wing.description}</p>
              <p className="mt-4 text-sm text-foreground/80 group-hover:underline">
                Enter wing
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-muted/20">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="font-heading text-2xl">How Someday works</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="subtle-hover rounded-xl border border-border/70 bg-card p-5 text-center shadow-[0_1px_0_rgba(0,0,0,0.02)]">
              <h3 className="font-medium">Write what you started</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Share the real version: messy notes, context, and where momentum dropped.
              </p>
            </div>
            <div className="subtle-hover rounded-xl border border-border/70 bg-card p-5 text-center shadow-[0_1px_0_rgba(0,0,0,0.02)]">
              <h3 className="font-medium">Turn it into an exhibit</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We help format it into a museum card you can edit before publishing.
              </p>
            </div>
            <div className="subtle-hover rounded-xl border border-border/70 bg-card p-5 text-center shadow-[0_1px_0_rgba(0,0,0,0.02)]">
              <h3 className="font-medium">Invite continuation</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                If you want, other builders can message you and pick up where you left off.
              </p>
            </div>
          </div>
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
