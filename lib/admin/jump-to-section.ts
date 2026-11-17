/**
 * Move to another section of the current admin page (for example a group in
 * Page text and SEO). Next.js keeps native history.pushState in sync with its
 * router; the hashchange event lets collapsed groups open themselves.
 */
export function jumpToSection(hash: string): void {
  window.history.pushState(null, "", `#${hash}`);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}
