// =============================================================================
//   Faroe Islands · trip data
//   This is the single source of truth for the trip journal. It is plain
//   TypeScript so it ships baked-in to the static export — no API layer, no
//   database, no JSON middleware. Every section read by the UI is typed here.
// =============================================================================

export type DateLabel = string;            // e.g. "Mon 27 Jul"
export type ISODate = string;              // e.g. "2026-07-27"

export const TRIP = {
  week: "FAROE ISLANDS",
  dates: "27 Jul — 1 Aug 2026",
  iso: { start: "2026-07-27", end: "2026-08-01" } as const,
  // The countdown target. The hook reads this on the client; the prerendered
  // HTML carries no countdown so hydration cannot mismatch.
  countdownTarget: "2026-07-27T17:00:00Z" as const,
  // The journey, one line, repeated in the hero and route composition.
  route: "Edinburgh → Vágar → Tórshavn → Krambatangi → Øravík → Sørvágur → LGW → STN → GLA",
  // The fixture block lifted onto the cover and into the match day visual.
  fixture: {
    competition: "UEFA Conference League · Qualifying Round 1",
    home: "HB Tórshavn",
    away: "Motherwell",
    kickoff: "Thu 30 Jul · 18:00",
    stadium: "Tórsvøllur · Gundadalur · Tórshavn",
  },
  base: "Øravík, Suðuroy",
  baseLastNight: "Guesthouse Hugo · Sørvágur",
  travellers: "Two · Declan + guest",
} as const;

// -----------------------------------------------------------------------------
// Bookings we already confirmed. The booking codes are kept here so the
// packing/checklist pulls them through without anyone needing to retype them.
// -----------------------------------------------------------------------------
export const BOOKINGS = {
  airbnb: {
    label: "Øravík guesthouse",
    nights: 4,
    address: "Við á 7, Øravík 827, Suðuroy",
    pricePerTwo: "£232/night · £928 total",
    listing: "https://www.airbnb.com/l/zdrMEniF",
  },
  hugo: {
    label: "Guesthouse Hugo",
    nights: 1,
    address: "2 Bakkavegur, 380 Sørvágur",
    confirmation: "5924180270",
    // PIN concealed — never rendered in plain text on public pages.
    // Check your booking confirmation email for the access code.
    pin: "● ● ● ●",
    phone: "+298 232101",
  },
  flights: {
    outbound: { code: "RC 415", carrier: "Atlantic Airways", dep: "EDI 17:10", arr: "FAE 18:35", date: "Mon 27 Jul 2026" },
    return:   { code: "RC 416", carrier: "Atlantic Airways", dep: "FAE 09:10", arr: "LGW 11:25", date: "Sat 1 Aug 2026" },
    onward:  { code: "RK 330", carrier: "Ryanair UK",        dep: "STN 19:35", arr: "GLA 21:10", date: "Sat 1 Aug 2026" },
  },
} as const;

// -----------------------------------------------------------------------------
// Six bespoke day chapters. Each day is its own object because the editorial
// brief explicitly forbids six identical cards. We compose the layout from
// fields, not from a generic component — the page reads these as JSX.
// Day 1 (Mon 27 Jul) · Day 2 (Tue 28 Jul) · Day 3 (Wed 29 Jul) ·
// Day 4 (Thu 30 Jul · match) · Day 5 (Fri 31 Jul) · Day 6 (Sat 1 Aug).
// -----------------------------------------------------------------------------

export type DayStage =
  | { kind: "flight"; ref: string; dep: string; arr: string; note?: string }
  | { kind: "ferry";  ref: string; dep: string; arr: string; note?: string; critical?: boolean }
  | { kind: "bus";    ref: string; dep: string; arr: string; note?: string }
  | { kind: "anchor"; time: string; title: string; detail: string };

export interface DayPlan {
  num: string;            // "01"
  date: DateLabel;
  weekday: string;        // "Tuesday"
  iso: ISODate;
  chapter: string;        // editorial title, e.g. "Into the North Atlantic"
  location: string;       // single location line
  narrative: string;      // one paragraph, ~28–42 words
  stages: DayStage[];
  // The single thing that could disrupt the day.
  couldDisrupt: string;
  // Visual treatment choice — drives layout variation so days don't read alike.
  composition: "image-led" | "map-led" | "split-rhythm" | "match-climax" | "quiet-closing";
  // Editorial cue for the hero image — picked by the renderer.
  heroCue: { caption: string; alt: string };
}

