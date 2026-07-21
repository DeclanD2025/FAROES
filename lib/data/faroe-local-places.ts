// =============================================================================
// Faroe Islands · Local Field Guide
// Food, drink, shops, sights, practical services — near every trip location.
// =============================================================================

export type LocalPlaceCategory =
  | "supermarket" | "convenience" | "bakery"
  | "cafe" | "restaurant" | "bar" | "brewery" | "takeaway"
  | "pharmacy" | "medical" | "atm"
  | "taxi" | "transport"
  | "shop" | "outdoor-shop"
  | "attraction" | "museum" | "viewpoint" | "historic-site" | "church"
  | "harbour" | "walk" | "toilet"
  | "other";

export type LocalPlaceTab = "food" | "drink" | "shops" | "sights" | "practical" | "hikes";

export interface LocalPlace {
  id: string;
  locationId: string;  // matches TripPlace.id
  name: string;
  alternativeName?: string;
  category: LocalPlaceCategory;
  subcategory?: string;
  address?: string;
  coordinates: [number, number]; // [lng, lat]
  website?: string;
  phone?: string;
  openingHours?: string;
  priceLevel?: 1 | 2 | 3 | 4;
  entryFee?: string;
  notes?: string[];
  sourceUrl?: string;
  lastVerified?: string;
  confidence: "official" | "verified-secondary" | "provisional" | "unverified";
  visitDuration?: string;
  indoorOutdoor?: "indoor" | "outdoor" | "mixed";
}

