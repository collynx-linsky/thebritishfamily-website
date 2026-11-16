import type { Metadata } from "next";
import { CtaBand } from "@/components/CtaBand";
import { GalleryGrid, type GalleryGridPhoto } from "@/components/motion/GalleryGrid";
import { PageMotion } from "@/components/motion/PageMotion";
import { PageBanner } from "@/components/PageBanner";
import { ButtonLink, Section } from "@/components/ui";
import { galleryPhotos } from "@/lib/media";
import { bannerImages } from "@/lib/samples";
import { pageMetadata } from "@/lib/seo";
import { pages, sectors } from "@/lib/site";

const page = pages.gallery;

export const metadata: Metadata = pageMetadata({
  title: page.title,
  description: page.description,
  path: "/gallery",
});

// Plain, serialisable data for the client component
const photos: GalleryGridPhoto[] = galleryPhotos.map(({ image, sector }) => ({
  src: image.src,
  width: image.width,
  height: image.height,
  alt: image.alt,
  filter: sector?.slug ?? null,
  label: sector?.shortName ?? null,
  icon: sector?.icon ?? null,
}));

const filters = [
  { value: "all", label: "All photos", count: photos.length },
  ...sectors.map((s) => ({
    value: s.slug,
    label: s.shortName,
    count: photos.filter((p) => p.filter === s.slug).length,
  })),
];

export default function GalleryPage() {
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageMotion>
        <PageBanner
          eyebrow={page.eyebrow}
          title={page.heading}
          lead={page.lead}
          crumbs={[{ label: "Gallery" }]}
          image={bannerImages.gallery}
        >
          <div className="mt-2 flex flex-wrap gap-3">
            <ButtonLink href="/sectors" fx>
              Explore our sectors
            </ButtonLink>
          </div>
        </PageBanner>

        <Section tone="mist" labelledBy="gallery-heading">
          <h2 id="gallery-heading" className="sr-only">
            Photos
          </h2>
          <GalleryGrid photos={photos} filters={filters} />
        </Section>

        <CtaBand fx />
      </PageMotion>
    </main>
  );
}
