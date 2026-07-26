import audit from "@/lib/data/oravik-loop-audit.json";

// One cache-busted address for the map and GPX download. Resolving from the
// current Day page preserves the GitHub Pages basePath without hard-coding it.
export const ORAVIK_ROUTE_VERSION = "2026-07-26-1";
export const ORAVIK_AUDIT = audit;

export function getOravikRouteUrl(): string {
  const path = "routes/oravik-fell-loop.gpx";
  if (typeof window === "undefined") return `/${path}?v=${ORAVIK_ROUTE_VERSION}`;
  const url = new URL(`../../${path}`, window.location.href);
  url.searchParams.set("v", ORAVIK_ROUTE_VERSION);
  return url.href;
}