export const LOCAL_PLACES: LocalPlace[] = [
  // ================================================================
  // TÓRSHAVN — Food
  // ================================================================
  {
    id: "torsh-oy-brewing",
    locationId: "torshavn",
    name: "OY Brewing",
    category: "brewery",
    subcategory: "craft beer + food",
    coordinates: [-6.772, 62.016],
    openingHours: "Mon–Thu 16:00–00:00, Fri–Sat 12:00–01:00, Sun 12:00–22:00",
    notes: ["Site-brewed craft beer", "Food served", "5 min walk to Tórsvøllur", "Indoor + outdoor seating"],
    sourceUrl: "https://oy.fo",
    confidence: "verified-secondary",
    indoorOutdoor: "mixed",
    visitDuration: "90 min",
  },
  {
    id: "torsh-barbara",
    locationId: "torshavn",
    name: "Barbara Fish House",
    category: "restaurant",
    subcategory: "seafood · Faroese",
    coordinates: [-6.770, 62.008],
    openingHours: "Daily 12:00–14:30, 18:00–22:00",
    priceLevel: 3,
    notes: ["Traditional Faroese fish", "Harbour-side", "Book ahead for dinner"],
    confidence: "verified-secondary",
    indoorOutdoor: "indoor",
    visitDuration: "90 min",
  },
  {
    id: "torsh-etika",
    locationId: "torshavn",
    name: "Etika",
    category: "restaurant",
    subcategory: "sushi · Japanese",
    coordinates: [-6.7715, 62.009],
    openingHours: "Mon–Sat 17:00–22:00",
    priceLevel: 3,
    notes: ["Faroese fish, Japanese technique", "Central Tórshavn", "Popular — book"],
    confidence: "verified-secondary",
    indoorOutdoor: "indoor",
    visitDuration: "90 min",
  },
  {
    id: "torsh-paname",
    locationId: "torshavn",
    name: "Paname Café",
    category: "cafe",
    subcategory: "coffee · brunch",
    coordinates: [-6.771, 62.0085],
    openingHours: "Mon–Sat 09:00–18:00, Sun 10:00–17:00",
    priceLevel: 2,
    notes: ["Good coffee", "Pastries and light lunch", "Central"],
    confidence: "provisional",
    indoorOutdoor: "indoor",
  },
  {
    id: "torsh-burger",
    locationId: "torshavn",
    name: "The Burger House",
    category: "takeaway",
    subcategory: "burgers",
    coordinates: [-6.772, 62.010],
    openingHours: "Daily 11:30–21:30",
    priceLevel: 2,
    notes: ["Quick pre-match food", "Takeaway available"],
    confidence: "provisional",
    visitDuration: "30 min",
  },

  // ================================================================
  // TÓRSHAVN — Drink
  // ================================================================
  {
    id: "torsh-torsholl",
    locationId: "torshavn",
    name: "Tórshøll",
    category: "bar",
    subcategory: "local pub",
    coordinates: [-6.769, 62.009],
    openingHours: "Mon–Thu 16:00–00:00, Fri–Sat 14:00–02:00, Sun 14:00–22:00",
    notes: ["Cheap Faroese pints", "Working-class football crowd", "Harbour area", "15 min walk to stadium"],
    confidence: "verified-secondary",
    indoorOutdoor: "indoor",
  },
  {
    id: "torsh-glitnir",
    locationId: "torshavn",
    name: "Glitnir",
    category: "bar",
    subcategory: "sports bar",
    coordinates: [-6.7695, 62.0085],
    openingHours: "Daily 15:00–01:00",
    notes: ["Live football on screens", "Gull and Slupp on tap", "Waterfront"],
    confidence: "provisional",
    indoorOutdoor: "indoor",
  },
  {
    id: "torsh-irish",
    locationId: "torshavn",
    name: "Irish Pub Tórshavn",
    category: "bar",
    subcategory: "pub · fish & chips",
    coordinates: [-6.769, 62.008],
    openingHours: "Daily 12:00–01:00",
    notes: ["Fish & chips", "Full bar", "The away-day classic"],
    confidence: "verified-secondary",
    indoorOutdoor: "indoor",
  },
  {
    id: "torsh-mikkeller",
    locationId: "torshavn",
    name: "Mikkeller Tórshavn",
    category: "bar",
    subcategory: "craft beer",
    coordinates: [-6.771, 62.0095],
    openingHours: "Wed–Thu 16:00–23:00, Fri–Sat 14:00–01:00",
    notes: ["Tiny craft bar", "Late afternoon opening on Thu", "Old lanes"],
    confidence: "provisional",
    indoorOutdoor: "indoor",
  },
  {
    id: "torsh-sirkus",
    locationId: "torshavn",
    name: "Sirkus Bar",
    category: "bar",
    subcategory: "late bar",
    coordinates: [-6.771, 62.009],
    openingHours: "Thu–Sat 20:00–03:00",
    notes: ["Late opening", "Central", "Right last stop before the pier"],
    confidence: "provisional",
    indoorOutdoor: "indoor",
  },

  // ================================================================
  // TÓRSHAVN — Shops
  // ================================================================
  {
    id: "torsh-bonus",
    locationId: "torshavn",
    name: "Bónus",
    category: "supermarket",
    coordinates: [-6.779, 62.012],
    openingHours: "Mon–Thu 10:00–19:00, Fri 10:00–20:00, Sat 10:00–18:00, Sun closed",
    notes: ["Largest Faroese supermarket chain", "Best prices", "Closed Sundays — use ESSA instead"],
    confidence: "official",
  },
  {
    id: "torsh-essa",
    locationId: "torshavn",
    name: "ESSA",
    category: "convenience",
    coordinates: [-6.774, 62.011],
    openingHours: "Mon–Sat 07:00–22:00, Sun 07:00–22:00",
    notes: ["Open on Sundays when Bónus is closed", "Good for late arrivals"],
    confidence: "provisional",
  },

  // ================================================================
  // TÓRSHAVN — Sights
  // ================================================================
  {
    id: "torsh-tinganes",
    locationId: "torshavn",
    name: "Tinganes",
    category: "historic-site",
    subcategory: "old town · parliament",
    coordinates: [-6.770, 62.008],
    notes: ["One of the oldest parliamentary meeting places in the world", "Turf-roofed timber houses", "Free to walk", "1 min from ferry terminal"],
    confidence: "official",
    indoorOutdoor: "outdoor",
    visitDuration: "30–60 min",
  },
  {
    id: "torsh-nordic-house",
    locationId: "torshavn",
    name: "Nordic House",
    category: "attraction",
    subcategory: "culture centre",
    coordinates: [-6.783, 62.022],
    openingHours: "Mon–Sat 10:00–17:00, Sun 14:00–17:00",
    entryFee: "Free entry (exhibitions may charge)",
    notes: ["Nordic cultural centre", "Café with sea views", "Architecture worth seeing"],
    confidence: "provisional",
    indoorOutdoor: "mixed",
    visitDuration: "60 min",
  },

  // ================================================================
  // TÓRSHAVN — Practical
  // ================================================================
  {
    id: "torsh-ferry-terminal",
    locationId: "torshavn-ferry",
    name: "Tórshavn Ferry Terminal (Farstøðin)",
    category: "transport",
    subcategory: "ferry",
    coordinates: [-6.7686, 62.011],
    notes: ["SSL Route 7 to Suðuroy", "Foot passengers queue 1h before", "Gate closes 5 min before departure", "Limited facilities"],
    sourceUrl: "https://ssl.fo",
    confidence: "official",
  },
  {
    id: "torsh-bus-station",
    locationId: "torshavn",
    name: "Tórshavn Bus Station",
    category: "transport",
    subcategory: "bus terminal",
    coordinates: [-6.774, 62.0115],
    notes: ["Bus 300 to airport/Sørvágur", "Bus 700 to Suðuroy villages", "Central — walkable from ferry"],
    sourceUrl: "https://ssl.fo",
    confidence: "official",
  },
  {
    id: "torsh-pharmacy",
    locationId: "torshavn",
    name: "Apotekið Tórshavn",
    category: "pharmacy",
    coordinates: [-6.773, 62.011],
    openingHours: "Mon–Fri 09:00–17:30, Sat 10:00–14:00, Sun closed",
    notes: ["Main pharmacy in Tórshavn"],
    confidence: "provisional",
  },

  // ================================================================
  // SUÐUROY / ØRAVÍK / TVØROYRI — Food & Drink
  // ================================================================
  {
    id: "tvor-hotel",
    locationId: "oravik",
    name: "Hotel Tvøroyri",
    category: "restaurant",
    subcategory: "pizzeria · bar",
    coordinates: [-6.815, 61.555],
    openingHours: "Daily 12:00–22:00",
    priceLevel: 2,
    notes: ["Pizzeria, dependable pint", "The same locals every night", "~5 min drive from Øravík", "The social centre of Suðuroy"],
    confidence: "verified-secondary",
    indoorOutdoor: "indoor",
    visitDuration: "90 min",
  },
  {
    id: "tvor-cafe",
    locationId: "oravik",
    name: "Café Tvøroyri",
    category: "cafe",
    coordinates: [-6.815, 61.555],
    openingHours: "Mon–Sat 10:00–18:00",
    notes: ["Coffee, cakes, light lunch", "In Tvøroyri town centre"],
    confidence: "provisional",
  },

  // ================================================================
  // SUÐUROY / ØRAVÍK / TVØROYRI — Shops
  // ================================================================
  {
    id: "tvor-bonus",
    locationId: "oravik",
    name: "Bónus Tvøroyri",
    category: "supermarket",
    coordinates: [-6.815, 61.555],
    openingHours: "Mon–Thu 10:00–19:00, Fri 10:00–20:00, Sat 10:00–18:00, Sun closed",
    notes: ["Nearest large supermarket to Øravík", "~5-10 min drive from Airbnb", "Stock up here — Øravík has no shop", "Closed Sundays"],
    confidence: "official",
  },

  // ================================================================
  // SUÐUROY / ØRAVÍK / TVØROYRI — Practical
  // ================================================================
  {
    id: "tvor-krambatangi",
    locationId: "krambatangi",
    name: "Krambatangi Ferry Terminal",
    category: "transport",
    subcategory: "ferry terminal",
    coordinates: [-6.8185, 61.5481],
    notes: ["SSL Route 7 to Tórshavn", "Limited terminal facilities — no café or shop", "Bus 700 stop nearby", "Waiting area with basic shelter"],
    sourceUrl: "https://ssl.fo",
    confidence: "official",
  },
  {
    id: "tvor-pharmacy",
    locationId: "oravik",
    name: "Suðuroyar Apotek",
    category: "pharmacy",
    coordinates: [-6.815, 61.555],
    openingHours: "Mon–Fri 09:00–17:00, Sat 10:00–13:00",
    notes: ["Pharmacy in Tvøroyri", "Also: Suðuroyar Sjúkrahús (hospital) nearby"],
    confidence: "provisional",
  },
  {
    id: "tvor-taxi",
    locationId: "oravik",
    name: "Suðuroy Taxi",
    category: "taxi",
    coordinates: [-6.815, 61.555],
    notes: ["Pre-book for late-night Krambatangi arrivals", "Save number before travel — signal may be patchy"],
    confidence: "provisional",
  },

  // ================================================================
  // SØRVÁGUR / VÁGAR — Food & Practical
  // ================================================================
  {
    id: "sorv-airport-cafe",
    locationId: "vagar-airport",
    name: "Vágar Airport Café",
    category: "cafe",
    coordinates: [-7.2772, 62.0636],
    openingHours: "Daily during flight hours",
    notes: ["Small terminal café", "Coffee, sandwiches, snacks", "Limited hours — check on departure day"],
    confidence: "provisional",
  },
  {
    id: "sorv-guesthouse",
    locationId: "sorvagur",
    name: "Guesthouse Hugo",
    category: "other",
    subcategory: "accommodation",
    coordinates: [-7.3577, 62.0973],
    notes: ["2 Bakkavegur, 380 Sørvágur", "Conf: 5924180270 · PIN: 9432", "Self check-in 14:00–23:30", "Phone: +298 232101"],
    sourceUrl: "https://guesthousehugo.com",
    confidence: "official",
  },
];

// Group tabs
export type FieldGuideTab = { id: LocalPlaceTab; label: string; icon: string };

export const FIELD_GUIDE_TABS: FieldGuideTab[] = [
  { id: "food", label: "Food", icon: "Fd" },
  { id: "drink", label: "Drink", icon: "Dr" },
  { id: "shops", label: "Shops", icon: "Sh" },
  { id: "sights", label: "Sights", icon: "🏛" },
  { id: "practical", label: "Practical", icon: "ℹ" },
  { id: "hikes", label: "Hikes", icon: "Hk" },
];

export function getTabCategory(tab: LocalPlaceTab): LocalPlaceCategory[] {
  switch (tab) {
    case "food": return ["cafe", "restaurant", "bakery", "takeaway"];
    case "drink": return ["bar", "brewery"];
    case "shops": return ["supermarket", "convenience", "shop", "outdoor-shop"];
    case "sights": return ["attraction", "museum", "viewpoint", "historic-site", "church", "harbour", "walk"];
    case "practical": return ["pharmacy", "medical", "atm", "taxi", "transport", "toilet", "other"];
    case "hikes": return [];
    default: return [];
  }
}
