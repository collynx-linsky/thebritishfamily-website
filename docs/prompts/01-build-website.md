# Build the website for The British Family Limited

## What this is and why it matters

You are building the first public website for The British Family Limited (BFL), a diversified Tanzanian company based in Dar es Salaam with four business sectors: mining and mineral processing chemical supply, construction, electronics and home appliances supply, and educational services.

The company's director commissioned this site and has already approved a homepage design. I am the developer delivering it, and this site will also be the portfolio piece I show to win future clients. So there are two audiences to satisfy:

1. Prospective BFL customers and partners (procurement officers, institutions, contractors, individual buyers), who should come away thinking this is an established, trustworthy, well-run company and should find it easy to make an enquiry.
2. Other business owners I show this to, who should see an enterprise-grade website: polished, fast, consistent, and clearly built with care.

The quality bar is the website of a serious regional industrial group, not a template. Restraint reads as more premium than decoration: strong typography, generous spacing, precise alignment, consistent components, and a few well-judged details matter more than effects.

## Read these first

Before writing any code, read:

- `AGENTS.md`. This project is on Next.js 16, which has breaking changes from earlier versions. Follow its instruction to consult the bundled docs in `node_modules/next/dist/docs/` for the conventions you use (routing, metadata, images, fonts, dynamic params, caching). Do not rely on memory of older Next.js versions.
- `docs/content.md`. The approved text, facts, contact details and image list. This is the only source of facts.
- `docs/design/option-a-homepage.html`. The homepage design the director approved. Open it and study it: the section order, colours, type, spacing and component shapes are the visual language for the whole site.
- `docs/BFL-company-profile.pdf`. The original company profile, for tone and to check anything in `content.md`.

## What is already in place

- Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, ESLint. Dependencies are installed. `app/layout.tsx`, `app/page.tsx` and `app/globals.css` are still the default starter files and should be replaced.
- Empty folders ready for use: `app/about`, `app/sectors/[slug]`, `app/leadership`, `app/contact`, `components`, `lib`.
- Images in `public/images/` (listed in `docs/content.md`).
- No git repository yet. Run `git init` and commit at sensible milestones so I have a clean history.

Stay on this stack. Do not add a UI kit, a CMS, a database or a CSS framework other than Tailwind. Add a dependency only when it clearly earns its place, and tell me why.

## Design direction

The approved design is "light and open": white backgrounds, navy and gold from the BFL logo, photo hero under a navy overlay, cards that overlap the hero, round fact counters, and sector cards with icon chips.

Design tokens (define them once as Tailwind theme variables and use them everywhere, so no raw hex values are scattered through components):

| Token | Value | Use |
| --- | --- | --- |
| Navy | `#1E3A6E` | Primary brand colour, headings, dark sections |
| Navy deep | `#14274D` | Footer, hover states on navy |
| Navy soft | `#284A87` | Cards on navy sections |
| Gold | `#F7A529` | Accent, primary buttons, highlights (never as text on white) |
| Gold deep | `#C77700` | Large gold-toned text on light backgrounds |
| Amber ink | `#8A5200` | Small uppercase labels on light backgrounds |
| Ink | `#14213D` | Body text on gold, darkest text |
| Muted | `#46536B` | Body copy on white |
| Mist | `#F3F6FB` | Alternate section background |
| Line | `#E3E8F1` | Borders and dividers |

Typography: Archivo (600, 700, 800) for headings and numerals, Inter for body, both loaded through `next/font`. Headings are tight (line-height near 1.1), body is comfortable (1.6).

The homepage should match the approved design closely. You may refine it where it makes the result better (spacing rhythm, hover and focus states, responsive behaviour), but the director should recognise it as what he approved. The inner pages have no approved design, so design them yourself in the same language, and give each one a compact page banner rather than repeating the full hero.

What "enterprise-grade" means here:

- One consistent system: the same container width, section spacing scale, button styles, card radii and shadow across every page.
- Purposeful motion only: subtle reveal-on-scroll for sections, smooth hover transitions on cards and buttons, a sticky header that stays out of the way. Nothing that bounces, loops or delays reading. Respect `prefers-reduced-motion`.
- Every interactive element has visible hover and keyboard-focus states.
- It looks deliberate at every width from 360 px phones to wide desktops, with a proper mobile menu.

Because the available photos are low resolution, never stretch them into something that looks blurry. Use them under overlays, at modest sizes, or cropped inside cards. Educational services has no photo: design a branded panel for it (navy or mist with the sector icon) that looks intentional rather than like a missing image.

