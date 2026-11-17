# Redesign the BFL admin into a premium content studio

## What this is and why

The BFL admin works (login, dashboard, account, and the content editors from step 5), but it is plain. I have a reference for where I want it to go: the website admin I use for another organisation, described in detail below. The director liked that style of admin. I want the BFL admin to feel like that one and then go further, in BFL's own brand.

Two audiences, as before:

1. The BFL director or office administrator, who is not technical, edits rarely, and may be on a phone. Everything must be obvious and hard to get wrong.
2. Business owners I show this to when selling my work. The admin is half of the demo. When I change a headline and they watch it update in a live preview, that is the moment that wins the job. It has to look and feel like a product, not a form on a page.

Do not copy the reference pixel for pixel. Take its structure and its good ideas, express them in BFL's navy and gold and the fonts the site already uses, and improve on them where this brief says so or where you see a better way.

## Read these first

- `AGENTS.md` and the bundled Next.js 16 docs for anything you touch.
- `docs/prompts/02-add-admin-panel.md` (the original admin brief) and the git history from "Admin step 1" onward, so you know what exists and which steps remain (uploads, news and downloads management, SEO wiring, docs).
- Everything under `app/(admin)` and `components/admin`, plus the content layer the editors use.

Everything in the original admin brief still applies: security rules, server-side validation, session checks in every action, caching and revalidation, accessibility, and passing build and lint. This brief changes the experience, not those rules.

## The reference admin, screen by screen

This is what the reference does. Treat it as a description of patterns, not a specification.

Sign-in page:
- Split screen. Left: a dark navy brand panel with the logo, a small gold uppercase tagline, a large serif title ("... website admin") and one sentence saying what the admin is for. Right: a small white card on a warm off-white background with the heading "Sign in", a one-line hint, two fields and one solid button.

Shell (every page after sign-in):
- Dark navy sidebar: logo and organisation name with "WEBSITE ADMIN" under it in gold; a "Search or jump to..." box with a Ctrl K hint; then navigation grouped the way the public site is grouped. Each group expands to show its sub-items, the current item is highlighted with a gold marker, and a "Collapse sidebar" control sits at the bottom.
- Top bar: a "Find a page or section..." search with Ctrl K, a "View website" button, and a user menu with the signed-in name.
- Content area on a warm off-white background with white rounded cards.

Dashboard:
- A large dark welcome banner with a small gold "DASHBOARD" label, a big serif "Welcome back", a greeting that changes with the time of day, a sentence reminding the editor that changes go live straight away with a live preview, and two buttons (open the website; go to new enquiries with the count).
- A row of four stat cards, each a large number with a label and a small detail line, each clickable through to the relevant screen. The one that needs attention is outlined.
- "Quick actions": a grid of the six things editors do most often, each with an icon, a title and a three-word description.
- A side panel listing what is coming up next (in the reference, upcoming events with date badges).
- "Website content": every section of the site with a count of its items, so the editor sees the whole site at a glance.

List screens (for example, hero slides):
- Small section label, big serif page title, and one helpful sentence: "Click a title to edit it with a live preview. Use the Visible switch to hide something without deleting it."
- A toolbar with search, a filter, a "Reorder" button and a solid "New ..." button.
- A table with thumbnail, title, a truncated summary, last updated date, a Visible on/off switch, an Edit button and a delete icon.
- A footer line with the count and a reassurance: hidden items are not shown on the website and nothing is deleted.

Editor screens (for example, a news story or the home page):
- Breadcrumbs, a big title, a "Visible" badge, "Last saved" with date and time, and "Hide preview" and "View on site" buttons.
- Two columns. Left: the form, split into cards that each have an icon, a title and a plain-language subtitle: "Content: the words visitors read", "Images & files: photos are resized automatically", "Where it appears: the page or group this belongs to", "Publishing: visibility and position on the website".
- Right: a live preview of the real public page that updates as you type, with Desktop and Mobile toggles, a refresh button and a full-screen button.
- Fields have hints under them, for example under the URL slug: "Used in the page address. Generated from the title; letters, numbers and hyphens only." Image fields show the recommended size and shape and where the image will appear, and accept drag and drop.
- A small formatting toolbar on long text fields: bold, italic, two heading levels, paragraph, bullet list, numbered list, link, clear.
- A sticky bar at the bottom with the save button, an "All changes saved" status, and a "Ctrl S to save" hint.

Other screens:
- Enquiries inbox: messages from the website's forms, with New, Contacted and All tabs, a search box, and each enquiry showing name, time, and one-tap links to call, WhatsApp or email, plus an Open button.
- Bulk photo upload: choose an album, drop many photos at once, with the recommended size stated.
- Site visibility: three clear modes with a sentence each. Online (everyone can see the site), Admin preview only (only browsers signed in to the admin can see it; everyone else sees an "under development" page), and Offline. It shows the current mode, who changed it and when.
- Content review: a list of records that still hold sample or placeholder text, or contact details that need confirming, each with Open and "Mark reviewed" buttons.

## What to build for BFL

