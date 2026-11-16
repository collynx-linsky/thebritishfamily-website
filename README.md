# The British Family Limited website

Public website for The British Family Limited (BFL), Dar es Salaam, Tanzania.

Built with Next.js 16 (App Router, Cache Components), React 19, TypeScript and Tailwind CSS v4. Every page is prerendered at build time; there is no database or CMS.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build and check

```bash
npm run lint
npm run build      # production build; fails if any page stops being static
npm run start      # serve the production build locally
```

The root layout exports `ensureStatic = "navigation"`, so the build fails if a change ever makes a page render per request.

## Configuration

| Variable | Purpose | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public URL of the site, no trailing slash. Used for canonical URLs, Open Graph tags, `sitemap.xml`, `robots.txt` and JSON-LD. | `http://localhost:3000` |

Copy `.env.example` to `.env.local` for local overrides. The domain is not registered yet: set this variable in the hosting environment before launch.

## Deploy

Any host that runs Next.js 16 on Node.js works. On Vercel: import the repository, set `NEXT_PUBLIC_SITE_URL` under Project Settings, Environment Variables, and deploy. To self-host, run `npm run build` then `npm run start` behind a reverse proxy (see the Next.js self-hosting guide).

## Editing content

All text, contact details, sectors and leaders live in **`lib/site.ts`**. Components contain no copy, so most edits are made there:

- Company details, phones and email: `company`
- Navigation: `navigation`
- About page text, mission, vision, philosophy: `about`, `values`, `approach`
- Sectors (pages are generated from this list): `sectors`. Set a sector's `image` to replace the branded panel with a photo.
- Directors: `leaders`
- Page titles, descriptions and banners: `pages`

Images live in `public/images/`. Design tokens (colours, type sizes, shadows) are defined once in `app/globals.css`.

Only publish facts the company has confirmed. Outstanding information is listed in `docs/TODO-for-BFL.md`.

### News and downloads (ready for the admin panel)

News (`/news`, `/news/[slug]`) and documents (`/downloads`) are designed to be managed from the future admin panel, so they are already separated from the rest of the content:

| Layer | News | Downloads |
| --- | --- | --- |
| Types (the future database rows) | `lib/content/types.ts` | `lib/content/types.ts` |
| Default content | `lib/defaults/news.ts` | `lib/defaults/downloads.ts` (files in `public/downloads/`) |
| Access functions used by pages | `lib/content/news.ts` | `lib/content/downloads.ts` |

Pages never read the defaults directly. Each access function is cached with `"use cache"`, `cacheTag("news")` or `cacheTag("downloads")`, and `cacheLife("max")`, so every page stays static. When the admin panel is built:

1. Replace the body of `loadNews()` / `loadDownloads()` with a database query that falls back to the defaults if the database is unreachable. Store uploaded documents in Vercel Blob and save their URL as `file.url`.
2. In the admin's save actions (server actions), call `updateTag(NEWS_TAG)` or `updateTag(DOWNLOADS_TAG)`. The home page news strip, the News pages, the sitemap and the Downloads page then refresh on the next visit.

Article text is stored as plain-text blocks (`paragraph` or `heading`) and rendered as text, never HTML. The contact card (`/downloads/bfl-contact-card.vcf`) is generated from `company` in `lib/site.ts`, so it always matches the contact details on the site.

### Sample photos

`lib/samples.ts` defines temporary Unsplash sample photos (in `public/images/samples/`) used until real BFL photos are supplied. Real photos always take priority. They must be replaced before launch; see `docs/TODO-for-BFL.md`.

## Project structure

```text
app/            routes: home, about, sectors, sectors/[slug], leadership, gallery,
                news, news/[slug], downloads, contact, not-found, sitemap,
                robots, share images and icons
components/     reusable UI (header, footer, cards, banner, form, icons)
components/motion/  scroll reveals, slideshow, gallery, strip, counters
lib/site.ts     site content (company, sectors, leaders, page copy)
lib/content/    news and downloads: types and cached access functions
lib/defaults/   default news articles and downloads
lib/samples.ts  temporary sample photos (replace before launch)
lib/enquiry.ts  enquiry validation and delivery
lib/seo.ts      site URL and per-page metadata helper
docs/           brief, approved content, approved homepage design, TODO for BFL
```

## Connecting a form backend

The contact form has no backend yet. It validates the enquiry and then opens the visitor's email app with the message filled in, addressed to the general inbox.

Delivery is isolated in `lib/enquiry.ts`. The form UI only calls `submitEnquiry()`, so switching to a real backend means changing one line there:

1. Create a route handler, for example `app/api/enquiry/route.ts`, that validates the JSON body with `validateEnquiry()` and sends it with your email provider or form service.
2. In `lib/enquiry.ts`, set `activeTransport` to `exampleApiTransport` (or your own transport that returns `{ status: "sent" }` on success).

The form already shows the right confirmation for each result (`"handoff"` for the email app, `"sent"` for a backend).
