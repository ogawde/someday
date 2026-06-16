import { db } from "@/lib/db";
import {
  conversations,
  exhibitMedia,
  exhibits,
  messages,
  reports,
  user,
} from "@/lib/db/schema";
import type { WingDbValue } from "@/lib/constants";
import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";

export type ExhibitWithOwner = {
  id: string;
  wing: WingDbValue;
  title: string;
  whatItWas: string;
  whyItStopped: string;
  whatItCouldHaveBeen: string;
  openToCollaboration: boolean;
  status: "published" | "hidden" | "unpublished";
  createdAt: Date;
  updatedAt: Date;
  owner: {
    id: string;
    username: string | null;
    name: string;
    image: string | null;
    bio: string | null;
  };
  media: { id: string; type: "image" | "audio" | "link"; url: string }[];
};

export async function getPublishedExhibits(options?: {
  wing?: WingDbValue;
  search?: string;
  openOnly?: boolean;
  limit?: number;
  ownerId?: string;
}) {
  const conditions = [eq(exhibits.status, "published")];

  if (options?.wing) {
    conditions.push(eq(exhibits.wing, options.wing));
  }

  if (options?.openOnly) {
    conditions.push(eq(exhibits.openToCollaboration, true));
  }

  if (options?.ownerId) {
    conditions.push(eq(exhibits.ownerId, options.ownerId));
  }

  if (options?.search) {
    const term = `%${options.search}%`;
    conditions.push(
      or(
        ilike(exhibits.title, term),
        ilike(exhibits.whatItWas, term),
        ilike(exhibits.whyItStopped, term),
        ilike(exhibits.whatItCouldHaveBeen, term)
      )!
    );
  }

  const rows = await db
    .select({
      exhibit: exhibits,
      owner: {
        id: user.id,
        username: user.username,
        name: user.name,
        image: user.image,
        bio: user.bio,
      },
    })
    .from(exhibits)
    .innerJoin(user, eq(exhibits.ownerId, user.id))
    .where(and(...conditions))
    .orderBy(desc(exhibits.createdAt))
    .limit(options?.limit ?? 50);

  const exhibitIds = rows.map((r) => r.exhibit.id);
  const mediaRows =
    exhibitIds.length > 0
      ? await db
          .select()
          .from(exhibitMedia)
          .where(inArray(exhibitMedia.exhibitId, exhibitIds))
      : [];

  const mediaByExhibit = new Map<string, typeof mediaRows>();
  for (const m of mediaRows) {
    const list = mediaByExhibit.get(m.exhibitId) ?? [];
    list.push(m);
    mediaByExhibit.set(m.exhibitId, list);
  }

  return rows.map((row) => ({
    ...row.exhibit,
    owner: row.owner,
    media: (mediaByExhibit.get(row.exhibit.id) ?? []).map((m) => ({
      id: m.id,
      type: m.type,
      url: m.url,
    })),
  })) as ExhibitWithOwner[];
}

export async function getExhibitById(id: string, includeUnpublished = false) {
  const conditions = [eq(exhibits.id, id)];
  if (!includeUnpublished) {
    conditions.push(eq(exhibits.status, "published"));
  }

  const [row] = await db
    .select({
      exhibit: exhibits,
      owner: {
        id: user.id,
        username: user.username,
        name: user.name,
        image: user.image,
        bio: user.bio,
      },
    })
    .from(exhibits)
    .innerJoin(user, eq(exhibits.ownerId, user.id))
    .where(and(...conditions))
    .limit(1);

  if (!row) return null;

  const media = await db
    .select()
    .from(exhibitMedia)
    .where(eq(exhibitMedia.exhibitId, id))
    .orderBy(exhibitMedia.sortOrder);

  return {
    ...row.exhibit,
    owner: row.owner,
    media: media.map((m) => ({
      id: m.id,
      type: m.type,
      url: m.url,
    })),
  } as ExhibitWithOwner;
}

export async function getExhibitCount() {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(exhibits)
    .where(eq(exhibits.status, "published"));
  return result?.count ?? 0;
}

export async function getUserByUsername(username: string) {
  const [row] = await db
    .select()
    .from(user)
    .where(eq(user.username, username.toLowerCase()))
    .limit(1);
  return row ?? null;
}

export async function getConversationForUser(conversationId: string, userId: string) {
  const [row] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  if (!row) return null;
  if (row.creatorId !== userId && row.requesterId !== userId) return null;
  return row;
}

export async function getOpenReports() {
  return db
    .select({
      report: reports,
      exhibit: {
        id: exhibits.id,
        title: exhibits.title,
        status: exhibits.status,
      },
      reporter: {
        username: user.username,
        name: user.name,
      },
    })
    .from(reports)
    .innerJoin(exhibits, eq(reports.exhibitId, exhibits.id))
    .innerJoin(user, eq(reports.reporterId, user.id))
    .where(eq(reports.status, "open"))
    .orderBy(desc(reports.createdAt));
}
