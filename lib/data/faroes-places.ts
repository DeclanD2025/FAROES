// =============================================================================
// Faroe Islands trip · place data
// Single source of truth for every location plotted on the map.
// Coordinates are real [longitude, latitude] verified against OpenStreetMap.
// =============================================================================

export type PlaceCategory =
  | "airport"
  | "harbour"
  | "accommodation"
  | "match"
  | "visit"
  | "transfer"
  | "hike"
  | "viewpoint"
  | "food";

export interface TripPlace {
  id: string;
  name: string;
  displayName: string;
  coordinates: [number, number]; // [longitude, latitude]
  category: PlaceCategory;
  routeSequence?: number;
  day?: string;
  time?: string;
  status?: "confirmed" | "pending" | "needs-booking";
  description?: string;
  practicalNote?: string;
  service?: string;
  href?: string;
}

// -----------------------------------------------------------------------------
// Journey stops — the main route sequence, numbered.
// -----------------------------------------------------------------------------
export const JOURNEY_STOPS: TripPlace[] = [
  {
    id: "vagar-airport",
    name: "Vágar Airport",
    displayName: "Vágar Airport (FAE)",
    coordinates: [-7.2772, 62.0636],
    category: "airport",
    routeSequence: 1,
    day: "Mon 27 Jul",
    time: "18:35",
    status: "confirmed",
    description: "Atlantic Airways RC 415 lands from Edinburgh. The only airport in the Faroe Islands, on the island of Vágar.",
    practicalNote: "Bus 300 departs ~19:00 for Tórshavn. Pre-book taxi if the connection is tight.",
    service: "RC 415 · Atlantic Airways",
  },
  {
    id: "torshavn",
    name: "Tórshavn",
    displayName: "Tórshavn",
    coordinates: [-6.7716, 62.0097],
    category: "transfer",
    routeSequence: 2,
    day: "Mon 27 Jul",
    time: "~19:45",
    status: "needs-booking",
    description: "The capital. Bus 300 terminates here. From the bus station, walk or taxi to the ferry terminal for the Smyril sailing south.",
    practicalNote: "Airport bus to Tórshavn takes ~45 min. Ferry terminal (Farstøðin) is at the harbour, a short walk from the bus station.",
    service: "Bus 300 · 45 min",
  },
  {
    id: "torshavn-ferry",
    name: "Tórshavn Ferry Terminal",
    displayName: "Tórshavn · Farstøðin",
    coordinates: [-6.7686, 62.011],
    category: "harbour",
    routeSequence: 2,
    day: "Mon 27 Jul",
    time: "21:15",
    status: "needs-booking",
    description: "The Smyril ferry terminal in Tórshavn harbour. Route 7 departure point for the 2h 05m crossing to Krambatangi on Suðuroy.",
    practicalNote: "Foot-passenger gate closes 5 min before departure. Queue up to 1 hour before sailing.",
    service: "M/F Smyril · Route 7",
  },
  {
    id: "krambatangi",
    name: "Krambatangi",
    displayName: "Krambatangi Ferry Terminal",
    coordinates: [-6.8185, 61.5481],
    category: "harbour",
    routeSequence: 3,
    day: "Mon 27 Jul",
    time: "~23:20",
    status: "confirmed",
    description: "The Suðuroy ferry pier. Arrival after the 2h 05m crossing from Tórshavn. From here, a short bus or taxi ride to Øravík.",
    practicalNote: "Bus 700 runs from Krambatangi (Ferjuleðan stop) to Øravík — two stops, ~8 min. Pre-book a late taxi if arriving after 23:00.",
    service: "Bus 700 · 2 stops",
  },
  {
    id: "oravik",
    name: "Øravík",
    displayName: "Øravík · Accommodation",
    coordinates: [-6.81, 61.536],
    category: "accommodation",
    routeSequence: 4,
    day: "Mon 27 Jul – Fri 31 Jul",
    status: "confirmed",
    description: "Main Suðuroy base for four nights. Quiet mid-island village near the Krambatangi ferry terminal and on the Bus 700 route.",
    practicalNote: "Airbnb at Við á 7. Check-in details in your booking. Nearest shop in Tvøroyri, 3–4 km north.",
    href: "https://www.airbnb.com/l/zdrMEniF",
  },
];

