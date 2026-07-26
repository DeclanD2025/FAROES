// Single source of truth for the trip's mobile-data plan. Keep itinerary copy
// and operational instructions tied to these values rather than duplicating them.

export const CONNECTIVITY_PLAN = {
  provider: "Nomad",
  destination: "Faroe Islands",
  allowanceGb: 10,
  validityDays: 30,
  price: "US$21",
  network: "Nema (VODAFONE FO)",
  purchaseUrl: "https://www.nomadesim.com/faroe-islands-eSIM",
  checkedAt: "26 July 2026 · 20:20 BST",
  activation: "Install it before travel. The plan starts when the eSIM first connects to its supported Faroe network; installation itself does not start the plan.",
  giffgaffWarning: "The Faroe Islands are not included in giffgaff's normal EU roaming allowance. Do not use giffgaff mobile data there.",
} as const;

export const PRE_DEPARTURE_ESIM_STEPS = [
  "Buy the Nomad Faroe Islands 10 GB / 30-day eSIM while on reliable Wi‑Fi in Scotland.",
  "Install it: open the Nomad instructions or QR code, then Settings → Mobile Service → Add eSIM.",
  "Label the line “Faroes Data”. Keep it switched off until landing; do not delete it after installation.",
  "Download offline maps, ferry/bus tickets, this trip plan and Airbnb details before leaving Wi‑Fi.",
] as const;

export const ARRIVAL_CONNECTIVITY_STEPS = [
  "Settings → Mobile Service → Mobile Data → Faroes Data.",
  "On the giffgaff line: Data Roaming OFF.",
  "On Faroes Data: Data Roaming ON. Set Mobile Data Switching OFF.",
  "Wait for Nema / VODAFONE FO, then open a small webpage or message to test it.",
] as const;

export const OFFLINE_FALLBACK = [
  "GPS positioning still works without mobile signal; it does not require a data connection.",
  "Find My location sharing needs an internet path. Without signal, friends may only see your last known location.",
  "An Apple Watch can record an offline GPS workout, but a GPS-only watch cannot independently send a live location or emergency message.",
  "If signal disappears on a hike: stop, conserve battery, use the downloaded route and GPS position, then move only to a known safe point. Call 112 if needed.",
] as const;

export const DATA_BUDGET = [
  { label: "Navigation & transport", amount: "~2 GB", note: "Maps, ferry/bus updates and short route checks" },
  { label: "Messages & safety", amount: "~1 GB", note: "Airbnb, Find My and essential calls/messages" },
  { label: "Weather & browsing", amount: "~2 GB", note: "Keep video autoplay and cloud photo backup off" },
  { label: "Reserve", amount: "~5 GB", note: "Delay days, disrupted transport and hotspot contingency" },
] as const;