## Pages

Build these routes:

- `/` Home: hero, overlapping cards, about summary, the four sectors, key facts, mission and vision, leadership preview, call to action.
- `/about`: introduction, mission, vision, philosophy, values, and how the company works.
- `/sectors`: overview of all four sectors.
- `/sectors/[slug]`: one statically generated page per sector, with a way to enquire about that sector and links to the others.
- `/leadership`: both directors with photo, role and full bio.
- `/contact`: address, both phone numbers, emails, and an enquiry form (name, email, phone, sector of interest, message).
- A branded 404 page.

Shared across all pages: a top bar with address, email and phone; a sticky header with logo, navigation with the current page marked, and a "Request a quote" button; a footer with company blurb, page links, sector links and contact details.

Contact form: there is no backend or email service yet. Make the form work without one by opening the visitor's email app with the enquiry pre-filled to the general inquiries address, with a clear on-page confirmation. Add a WhatsApp button using the first phone number as a second way to reach the company. Isolate the submit logic so I can later swap in a route handler or a form service without touching the form UI.

## Content rules

This is a real company's public website, so accuracy matters more than fullness.

- Use only the facts in `docs/content.md`. Do not invent statistics, project counts, clients, testimonials, awards, certifications, product lists, prices, office hours or social media links. A fabricated claim on a company's website can embarrass the director and damage my credibility, so a shorter honest page is always better than a fuller invented one.
- You may rewrite and tighten the profile's wording for the web (headlines, short summaries, calls to action), as long as the meaning stays true to the source. Keep the mission and vision statements complete on the About page.
- The only numeric facts available are: established 2019, four sectors, headquartered in Dar es Salaam, two directors. Use those for the fact counters.
- Where real information is needed but missing (for example specific products per sector, or an education photo), do not put placeholder text on the page. Design the page to look complete without it, and record the gap in `docs/TODO-for-BFL.md` so I can ask the director.
- Keep all site content in one typed module in `lib/` (company details, navigation, sectors, leaders), so text can be edited in one place and no copy is hard-coded inside components.
- Use British English spelling in new copy.

## Engineering standards

- Server components by default. Use client components only where interaction requires it (mobile menu, form, scroll reveal).
- Small, reusable, typed components in `components/`. No duplicated markup between pages for things like section headings, sector cards, leader cards and the call-to-action band.
- `next/image` for every image with correct `sizes` and meaningful alt text (empty alt for decorative images). `next/link` for internal navigation.
- SEO: unique title and description per page through the Metadata API, Open Graph and Twitter tags, `sitemap.ts`, `robots.ts`, a favicon and app icon from the logo, and Organization JSON-LD on the home page using the real contact details. The domain is not registered yet, so read the site URL from an environment variable with a sensible local default and note it in the README.
- Accessibility to WCAG AA: semantic landmarks and heading order, a skip link, labelled form fields, 4.5:1 text contrast (gold text on white fails, which is why the darker gold tokens exist), touch targets of at least 44 px, and full keyboard operability including the mobile menu.
- Performance: the pages should be statically generated, ship very little client JavaScript, and cause no layout shift.
- `npm run build` and `npm run lint` must both pass with no errors and no warnings you introduced.

## How to work

1. Read the files listed above, then give me a short plan: the component list, the content module shape, and anything in the brief you would do differently and why. Then proceed without waiting, unless you have a question that would change the build.
2. Build in this order and commit after each step: design tokens and global styles; layout shell (top bar, header, mobile menu, footer); home page; inner pages; contact form; SEO files and 404; polish pass.
3. After each major step, run the dev server and check the result in a browser at phone (390 px), tablet (768 px) and desktop (1440 px) widths. If you have a browser or screenshot tool available, use it and look critically at what you see; if not, tell me which pages to check.
4. Finish with a polish pass over the whole site looking specifically for: inconsistent spacing between sections, text that wraps badly, images that look blurry or badly cropped, missing hover or focus states, and anything that looks like a template.
5. Replace the starter `README.md` with a short one covering how to run, build and deploy the site, where to edit content, and how to connect a real form backend later.

## When you are done

Tell me:

- What you built, page by page, in a few lines.
- Confirmation that `npm run build` and `npm run lint` pass, with the route list from the build output.
- Anything you could not verify yourself.
- What is in `docs/TODO-for-BFL.md`: the real content and photos I need to collect from the director to finish the site.
