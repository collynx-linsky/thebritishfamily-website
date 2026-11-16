import "server-only";
import type { Metadata } from "next";
import { pageMetadata } from "../seo";
import type { PageKey } from "./sections";
import { getCompany, getPages } from "./site-content";

/** Metadata for a standard page, from the edited page copy and company name. */
export async function metadataForPage(key: PageKey, path: string): Promise<Metadata> {
  const [pages, company] = await Promise.all([getPages(), getCompany()]);
  const page = pages[key];
  return pageMetadata({ title: page.title, description: page.description, path, siteName: company.name });
}

/** Metadata for any other page (articles, sectors) with its own title and description. */
export async function metadataFor(title: string, description: string, path: string): Promise<Metadata> {
  const company = await getCompany();
  return pageMetadata({ title, description, path, siteName: company.name });
}