export const DAYS: DayPlan[] = [
  {
    num: "01",
    date: "Mon 27 Jul",
    weekday: "Monday",
    iso: "2026-07-27",
    chapter: "The journey north",
    location: "Edinburgh · Vágar · Tórshavn · Øravík",
    narrative:
      "An Atlantic Airways afternoon crossing, a forty-five minute bus to the capital, then the last boat of the day slipping south through the Suðuroyarfjørður. Arrival in Øravík well after midnight.",
    stages: [
      { kind: "flight", ref: "RC 415", dep: "Edinburgh 17:10", arr: "Vágar 18:35", note: "1h 25m · direct" },
      { kind: "bus",    ref: "Bus 300", dep: "Vágar Airport 19:00", arr: "Tórshavn 19:45", note: "45 min · change for the ferry" },
      { kind: "ferry",  ref: "M/F Smyril", dep: "Tórshavn 21:15", arr: "Krambatangi 23:20", note: "2h 05m · Route 7 · pre-booked" },
      { kind: "anchor", time: "23:20", title: "Brief transfer to Øravík", detail: "Bus 700 two stops or taxi 2 km." },
    ],
    couldDisrupt: "The 21:15 is the last boat of the day. If RC 415 is held by Faroese fog, we sleep in Tórshavn.",
    composition: "image-led",
    heroCue: {
      caption: "Múlafossur, the waterfall that walks into the Atlantic.",
      alt: "Soft, misted cliff face and a long thread of water falling into ocean.",
    },
  },
  {
    num: "02",
    date: "Tue 28 Jul",
    weekday: "Tuesday",
    iso: "2026-07-28",
    chapter: "The cliffs of Suðuroy",
    location: "Øravík · Tvøroyri · Akraberg",
    narrative:
      "A whole Suðuroy day. Beinisvørð on the way south, a pint at Hotel Tvøroyri, and the twilight worth losing sleep for. Thursday is the match — today is the breathing room.",
    stages: [
      { kind: "anchor", time: "10:00", title: "Bus 700 to Hov village", detail: "Walk the chieftain-mound loop; quick orientation." },
      { kind: "anchor", time: "13:30", title: "Hvannhagi ridge walk", detail: "2–3 hrs · orange posts · cliff-edge lake facing Stóra Dímun." },
      { kind: "anchor", time: "19:00", title: "Hotel Tvøroyri · dinner", detail: "Pizzeria, dependable pint, the same locals every night." },
    ],
    couldDisrupt: "Coastal fog. If Åsmundarstakkur is in cloud, swap in Hvannhagi — the markers vanish in fog.",
    composition: "map-led",
    heroCue: {
      caption: "Beinisvørð — the cliff that lands the South Atlantic on Faroese stone.",
      alt: "A near-vertical basalt wall rising above a low green sea, with horizon haze.",
    },
  },
  {
    num: "03",
    date: "Wed 29 Jul",
    weekday: "Wednesday",
    iso: "2026-07-29",
    chapter: "A free day on Suðuroy",
    location: "Øravík · Hov · Froðba",
    narrative:
      "No fixed plan, no ferry to catch. A slow morning, a walk that doesn't have to go anywhere, and the island at its own pace. The match is tomorrow — today is for doing very little, well.",
    stages: [
      { kind: "anchor", time: "~09:00", title: "Slow start · breakfast at Við á 7", detail: "ESLA supplies, coffee, the weather window." },
      { kind: "anchor", time: "11:00", title: "Fámjin or Froðba — pick one", detail: "Bus 701 to the flag church at Fámjin, or an easy coastal walk to Froðba's basalt columns." },
      { kind: "anchor", time: "~15:00", title: "Café MorMor · late lunch", detail: "Open Wed–Fri 12–18:00. The island gem — soup and cake." },
      { kind: "anchor", time: "Evening", title: "Self-cater or Hotel Tvøroyri", detail: "No schedule. Pack and prep for tomorrow's matchday ferry." },
    ],
    couldDisrupt: "Rain. A free day is the cheapest day to lose to weather — ESLA, the guesthouse, and a book are the plan.",
    composition: "quiet-closing",
    heroCue: {
      caption: "Fámjin — where the Faroese flag was first raised.",
      alt: "A small white-walled church under a low hill, quiet in soft Atlantic light.",
    },
  },
  {
    num: "04",
    date: "Thu 30 Jul",
    weekday: "Thursday",
    iso: "2026-07-30",
    chapter: "Motherwell v HB",
    location: "Øravík · Krambatangi · Tórshavn · Tórsvøllur",
    narrative:
      "Brief up the coast, ferry across the fjord, Tinganes and a stadium that fits inside a small town. Kick-off in late-afternoon light; the last boat back is the only thing that matters afterwards.",
    stages: [
      { kind: "ferry", ref: "M/F Smyril", dep: "Krambatangi 11:30", arr: "Tórshavn 13:35", note: "Out · 2h 05m" },
      { kind: "anchor", time: "13:35–17:00", title: "Tinganes & the harbour", detail: "Old-town peninsula; pre-match at OY Brewing (5 min from the ground)." },
      { kind: "anchor", time: "18:00", title: "Kick-off · Tórsvøllur", detail: "HB Tórshavn v Motherwell · UEFA Conference League qualifying." },
      { kind: "anchor", time: "~19:50", title: "Full time · walk for the pier", detail: "Stadium to ferry terminal is ~1 km, 15–20 min on foot." },
      { kind: "ferry", ref: "M/F Smyril", dep: "Tórshavn 21:15", arr: "Krambatangi 23:20", note: "Last sailing · pad to Øravík", critical: true },
    ],
    couldDisrupt: "Miss the 21:15 and we sleep in Tórshavn. There is no Plan B after this boat.",
    composition: "match-climax",
    heroCue: {
      caption: "Tórshavn harbour on match eve — the walk to the ferry is on foot, in late-July light.",
      alt: "A small harbour town at dusk, timber rooftops and the silhouette of a ferry at the pier.",
    },
  },
  {
    num: "05",
    date: "Fri 31 Jul",
    weekday: "Friday",
    iso: "2026-07-31",
    chapter: "Walking and repositioning north",
    location: "Øravík · Tórshavn · Sørvágur",
    narrative:
      "One last ferry crossing, this time chasing the late sun towards the airport island. Guesthouse Hugo is ten minutes from the terminal — we want an easy morning, not a panicked dawn.",
    stages: [
      { kind: "ferry", ref: "M/F Smyril", dep: "Krambatangi 16:00", arr: "Tórshavn 18:05", note: "2h 05m" },
      { kind: "bus",   ref: "Bus 300", dep: "Tórshavn 18:30", arr: "Sørvágur 19:15", note: "45 min · stops at Vágar Airport en route" },
      { kind: "anchor", time: "19:30", title: "Guesthouse Hugo · check-in", detail: "Code 9432 · luggage down, no pressure to be anywhere tonight." },
    ],
    couldDisrupt: "The Friday timetable differs from Thursday's. If the 16:00 ferry is cancelled for swell, the 21:15 may still run — keep the option open.",
    composition: "split-rhythm",
    heroCue: {
      caption: "Sørvágur — the airport island seen at the end of the trip.",
      alt: "Two red-roofed timber houses facing a still fjord at late evening.",
    },
  },  {
    num: "06",
    date: "Sat 1 Aug",
    weekday: "Saturday",
    iso: "2026-08-01",
    chapter: "Homeward, via London",
    location: "Sørvágur · Vágar Airport · Gatwick · Stansted · Glasgow",
    narrative:
      "A short hop over the North Sea, then the awkwardness of a self-transfer done on purpose — Gatwick to Stansted by coach, the last leg with Glasgow's lights coming up the horizon.",
    stages: [
      { kind: "bus",   ref: "Bus 300", dep: "Hugo 07:40", arr: "Vágar Airport 07:50", note: "10 min hop · allow slack for tunnel traffic" },
      { kind: "flight", ref: "RC 416", dep: "FAE 09:10", arr: "LGW 11:25", note: "2 h 15 m" },
      { kind: "anchor", time: "13:00", title: "Self-transfer LGW → STN", detail: "National Express coach ~2h 15m direct; allow 4h+ margin." },
      { kind: "flight", ref: "RK 330", dep: "STN 19:35", arr: "GLA 21:10", note: "1 h 35 m" },
    ],
    couldDisrupt: "Faroese fog swallows the morning flight more often than you'd like. Build slack into the LGW→STN transfer for that reason too.",
    composition: "quiet-closing",
    heroCue: {
      caption: "The morning the Faroes make you leave.",
      alt: "Low cloud over an Atlantic shoreline, headlight-white fog between the hills.",
    },
  },
];

