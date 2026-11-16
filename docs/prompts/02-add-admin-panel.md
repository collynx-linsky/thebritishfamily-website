# Add an admin panel so BFL can manage the website content

## What this is and why

The BFL website is built and working (see `docs/prompts/01-build-website.md` for the original brief, and the git history for what was done). Today all the content lives in code, in `lib/site.ts`, so every wording change or new photo needs a developer.

The director wants to manage the content himself. Add a private admin panel where one company administrator can log in and edit all the text and images on the public site, with changes appearing on the live site shortly after saving.

The person using this panel is a company director or office administrator, not a developer. They will use it rarely, possibly from a phone, and nobody will be there to help. So the panel has to be obvious without training, hard to break the site with, and clear about what happened after every action. The public site must stay as fast and polished as it is now: visitors should not be able to tell anything changed.

This site is also my portfolio piece, and "the client can update it themselves" is a selling point I will demonstrate to future clients. Build it to the standard of something I can show with confidence.

## Read these first

- `AGENTS.md`. This is Next.js 16 with breaking changes. Read the bundled docs in `node_modules/next/dist/docs/` for everything this task touches before choosing an approach: caching and revalidation (note that `cacheComponents` is enabled in `next.config.ts`), server functions and forms, the request-interception file convention (it has been renamed in this version), cookies, and route handlers. Do not rely on memory of older versions.
- `lib/site.ts` and the components that read from it, so you know the exact shape of the content today.
- `lib/enquiry.ts`, `lib/seo.ts` and `lib/structured-data.ts`, which also consume content.
- `README.md` and `docs/TODO-for-BFL.md`.

## Scope

In scope:

- A login-protected admin area at `/admin`.
- Editing every piece of visitor-facing text that currently comes from `lib/site.ts`: hero, about summary, introduction, mission, vision, philosophy, values, fact counters, "how we work" items, the text of each of the four sectors, each director's name, role and bio, contact details (address, phones, emails, WhatsApp number), footer blurb, and per-page SEO title and description.
- Replacing every content image: hero background, the photo of each sector (including adding one for educational services, which currently has none), director portraits, and the photos used in the about sections.
- Changing the admin password from inside the panel.

Out of scope for now, so please do not build them: adding or removing sectors or directors, an enquiries inbox, news or project posts, multiple users or roles, draft and publish workflow, and rich-text formatting. I may ask for some of these later, so do not make choices that would block them (for example, store sectors and leaders as rows, not as fixed columns), but do not build UI for them.

The logo, colours, fonts, layout and navigation structure stay in code. The admin edits content, not design.

## Hosting and infrastructure

The site will be deployed on Vercel. That drives three constraints:

- Database: hosted PostgreSQL (Neon, through the Vercel integration). Use the connection approach recommended for serverless functions so connections are not exhausted.
- Image uploads: Vercel's filesystem is read-only at runtime and not persistent, so uploaded images cannot be written to `public/`. Store uploads in Vercel Blob (or an equivalent object store) and save the URL in the database. The existing files in `public/images/` remain as the built-in defaults.
- Secrets come from environment variables. Keep `.env.example` up to date with every variable, with a comment on each, and never commit real values.

I have not created the database or the blob store yet. When you reach the point where you need them, stop and give me exact step-by-step instructions for what to create and which values to paste into `.env.local`, then continue once I confirm. Do the same for anything else only I can do in a browser.

Check current package versions and their documentation before installing anything, rather than assuming an API from memory. Prefer few, well-maintained dependencies, and tell me what you add and why. My default preferences, which you may override with a reason: Drizzle ORM for the database layer, Zod for validation.

## How content should flow

- The database becomes the source of truth for content. Keep the current content in `lib/site.ts` (or a renamed defaults module) as typed defaults, and write a seed script that loads those defaults into an empty database.
- Give the public pages one typed content-access layer. Components should not query the database directly or care where content comes from.
- If a field is missing from the database, fall back to its default, so a partly filled database can never produce a blank section.
- Public pages must remain cached and fast. Read content through Next.js caching and invalidate the affected pages when the admin saves, so a change appears within seconds without a redeploy and without making every visit hit the database. Follow the caching docs for this version to do it correctly.
- The sitemap, metadata, Open Graph images and JSON-LD should read the same edited content, so SEO never drifts from what the page shows.
- If the database is unreachable at build or request time, the public site should still render from defaults rather than show an error page. Log the failure on the server.

