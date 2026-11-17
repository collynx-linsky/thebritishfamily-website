"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const greetingNow = () => {
  const h = new Date().getHours();
  return h >= 5 && h < 12 ? "Good morning" : h >= 12 && h < 17 ? "Good afternoon" : h >= 17 && h < 22 ? "Good evening" : "Hello";
};

/**
 * "Good morning" / "Good afternoon" / "Good evening", from the device's own
 * clock (so it is right in Tanzania). The server renders a neutral greeting
 * and the browser fills in the time of day after loading.
 */
export function Greeting() {
  const greeting = useSyncExternalStore(subscribe, greetingNow, () => "Hello");
  return <>{greeting}</>;
}