export const MATCH_FIXTURE = {
  competition: "UEFA Conference League · Qualifying Round 1",
  home: "HB Tórshavn",
  homeCrest: "HB",
  away: "Motherwell FC",
  awayCrest: "MFC",
  kickoffLocal: "18:00",
  fullTime: "~19:50",
  venue: "Tórsvøllur · Gundadalur · Tórshavn",
  capacity: "~6,000",
  referee: "TBC",
  notes:
    "Tórsvøllur is the Faroese national ground and the only stadium in the country that seats more than a few hundred. The away end opens on the north terrace.",
} as const;

export const FERRY = {
  route: "Route 7 · M/F Smyril",
  crossingMinutes: 125,
  matchNorthbound: [
    { dep: "Krambatangi 06:00", arr: "Tórshavn 08:05" },
    { dep: "Krambatangi 11:30", arr: "Tórshavn 13:35", highlight: true, note: "match out" },
    { dep: "Krambatangi 17:30", arr: "Tórshavn 19:35", note: "too late for KO" },
  ],
  matchSouthbound: [
    { dep: "Tórshavn 08:45", arr: "Krambatangi 10:50" },
    { dep: "Tórshavn 14:15", arr: "Krambatangi 16:20" },
    { dep: "Tórshavn 21:15", arr: "Krambatangi 23:20", highlight: true, note: "last boat" },
  ],
  booking: "booking.ssl.fo · foot passengers queue 1 h, gate closes 5 min before sailing",
} as const;

