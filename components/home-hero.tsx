import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getExhibitCount } from "@/lib/queries/exhibits";
import { getSession } from "@/lib/session";

export async function HomeHero() {
  const [count, session] = await Promise.all([getExhibitCount(), getSession()]);

  return (
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
  );
}

export function HomeHeroSkeleton() {
  return (
    <section className="border-b border-border/60 bg-muted/20">
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <Skeleton className="mx-auto h-4 w-48" />
        <Skeleton className="mx-auto mt-4 h-12 w-full max-w-3xl" />
        <Skeleton className="mx-auto mt-3 h-12 w-full max-w-2xl" />
        <Skeleton className="mx-auto mt-6 h-16 w-full max-w-xl" />
        <div className="mt-8 flex justify-center gap-3">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="mx-auto mt-8 h-4 w-40" />
      </div>
    </section>
  );
}
