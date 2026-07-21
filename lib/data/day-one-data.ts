// =============================================================================
// Day 1 operational data — every practical detail for Monday 27 July 2026.
// Hardcoded because it's a single trip date. All times are local unless stated.
// Train times: typical Monday ScotRail departures (confirm near the date).
// Ferry times: SSL Route 7 published timetable.
// Flight: Atlantic Airways RC 415 schedule.
// =============================================================================

// -----------------------------------------------------------------------------
// Home → Edinburgh Airport
// -----------------------------------------------------------------------------
export const HOME_TO_AIRPORT = {
  origin: "40 Liberty Road, Bellshill, ML4 2EX",
  nearestStation: "Bellshill",
  stationWalk: "6 min east on Liberty Rd to Main St",
  stationPostcode: "ML4 1DT",
  scotrailRoute: "Bellshill → Haymarket",
  scotrailOperator: "ScotRail",
  scotrailFrequency: "Hourly on Mondays",
  scotrailTypicalJourneyTime: "~1h 03m to Haymarket",
  haymarketNote: "Get off at Haymarket. Tram stop is outside the station.",
  tramRoute: "Tram · Haymarket → Airport",
  tramFrequency: "Every 7 min",
  tramJourneyTime: "~25 min",
  tramPayment: "Tap-on-tap-off contactless or ticket machine.",
  totalTransitTime: "~1h 40m Bellshill → EDI terminal",
} as const;

// -----------------------------------------------------------------------------
// ScotRail — typical Monday departures Bellshill → Haymarket
// (Confirm near the date at scotrail.co.uk)
// -----------------------------------------------------------------------------
export const SCOTRAIL_DEPARTURES = [
  { dep: "08:59", arr: "10:02", notes: "" },
  { dep: "09:59", arr: "11:02", notes: "" },
  { dep: "10:59", arr: "12:02", notes: "" },
  { dep: "11:59", arr: "13:02", notes: "* safest — EDI by ~13:30" },
  { dep: "12:59", arr: "14:02", notes: "also fine — EDI by ~14:30" },
  { dep: "13:59", arr: "15:02", notes: "latest comfortable — EDI ~15:30" },
] as const;

// -----------------------------------------------------------------------------
// Edinburgh Airport — departure board for EDI → FAE
// -----------------------------------------------------------------------------
export const EDI_DEPARTURE_BOARD = [
  { time: "17:10", flight: "RC 415", destination: "Vágar (FAE)", carrier: "Atlantic Airways", gate: "Gate 7–10 (intl)", status: "Scheduled" },
] as const;

// -----------------------------------------------------------------------------
// Edinburgh Airport — gate-area pubs & food
// -----------------------------------------------------------------------------
export const EDI_PUBS_FOOD = [
  { name: "All Bar One", type: "Bar + dining", note: "Sit-down. Wine, cocktails, food. Nearest international gates.", walk: "Airside · gates 7–10" },
  { name: "The Sir Walter Scott", type: "Wetherspoons", note: "Pub food, cheap pints. Reliable.", walk: "Airside · main lounge" },
  { name: "Flutes and Tails", type: "Champagne bar", note: "Seafood and fizz.", walk: "Airside · central" },
  { name: "Pret a Manger", type: "Coffee + food", note: "Hot wraps, filter coffee. Grab and go.", walk: "Airside · throughout" },
  { name: "Starbucks", type: "Coffee", note: "Open late.", walk: "Airside · main concourse" },
] as const;

// -----------------------------------------------------------------------------
// The aircraft — Atlantic Airways RC 415
// -----------------------------------------------------------------------------
export const AIRCRAFT = {
  type: "Airbus A320neo (or A320-214)",
  registration: "OY-RC_ (varies)",
  airline: "Atlantic Airways",
  livery: "Blue + white. Faroese flag on tail.",
  engines: "CFM LEAP-1A26 (neo) or CFM56 (ceo)",
  capacity: "174–178 pax · single-class",
  cruiseAltitude: "35,000–39,000 ft",
  cruiseSpeed: "~830 km/h",
  range: "~6,300 km — this leg is 670 km",
  boardingMusic: "—",
  seatPitch: "~30 in",
  inflightService: "Buy on board. Faroese beer, snacks, duty-free.",
} as const;

// -----------------------------------------------------------------------------
// The flight — RC 415 Edinburgh → Vágar
// -----------------------------------------------------------------------------
export const THE_FLIGHT = {
  flightNumber: "RC 415",
  callsign: "FAROELINE 415",
  route: "EDI → FAE",
  date: "Monday 27 July 2026",
  scheduledDeparture: "17:10 BST",
  scheduledArrival: "18:35 WEST (UTC+1)",
  duration: "1h 25m",
  distance: "~670 km",
  departureGate: "7–10 (international pier)",
  departureRunway: "06/24 · typically 24",
  flightPath: "EDI westbound → over Firth of Forth → NW over Highlands → North Sea → descent over Faroe plateau → FAE runway 12/30",
  whatYouSee: [
    "Forth bridges (rail + road) ~3 min after takeoff",
    "Cairngorms right side, cloud permitting",
    "North Sea — 45 min open water",
    "Mykines and Vágar appear as dark shapes",
    "Curved approach between fjord walls — RNP AR 0.1 precision path",
    "Tindholmur and Drangarnir sea-stacks on final approach",
  ],
  approachNote: "RNP AR 0.1 approach allows landing in cloud as low as 300 ft. Curves between mountains into Sørvágur fjord. One of the more demanding commercial approaches in Europe.",
} as const;

