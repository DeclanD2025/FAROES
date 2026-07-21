// =============================================================================
// Faroe Islands trip · journey legs
// Each leg carries a static, curated GeoJSON LineString geometry that follows
// the real road or ferry path. No runtime routing API calls.
// =============================================================================

import type { LineString } from "geojson";

export type TransportMode = "bus" | "ferry" | "car" | "walk" | "flight";

export interface JourneyLeg {
  id: string;
  fromPlaceId: string;
  toPlaceId: string;
  mode: TransportMode;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  service?: string;
  status?: "confirmed" | "pending" | "needs-booking";
  practicalNote?: string;
  geometry: LineString;
}

// =============================================================================
// LineString geometries — all defined FIRST, before they are referenced
// =============================================================================

// Leg 1: Vágar Airport → Tórshavn · Bus 300 / road
const VAGAR_TO_TORSHAVN: LineString = {
  type: "LineString",
  coordinates: [
    [-7.2772, 62.0636],  // Vágar Airport
    [-7.2600, 62.0660],
    [-7.2300, 62.0690],
    [-7.2000, 62.0720],
    [-7.1750, 62.0750],
    [-6.9500, 62.0220],  // Vágatunnilin south portal, Streymoy side
    [-6.9000, 62.0180],
    [-6.8500, 62.0160],
    [-6.8000, 62.0140],
    [-6.7800, 62.0130],
    [-6.7716, 62.0097],  // Tórshavn centre
  ],
};

// Leg 2: Tórshavn → Krambatangi · M/F Smyril ferry
const TORSHAVN_TO_KRAMBATANGI: LineString = {
  type: "LineString",
  coordinates: [
    [-6.7686, 62.0110],
    [-6.7700, 61.9500],
    [-6.7750, 61.8800],
    [-6.7800, 61.8000],
    [-6.7880, 61.7200],
    [-6.7980, 61.6500],
    [-6.8080, 61.5900],
    [-6.8185, 61.5481],
  ],
};

// Leg 3: Krambatangi → Øravík · Bus 700 / Route 14
const KRAMBATANGI_TO_ORAVIK: LineString = {
  type: "LineString",
  coordinates: [
    [-6.8185, 61.5481],
    [-6.8150, 61.5420],
    [-6.8120, 61.5390],
    [-6.8100, 61.5360],
  ],
};

// Leg: Tórshavn → Tórsvøllur · walk
const TORSHAVN_TO_TORSVOLLUR: LineString = {
  type: "LineString",
  coordinates: [
    [-6.7686, 62.0110],
    [-6.7700, 62.0130],
    [-6.7720, 62.0150],
    [-6.7735, 62.0182],
  ],
};

// Day 2 · Øravík → Hov · Bus 700 south
const ORAVIK_TO_HOV: LineString = {
  type: "LineString",
  coordinates: [
    [-6.8100, 61.5360],  // Øravík
    [-6.8080, 61.5280],
    [-6.8020, 61.5180],
    [-6.7950, 61.5060],  // Hov
  ],
};

// Day 2 · Hov → Hvannhagi ridge · walk
const HOV_TO_HVANNHAGI: LineString = {
  type: "LineString",
  coordinates: [
    [-6.7950, 61.5060],  // Hov
    [-6.7880, 61.5070],
    [-6.7820, 61.5080],  // Hvannhagi
  ],
};

// Day 2 · Øravík → Tvøroyri · Bus 700 north
const ORAVIK_TO_TVOROYRI: LineString = {
  type: "LineString",
  coordinates: [
    [-6.8100, 61.5360],  // Øravík
    [-6.8110, 61.5450],
    [-6.8120, 61.5560],  // Tvøroyri
  ],
};

// =============================================================================
// JOURNEY_LEGS — the definitive ordered sequence
// =============================================================================

