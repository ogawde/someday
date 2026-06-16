import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ExhibitCard } from "@/components/exhibit-card";
import { ProfileManage } from "@/components/profile-manage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { exhibits } from "@/lib/db/schema";
import { getPublishedExhibits, getUserByUsername } from "@/lib/queries/exhibits";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profileUser = await getUserByUsername(username);

  if (!profileUser) notFound();

  const session = await getSession();
  const isOwnProfile = session?.user.id === profileUser.id;

  const userExhibits = await getPublishedExhibits({ ownerId: profileUser.id });
  const allOwnExhibits = isOwnProfile
    ? await db.select().from(exhibits).where(eq(exhibits.ownerId, profileUser.id))
    : [];

  const hasOpenExhibits = userExhibits.some((e) => e.openToCollaboration);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-start gap-6">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profileUser.image ?? undefined} />
          <AvatarFallback className="text-2xl">
            {(profileUser.name?.[0] ?? "U").toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-heading text-3xl">{profileUser.name}</h1>
          <p className="text-muted-foreground">@{profileUser.username}</p>
          {profileUser.bio && (
            <p className="mt-3 max-w-xl text-muted-foreground">{profileUser.bio}</p>
          )}
          {hasOpenExhibits && (
            <Badge variant="secondary" className="mt-3">
              Open to collaboration
            </Badge>
          )}
        </div>
      </div>

      {isOwnProfile && (
        <ProfileManage
          userId={profileUser.id}
          bio={profileUser.bio ?? ""}
          exhibits={allOwnExhibits}
        />
      )}

      <section className="mt-12">
        <h2 className="font-heading text-2xl">Exhibits</h2>
        {userExhibits.length === 0 ? (
          <p className="mt-4 text-muted-foreground">
            No exhibits yet.{" "}
            {isOwnProfile && (
              <Link href="/submit" className="underline">
                Submit your first
              </Link>
            )}
          </p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {userExhibits.map((exhibit) => (
              <ExhibitCard key={exhibit.id} exhibit={exhibit} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
