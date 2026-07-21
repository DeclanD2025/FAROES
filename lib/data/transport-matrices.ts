// =============================================================================
// Faroe Islands trip · Transport Matrices
// Connection chains with buffer calculations and risk states.
// Each connection: arriving leg → departing leg → scheduled buffer →
// minimum comfortable buffer → risk → backup.
// =============================================================================

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface ConnectionLink {
  from: string;
  to: string;
  mode: string;
  arrivalTime: string;
  departureTime: string;
  scheduledBuffer: string;
  minimumBuffer: string;
  risk: RiskLevel;
  consequence: string;
  backup: string;
  sourceNote?: string;
}

export interface ConnectionChain {
  id: string;
  title: string;
  day: number;
  links: ConnectionLink[];
}

// =============================================================================
// Day 1 — Arrival: Home → Bellshill → Haymarket → EDI → FAE → Tórshavn → Smyril → Krambatangi → Øravík
// =============================================================================

export const DAY1_CONNECTIONS: ConnectionChain = {
  id: "day1-arrival",
  title: "Connection chain · Monday 27 July",
  day: 1,
  links: [
    {
      from: "Home (Liberty Rd)",
      to: "Bellshill Station",
      mode: "Walk",
      arrivalTime: "08:50",
      departureTime: "08:59",
      scheduledBuffer: "9 min",
      minimumBuffer: "5 min",
      risk: "low",
      consequence: "Miss the train: take backup at 09:59. ~1h delay.",
      backup: "Taxi to Haymarket (~£35, 35 min) or next train 09:59.",
    },
    {
      from: "Bellshill",
      to: "Haymarket",
      mode: "ScotRail",
      arrivalTime: "10:02",
      departureTime: "~10:05",
      scheduledBuffer: "~3 min",
      minimumBuffer: "2 min",
      risk: "low",
      consequence: "Tram stop is directly outside the station. Short walk.",
      backup: "Taxi from Haymarket to EDI (~£25, 20 min).",
    },
    {
      from: "Haymarket",
      to: "Edinburgh Airport",
      mode: "Tram",
      arrivalTime: "~10:35",
      departureTime: "17:10",
      scheduledBuffer: "~6h 35m",
      minimumBuffer: "2h",
      risk: "low",
      consequence: "Massive buffer. Airport is the contingency.",
      backup: "Airport bus 100 runs every 10 min from Haymarket.",
    },
    {
      from: "Edinburgh Airport",
      to: "Vágar Airport",
      mode: "RC 415",
      arrivalTime: "18:35",
      departureTime: "~19:00",
      scheduledBuffer: "~25 min",
      minimumBuffer: "15 min",
      risk: "medium",
      consequence: "Bus 300 meets RC 415. If flight is significantly delayed, bus may not wait.",
      backup: "Taxi from FAE to Tórshavn (~DKK 1,200, 30 min). Or next Bus 300.",
    },
    {
      from: "Vágar Airport",
      to: "Tórshavn",
      mode: "Bus 300",
      arrivalTime: "~19:45",
      departureTime: "21:15",
      scheduledBuffer: "~1h 30m",
      minimumBuffer: "30 min",
      risk: "medium",
      consequence: "Last ferry of the day. If bus is late or delayed, lose the ferry.",
      backup: "Taxi direct to ferry terminal. If ferry missed: overnight in Tórshavn.",
    },
    {
      from: "Tórshavn",
      to: "Krambatangi",
      mode: "M/F Smyril",
      arrivalTime: "23:20",
      departureTime: "~23:25",
      scheduledBuffer: "~5 min",
      minimumBuffer: "2 min",
      risk: "medium",
      consequence: "Miss the bus: walk 2 km (25 min with luggage, uphill, unlit road).",
      backup: "Pre-booked taxi +298 239550. Walk with phone torch if desperate.",
    },
    {
      from: "Krambatangi",
      to: "Øravík (Við á 7)",
      mode: "Bus 700 / walk",
      arrivalTime: "~23:30",
      departureTime: "—",
      scheduledBuffer: "—",
      minimumBuffer: "—",
      risk: "low",
      consequence: "Final destination. Self check-in with lockbox.",
      backup: "Taxi if bus doesn't run. ~DKK 150.",
    },
  ],
};

// =============================================================================
// Day 4 — Matchday ferry critical path
// =============================================================================

export const DAY4_MATCH_CONNECTIONS: ConnectionChain = {
  id: "day4-match",
  title: "Matchday critical path · Thursday 30 July",
  day: 4,
  links: [
    {
      from: "Tórsvøllur (full time)",
      to: "Farstøðin ferry terminal",
      mode: "Walk",
      arrivalTime: "~20:10",
      departureTime: "21:15",
      scheduledBuffer: "~1h 5m",
      minimumBuffer: "15 min",
      risk: "low",
      consequence: "Normal time: comfortable. Extra time/pens: very tight.",
      backup: "Taxi from Gundadalur to Farstøðin (~DKK 80, 3 min).",
    },
    {
      from: "Farstøðin",
      to: "Krambatangi",
      mode: "M/F Smyril",
      arrivalTime: "23:20",
      departureTime: "—",
      scheduledBuffer: "—",
      minimumBuffer: "—",
      risk: "critical",
      consequence: "Last boat. Miss it: sleep in Tórshavn.",
      backup: "Emergency: Hotel Hafnia +298 313233, Hotel Føroyar +298 317500, AirBnB last-minute.",
    },
  ],
};