export const PUBS_NEAR_GROUND = [
  { name: "OY Brewing",      walk: "Five minutes from the ground", note: "Site-brewed, food. The pre-match room." },
  { name: "Tórshøll",        walk: "Harbour, fifteen minutes",      note: "Cheap Faroese pints, a working-class football crowd." },
  { name: "Glitnir",         walk: "Waterfront",                    note: "Live football, Gull and Slupp on tap." },
  { name: "Irish Pub Tórshavn", walk: "Harbour",                   note: "Fish & chips, full bar — the away-day classic." },
  { name: "Mikkeller Tórshavn", walk: "Old lanes",                 note: "Tiny craft bar, late afternoon opening." },
  { name: "Sirkus Bar",      walk: "Central",                       note: "Eccentric · the right last stop before the pier." },
] as const;

// -----------------------------------------------------------------------------
// Before-we-leave: the three open items the brief singles out. Kept separate
// from the checklist below so the editorial strip has exactly three lines.
// -----------------------------------------------------------------------------
export const BEFORE_WE_LEAVE = [
  {
    title: "Resolve the Monday-night arrival stay",
    detail:
      "RC 415 lands 18:35 — too late for a 21:15 ferry that we can’t afford to miss. Confirm a Tórshavn hotel for Monday night or lean on the contingency we already have reserved.",
  },
  {
    title: "Finalise the Gatwick-to-Stansted transfer",
    detail:
      "Saturday’s return is a self-transfer on purpose. National Express coach is the cleanest path — book it, save the reference offline.",
  },
  {
    title: "Complete the under-seat packing list",
    detail:
      "The case has to clear 40 × 30 × 20 on each leg. Wear the heavier shoes; everything else has to fit the compartments on the right page.",
  },
] as const;

