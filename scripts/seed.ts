/**
 * Seeds an empty database with the built-in default content and the
 * administrator account.
 *
 *   npm run db:seed
 *
 * Safe to run more than once: tables that already contain rows are left
 * untouched, so the administrator's edits are never overwritten. The admin
 * account is created from ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD only if it
 * does not exist yet.
 */
import { describeDatabase, explainError, requireEnv } from "./env";
import { count, eq } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { createDb, createPool, schema } from "../lib/db/client";
import { SECTION_KEYS } from "../lib/db/schema";
import { sectionDefaults } from "../lib/content/sections";
import { defaultNews } from "../lib/defaults/news";
import { defaultDownloads } from "../lib/defaults/downloads";
import { galleryPhotos, heroSlides, homeGallery } from "../lib/media";
import { hashPassword, passwordProblem } from "../lib/auth/password";
import { leaders, sectors } from "../lib/site";

requireEnv("DATABASE_URL");
console.log(`\n  Seeding ${describeDatabase()}`);
const pool = createPool();
const db = createDb(pool);

async function isEmpty(table: PgTable) {
  const [{ value }] = await db.select({ value: count() }).from(table);
  return value === 0;
}

const image = (i: { src: string; alt: string; width: number; height: number }) => ({
  imageUrl: i.src,
  imageAlt: i.alt,
  imageWidth: i.width,
  imageHeight: i.height,
});

async function main() {
  const report: string[] = [];

  // Sections
  for (const key of SECTION_KEYS) {
    const inserted = await db
      .insert(schema.contentSections)
      .values({ key, data: sectionDefaults[key] as Record<string, unknown> })
      .onConflictDoNothing()
      .returning({ key: schema.contentSections.key });
    report.push(`section ${key}: ${inserted.length ? "seeded" : "kept existing"}`);
  }

  if (await isEmpty(schema.sectors)) {
    await db.insert(schema.sectors).values(
      sectors.map((s, i) => ({
        slug: s.slug,
        sortOrder: i,
        name: s.name,
        shortName: s.shortName,
        icon: s.icon,
        summary: s.summary,
        headline: s.headline,
        overview: s.overview,
        focus: s.focus,
        imageUrl: s.image?.src ?? null,
        imageAlt: s.image?.alt ?? null,
        imageWidth: s.image?.width ?? null,
        imageHeight: s.image?.height ?? null,
      })),
    );
    report.push(`sectors: seeded ${sectors.length}`);
  } else report.push("sectors: kept existing");

  if (await isEmpty(schema.leaders)) {
    await db.insert(schema.leaders).values(
      leaders.map((l, i) => ({
        slug: l.slug,
        sortOrder: i,
        name: l.name,
        role: l.role,
        summary: l.summary,
        bio: l.bio,
        email: l.email,
        ...image(l.photo),
      })),
    );
    report.push(`leaders: seeded ${leaders.length}`);
  } else report.push("leaders: kept existing");

  if (await isEmpty(schema.heroSlides)) {
    await db.insert(schema.heroSlides).values(heroSlides.map((s, i) => ({ sortOrder: i, ...image(s) })));
    report.push(`hero slides: seeded ${heroSlides.length}`);
  } else report.push("hero slides: kept existing");

  if (await isEmpty(schema.galleryPhotos)) {
    const onHome = new Set(homeGallery.map((g) => g.image.src));
    await db.insert(schema.galleryPhotos).values(
      galleryPhotos.map((g, i) => ({
        sortOrder: i,
        sectorSlug: g.sector?.slug ?? null,
        showOnHome: onHome.has(g.image.src),
        ...image(g.image),
      })),
    );
    report.push(`gallery photos: seeded ${galleryPhotos.length}`);
  } else report.push("gallery photos: kept existing");

  if (await isEmpty(schema.newsArticles)) {
    await db.insert(schema.newsArticles).values(
      defaultNews.map((a) => ({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        category: a.category,
        publishedAt: a.publishedAt,
        body: a.body,
        ...image(a.image),
      })),
    );
    report.push(`news: seeded ${defaultNews.length}`);
  } else report.push("news: kept existing");

  if (await isEmpty(schema.downloads)) {
    await db.insert(schema.downloads).values(
      defaultDownloads.map((d, i) => ({
        key: d.id,
        sortOrder: i,
        title: d.title,
        description: d.description,
        category: d.category,
        fileUrl: d.file.url,
        fileName: d.file.fileName,
        fileFormat: d.file.format,
        fileSizeBytes: d.file.sizeBytes,
        filePages: d.file.pages ?? null,
        publishedAt: d.publishedAt,
        featured: d.featured ?? false,
      })),
    );
    report.push(`downloads: seeded ${defaultDownloads.length}`);
  } else report.push("downloads: kept existing");

  // Administrator
  const email = requireEnv("ADMIN_EMAIL").trim().toLowerCase();
  const existing = await db.select({ id: schema.adminUsers.id }).from(schema.adminUsers).where(eq(schema.adminUsers.email, email));
  if (existing.length) {
    report.push(`admin ${email}: kept existing (use npm run admin:reset-password to change the password)`);
  } else {
    const password = requireEnv("ADMIN_INITIAL_PASSWORD");
    const problem = passwordProblem(password);
    if (problem) {
      console.error(`\n  ADMIN_INITIAL_PASSWORD is not strong enough: ${problem}\n`);
      process.exit(1);
    }
    await db.insert(schema.adminUsers).values({ email, passwordHash: await hashPassword(password) });
    report.push(`admin ${email}: created`);
  }

  console.log("\nSeed complete:\n  " + report.join("\n  ") + "\n");
}

main()
  .catch((error) => {
    const reason = explainError(error);
    console.error(`\n  Seed failed: ${reason}`);
    if (/relation .* does not exist/.test(reason)) console.error("  The tables are missing: run npm run db:migrate first.");
    console.error("");
    process.exitCode = 1;
  })
  .finally(() => pool.end());
