import audit from "@/lib/data/oravik-loop-audit.json";

// One cache-busted address for the map and GPX download. Resolving from the
// current Day page preserves the GitHub Pages basePath without hard-coding it.
export const ORAVIK_ROUTE_VERSION = "2026-07-26-2";
export const ORAVIK_AUDIT = audit;

export function getOravikRouteUrl(): string {
  const path = "routes/oravik-fell-loop.gpx";
  if (typeof window === "undefined") return `/${path}?v=${ORAVIK_ROUTE_VERSION}`;

  // `../../routes` escapes a GitHub Pages basePath when the map is viewed at
  // /<repo>/day/2/. Derive the prefix before /day/ instead, so this resolves
  // to /routes locally and /<repo>/routes in the deployed static export.
  const dayIndex = window.location.pathname.indexOf("/day/");
  const basePath = dayIndex === -1 ? "" : window.location.pathname.slice(0, dayIndex);
  const url = new URL(`${basePath}/${path}`, window.location.origin);
  url.searchParams.set("v", ORAVIK_ROUTE_VERSION);
  return url.href;
}