// -----------------------------------------------------------------------------
// Public-service checklist (Book / Confirm / Download / Pack / Carry).
// The checklist state lives in localStorage under "faroe-pack-state"; this
// array is the canonical item shape and order. The useChecklist hook keys
// checkboxes against this list.
// -----------------------------------------------------------------------------
export interface ChecklistItem {
  id: string;            // localStorage key
  group: "Book" | "Confirm" | "Download" | "Pack" | "Carry";
  what: string;
  why?: string;
}

export const CHECKLIST: ChecklistItem[] = [
  { id: "airbnb-pin",       group: "Confirm", what: "Save the Øravík guesthouse host message + directions",  why: "Mobile signal on Suðuroy is patchy." },
  { id: "hugo-confirm",     group: "Confirm", what: "Guesthouse Hugo confirmation · 5924180270 · PIN 9432",  why: "Saved offline, in three places." },
  { id: "ferry-out",        group: "Book",    what: "Mon 27 Jul · Tórshavn 21:15 → Krambatangi · 2 foot",      why: "booking.ssl.fo · matches the St Olaf’s Eve deviation." },
  { id: "ferry-match-out",  group: "Book",    what: "Thu 30 Jul · Krambatangi 11:30 → Tórshavn · 2 foot",      why: "Pre-booked, the only viable north crossing." },
  { id: "ferry-match-bk",   group: "Book",    what: "Thu 30 Jul · Tórshavn 21:15 → Krambatangi · 2 foot",      why: "Last sailing · gate closes 5 min before departure." },
  { id: "ferry-rika",       group: "Book",    what: "Fri 31 Jul · Krambatangi 16:00 → Tórshavn · 2 foot",      why: "Friday timetable differs from Thursday’s." },
  { id: "lgw-stn-coach",    group: "Book",    what: "Sat 1 Aug · LGW → STN National Express coach",             why: "Self-transfer; surface the booking ref before the cabin doors close." },
  { id: "travel-card",      group: "Book",    what: "7-day SSL Travel Card × 2 (DKK 700 ≈ £80 pp) · pickup Tórshavn terminal", why: "Covers all buses + foot-ferry crossings." },
  { id: "edinburgh-fare",   group: "Book",    what: "Taxi/transfer EDI home → airport or overnight parking",  why: "Both directions need confirming, especially the early return." },
  { id: "weather-pack",     group: "Confirm", what: "weather forecast · checked Sunday before departure",     why: "yr.no is more reliable than Apple Weather in the Faroes." },
  { id: "motherwell-tickets", group: "Confirm", what: "Match tickets · save offline PDF + a paper copy",      why: "Match ticket bought — keep an eye on the club." },
  { id: "offline-maps",     group: "Download", what: "Google Maps / Maps.me · Faroese tiles for offline",       why: "Country-wide, including Suðuroy and Tórshavn street-level." },
  { id: "itinerary-pdf",    group: "Download", what: "A printable copy of this site saved offline",             why: "If signal fails, the page should still answer the practical questions." },
  { id: "apps-eu-plug",     group: "Pack",    what: "EU travel adapter · Type C/F · 230V",                       why: "Two-pin only · don‘t leave home without it." },
  { id: "documents-case",   group: "Carry",   what: "Passport (6+ months valid), travel insurance with hiking cover", why: "GHIC/EHIC is NOT valid · the Faroes are outside EU/EEA." },
  { id: "pharmacy",         group: "Carry",   what: "Sleep mask · blister plasters · earplugs · seasickness",     why: "~17–18 hours daylight · ferry swells can be rough." },
  { id: "credit-card",      group: "Carry",   what: "One card on the body (not just the bag)",                    why: "Cards work everywhere on the islands; cash is rarely needed." },
  { id: "match-colours",    group: "Carry",   what: "Motherwell shirt, scarf",                                     why: "On under the shell in the stands — late-July evenings cool fast." },
];

// -----------------------------------------------------------------------------
// Packing: four zones of the under-seat bag (40 × 30 × 20).
// -----------------------------------------------------------------------------
export interface PackItem {
  id: string;            // localStorage key
  zone: "Wear" | "Pack" | "Keep accessible" | "Leave at home";
  what: string;
  why?: string;
}

