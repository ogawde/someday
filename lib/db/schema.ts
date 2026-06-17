import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const wingEnum = pgEnum("wing", [
  "products",
  "art",
  "scripts",
  "everything_else",
]);

export const exhibitStatusEnum = pgEnum("exhibit_status", [
  "published",
  "hidden",
  "unpublished",
]);

export const mediaTypeEnum = pgEnum("media_type", ["image", "audio", "link"]);

export const reportStatusEnum = pgEnum("report_status", ["open", "resolved"]);

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  username: text("username").unique(),
  displayUsername: text("display_username"),
  bio: text("bio"),
  role: text("role").notNull().default("user"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const exhibits = pgTable(
  "exhibits",
  {
    id: text("id").primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    wing: wingEnum("wing").notNull(),
    title: text("title").notNull(),
    whatItWas: text("what_it_was").notNull(),
    whyItStopped: text("why_it_stopped").notNull(),
    whatItCouldHaveBeen: text("what_it_could_have_been").notNull(),
    openToCollaboration: boolean("open_to_collaboration").notNull().default(false),
    status: exhibitStatusEnum("status").notNull().default("published"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("exhibits_wing_status_created_idx").on(
      table.wing,
      table.status,
      table.createdAt
    ),
    index("exhibits_owner_idx").on(table.ownerId),
  ]
);

export const exhibitMedia = pgTable("exhibit_media", {
  id: text("id").primaryKey(),
  exhibitId: text("exhibit_id")
    .notNull()
    .references(() => exhibits.id, { onDelete: "cascade" }),
  type: mediaTypeEnum("type").notNull(),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const conversations = pgTable(
  "conversations",
  {
    id: text("id").primaryKey(),
    exhibitId: text("exhibit_id")
      .notNull()
      .references(() => exhibits.id, { onDelete: "cascade" }),
    creatorId: text("creator_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    requesterId: text("requester_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    creatorLastReadAt: timestamp("creator_last_read_at"),
    requesterLastReadAt: timestamp("requester_last_read_at"),
  },
  (table) => [
    uniqueIndex("conversations_exhibit_requester_idx").on(
      table.exhibitId,
      table.requesterId
    ),
  ]
);

export const messages = pgTable(
  "messages",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("messages_conversation_created_idx").on(
      table.conversationId,
      table.createdAt
    ),
  ]
);

export const reports = pgTable("reports", {
  id: text("id").primaryKey(),
  exhibitId: text("exhibit_id")
    .notNull()
    .references(() => exhibits.id, { onDelete: "cascade" }),
  reporterId: text("reporter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  status: reportStatusEnum("status").notNull().default("open"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const userRelations = relations(user, ({ many }) => ({
  exhibits: many(exhibits),
  conversationsAsCreator: many(conversations, { relationName: "creator" }),
  conversationsAsRequester: many(conversations, { relationName: "requester" }),
  messages: many(messages),
}));

export const exhibitRelations = relations(exhibits, ({ one, many }) => ({
  owner: one(user, { fields: [exhibits.ownerId], references: [user.id] }),
  media: many(exhibitMedia),
  conversations: many(conversations),
  reports: many(reports),
}));

export const exhibitMediaRelations = relations(exhibitMedia, ({ one }) => ({
  exhibit: one(exhibits, {
    fields: [exhibitMedia.exhibitId],
    references: [exhibits.id],
  }),
}));

export const conversationRelations = relations(
  conversations,
  ({ one, many }) => ({
    exhibit: one(exhibits, {
      fields: [conversations.exhibitId],
      references: [exhibits.id],
    }),
    creator: one(user, {
      fields: [conversations.creatorId],
      references: [user.id],
      relationName: "creator",
    }),
    requester: one(user, {
      fields: [conversations.requesterId],
      references: [user.id],
      relationName: "requester",
    }),
    messages: many(messages),
  })
);

export const messageRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(user, { fields: [messages.senderId], references: [user.id] }),
}));