## Authentication and security

This panel can rewrite a real company's public website, so treat it as a real attack surface.

- One administrator account. Seed it from environment variables (admin email and an initial password) and store only a password hash made with a current, recommended algorithm from a maintained library. Do not write your own cryptography.
- Sessions in an httpOnly, secure, same-site cookie with a sensible expiry, plus a working log out.
- Protect `/admin` at the routing layer, and also verify the session inside every server function and route handler that reads or writes admin data. The routing-layer check alone is not sufficient, because server functions can be called directly.
- Rate-limit or progressively delay failed logins, and use the same error message for a wrong email and a wrong password.
- Validate every input on the server: required fields, sensible maximum lengths, valid email and phone formats, and URLs only where a URL is expected.
- Content is plain text. Render it as text, never as HTML, so the admin cannot accidentally or deliberately inject markup or scripts into the public site.
- Uploads: accept only JPEG, PNG and WebP, enforce a size limit, verify the file is really an image on the server, and generate the stored filename yourself rather than trusting the uploaded name.
- Keep `/admin` out of search engines: noindex on the pages, excluded from the sitemap, and disallowed in robots.

## The admin experience

Design it for someone who has never used a CMS.

- After login, a simple dashboard listing the areas they can edit, organised the way the public site is organised (Home, About, Sectors, Leadership, Contact details, SEO), so they find a field by thinking about where it appears on the site.
- Plain forms with clear labels in everyday language, a short hint under any field where the right length or format is not obvious, and a character counter where the layout depends on length (headlines, card summaries). Pick limits that keep the public design looking good, based on how the current text fits.
- Image fields show the current image, let them upload a replacement, and require a short description for accessibility, explained in plain words. Show the recommended size and warn (without blocking) when an upload is too small to look sharp.
- Every save gives unmistakable feedback: what was saved, or exactly which field needs fixing and why. Warn before leaving a page with unsaved changes.
- A "View on site" link on each section that opens the matching public page.
- A "Restore original" option per section that puts back the built-in default, with a confirmation step, so an editing mistake is always recoverable.
- Show when each section was last updated.
- Fully usable on a phone, keyboard accessible, with the same contrast and focus standards as the public site.
- Visually it should belong to the same brand (navy, gold, the same fonts) but be calmer and denser than the public pages. It is a working tool, not a marketing page.

## Engineering standards

Everything from the first brief still applies: server components by default, small typed components, no duplicated markup, `npm run build` and `npm run lint` passing cleanly. In addition:

- Database schema in versioned migrations, with npm scripts for migrate and seed, documented in the README.
- Keep admin code separate from public code (its own route group and component folder), so the public bundle does not grow.
- Remove or repurpose anything this change makes obsolete, rather than leaving two sources of truth.
- Commit after each working step with clear messages, as before.

## How to work

1. Read the files and docs listed above, then give me a short plan: the data model, the auth approach, the caching and revalidation approach with the doc pages you based it on, the packages you intend to add, and the list of things you will need from me. Wait for my go-ahead on this plan before building, because these choices are expensive to change later.
2. Build in this order: database layer, schema, migrations and seed; content-access layer with the public site reading from it and rendering identically to before; authentication; admin shell and dashboard; the editing forms section by section; image uploads; SEO and structured data wiring; polish.
3. After step one of the build, confirm that the public site looks exactly as it did before, since nothing visible should have changed yet.
4. Test the full loop yourself where you can: log in, change a headline, confirm the public page updates, upload an image, restore a default, log out, and confirm `/admin` pages and admin actions are refused without a session. Tell me plainly anything you could not test.
5. Update the README with: local setup, the environment variables, how to run migrations and seed, how to deploy to Vercel with the database and blob store, and how to reset the admin password if it is forgotten.
6. Write `docs/admin-guide.md`: a one-page guide in plain language for the director, covering how to log in, edit text, replace a photo, undo a mistake, and change the password.

## When you are done

Tell me:

- What was built and how content now flows from the admin to the public page, in a few lines.
- The packages added and why.
- Build and lint results.
- What you tested and what you could not.
- The exact steps I must take to deploy this to Vercel.
- Anything about the design that I should know before I show it to the director.
