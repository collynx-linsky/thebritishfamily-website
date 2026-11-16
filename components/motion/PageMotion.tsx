import { MotionRoot } from "./MotionRoot";
import { ScrollChrome } from "./ScrollChrome";

/**
 * Wraps a page's content with scroll reveals, the scroll progress bar and
 * the back-to-top button. The page's <main> should be id="main" tabIndex={-1}
 * so back-to-top can return keyboard focus to it.
 */
export function PageMotion({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollChrome focusTargetId="main" />
      <MotionRoot>{children}</MotionRoot>
    </>
  );
}
