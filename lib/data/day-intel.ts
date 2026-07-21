// =============================================================================
// Faroe Islands trip · Day Intelligence
// Proximity-based local information: what's nearby, how far, and why it matters.
// Centred on Við á 7, Øravík 827 as the primary base.
// =============================================================================

export interface ProximityItem {
  id: string;
  name: string;
  category: string;
  distanceKm: number;
  walkingTimeMin: number | null;
  busRoute: string | null;
  busStops: number | null;
  openingHours: string;
  notes: string;
  confidence: "confirmed" | "provisional" | "unverified";
  sourceUrl?: string;
  fallback?: string;
}

export interface DistanceBand {
  label: string;
  description: string;
  items: ProximityItem[];
}

// =============================================================================
// ØRAVÍK BASE GUIDE — Við á 7, Øravík 827
// =============================================================================

export const ORAVIK_BASE_GUIDE: DistanceBand[] = [
  {
    label: "ON FOOT — UNDER 15 MINUTES",
    description: "Within ~1 km of Við á 7",
    items: [
      {
        id: "oravik-bus-700",
        name: "Bus 700 stop · Ferjuleðan",
        category: "transport",
        distanceKm: 0.3,
        walkingTimeMin: 4,
        busRoute: "700",
        busStops: null,
        openingHours: "Varies — check SSL timetable",
        notes: "The lifeline. Two stops to Krambatangi ferry terminal southbound, two stops to Tvøroyri northbound. Also request stops along the route.",
        confidence: "confirmed",
        sourceUrl: "https://ssl.fo",
      },
      {
        id: "oravik-village",
        name: "Øravík village centre",
        category: "village",
        distanceKm: 0.1,
        walkingTimeMin: 2,
        busRoute: null,
        busStops: null,
        openingHours: "N/A",
        notes: "Small village with a few houses. No shop, no café, no pub. The base is peaceful but not serviced — plan supplies from Tvøroyri.",
        confidence: "confirmed",
        fallback: "Tvøroyri for all services (3.5 km north).",
      },
      {
        id: "oravik-harbour",
        name: "Øravík harbour",
        category: "harbour",
        distanceKm: 0.2,
        walkingTimeMin: 3,
        busRoute: null,
        busStops: null,
        openingHours: "N/A",
        notes: "Small working harbour. Quiet, photogenic, good for an evening walk or morning run start point.",
        confidence: "confirmed",
      },
    ],
  },
  {
    label: "NEARBY — 15 TO 30 MINUTES",
    description: "Within ~2–3 km of Við á 7",
    items: [
      {
        id: "krambatangi-terminal",
        name: "Krambatangi Ferry Terminal",
        category: "transport",
        distanceKm: 2.0,
        walkingTimeMin: 25,
        busRoute: "700",
        busStops: 2,
        openingHours: "Terminal: limited facilities. Ferry: see SSL timetable.",
        notes: "The Suðuroy ferry terminal. Walkable with day packs — harder with luggage (unlit road, uphill return). Pre-book late-night taxi. No café or shop at terminal.",
        confidence: "confirmed",
        sourceUrl: "https://ssl.fo",
        fallback: "Bus 700 (two stops, ~8 min) or taxi +298 239550.",
      },
      {
        id: "oravik-fjord",
        name: "Trongisvágsfjørður shoreline",
        category: "walk",
        distanceKm: 1.5,
        walkingTimeMin: 20,
        busRoute: null,
        busStops: null,
        openingHours: "N/A",
        notes: "Fjord-side walking path. Flat, scenic, good for easy runs or evening strolls. Views across to the eastern shore.",
        confidence: "provisional",
      },
    ],
  },
  {
    label: "SHORT BUS OR TAXI",
    description: "5–15 min by bus 700, ~2–8 km",
    items: [
      {
        id: "tvoroyri-town",
        name: "Tvøroyri town centre",
        category: "town",
        distanceKm: 3.5,
        walkingTimeMin: 45,
        busRoute: "700",
        busStops: 2,
        openingHours: "N/A",
        notes: "Suðuroy's main service town. Hotel, supermarket, pharmacy, café, ATM. Everything you need that Øravík doesn't have.",
        confidence: "confirmed",
        sourceUrl: "https://visitsuduroy.fo",
      },
      {
        id: "tvor-bonus",
        name: "Bónus Tvøroyri",
        category: "supermarket",
        distanceKm: 3.5,
        walkingTimeMin: 45,
        busRoute: "700",
        busStops: 2,
        openingHours: "Mon–Thu 10–19, Fri 10–20, Sat 10–18, Sun CLOSED",
        notes: "Largest supermarket near Øravík. Stock up here — no shop in Øravík. Closed Sundays.",
        confidence: "confirmed",
        sourceUrl: "https://bonus.fo",
        fallback: "ESSA in Tórshavn (open daily 07–22 including Sundays).",
      },
      {
        id: "tvor-hotel",
        name: "Hotel Tvøroyri",
        category: "food",
        distanceKm: 3.5,
        walkingTimeMin: 45,
        busRoute: "700",
        busStops: 2,
        openingHours: "Daily 12:00–22:00",
        notes: "Pizzeria, bar, the social centre of Suðuroy. Dependable food and drink. Cash and card.",
        confidence: "provisional",
        fallback: "Self-cater from Bónus supplies.",
      },
      {
        id: "tvor-pharmacy",
        name: "Suðuroyar Apotek",
        category: "pharmacy",
        distanceKm: 3.5,
        walkingTimeMin: 45,
        busRoute: "700",
        busStops: 2,
        openingHours: "Mon–Fri 09–17, Sat 10–13",
        notes: "Only pharmacy on Suðuroy. Plan around weekday hours.",
        confidence: "provisional",
        fallback: "Hospital in Tvøroyri for emergencies.",
      },
      {
        id: "tvor-taxi",
        name: "Suðuroy Taxi",
        category: "taxi",
        distanceKm: 2.0,
        walkingTimeMin: null,
        busRoute: null,
        busStops: null,
        openingHours: "24/7 — pre-book for late arrivals",
        notes: "Pre-book for late-night Krambatangi arrivals (~DKK 150 to Øravík, 5 min). Also useful for Beinisvørð (~DKK 400–500 return). Call +298 239550. Save the number before you lose signal.",
        confidence: "confirmed",
        fallback: "Bus 700 for most routes. Walking is the last resort.",
      },
      {
        id: "tvor-atm",
        name: "ATM · BankNordik Tvøroyri",
        category: "atm",
        distanceKm: 3.5,
        walkingTimeMin: 45,
        busRoute: "700",
        busStops: 2,
        openingHours: "24/7 (ATM)",
        notes: "Cash machine. Cards accepted almost everywhere but useful for backup.",
        confidence: "provisional",
      },
      {
        id: "cafe-mormor",
        name: "Café MorMor",
        category: "cafe",
        distanceKm: 3.5,
        walkingTimeMin: 45,
        busRoute: "700",
        busStops: 2,
        openingHours: "Wed–Fri 12:00–18:00 (NOTE: limited days)",
        notes: "The island gem. Brilliant soup and cake. Open Wed–Fri only — Day 3 is the day for it.",
        confidence: "provisional",
        sourceUrl: "https://www.facebook.com/cafemormor",
        fallback: "Hotel Tvøroyri café or self-cater.",
      },
    ],
  },
  {
    label: "HALF-DAY TRIP",
    description: "Bus or walk, ~5–15 km",
    items: [
      {
        id: "hov-village",
        name: "Hov village",
        category: "visit",
        distanceKm: 8,
        walkingTimeMin: null,
        busRoute: "700",
        busStops: 4,
        openingHours: "N/A",
        notes: "Viking chieftain's burial mound overlooking the harbour. 30 min loop walk. Starting point for Hvannhagi ridge walk.",
        confidence: "confirmed",
      },
      {
        id: "famjin-church",
        name: "Fámjin church · the original Merkið",
        category: "visit",
        distanceKm: 12,
        walkingTimeMin: null,
        busRoute: "701",
        busStops: null,
        openingHours: "Church: check locally. Village: accessible.",
        notes: "Original Faroese flag (Merkið) from 1919. Waterfall behind the church. Shoreline walks. Bus 701 may require request — call +298 239550.",
        confidence: "confirmed",
        fallback: "Bus 701 marked 'T' in timetable — request in advance.",
      },
      {
        id: "frodba-basalt",
        name: "Froðba basalt columns",
        category: "visit",
        distanceKm: 5,
        walkingTimeMin: null,
        busRoute: "700",
        busStops: 3,
        openingHours: "N/A",
        notes: "Red cliffs, blowhole, columnar basalt along the coast. Easy walk from Tvøroyri (~20 min). Works in any weather.",
        confidence: "confirmed",
      },
    ],
  },
  {
    label: "FULL-DAY TRIP",
    description: "Requires bus or significant walking",
    items: [
      {
        id: "beinisvord-cliff",
        name: "Beinisvørð (469 m)",
        category: "viewpoint",
        distanceKm: 20,
        walkingTimeMin: null,
        busRoute: "700",
        busStops: null,
        openingHours: "N/A · Open access",
        notes: "Defining 469 m basalt cliff of Suðuroy. The view is the point — pointless in fog. NOT accessible by public bus to the trailhead. Requires taxi or hike from nearest bus stop (~8 km walk from Sumba stop).",
        confidence: "confirmed",
        fallback: "Fámjin or Froðba — both bus-accessible.",
      },
    ],
  },
];

