import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False during server rendering and until React has hydrated, true after.
 *
 * Admin forms keep their submit button disabled until then: a click before
 * hydration would send a plain HTML form post, which runs the action but
 * shows no result message, so the admin couldn't tell what happened.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
