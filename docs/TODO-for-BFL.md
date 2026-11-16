# Information and photos needed from BFL

The site was built only from facts in `docs/content.md` (the company profile). Each page looks complete as it stands, but the items below would make it stronger. Nothing here has been guessed or added as a placeholder.

When an answer comes back, update `lib/site.ts`; most items need no component changes.

## News and downloads (to review before launch)

**News.** The News section starts with three posts marked `sample: true` in `lib/defaults/news.ts`: "Welcome to our new website", "Our four core sectors at a glance" and "Our mission, vision and values". They contain no invented events, only facts from the company profile. They do carry a placeholder publication date (16 November 2026), so before launch:

1. Confirm the launch date for the "Welcome" post, or remove it.
2. Ask the director for real news to publish: contracts or projects BFL is happy to name, new products or services, partnerships, exhibitions, community or education programmes. Each needs a title, a date, a short summary, the text, and ideally a photo.
3. If there is no real news at launch, consider keeping only the "Welcome" post. With no posts at all, the News page shows a designed "No news yet" message and the home page hides its news section automatically.

**Downloads.** Currently two real documents: the company profile PDF and a contact card generated from the site's contact details.

4. **Company profile PDF: please confirm it can be public.** It is a copy of `docs/BFL-company-profile.pdf`, now downloadable from `/downloads/bfl-company-profile.pdf`. I could not view its pages here (no PDF viewer available), so the director should check that all 8 pages are fit for public release.
5. **The PDF's hidden metadata** lists the designer's name and handle in its "Author" field, which anyone can see in the file's properties. If that should not be public, re-export the PDF from Canva without it (or edit the document properties) and replace the file.
6. **Forms to collect.** The "Forms" and "Brochures and guides" categories show a designed "coming soon" message until documents exist. Ask the director which forms visitors need, for example a supplier or vendor registration form, a quotation or order request form, or education programme application forms, plus any sector brochures or product lists. Supply them as PDF files.

Until the admin panel exists, adding a document means placing the file in `public/downloads/` and adding an entry to `lib/defaults/downloads.ts`. After that, the administrator will upload documents and publish news from the panel.

## Sample photos to replace before launch (important)

To make the site look complete during development, 17 **free stock sample photos** from Unsplash are used across every page. They are free for commercial use under the Unsplash License, but they show **other companies' sites and people, not BFL's own work**. They must be replaced with real BFL photos (or removed) before the site goes public. Otherwise visitors could take them for BFL's projects and staff.

All samples live in `public/images/samples/` and are defined in one file, `lib/samples.ts`. Real photos always take priority: setting `image` on a sector in `lib/site.ts` replaces that sector's sample everywhere. To remove the samples entirely, delete `lib/samples.ts` and fix the imports TypeScript reports.

| Sample file | Where it appears | Real photo needed |
| --- | --- | --- |
| `education-teacher.jpg` | Educational services photo on the home page, sector cards, the strip, the hero slideshow, the education sector page | Educational services in action (training, classroom or partner institution, with permission) |
| `education-books.jpg`, `education-classroom.jpg` | Education sector page photo row, Gallery | More education photos |
| `mining-open-pit-aerial.jpg` | Gallery page banner, About (behind mission), mining sector page and Sectors thumbnails, Gallery | A real BFL mining site |
| `mining-truck-road.jpg`, `mining-haul-truck.jpg` | Mining sector page photo row, Gallery | Real BFL mining operations or deliveries |
| `chem-lab-bench.jpg`, `chem-test-tube.jpg` | Home gallery, mining sector page, Sectors thumbnails, Gallery | Real BFL mineral processing chemical products, storage or lab work |
| `construction-crane.jpg` | Sectors page banner, About (philosophy), home slideshow, Gallery | A real BFL construction project |
| `construction-bricks.jpg` | Contact page banner, home gallery, construction pages, Gallery | A real BFL construction site |
| `construction-worker.jpg` | Leadership page banner, construction pages, Gallery | BFL team on site |
| `construction-frame.jpg` | Construction sector page photo row, Gallery | A real BFL construction project |
| `appliances-store.jpg`, `appliances-stoves-shop.jpg` | Home gallery, electronics pages, Gallery | BFL's electronics and appliances stock, store or deliveries |
| `team-meeting.jpg` | About page banner and introduction, Leadership values band, Gallery | BFL office or team photo |
| `logistics-boxes.jpg` | About ("How we work"), Contact closing band, Gallery | BFL deliveries or warehouse |
| `logistics-forklift.jpg` | Gallery | BFL deliveries or warehouse |

Credits (optional under the licence) are recorded in `lib/samples.ts`.

The existing real photos (skyline, mining, construction, electronics) are low resolution, so they are kept small or under overlays. Higher-resolution originals (see item 2 below) would make the slideshow and banners noticeably sharper.

## Photos

1. **Educational services photo.** There is no real photo for this sector, so the site currently shows a stock sample (see above). A real photo (a training session, classroom, or a partner institution, used with permission) would replace it everywhere. In `lib/site.ts`, set `image` on the `educational-services` sector.
2. **Higher-resolution photos of all four sectors.** The current images come from the PDF and are 480 to 740 px wide, so they are only shown small or under overlays. Original photos at least 1600 px wide, ideally of BFL's own sites, people and stock rather than generic scenes, would allow larger, sharper images.
3. **Higher-resolution director portraits.** The portraits are about 290 px wide, so they are capped at 220 px on the site. Originals or new portraits on a neutral background would look sharper and more consistent.
4. **Logo as a vector file (SVG or PDF).** The logo is a 600 px PNG. A vector version would give a crisper header, favicon and share image.

## Content

5. **Products and services per sector.** For example: which mineral processing chemicals are supplied, what kinds of construction work are undertaken, which electronics and appliance lines are stocked, and which educational programmes are offered. This is the biggest gap: the sector pages currently describe each sector only in the general terms used in the profile.
6. **Past projects or clients.** Even two or three examples per sector (with permission to name them) would build trust. Only include what the director is happy to publish.
7. **Office hours.** Not listed anywhere yet.
8. **Map location.** A pin or coordinates for the Mwenge Street, Bagamoyo Road office would allow a map on the contact page.
9. **Registration and licences.** Company registration number, TIN, or sector licences and certifications, if the director wants them shown.
10. **Social media accounts.** If BFL has any, they can be added to the footer.
11. **Company name on the site.** The profile uses both "The British Family Limited" and "The British Family Company Limited". The site uses "The British Family Limited" and lists the other as an alternative name for search engines. Please confirm which is the registered legal name.
12. **Which WhatsApp number to use.** The WhatsApp button uses +255 655 701 421 (the first number). Confirm that this number is on WhatsApp and is monitored.

## Before launch

13. **Domain name.** Not registered yet. Once it is, set `NEXT_PUBLIC_SITE_URL` in the hosting environment (see README) so canonical URLs, the sitemap and share previews use it.
14. **A business email on the domain** (for example `info@` the new domain) would look more established than the current Gmail address. If it changes, update `company.email` in `lib/site.ts`.
15. **Form delivery.** The enquiry form currently opens the visitor's email app with the message filled in. To receive enquiries directly, choose a form backend or email service (see README, "Connecting a form backend").