// =============================================================================
// Last chance supplies — by day
// =============================================================================

export interface LastChanceCard {
  day: number;
  dayName: string;
  items: string[];
}

export const LAST_CHANCE_SUPPLIES: LastChanceCard[] = [
  {
    day: 0,
    dayName: "Before departure",
    items: [
      "Buy eSIM for Faroe Islands data",
      "Download offline Google Maps (Suðuroy + Tórshavn + Vágar)",
      "Save SSL timetable PDFs",
      "Confirm all ferry bookings",
      "Pack sleep mask (17-18h daylight)",
      "Pack EU adapter (Type C/F)",
      "No cotton layers — merino + fleece only",
    ],
  },
  {
    day: 1,
    dayName: "Monday — travel day",
    items: [
      "Buy food at Edinburgh Airport airside for late arrival",
      "Buy food on Smyril ferry if café is open",
      "Confirm lockbox code before losing signal",
      "Save taxi number +298 239550",
    ],
  },
  {
    day: 2,
    dayName: "Tuesday — Suðuroy cliffs",
    items: [
      "Stock up at Bónus Tvøroyri (Mon–Thu until 19:00)",
      "Fill water bottles at Við á 7 before hike",
      "Pack waterproofs — Beinisvørð exposed",
    ],
  },
  {
    day: 3,
    dayName: "Wednesday — free day",
    items: [
      "Restock at Bónus if needed (until 19:00)",
      "Buy ferry snacks for tomorrow",
      "Charge phone and portable charger for matchday",
      "Pack layers for match — stadium is exposed",
      "Save match ticket offline",
    ],
  },
  {
    day: 4,
    dayName: "Thursday — matchday",
    items: [
      "Save emergency Tórshavn hotel numbers",
      "Buy food/drink for return ferry (café may close late)",
      "Pack warm layer — ferry terminal is exposed at night",
      "Friday packing: separate bag for Sørvágur check-in",
    ],
  },
  {
    day: 5,
    dayName: "Friday — repositioning",
    items: [
      "Pack everything — leaving Øravík permanently",
      "Clean Airbnb — leave as found",
      "Check Guesthouse Hugo check-in details",
      "Buy dinner before ferry if evening arrival is late",
    ],
  },
];
