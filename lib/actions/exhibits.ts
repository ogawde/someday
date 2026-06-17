"use server";

import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { exhibitMedia, exhibits } from "@/lib/db/schema";
import { publishExhibitSchema } from "@/lib/validations/exhibit";
import { getSession } from "@/lib/session";

function buildMediaItems(
  exhibitId: string,
  imageUrls: string[] = [],
  links: string[] = []
) {
  return [
    ...imageUrls.map((url, i) => ({
      id: nanoid(),
      exhibitId,
      type: "image" as const,
      url,
      sortOrder: i,
    })),
    ...links.map((url, i) => ({
      id: nanoid(),
      exhibitId,
      type: "link" as const,
      url,
      sortOrder: imageUrls.length + i,
    })),
  ];
}

async function replaceExhibitMedia(
  exhibitId: string,
  imageUrls: string[] = [],
  links: string[] = []
) {
  await db.delete(exhibitMedia).where(eq(exhibitMedia.exhibitId, exhibitId));

  const mediaItems = buildMediaItems(exhibitId, imageUrls, links);
  if (mediaItems.length > 0) {
    await db.insert(exhibitMedia).values(mediaItems);
  }
}

export async function publishExhibitAction(input: unknown) {
  const session = await getSession();
  if (!session) {
    return { error: "You must be signed in to publish." };
  }

  const parsed = publishExhibitSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please complete all required fields." };
  }

  const data = parsed.data;
  const exhibitId = nanoid();

  await db.insert(exhibits).values({
    id: exhibitId,
    ownerId: session.user.id,
    wing: data.wing,
    title: data.title,
    whatItWas: data.whatItWas,
    whyItStopped: data.whyItStopped,
    whatItCouldHaveBeen: data.whatItCouldHaveBeen,
    openToCollaboration: data.openToCollaboration,
    status: "published",
  });

  await replaceExhibitMedia(
    exhibitId,
    data.imageUrls ?? [],
    data.links ?? []
  );

  revalidatePath("/");
  revalidatePath(
    `/wings/${data.wing === "everything_else" ? "everything-else" : data.wing}`
  );
  if (session.user.username) {
    revalidatePath(`/u/${session.user.username}`);
  }

  return { exhibitId };
}

export async function updateExhibitAction(exhibitId: string, input: unknown) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const parsed = publishExhibitSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid exhibit data" };

  const [existing] = await db
    .select()
    .from(exhibits)
    .where(eq(exhibits.id, exhibitId))
    .limit(1);

  if (!existing || existing.ownerId !== session.user.id) {
    return { error: "Exhibit not found" };
  }

  const data = parsed.data;

  await db
    .update(exhibits)
    .set({
      wing: data.wing,
      title: data.title,
      whatItWas: data.whatItWas,
      whyItStopped: data.whyItStopped,
      whatItCouldHaveBeen: data.whatItCouldHaveBeen,
      openToCollaboration: data.openToCollaboration,
      updatedAt: new Date(),
    })
    .where(eq(exhibits.id, exhibitId));

  await replaceExhibitMedia(
    exhibitId,
    data.imageUrls ?? [],
    data.links ?? []
  );

  revalidatePath(`/exhibit/${exhibitId}`);
  revalidatePath("/");
  return { success: true };
}

export async function unpublishExhibitAction(exhibitId: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  const [existing] = await db
    .select()
    .from(exhibits)
    .where(eq(exhibits.id, exhibitId))
    .limit(1);

  if (!existing || existing.ownerId !== session.user.id) {
    return { error: "Exhibit not found" };
  }

  await db
    .update(exhibits)
    .set({ status: "unpublished", updatedAt: new Date() })
    .where(eq(exhibits.id, exhibitId));

  revalidatePath(`/exhibit/${exhibitId}`);
  revalidatePath("/");
  return { success: true };
}
