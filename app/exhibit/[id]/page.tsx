import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ExhibitImage } from "@/components/exhibit-image";
import { RequestContinueButton } from "@/components/request-continue-button";
import { ReportDialog } from "@/components/report-dialog";
import { getWingLabel } from "@/lib/constants";
import { getExhibitById } from "@/lib/queries/exhibits";
import { getSession } from "@/lib/session";

export default async function ExhibitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  const exhibit = await getExhibitById(id);

  if (!exhibit) notFound();

  const username = exhibit.owner.username ?? "anonymous";
  const isOwner = session?.user.id === exhibit.owner.id;
  const images = exhibit.media.filter((m) => m.type === "image");
  const links = exhibit.media.filter((m) => m.type === "link");

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {getWingLabel(exhibit.wing)}
          </p>
          <h1 className="font-heading mt-2 text-4xl leading-tight">{exhibit.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {exhibit.openToCollaboration && (
            <Badge variant="secondary">Open to collaboration</Badge>
          )}
          {session && !isOwner && <ReportDialog exhibitId={exhibit.id} />}
        </div>
      </div>

      {images.length > 0 && (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {images.map((img) => (
            <div key={img.id} className="overflow-hidden rounded-lg border border-border/70">
              <ExhibitImage src={img.url} />
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 space-y-8 border-l-2 border-border pl-6">
        <section>
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            What it was
          </h2>
          <p className="mt-3 leading-relaxed">{exhibit.whatItWas}</p>
        </section>
        <section>
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Why it stopped
          </h2>
          <p className="mt-3 leading-relaxed">{exhibit.whyItStopped}</p>
        </section>
        <section>
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            What it could have been
          </h2>
          <p className="mt-3 leading-relaxed">{exhibit.whatItCouldHaveBeen}</p>
        </section>
      </div>

      {links.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Links
          </h2>
          <ul className="mt-3 space-y-2">
            {links.map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline underline-offset-4"
                >
                  {link.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-12 flex flex-col gap-6 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/u/${username}`}
          className="flex items-center gap-3 hover:opacity-80"
        >
          <Avatar>
            <AvatarImage src={exhibit.owner.image ?? undefined} />
            <AvatarFallback>
              {(exhibit.owner.name?.[0] ?? "U").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{exhibit.owner.name}</p>
            <p className="text-sm text-muted-foreground">@{username}</p>
          </div>
        </Link>

        {session && !isOwner && (
          <RequestContinueButton exhibitId={exhibit.id} />
        )}
        {!session && (
          <Link href="/sign-in" className="text-sm underline">
            Sign in to request to continue
          </Link>
        )}
      </div>
    </article>
  );
}
