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

export const EXHIBITS_PAGE_SIZE = 12;

export type ExhibitListItem = {
  id: string;
  wing: WingDbValue;
  title: string;
  whatItWas: string;
  openToCollaboration: boolean;
  createdAt: Date;
  owner: {
    id: string;
    username: string | null;
    name: string;
    image: string | null;
  };
  media: { id: string; type: "image" | "audio" | "link"; url: string }[];
};

export type ExhibitWithOwner = ExhibitListItem & {
  whyItStopped: string;
  whatItCouldHaveBeen: string;
  status: "published" | "hidden" | "unpublished";
  updatedAt: Date;
  owner: ExhibitListItem["owner"] & { bio: string | null };
};

type ExhibitQueryOptions = {
  wing?: WingDbValue;
  search?: string;
  openOnly?: boolean;
  ownerId?: string;
};

function buildPublishedConditions(options?: ExhibitQueryOptions) {
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

  return conditions;
}

async function attachMediaToExhibits<T extends { id: string }>(
  rows: T[]
): Promise<(T & { media: ExhibitListItem["media"] })[]> {
  const exhibitIds = rows.map((row) => row.id);
  const mediaRows =
    exhibitIds.length > 0
      ? await db
          .select()
          .from(exhibitMedia)
          .where(inArray(exhibitMedia.exhibitId, exhibitIds))
      : [];

  const mediaByExhibit = new Map<string, typeof mediaRows>();
  for (const media of mediaRows) {
    const list = mediaByExhibit.get(media.exhibitId) ?? [];
    list.push(media);
    mediaByExhibit.set(media.exhibitId, list);
  }

  return rows.map((row) => ({
    ...row,
    media: (mediaByExhibit.get(row.id) ?? []).map((item) => ({
      id: item.id,
      type: item.type,
      url: item.url,
    })),
  }));
}

export async function getPublishedExhibitCount(options?: ExhibitQueryOptions) {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(exhibits)
    .where(and(...buildPublishedConditions(options)));

  return result?.count ?? 0;
}

export async function getPublishedExhibits(options?: ExhibitQueryOptions & {
  limit?: number;
  offset?: number;
}) {
  const limit = options?.limit ?? EXHIBITS_PAGE_SIZE;
  const offset = options?.offset ?? 0;

  const rows = await db
    .select({
      id: exhibits.id,
      wing: exhibits.wing,
      title: exhibits.title,
      whatItWas: exhibits.whatItWas,
      openToCollaboration: exhibits.openToCollaboration,
      createdAt: exhibits.createdAt,
      owner: {
        id: user.id,
        username: user.username,
        name: user.name,
        image: user.image,
      },
    })
    .from(exhibits)
    .innerJoin(user, eq(exhibits.ownerId, user.id))
    .where(and(...buildPublishedConditions(options)))
    .orderBy(desc(exhibits.createdAt))
    .limit(limit)
    .offset(offset);

  return (await attachMediaToExhibits(rows)) as ExhibitListItem[];
}

export async function getPublishedExhibitsPaginated(
  options?: ExhibitQueryOptions & { page?: number; limit?: number }
) {
  const limit = options?.limit ?? EXHIBITS_PAGE_SIZE;
  const page = Math.max(1, options?.page ?? 1);
  const offset = (page - 1) * limit;
  const filters = {
    wing: options?.wing,
    search: options?.search,
    openOnly: options?.openOnly,
    ownerId: options?.ownerId,
  };

  const [total, items] = await Promise.all([
    getPublishedExhibitCount(filters),
    getPublishedExhibits({ ...filters, limit, offset }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    pageSize: limit,
  };
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
