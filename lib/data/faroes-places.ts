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
    id: "bellshill-station",
    name: "Bellshill",
    displayName: "Bellshill Station",
    coordinates: [-4.024, 55.817],
    category: "transfer",
    routeSequence: 1,
    day: "Mon 27 Jul",
    time: "11:59",
    status: "confirmed",
    description: "ScotRail departure station. Walk east on Liberty Road to Main Street — ~6 min from home.",
    practicalNote: "ScotRail 11:59 → Haymarket (arr 13:02). Backup: 12:59. Taxi to Haymarket ~£35 if trains fail.",
    service: "ScotRail · 1h 03m",
  },
  {
    id: "haymarket",
    name: "Haymarket",
    displayName: "Haymarket Station",
    coordinates: [-3.219, 55.946],
    category: "transfer",
    routeSequence: 2,
    day: "Mon 27 Jul",
    time: "13:02",
    status: "confirmed",
    description: "ScotRail terminus. Edinburgh Tram stop is directly outside the station — no street crossing needed.",
    practicalNote: "Tram to Edinburgh Airport every 7–8 min, ~30 min journey. Tap-on tap-off contactless.",
    service: "Edinburgh Tram",
  },
  {
    id: "edinburgh-airport",
    name: "Edinburgh Airport",
    displayName: "Edinburgh Airport (EDI)",
    coordinates: [-3.363, 55.950],
    category: "airport",
    routeSequence: 3,
    day: "Mon 27 Jul",
    time: "17:10",
    status: "confirmed",
    description: "Atlantic Airways RC 415 departs for Vágar at 17:10. Arrive by ~13:40 — comfortable 3h 30m buffer.",
    practicalNote: "Airside food: All Bar One, Wetherspoons, Pret. Flight boards ~30 min before departure from gates 7–10.",
    service: "RC 415 · Atlantic Airways",
  },
  {
    id: "vagar-airport",
    name: "Vágar Airport",
    displayName: "Vágar Airport (FAE)",
    coordinates: [-7.2772, 62.0636],
    category: "airport",
    routeSequence: 4,
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
    routeSequence: 5,
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
    routeSequence: 5,
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
    routeSequence: 6,
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
    displayName: "Øravík · Gist",
    coordinates: [-6.81, 61.536],
    category: "accommodation",
    routeSequence: 7,
    day: "Mon 27 Jul – Fri 31 Jul",
    status: "confirmed",
    description: "Gist, the main Suðuroy base for four nights. Quiet mid-island village near the Krambatangi ferry terminal and on the Bus 700 route.",
    practicalNote: "Host Arnbjørn. The entrance is marked “Gist”; self check-in with the key in the door on arrival. Nearest shop in Tvøroyri, 3–4 km north.",
    href: "https://www.airbnb.co.uk/rooms/43322258",
  },
  {
    id: "sorvagur",
    name: "Sørvágur",
    displayName: "Sørvágur · Guesthouse Hugo",
    coordinates: [-7.3577, 62.0973],
    category: "accommodation",
    routeSequence: 8,
    day: "Sat 1 Aug",
    time: "07:35",
    status: "confirmed",
    description: "Final-morning base on Vágar. Walk 2 min to the village bus stop for Bus 300 to the airport.",
    practicalNote: "Guesthouse Hugo, 2 Bakkavegur. Conf. 5924180270, PIN 9432. Double-check drawers before leaving.",
  },
  {
    id: "london-gatwick",
    name: "Gatwick",
    displayName: "London Gatwick (LGW)",
    coordinates: [-0.190, 51.148],
    category: "airport",
    routeSequence: 9,
    day: "Sat 1 Aug",
    time: "11:25 BST",
    status: "confirmed",
    description: "RC 416 lands from Vágar. Self-transfer: collect bags, take free monorail to South Terminal, catch National Express to Stansted.",
    practicalNote: "North Terminal arrivals. Monorail to South Terminal every 3 min. Coach station at South Terminal lower level.",
    service: "RC 416 · Atlantic Airways",
  },
  {
    id: "london-stansted",
    name: "Stansted",
    displayName: "London Stansted (STN)",
    coordinates: [0.235, 51.885],
    category: "airport",
    routeSequence: 10,
    day: "Sat 1 Aug",
    time: "~15:15",
    status: "confirmed",
    description: "National Express coach arrives from Gatwick. RK 330 departs for Glasgow at 19:35 — ~4h buffer to clear security.",
    practicalNote: "Food court before security. Wetherspoons airside (The Windmill). Ryanair check-in closes 40 min before departure.",
    service: "RK 330 · Ryanair UK",
  },
  {
    id: "glasgow-airport",
    name: "Glasgow Airport",
    displayName: "Glasgow Airport (GLA)",
    coordinates: [-4.433, 55.872],
    category: "airport",
    routeSequence: 11,
    day: "Sat 1 Aug",
    time: "21:10",
    status: "confirmed",
    description: "Final stop. RK 330 lands from Stansted. Domestic arrivals — no passport control. Taxi ~35 min to Bellshill.",
    practicalNote: "Taxi rank outside domestic arrivals (~£35). Bus 500 + ScotRail ~£10 (1h 10m). Pick-up at short-stay car park.",
    service: "Taxi / Bus 500",
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
  [-10.0, 50.0],
  [1.5, 63.5],
];
