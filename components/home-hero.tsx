import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getExhibitCount } from "@/lib/queries/exhibits";
import { getSession } from "@/lib/session";

export async function HomeHero() {
  const [count, session] = await Promise.all([getExhibitCount(), getSession()]);

  return (
    <section className="border-b border-border/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-[1.3fr_1fr] md:items-end md:py-20">
        <div>
          <p className="text-sm tracking-wide text-muted-foreground">
            A museum of unfinished projects
          </p>
          <h1 className="font-heading mt-3 text-4xl leading-tight md:text-5xl">
            Some projects launch.
            <br />
            Some projects become stories.
          </h1>
          <p className="mt-5 max-w-xl text-muted-foreground">
            Someday is a public archive for work-in-progress that never crossed the finish line.
            Share what you built, why it paused, and what it could still become.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/wings/products" size="lg">
              Browse exhibits
            </ButtonLink>
            {session ? (
              <ButtonLink href="/submit" variant="outline" size="lg">
                Add your project
              </ButtonLink>
            ) : (
              <ButtonLink href="/sign-up" variant="outline" size="lg">
                Join the museum
              </ButtonLink>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-muted/40 p-6">
          <p className="text-sm text-muted-foreground">Currently archived</p>
          <p className="font-heading mt-2 text-4xl">
            {count}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            unfinished {count === 1 ? "project" : "projects"}
          </p>
          <div className="mt-6 border-t border-border/70 pt-4 text-sm text-muted-foreground">
            <p>&ldquo;I thought I was the only one who never finished things.&rdquo;</p>
            <p className="mt-2">— museum visitor</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeHeroSkeleton() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-[1.3fr_1fr] md:items-end md:py-20">
        <div>
          <Skeleton className="h-4 w-44" />
          <Skeleton className="mt-4 h-12 w-full max-w-3xl" />
          <Skeleton className="mt-3 h-12 w-full max-w-2xl" />
          <Skeleton className="mt-6 h-16 w-full max-w-xl" />
          <div className="mt-8 flex gap-3">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
        <div className="rounded-2xl border border-border/70 p-6">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-3 h-10 w-20" />
          <Skeleton className="mt-2 h-4 w-36" />
          <Skeleton className="mt-6 h-14 w-full" />
          <Skeleton className="mt-2 h-4 w-24" />
        </div>
      </div>
    </section>
  );
}