// =============================================================================
// Day 6 — Self-transfer risk diagram
// =============================================================================

export const DAY6_SELF_TRANSFER: ConnectionChain = {
  id: "day6-self-transfer",
  title: "Self-transfer risk · Saturday 1 August",
  day: 6,
  links: [
    {
      from: "Vágar Airport (FAE)",
      to: "London Gatwick (LGW)",
      mode: "RC 416",
      arrivalTime: "11:25 BST",
      departureTime: "13:00",
      scheduledBuffer: "1h 35m",
      minimumBuffer: "45 min",
      risk: "medium",
      consequence: "RC 416 delay: rebook coach. 15:00 is last safe option.",
      backup: "Next National Express: 14:00, 15:00 (last safe). Book flexible ticket.",
    },
    {
      from: "Gatwick South Terminal",
      to: "Stansted Airport (STN)",
      mode: "National Express",
      arrivalTime: "~15:15",
      departureTime: "19:35",
      scheduledBuffer: "4h 20m",
      minimumBuffer: "2h",
      risk: "low",
      consequence: "M25 traffic can add 30-60 min. Still comfortable buffer.",
      backup: "Train LGW→STN via London (Thameslink + Stansted Express, ~2h).",
    },
    {
      from: "Stansted",
      to: "Glasgow (GLA)",
      mode: "RK 330",
      arrivalTime: "21:10",
      departureTime: "—",
      scheduledBuffer: "—",
      minimumBuffer: "—",
      risk: "low",
      consequence: "Final leg. Domestic arrival — quick exit.",
      backup: "If RK 330 cancelled: next Ryanair STN→GLA next day. Or train from London.",
    },
    {
      from: "Glasgow Airport",
      to: "Bellshill (Home)",
      mode: "Taxi / Bus+Train",
      arrivalTime: "~22:00",
      departureTime: "—",
      scheduledBuffer: "—",
      minimumBuffer: "—",
      risk: "low",
      consequence: "Final journey. Multiple options.",
      backup: "Taxi ~£35 (35 min). Bus 500 + ScotRail ~£10 (1h 10m).",
    },
  ],
};

// =============================================================================
// Ferry comparison table — Day 5
// =============================================================================

export interface FerryOption {
  id: string;
  departure: string;
  arrival: string;
  crossingTime: string;
  route300Connection: string;
  arrivalSorvagur: string;
  totalJourneyTime: string;
  sleepAfterMatchday: string;
  usableVagarTime: string;
  disruptionResilience: RiskLevel;
  recommendation: string;
}

export const FRIDAY_FERRY_OPTIONS: FerryOption[] = [
  {
    id: "friday-early",
    departure: "Krambatangi 09:00",
    arrival: "Tórshavn 11:05",
    crossingTime: "2h 05m",
    route300Connection: "Tórshavn 11:30",
    arrivalSorvagur: "~12:15",
    totalJourneyTime: "~3h 15m",
    sleepAfterMatchday: "~6-7h (early alarm)",
    usableVagarTime: "~7h (full afternoon + evening)",
    disruptionResilience: "high",
    recommendation: "Best for Vágar exploration. Requires early start but full day available.",
  },
  {
    id: "friday-mid",
    departure: "Krambatangi 11:30",
    arrival: "Tórshavn 13:35",
    crossingTime: "2h 05m",
    route300Connection: "Tórshavn 14:00",
    arrivalSorvagur: "~14:45",
    totalJourneyTime: "~3h 15m",
    sleepAfterMatchday: "~8-9h (reasonable wake)",
    usableVagarTime: "~4-5h (afternoon)",
    disruptionResilience: "high",
    recommendation: "Good balance. Meaningful Vágar time without painful early start.",
  },
  {
    id: "friday-afternoon",
    departure: "Krambatangi 16:00",
    arrival: "Tórshavn 18:05",
    crossingTime: "2h 05m",
    route300Connection: "Tórshavn 18:30",
    arrivalSorvagur: "~19:15",
    totalJourneyTime: "~3h 15m",
    sleepAfterMatchday: "~13h (very leisurely)",
    usableVagarTime: "~1-2h (evening only)",
    disruptionResilience: "medium",
    recommendation: "Most rest. Limited Vágar time — evening walk in Sørvágur only.",
  },
];

// =============================================================================
// All connection chains
// =============================================================================

export const CONNECTION_CHAINS: Record<string, ConnectionChain> = {
  day1: DAY1_CONNECTIONS,
  day4: DAY4_MATCH_CONNECTIONS,
  day6: DAY6_SELF_TRANSFER,
};
