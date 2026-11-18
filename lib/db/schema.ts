/**
 * Database schema (PostgreSQL, managed with Drizzle migrations).
 *
 * Shapes:
 * - One-of-a-kind content (company, home, about, pages) lives in
 *   `content_sections` as one JSONB document per section, validated with Zod
 *   on every write. Missing fields fall back to the built-in defaults.
 * - Repeatable content (sectors, leaders, hero slides, gallery photos, news,
 *   downloads) is stored as rows with a sort order, so items can be added,
 *   removed and reordered.
 * - `content_history` keeps previous versions of anything the admin saves,
 *   so the last change can be undone.
 * - `uploads` tracks every uploaded file until a record uses it, so
 *   abandoned uploads can be cleaned up.
 */
import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

/** Image fields shared by every table that holds a picture */
const imageColumns = {
  imageUrl: text("image_url").notNull(),
  imageAlt: text("image_alt").notNull(),
  imageWidth: integer("image_width").notNull(),
  imageHeight: integer("image_height").notNull(),
};

/* ------------------------------------------------------------------
   Administration
   ------------------------------------------------------------------ */

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  passwordChangedAt: timestamp("password_changed_at", { withTimezone: true }).notNull().defaultNow(),
  /** Name shown in the admin (user menu, greetings, "saved by"). Existing accounts get the default. */
  displayName: text("display_name").notNull().default("Office"),
  /** When the first-visit welcome was dismissed (null: show it) */
  onboardedAt: timestamp("onboarded_at", { withTimezone: true }),
  ...timestamps,
});

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    /** SHA-256 of the random session token; the token itself is only in the cookie */
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("admin_sessions_token_hash_idx").on(t.tokenHash), index("admin_sessions_user_idx").on(t.userId)],
);

/**
 * Login attempts, for temporary lockouts. `pairKey` hashes email + IP, so a
 * lockout only ever affects the network the failures came from; `accountKey`
 * hashes the email alone and drives a short, capped delay (never a lockout).
 * Rows older than the window are ignored and cleaned up.
 */
export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: serial("id").primaryKey(),
    pairKey: text("pair_key").notNull(),
    accountKey: text("account_key").notNull(),
    success: boolean("success").notNull(),
    attemptedAt: timestamp("attempted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("login_attempts_pair_idx").on(t.pairKey, t.attemptedAt),
    index("login_attempts_account_idx").on(t.accountKey, t.attemptedAt),
  ],
);

/* ------------------------------------------------------------------
   Content
   ------------------------------------------------------------------ */

/** Keys of the one-of-a-kind sections stored in `content_sections` */
export const SECTION_KEYS = ["company", "home", "about", "pages"] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export const contentSections = pgTable("content_sections", {
  key: text("key").primaryKey().$type<SectionKey>(),
  data: jsonb("data").notNull().$type<Record<string, unknown>>(),
  ...timestamps,
});

export const sectors = pgTable("sectors", {
  slug: text("slug").primaryKey(),
  sortOrder: integer("sort_order").notNull().default(0),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  icon: text("icon").notNull(),
  summary: text("summary").notNull(),
  headline: text("headline").notNull(),
  overview: jsonb("overview").notNull().$type<string[]>(),
  focus: jsonb("focus").notNull().$type<string[]>(),
  /** Null until a real photo is uploaded (a sample is shown meanwhile) */
  imageUrl: text("image_url"),
  imageAlt: text("image_alt"),
  imageWidth: integer("image_width"),
  imageHeight: integer("image_height"),
  ...timestamps,
});

export const leaders = pgTable("leaders", {
  slug: text("slug").primaryKey(),
  sortOrder: integer("sort_order").notNull().default(0),
  name: text("name").notNull(),
  role: text("role").notNull(),
  summary: text("summary").notNull(),
  bio: text("bio").notNull(),
  email: text("email").notNull(),
  ...imageColumns,
  ...timestamps,
});