export const PACKING: PackItem[] = [
  { id: "wear-shoes",     zone: "Wear",            what: "Trail-running shoes", why: "Worn during travel — saves the bag their weight." },
  { id: "wear-layer",     zone: "Wear",            what: "Merino base + light fleece",                 why: "From the cabin to the ferry the temperature swings." },
  { id: "wear-scarf",     zone: "Wear",            what: "Motherwell scarf (rolled under the shell)", why: "Open-air stadium, late-July evening." },

  { id: "pack-shell",     zone: "Pack",            what: "Waterproof / windproof hardshell — taped seams", why: "Non-negotiable at 469 m of cliff." },
  { id: "pack-overtrs",   zone: "Pack",            what: "Waterproof overtrousers",                  why: "For cliff-edge and boggy Hvannhagi." },
  { id: "pack-laptop",    zone: "Pack",            what: "Laptop",                                   why: "One of the things we actually carry." },
  { id: "pack-power",     zone: "Pack",            what: "Power bank + EU plug adapter",             why: "Long days out, no car to charge from." },
  { id: "pack-daybag",    zone: "Pack",            what: "Small dry-bag liner, daypack rain cover",  why: "Carless trip — the bag has to do two jobs." },
  { id: "pack-docs",      zone: "Pack",            what: "Passport, insurance, ferry & flight refs", why: "Paper copies of every booking." },

  { id: "acc-tickets",    zone: "Keep accessible", what: "Match ticket (offline PDF + paper copy)",   why: "For the gate, not flagged bag." },
  { id: "acc-phone",      zone: "Keep accessible", what: "Phone, charger, ferry QR",                 why: "Used mid-journey for timetables." },
  { id: "acc-card",       zone: "Keep accessible", what: "Card on the body (separate from the bag)", why: "If the bag gets rained on at Krambatangi." },

  { id: "leave-cotton",   zone: "Leave at home",   what: "No cotton layers",                          why: "Cotton stays wet; the Faroes punish it." },
  { id: "leave-spare",     zone: "Leave at home",   what: "No spare passport, no second phone",         why: "Single point of failure is the simpler trip." },
  { id: "leave-suit",      zone: "Leave at home",   what: "No suit, no smart shoes",                     why: "Nothing the Faroes asks for needs a suit." },
  { id: "leave-curiosity", zone: "Leave at home",   what: "No spare ‘just in case’ items",                why: "The 40 × 30 × 20 limit is unforgiving — take the question, not the answer." },
];

export const PACK_DIMENSIONS = {
  width: 40, depth: 30, height: 20, unit: "cm",
  note: "40 × 30 × 20 cm · the standard Ryanair / Atlantic Airways under-seat allowance.",
} as const;