Bring all of the patterns above into the BFL admin, adapted to BFL's content (Home, About, Sectors, Leadership, Gallery, News, Downloads, Contact, Pages and SEO, Account):

1. The split sign-in page.
2. The shell: grouped collapsible sidebar, top bar, "View website", user menu, and a real command palette on Ctrl K (and a visible search button for touch) that jumps to any section, any individual item, or any action such as "New news story".
3. The dashboard: welcome banner, stat cards, quick actions, a "needs attention" panel, and the site content overview with counts.
4. Shared list and editor patterns as reusable components, then move the existing step 5 editors onto them: searchable lists with thumbnails, Visible switches, reorder and "New"; and the two-column editor with grouped cards, hints, sticky save bar and Ctrl S.
5. Live preview in the editor. It must show the real public page with the unsaved values, at desktop and mobile widths, without publishing anything until Save is pressed. Choose the approach from the Next.js 16 docs (draft mode or an equivalent) and keep it behind the admin session so unsaved content is never reachable by the public.
6. An enquiries inbox. The public contact form currently opens the visitor's email app. Change it to save the enquiry to the database and show it in the inbox with New and Contacted states and call, WhatsApp and email links, while keeping a graceful fallback if saving fails. Protect the public form against spam (rate limiting and a honeypot at minimum) and validate on the server. Enquiries contain personal details, so they must only ever be readable by a signed-in admin.
7. Site visibility with the three modes. This replaces the environment-variable noindex switch for demos: in "Admin preview only", visitors see a branded "site under development" page and search engines are told not to index.
8. Content review: flag every item that still holds sample content (the sample photos, sample news and downloads, the education placeholder, and anything listed in `docs/TODO-for-BFL.md`) so the director can work through them and mark each as reviewed. Show the count on the dashboard.

Then go further than the reference. These are the "and more":

9. Undo and history. Keep the existing "Undo last change" and "Restore original", and add a simple version history per item: who saved, when, and a one-click restore of any of the last several versions.
10. Activity log: a readable timeline of what changed and when, linked from the dashboard.
11. A media library: every uploaded image in one place, reusable across the site, showing where each is used, with a required description and a focal point or crop so photos are framed properly in cards and banners. (This is part of the uploads step that is still to be built, so design them together.)
12. Search preview: on any item with SEO fields, show how it will look as a Google result and as a shared link card, updating as the editor types, with length guidance.
13. A launch checklist on the dashboard: missing photos, unreviewed sample content, empty SEO fields, site still in preview mode. Each line links to where it is fixed, and the list empties as work is done.
14. Guidance built in: a first-visit welcome that points out the three things an editor needs to know, and a short help line on every screen in everyday language.
15. Autosave of drafts in the browser, so a closed tab or dropped connection never loses typing, with a clear "unsaved changes restored" notice.

For long text (news stories and other body copy), offer the small formatting toolbar, but store the content as structured blocks (heading, paragraph, list, link), not as HTML, and render it through components. The rule from the original brief stands: admin input must never be able to inject markup or scripts into the public site.

## Look and feel

- BFL brand throughout: navy sidebar and banners, gold as the accent and the active marker, the site's display font for big titles and numerals, a warm off-white work surface with white rounded cards and soft shadows.
- Confident and calm. Big clear page titles, generous spacing, one obvious primary action per screen, destructive actions quiet and always confirmed.
- Small, purposeful motion: the sidebar groups, the save confirmation, the preview updating, the stat numbers counting up once. Respect reduced-motion settings.
- Empty states that help: when a list is empty, say what it is for and offer the button to add the first item.
- It must work properly at every size from a 320 px phone to a 1920 px desktop. On small screens the sidebar becomes a drawer, tables become stacked cards, the live preview moves behind a "Preview" toggle rather than being squeezed, and the save bar stays reachable with the thumb. Check each screen at 320, 390, 768, 1024, 1440 and 1920 px.
- Keyboard and screen-reader accessible to the same standard as the public site, including the command palette, switches, reorder and dialogs. Reordering needs a non-drag alternative.

## How to work

1. Read the code and the remaining steps of the original admin plan. Then give me a plan that covers: how this redesign fits with the unfinished steps (uploads, news and downloads management, SEO wiring, docs) in one sensible build order; the reusable components you will create; how live preview will work and which doc pages you based it on; any new database tables; any packages you want to add and why; and anything here you would do differently. Wait for my go-ahead.
2. Build in stages I can look at: shell and sign-in first, then the dashboard, then the shared list and editor patterns with one editor moved over as the proof, then the rest. Commit after each stage and keep the admin working throughout.
3. After each stage, check it in a browser at the six widths and test the real loop (edit, preview, save, see it on the public site, undo). Tell me what you tested and what you could not.
4. Nothing on the public site should change in appearance or speed, apart from the contact form now saving enquiries and the site-visibility modes.
5. Update `docs/admin-guide.md` and the README when the work is done.

## When you are done with each stage

Tell me what was built, show or describe how it looks on a phone and on a desktop, give the build and lint results, list what you tested and what you could not, and say what the next stage is.