export const heroSlides = pgTable("hero_slides", {
  id: serial("id").primaryKey(),
  sortOrder: integer("sort_order").notNull().default(0),
  /** Hidden slides stay in the admin but are not shown on the website */
  visible: boolean("visible").notNull().default(true),
  ...imageColumns,
  ...timestamps,
});

export const galleryPhotos = pgTable("gallery_photos", {
  id: serial("id").primaryKey(),
  sortOrder: integer("sort_order").notNull().default(0),
  /** Sector the photo illustrates (filter and caption); null = company-wide */
  sectorSlug: text("sector_slug").references(() => sectors.slug, { onDelete: "set null" }),
  /** Also show in the "Our work in pictures" carousel on the home page */
  showOnHome: boolean("show_on_home").notNull().default(false),
  /** Hidden photos stay in the admin but are not shown on the website */
  visible: boolean("visible").notNull().default(true),
  ...imageColumns,
  ...timestamps,
});

export const newsArticles = pgTable(
  "news_articles",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    category: text("category").notNull(),
    publishedAt: date("published_at", { mode: "string" }).notNull(),
    /** Plain-text blocks: [{ type: "paragraph" | "heading", text }] */
    body: jsonb("body").notNull().$type<{ type: "paragraph" | "heading"; text: string }[]>(),
    /** Hidden stories stay in the admin but are not shown on the website */
    visible: boolean("visible").notNull().default(true),
    ...imageColumns,
    ...timestamps,
  },
  (t) => [uniqueIndex("news_articles_slug_idx").on(t.slug)],
);

export const downloads = pgTable("downloads", {
  id: serial("id").primaryKey(),
  /** Stable identifier used in URLs and history */
  key: text("key").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  fileFormat: text("file_format").notNull(),
  fileSizeBytes: integer("file_size_bytes").notNull(),
  filePages: integer("file_pages"),
  publishedAt: date("published_at", { mode: "string" }).notNull(),
  featured: boolean("featured").notNull().default(false),
  /** Hidden documents stay in the admin but are not shown on the website */
  visible: boolean("visible").notNull().default(true),
  ...timestamps,
});

/* ------------------------------------------------------------------
   History and uploads
   ------------------------------------------------------------------ */

export const HISTORY_ENTITIES = [
  "section",
  "sector",
  "leader",
  "hero_slides",
  "gallery_photos",
  "news_article",
  "download",
] as const;
export type HistoryEntity = (typeof HISTORY_ENTITIES)[number];

/**
 * Previous versions of saved content. Before every change the current
 * version is copied here; "Undo last change" restores the newest snapshot.
 * Collections that are reordered as a whole (hero slides, gallery photos)
 * are snapshotted as a whole list under a single entity id ("all").
 */
export const contentHistory = pgTable(
  "content_history",
  {
    id: serial("id").primaryKey(),
    entityType: text("entity_type").notNull().$type<HistoryEntity>(),
    entityId: text("entity_id").notNull(),
    /** The full previous version; null means the item did not exist yet */
    snapshot: jsonb("snapshot").$type<unknown>(),
    savedAt: timestamp("saved_at", { withTimezone: true }).notNull().defaultNow(),
    /** Who made the change that replaced this version (null for older rows) */
    savedBy: integer("saved_by").references(() => adminUsers.id, { onDelete: "set null" }),
    /** Plain-language description of that change, e.g. "Saved the Home page" */
    summary: text("summary"),
  },
  (t) => [index("content_history_entity_idx").on(t.entityType, t.entityId, t.savedAt)],
);

/**
 * A readable timeline of what happened in the admin: content saves, undos
 * and restores, sign-ins and account changes. Shown on the dashboard and
 * the Activity page. Old entries are pruned after a year.
 */