// -----------------------------------------------------------------------------
// Vágar Airport — arrival
// -----------------------------------------------------------------------------
export const VAGAR_ARRIVAL = {
  airportName: "Vágar Airport (FAE)",
  location: "Sørvágur, Vágar island",
  elevation: "85 m",
  runway: "1,799 m · asphalt · 12/30",
  terminal: "Single terminal. Walk from aircraft across tarmac.",
  passportControl: "Non-Schengen queue. Passport stamp on request.",
  dutyFree: "Arrivals duty-free: alcohol, Faroese wool, souvenirs. Open for incoming flights.",
  cafe: "Small café. Coffee, pastries, sandwiches. Card only.",
  wifi: "Free airport Wi-Fi.",
  outsideView: "Cold Atlantic air. Mountain ahead, fjord to the right. No city. Basalt, moss, salt.",
  practicalNote: "No taxi rank. Pre-book or take Bus 300 from outside the terminal.",
  busStopLocation: "50 m from terminal exit. Bus 300 departs ~10 min after flight arrival.",
  simCard: "No SIM vendor. Buy eSIM before departure or use offline maps.",
} as const;

// -----------------------------------------------------------------------------
// Airport transfer — Bus 300 / taxi
// -----------------------------------------------------------------------------
export const AIRPORT_TRANSFER = {
  busRoute: "Bus 300 · Vágar Airport → Tórshavn",
  busDeparture: "~19:00 (meets RC 415)",
  busArrival: "~19:45 at Tórshavn bus terminal",
  busDuration: "~45 min",
  busRoutePath: "Vágatunnilin (subsea tunnel) → Route 10 Streymoy coast → Tórshavn",
  busFare: "DKK 90 pp (~£10) · or 7-day SSL Travel Card",
  busOperator: "SSL · ssl.fo",
  taxiFallback: "Pre-book: +298 232323 or +298 221212",
  taxiFare: "~DKK 800–1,200 (~£90–135)",
  taxiToFerryNote: "Ask for Farstøðin (ferry terminal), not bus station.",
  reminder: "Book bus or taxi before travel. Bus 300 doesn't need booking but confirm summer timetable at ssl.fo. Taxi must be pre-booked.",
} as const;

// -----------------------------------------------------------------------------
// Ferry — Smyril Route 7 · Tórshavn → Krambatangi
// -----------------------------------------------------------------------------
export const FERRY_BOARD = {
  route: "Route 7 · M/F Smyril",
  vessel: "M/F Smyril",
  vesselType: "Ro-pax · 200 cars + 975 pax",
  operator: "SSL",
  fromTerminal: "Farstøðin · Tórshavn",
  toTerminal: "Krambatangi · Suðuroy",
  crossingTime: "2h 05m",
  frequencyNote: "Three daily Mon departures. 21:15 is the last.",
  departures: [
    { dep: "08:45", arr: "10:50", note: "Morning — too early" },
    { dep: "16:00", arr: "18:05", note: "Afternoon — still in the air" },
    { dep: "21:15", arr: "23:20", note: "✓ our sailing — last of the day" },
  ],
  ourSailing: "21:15 · Tórshavn → Krambatangi",
  arrivalNote: "Arrives Krambatangi 23:20. Dark, exposed pier. Bring a layer.",
  bookingUrl: "https://booking.ssl.fo",
  bookingReminder: "Book this ferry. Gate closes 5 min before sailing. Queue 20 min before. Two foot passengers.",
  onboardFacilities: "Café (hot food, beer, coffee) · indoor seating · outdoor deck · free Wi-Fi",
  weatherSensitivity: "Sails in most conditions. Rare cancellations for extreme swell.",
  contingency: "If 21:15 is cancelled, next is 08:45 Tue. Need Tórshavn hotel.",
} as const;

// -----------------------------------------------------------------------------
// Krambatangi → Øravík AirBnB
// -----------------------------------------------------------------------------
export const TO_AIRBNB = {
  from: "Krambatangi ferry terminal",
  to: "Við á 7, Øravík 827, Suðuroy",
  distance: "~2 km",
  options: [
    { method: "Bus 700", detail: "Two stops Ferjuleðan → Øravík. ~8 min. DKK 20. Runs late on ferry days — confirm with driver.", status: "preferred" },
    { method: "Taxi", detail: "Pre-book: +298 239550. ~DKK 100–150 (£12–17). 5 min. Call from ferry before docking.", status: "fallback" },
    { method: "Walk", detail: "2 km · ~25 min on Route 14. Partial footpath, mostly road. Dark at 23:20 — not advised without torch.", status: "not-recommended" },
  ],
  airbnbAddress: "Við á 7, Øravík 827, Suðuroy",
  airbnbCheckIn: "Self check-in. Lockbox code in host message. Save offline.",
  airbnbContact: "Contact host via Airbnb app. Message before departure (arrival ~23:30).",
  nearestShop: "Tvøroyri (3–4 km north) · open till 22:00 Mon. Get supplies before ferry.",
  arrivalNote: "Arrival ~23:30–midnight. Still twilight — sunset ~22:15, sunrise ~04:45. Eye mask essential.",
} as const;
