# Information and photos needed from BFL

The site was built only from facts in `docs/content.md` (the company profile). Each page looks complete as it stands, but the items below would make it stronger. Nothing here has been guessed or added as a placeholder.

When an answer comes back, update `lib/site.ts`; most items need no component changes.

## Home page photo placeholders

The home page shows branded navy/gold tiles marked "Photo coming soon" or "Project photo coming soon" wherever a real photo is still needed. Each is defined in `lib/home-media.ts` (gallery) or comes from the sector having no `image` in `lib/site.ts`. Replacing a placeholder needs only a new photo file and a one-line change there.

| # | Where on the home page | Label shown | Photo needed |
| --- | --- | --- | --- |
| P1 | Sectors grid, "Educational services" card | Photo coming soon | Educational services in action (training, classroom or partner institution, with permission) |
| P2 | Sector strip (scrolling band), "Educational services" thumbnail | Photo coming soon (icon tile) | Same photo as P1 works here |
| P3 | "Our work in pictures" gallery, tile 2 | Photo coming soon (Educational services) | Same photo as P1, or a second education photo |
| P4 | "Our work in pictures" gallery, tile 4 | Project photo coming soon (Mining and chemicals) | A real BFL mining or chemical supply site, delivery or product photo |
| P5 | "Our work in pictures" gallery, tile 6 | Project photo coming soon (Construction) | A real BFL construction project photo |

The home page also reuses the existing photos (skyline, mining, construction, electronics) in the hero slideshow, the strip and the gallery. Because they are low resolution, they are kept small or under overlays. Higher-resolution originals (see item 2 below) would make the slideshow noticeably sharper. A real BFL photo for each sector would also let the gallery show the company's own work rather than generic scenes.

## Photos

1. **Educational services photo.** There is no photo for this sector, so the site shows a branded navy panel instead. A real photo (a training session, classroom, or a partner institution, used with permission) would replace it everywhere. In `lib/site.ts`, set `image` on the `educational-services` sector.
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
