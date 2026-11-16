import type { Company } from "./content/site-content";
import type { NewsArticle } from "./content/types";
import { absoluteUrl } from "./seo";
import { company as defaults, type Sector } from "./site";

/** The logo stays in code (design, not content). */
const logoUrl = () => absoluteUrl(defaults.logo.src);

/** schema.org Article for a news page */
export function articleJsonLd(article: NewsArticle, company: Pick<Company, "name">) {
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
      logo: { "@type": "ImageObject", url: logoUrl() },
    },
  };
}

/** schema.org Organization for the home page, from the edited company details. */
export function organizationJsonLd(company: Company, sectors: Sector[]) {
  const { address } = company;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${absoluteUrl("/")}#organization`,
    name: company.name,
    alternateName: company.alternateNames,
    url: absoluteUrl("/"),
    logo: logoUrl(),
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
      areaServed: address.countryCode,
    })),
    knowsAbout: sectors.map((s) => s.name),
  };
}
