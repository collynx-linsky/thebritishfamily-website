import type { NewsArticle } from "./content/types";
import { absoluteUrl } from "./seo";
import { company, sectors } from "./site";

/** schema.org Article for a news page */
export function articleJsonLd(article: NewsArticle) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: absoluteUrl(article.image.src),
    datePublished: article.publishedAt,
    mainEntityOfPage: absoluteUrl(`/news/${article.slug}`),
    author: { "@type": "Organization", name: company.name, url: absoluteUrl("/") },
    publisher: {
      "@type": "Organization",
      name: company.name,
      logo: { "@type": "ImageObject", url: absoluteUrl(company.logo.src) },
    },
  };
}

/** schema.org Organization for the home page, using only known facts. */
export function organizationJsonLd() {
  const { address } = company;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${absoluteUrl("/")}#organization`,
    name: company.name,
    alternateName: company.alternateNames,
    url: absoluteUrl("/"),
    logo: absoluteUrl(company.logo.src),
    description: company.description,
    foundingDate: String(company.established),
    email: company.email,
    telephone: company.phones.map((p) => `+${p.e164}`),
    address: {
      "@type": "PostalAddress",
      postOfficeBoxNumber: address.poBox.replace(/\D/g, ""),
      streetAddress: address.street,
      addressLocality: address.city,
      addressCountry: address.countryCode,
    },
    contactPoint: company.phones.map((p) => ({
      "@type": "ContactPoint",
      telephone: `+${p.e164}`,
      email: company.email,
      contactType: "customer service",
      areaServed: "TZ",
    })),
    knowsAbout: sectors.map((s) => s.name),
  };
}