// -----------------------------------------------------------------------------
// Limited schedule of the practical travel-info side section (flights, costs,
// phrasebook, tips). Kept shorter than the previous version — the heavy lift
// lives in the days and match-day pages now.
// -----------------------------------------------------------------------------
export const PRACTICAL = {
  flights: {
    out: { code: "RC 415", carrier: "Atlantic Airways", dep: "Edinburgh 17:10", arr: "Vágar 18:35", date: "Mon 27 Jul 2026", duration: "1 h 25 m · direct" },
    ret: { code: "RC 416", carrier: "Atlantic Airways", dep: "Vágar 09:10",   arr: "Gatwick 11:25", date: "Sat 1 Aug 2026", duration: "2 h 15 m" },
  },
  buses: [
    { name: "Bus 300", route: "Tórshavn – Airport – Sørvágur", use: "airport ↔ Tórshavn ↔ Sørvágur · 45 min each way" },
    { name: "Bus 700", route: "Sumba – Vágur – Tvøroyri",       use: "Suðuroy spine · Øravík and Krambatangi stops" },
    { name: "Bus 701", route: "Fámjin – Tvøroyri – Sandvík",    use: "Ásmundarstakkur · Fámjin · request runs: +298 239 550" },
  ],
  phrasebook: [
    { phrase: "Hey",                      gloss: "Hi — informal." },
    { phrase: "Góðan dag",                  gloss: "Good day — GOH-an day." },
    { phrase: "Takk",                       gloss: "Thanks — tahk." },
    { phrase: "Takk fyri",                  gloss: "Thank you — tahk FEE-ree." },
    { phrase: "Gjørðu so væl",              gloss: "Please — JUR-oo so vatl." },
    { phrase: "Ja / Nei",                   gloss: "Yes / no — yah / nigh." },
    { phrase: "Ein bjór, takk",             gloss: "One beer, please — ayn BYOHR, tahk." },
    { phrase: "Skál!",                      gloss: "Cheers! — SKOHL." },
    { phrase: "Tórsvøllur",                 gloss: "The stadium — TORS-vur-lur." },
    { phrase: "Suðuroy",                    gloss: "The south island — SOO-dur-oy." },
    { phrase: "Eg havi ein bilett",         gloss: "I have a ticket — YAH hahv-ee ayn BIL-et." },
  ],
  tips: [
    { head: "Insurance · non-EU",        body: "GHIC / EHIC is not valid in the Faroe Islands. Travel insurance with medical + hiking cover is essential." },
    { head: "Mobile data",                body: "Outside UK ’roam like home‘ deals on some networks. An eSIM or saved offline maps is good practice." },
    { head: "Money",                      body: "Faroese króna = Danish krone (1:1). Cards are accepted almost everywhere — cash rarely needed." },
    { head: "Daylight",                   body: "~17–18 hours in late July — sunrise 04:45, sunset 22:15. Eye mask is non-optional." },
    { head: "Power",                      body: "230 V, Type C / F two-pin (standard EU). Bring an adapter." },
    { head: "Sundays",                    body: "Bónus is closed Sundays; ESLA stays open 07:00–22:00. Ferries and buses run reduced." },
    { head: "Emergency",                  body: "112. The Suðuroyar Sjúkrahús and pharmacy are in Tvøroyri." },
  ],
  links: [
    { name: "SSL ferry booking",  href: "https://booking.ssl.fo",                                          note: "pre-book every foot-passenger crossing" },
    { name: "Weather (yr.no)",     href: "https://www.yr.no/en",                                            note: "the most accurate Faroese forecast" },
    { name: "Visit Suðuroy",       href: "https://visitsuduroy.fo",                                          note: "local info, Vágur tourist office" },
    { name: "Visit Faroe Islands", href: "https://visitfaroeislands.com",                                    note: "hiking fees, trail status" },
    { name: "Atlantic Airways",    href: "https://www.atlanticairways.com",                                  note: "RC 415 / RC 416" },
    { name: "Motherwell FC",       href: "https://www.motherwellfc.co.uk",                                   note: "away ticket info (TBC)" },
  ],
} as const;

// -----------------------------------------------------------------------------
// Places — the field-guide stops. Each is photographed locally (no Iceland,
// no AI), hand-stamped with a rotated X glyph, and given a Caveat marginal
// note pinned to the side of its entry on the /places page.
// -----------------------------------------------------------------------------
export type Place = {
  id: string;
  island: string;
  photo: string;       // filename under public/images/faroes/ (without .jpg)
  alt: string;
  name: string;
  caption: string;
  detail: string;
  handwritten?: string;
};