// -----------------------------------------------------------------------------
// Other saved locations — not on the main journey sequence.
// -----------------------------------------------------------------------------
export const SAVED_PLACES: TripPlace[] = [
  {
    id: "torsvollur",
    name: "Tórsvøllur",
    displayName: "Tórsvøllur Stadium",
    coordinates: [-6.7735, 62.0182],
    category: "match",
    day: "Thu 30 Jul",
    time: "18:00",
    status: "confirmed",
    description: "The Faroese national stadium in Gundadalur, Tórshavn. HB Tórshavn v Motherwell, UEFA Conference League qualifying.",
    practicalNote: "~1 km north of the harbour, 15–20 min walk from the ferry terminal. Away end on the north terrace.",
  },
  {
    id: "sorvagur",
    name: "Sørvágur",
    displayName: "Sørvágur",
    coordinates: [-7.3577, 62.0973],
    category: "accommodation",
    day: "Fri 31 Jul",
    status: "confirmed",
    description: "Final-night village on Vágar. Guesthouse Hugo, ~10 min from the airport — the sensible last stop before the Saturday morning flight.",
    practicalNote: "Guesthouse Hugo, 2 Bakkavegur. Conf. 5924180270, PIN 9432. Check-in from 14:00.",
  },
  {
    id: "hov",
    name: "Hov",
    displayName: "Hov village",
    coordinates: [-6.795, 61.506],
    category: "visit",
    day: "Wed 29 Jul",
    status: "confirmed",
    description: "Small south-coast village on Suðuroy. Viking chieftain's burial mound overlooks the harbour. Starting point for the Hvannhagi ridge walk.",
    practicalNote: "Bus 700 from Øravík — two stops south. The chieftain's mound is a 30 min loop from the bus stop.",
  },
  {
    id: "hvannhagi",
    name: "Hvannhagi",
    displayName: "Hvannhagi ridge",
    coordinates: [-6.782, 61.508],
    category: "hike",
    day: "Wed 29 Jul",
    description: "2–3 hour ridge walk marked with orange T-posts. A cliff-edge lake faces Stóra Dímun island. The markers vanish in fog — not safe in low visibility.",
    practicalNote: "Start from Hov. Orange posts. No facilities on the ridge. Bring water, waterproofs, and offline maps.",
  },
  {
    id: "beinisvord",
    name: "Beinisvørð",
    displayName: "Beinisvørð (469 m)",
    coordinates: [-6.79, 61.425],
    category: "viewpoint",
    day: "Wed 29 Jul",
    description: "The defining 469 m basalt cliff of Suðuroy, at the island's south-west corner. Walk past the gate north of the lighthouse for the best view. Pointless in fog.",
    practicalNote: "Drive or bus to the lighthouse road. ~30–60 min visit. No shelter at the top — wind is strong even on calm days.",
  },
  {
    id: "tvoroyri",
    name: "Tvøroyri",
    displayName: "Tvøroyri · Hotel",
    coordinates: [-6.812, 61.556],
    category: "food",
    day: "Wed 29 Jul",
    description: "Suðuroy's main town. Hotel Tvøroyri has a pizzeria, bar, and the same local crowd every night. Nearest proper supermarket and pharmacy to Øravík.",
    practicalNote: "Hotel Tvøroyri serves until late. Bónus supermarket open until 18:00 weekdays. Last Bus 700 north ~22:00.",
  },
  {
    id: "akraberg",
    name: "Akraberg",
    displayName: "Akraberg lighthouse",
    coordinates: [-6.81, 61.393],
    category: "viewpoint",
    day: "Wed 29 Jul",
    description: "The southernmost point of Suðuroy. Lighthouse, radio mast, and open Atlantic beyond. No land between here and the Shetlands. Short drive from Beinisvørð.",
    practicalNote: "Narrow road. Combined with Beinisvørð for a southern loop. No facilities.",
  },
];

// -----------------------------------------------------------------------------
// All places combined — used by the Places filter.
// -----------------------------------------------------------------------------
export const ALL_PLACES: TripPlace[] = [...JOURNEY_STOPS, ...SAVED_PLACES];

// =============================================================================
// Faroe Islands bounding box for the initial map view.
// =============================================================================
export const FAROE_BOUNDS: [[number, number], [number, number]] = [
  [-7.85, 61.25], // south-west
  [-6.1, 62.45],  // north-east
];

// Maximum bounds — generous enough to allow comfortable panning.
export const FAROE_MAX_BOUNDS: [[number, number], [number, number]] = [
  [-9.0, 60.8],
  [-5.5, 63.0],
];