export const activityLog = pgTable(
  "activity_log",
  {
    id: serial("id").primaryKey(),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
    userId: integer("user_id").references(() => adminUsers.id, { onDelete: "set null" }),
    /** Machine-readable kind, e.g. "content.save", "auth.signin" */
    action: text("action").notNull(),
    /** Plain-language line, e.g. "Saved the Home page" */
    summary: text("summary").notNull(),
    /** Admin page about the item, when there is one */
    href: text("href"),
  },
  (t) => [index("activity_log_at_idx").on(t.at)],
);

/**
 * Items the editor has marked as reviewed on the dashboard's "Needs
 * attention" list (sample photos, sample news, details to confirm). Keyed
 * by a stable item key, e.g. "sector-photo:construction".
 */
export const contentReviews = pgTable("content_reviews", {
  key: text("key").primaryKey(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }).notNull().defaultNow(),
  reviewedBy: integer("reviewed_by").references(() => adminUsers.id, { onDelete: "set null" }),
});

export const UPLOAD_KINDS = ["image", "document"] as const;
export type UploadKind = (typeof UPLOAD_KINDS)[number];

/**
 * Every uploaded file. Starts as "pending"; becomes "attached" when a record
 * saves its URL; becomes "replaced" when a newer file takes its place.
 * Pending files older than 24 hours and replaced files are deleted by the
 * cleanup job.
 */
export const uploads = pgTable(
  "uploads",
  {
    id: serial("id").primaryKey(),
    url: text("url").notNull().unique(),
    /** Storage key (Blob pathname or local dev path) */
    pathname: text("pathname").notNull(),
    kind: text("kind").notNull().$type<UploadKind>(),
    contentType: text("content_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    status: text("status").notNull().default("pending").$type<"pending" | "attached" | "replaced">(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    statusChangedAt: timestamp("status_changed_at", { withTimezone: true }).notNull().default(sql`now()`),
  },
  (t) => [index("uploads_status_idx").on(t.status, t.statusChangedAt)],
);

/**
 * Unsaved editor values for the live preview. Written while an admin types
 * (only through admin-checked actions) and read by the public content
 * getters only in Draft Mode, whose cookie only the admin preview action
 * sets. Removed on save, on leaving the editor, and after a day.
 */
export const previewDrafts = pgTable("preview_drafts", {
  /** Entity key, e.g. "section:home" or "hero_slides:all" */
  key: text("key").primaryKey(),
  data: jsonb("data").notNull().$type<unknown>(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * The media library: every uploaded file, reusable across the site.
 *
 * - "library": uploaded to the library (kept even when not used anywhere).
 * - "pending": uploaded from an editor but not saved yet; removed (file and
 *   row) by the clean-up job after 24 hours unless it gets used.
 * Where a file is used is worked out from the content itself (by its URL),
 * so it can never drift out of date. The focal point (percent from the left
 * and top) decides how a photo is cropped in cards and banners everywhere.
 */
export const MEDIA_KINDS = ["image", "document"] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

export const media = pgTable(
  "media",
  {
    id: serial("id").primaryKey(),
    url: text("url").notNull().unique(),
    /** Storage key (Blob pathname, or the local development path) */
    pathname: text("pathname").notNull(),
    kind: text("kind").notNull().$type<MediaKind>(),
    contentType: text("content_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    width: integer("width"),
    height: integer("height"),
    /** Description for visitors who can't see the photo (required before use) */
    alt: text("alt").notNull().default(""),
    focalX: integer("focal_x").notNull().default(50),
    focalY: integer("focal_y").notNull().default(50),
    /** Tiny blurred preview shown while the photo loads */
    blurDataUrl: text("blur_data_url"),
    /** The file's name on the uploader's device (shown in the library only) */
    originalName: text("original_name").notNull().default(""),
    status: text("status").notNull().default("library").$type<"library" | "pending">(),
    createdBy: integer("created_by").references(() => adminUsers.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (t) => [index("media_status_created_idx").on(t.status, t.createdAt)],
);