export const PLACES: Place[] = [
  {
    id: "beinisvor",
    island: "Su\u00f0uroy \u00b7 south-west corner",
    photo: "beinisvor",
    alt: "Beinisv\u00f8r\u00f0, near-vertical basalt cliff at the south-west corner of Su\u00f0uroy.",
    name: "Beinisv\u00f8r\u00f0",
    caption: "469 m of basalt above the South Atlantic \u2014 the cliff that defines the south island.",
    detail:
      "For the geological essay alone. The cliff-face is basalt columnar but not regular; it leans and shelves. The weather side is what makes it postcard, the lee side is what makes it quiet. If you\u2019re not sure you\u2019ll come back to Su\u00f0uroy, walk past the gate north of the lighthouse.",
    handwritten: "the wind lives here.",
  },
  {
    id: "hvannhagi",
    island: "Su\u00f0uroy \u00b7 east",
    photo: "saksun",
    alt: "Lake above cliff \u2014 stand-in motif for the Hvannhagi ridge near \u00d8rav\u00edk.",
    name: "Hvannhagi ridge",
    caption: "A 2\u20133 hour ridge walk above the fjord, marked with orange posts.",
    detail:
      "The path is signed with T-marked orange posts and runs above a lake facing St\u00f3ra D\u00edmun. If Beinisv\u00f8r\u00f0 is in cloud, this is the plan B and probably the better one \u2014 quieter, wetter, more altitude than cliff, less wind.",
    handwritten: "a lake above the cliff.",
  },
  {
    id: "drangarnir",
    island: "V\u00e1gar \u00b7 south-west tip",
    photo: "drangarnir",
    alt: "Two sea-stacks south of Tindholmur, off the south-west tip of V\u00e1gar.",
    name: "Drangarnir",
    caption: "Two sea-stacks. One island (Tindholmur) just behind them.",
    detail:
      "The hero image on this site. The walk is boat-only really; pick a clear-weather boat from S\u00f8rv\u00e1gur with skipper Regin or similar, 2\u20133 hrs, ticket includes stopping the boat between the stacks so the photo can be drafted.",
    handwritten: "two rocks. one tide.",
  },
  {
    id: "eioi",
    island: "Eysturoy \u00b7 north-west",
    photo: "eioi",
    alt: "Ei\u00f0i village on Eysturoy with the Risin og Kellingin sea-stacks on the horizon.",
    name: "Ei\u00f0i & Risin og Kellingin",
    caption: "The headland village. The two biggest sea-stacks in the country stand offshore.",
    detail:
      "Worth the bus up from T\u00f3rshavn for an afternoon. The walk to the headland above the village is well-marked. Risin and Kellingin sit 1 km offshore \u2014 visible from the clifftop but not reachable without getting wet.",
    handwritten: "the headland in front of the cliff house.",
  },
  {
    id: "saksun",
    island: "Streymoy \u00b7 north",
    photo: "saksun",
    alt: "The black-roofed chapel of Saksun tucked under cliffs.",
    name: "Saksun",
    caption: "A black-roofed tower church under cliffs; the road in is a single-track dead end.",
    detail:
      "A side day if Friday\u2019s ferry holds. Tempo it carefully \u2014 the last 1 km is on a farm track and reversing past oncoming traffic isn\u2019t fun. The lake above is walkable; the caf\u00e9 in the valley is the only one and it\u2019s slow but kind.",
    handwritten: "the village you can see but cannot reach by car.",
  },
  {
    id: "sorvagur",
    island: "V\u00e1gar \u00b7 airport island",
    photo: "sorvagur",
    alt: "S\u00f8rv\u00e1gur with Mykines island visible above the village rooftops.",
    name: "S\u00f8rv\u00e1gur \u00b7 Mykines",
    caption: "The airport village. Mykines is the island behind it, twenty minutes by boat.",
    detail:
      "If the Friday ferry back to T\u00f3rshavn is cancelled for swell, this is where we wait for it to pass. The waterfall M\u00falafossur is a 25 min walk east of the village, into a gorge that drops straight into the sea. The photo is the postcard.",
    handwritten: "Mykines on the horizon, twenty minutes away.",
  },
  {
    id: "torshavn",
    island: "Streymoy",
    photo: "torshavn",
    alt: "T\u00f3rshavn harbour with turf-roofed and timber houses on Tinganes peninsula.",
    name: "T\u00f3rshavn \u00b7 Tinganes",
    caption: "The wooden peninsula at the harbour. The Government has been sitting on it since 1848.",
    detail:
      "Walk it from end to end before kick-off \u2014 turf-roofed timber houses on the gravel lanes. The harbour is one minute from where the ferry comes in. Eat somewhere casual: OY Brewing is closer to the ground than to the harbour, but it serves the right pint.",
    handwritten: "OY Brewing is the closest pub to the ground.",
  },
  {
    id: "funningur",
    island: "Eysturoy \u00b7 north",
    photo: "funningur",
    alt: "Funningur village and the cliff faces above it, looking north.",
    name: "Funningur cliff face",
    caption: "The cliff behind Funningur where the road stops being a road.",
    detail:
      "Famous as a side-trip from Ei\u00f0i; we never made it. The closest we got was seeing the cliff at dawn behind our Su\u00f0uroy base. It\u2019s the legend of the trip we didn\u2019t take. We\u2019d come back for this one alone.",
    handwritten: "where the road stops being a road.",
  },
];