export const JOURNEY_LEGS: JourneyLeg[] = [
  {
    id: "leg-vagar-torshavn",
    fromPlaceId: "vagar-airport",
    toPlaceId: "torshavn",
    mode: "bus",
    departureTime: "~19:00",
    arrivalTime: "~19:45",
    duration: "45 min",
    service: "Bus 300",
    status: "needs-booking",
    practicalNote:
      "Bus 300 runs Vágar Airport → Tórshavn via the Vágatunnilin subsea tunnel. Confirm summer 2026 timetable at ssl.fo before travel.",
    geometry: VAGAR_TO_TORSHAVN,
  },
  {
    id: "leg-torshavn-krambatangi",
    fromPlaceId: "torshavn-ferry",
    toPlaceId: "krambatangi",
    mode: "ferry",
    departureTime: "21:15",
    arrivalTime: "~23:20",
    duration: "2h 05m",
    service: "M/F Smyril · Route 7",
    status: "needs-booking",
    practicalNote:
      "Last sailing of the day. Pre-book at booking.ssl.fo. Foot-passenger gate closes 5 min before departure. The boat has a café and indoor seating.",
    geometry: TORSHAVN_TO_KRAMBATANGI,
  },
  {
    id: "leg-krambatangi-oravik",
    fromPlaceId: "krambatangi",
    toPlaceId: "oravik",
    mode: "bus",
    departureTime: "~23:20",
    arrivalTime: "~23:30",
    duration: "8 min",
    service: "Bus 700",
    status: "confirmed",
    practicalNote:
      "Two stops on Bus 700 to Øravík. Pre-book a taxi (+298 239550) if arriving after midnight — the bus may not run that late.",
    geometry: KRAMBATANGI_TO_ORAVIK,
  },
  {
    id: "leg-torshavn-torsvollur",
    fromPlaceId: "torshavn-ferry",
    toPlaceId: "torsvollur",
    mode: "walk",
    departureTime: "~17:20",
    arrivalTime: "~17:40",
    duration: "15–20 min",
    status: "confirmed",
    practicalNote:
      "About 1 km from the harbour. Walk up through the town toward Gundadalur. Tórsvøllur is visible from the main road.",
    geometry: TORSHAVN_TO_TORSVOLLUR,
  },
  {
    id: "leg-oravik-hov",
    fromPlaceId: "oravik",
    toPlaceId: "hov",
    mode: "bus",
    departureTime: "~10:00",
    duration: "~15 min",
    service: "Bus 700",
    status: "confirmed",
    practicalNote:
      "Two stops south from Øravík/Ferjuleðan. Ask the driver for Hov — the chieftain's mound is a short walk from the stop.",
    geometry: ORAVIK_TO_HOV,
  },
  {
    id: "leg-hov-hvannhagi",
    fromPlaceId: "hov",
    toPlaceId: "hvannhagi",
    mode: "walk",
    duration: "2–3 hrs",
    status: "confirmed",
    practicalNote:
      "Orange T-marked posts from Hov village. Ridge walk overlooking Stóra Dímun. Not safe in fog — markers vanish.",
    geometry: HOV_TO_HVANNHAGI,
  },
  {
    id: "leg-oravik-tvoroyri",
    fromPlaceId: "oravik",
    toPlaceId: "tvoroyri",
    mode: "bus",
    duration: "~10 min",
    service: "Bus 700",
    status: "confirmed",
    practicalNote:
      "Two stops north to Tvøroyri. Hotel Tvøroyri is near the bus stop. Last Bus 700 back ~22:00.",
    geometry: ORAVIK_TO_TVOROYRI,
  },
];

// =============================================================================
// London self-transfer — not on the Faroe map, used in the origin strip.
// =============================================================================
export const ORIGIN_FLIGHT = {
  from: { code: "EDI", name: "Edinburgh", time: "17:10", date: "Mon 27 Jul" },
  to: { code: "FAE", name: "Vágar", time: "18:35" },
  carrier: "Atlantic Airways",
  flightNumber: "RC 415",
  duration: "1h 25m",
} as const;
