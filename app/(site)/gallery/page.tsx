import type { Metadata } from "next";
import { CtaBand } from "@/components/CtaBand";
import { GalleryGrid, type GalleryGridPhoto } from "@/components/motion/GalleryGrid";
import { PageMotion } from "@/components/motion/PageMotion";
import { PageBanner } from "@/components/PageBanner";
import { ButtonLink, Section } from "@/components/ui";
import { metadataForPage } from "@/lib/content/metadata";
import { getGallery, getPages, getSectors } from "@/lib/content/site-content";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForPage("gallery", "/gallery");
}

export default async function GalleryPage() {
  const [pages, sectors, gallery] = await Promise.all([getPages(), getSectors(), getGallery()]);
  const page = pages.gallery;

  // Plain, serialisable data for the client component
  const photos: GalleryGridPhoto[] = gallery.map(({ image, sectorSlug }) => {
    const sector = sectors.find((s) => s.slug === sectorSlug);
    return {
      src: image.src,
      width: image.width,
      height: image.height,
      alt: image.alt,
      filter: sector?.slug ?? null,
      label: sector?.shortName ?? null,
      icon: sector?.icon ?? null,
    };
  });

  const filters = [
    { value: "all", label: "All photos", count: photos.length },
    ...sectors.map((s) => ({
      value: s.slug,
      label: s.shortName,
      count: photos.filter((p) => p.filter === s.slug).length,
    })),
  ];
  return (
    <main id="main" tabIndex={-1} className="outline-none">
      <PageMotion>
        <PageBanner
          eyebrow={page.eyebrow}
          title={page.heading}
          lead={page.lead}
          crumbs={[{ label: "Gallery" }]}
          image={page.bannerImage}
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
