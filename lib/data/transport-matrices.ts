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
      departureTime: "11:50",
      arrivalTime: "11:59",
      scheduledBuffer: "9 min",
      minimumBuffer: "5 min",
      risk: "low",
      consequence: "Miss the train: take backup at 12:59. ~1h delay.",
      backup: "Taxi to Haymarket (~£35, 35 min) or next train 12:59.",
    },
    {
      from: "Bellshill",
      to: "Haymarket",
      mode: "ScotRail",
      departureTime: "11:59",
      arrivalTime: "13:02",
      scheduledBuffer: "~3 min to tram",
      minimumBuffer: "2 min to tram",
      risk: "low",
      consequence: "Tram stop is directly outside the station. Short walk.",
      backup: "Taxi from Haymarket to EDI (~£25, 20 min).",
    },
    {
      from: "Haymarket",
      to: "Edinburgh Airport",
      mode: "Tram",
      departureTime: "~13:05",
      arrivalTime: "~13:35",
      scheduledBuffer: "~3h 35m",
      minimumBuffer: "2h",
      risk: "low",
      consequence: "Comfortable buffer. Time for lunch and a relaxed security queue.",
      backup: "Airport bus 100 runs every 10 min from Haymarket.",
    },
    {
      from: "Edinburgh Airport",
      to: "Vágar Airport",
      mode: "RC 415",
      departureTime: "17:10 BST",
      arrivalTime: "18:35 WEST",
      scheduledBuffer: "~2h 35m to ferry gate",
      minimumBuffer: "45 min",
      risk: "medium",
      consequence: "If RC 415 is significantly delayed, reassess the taxi and ferry connection immediately.",
      backup: "Contact Taxi og AirportTaxi and SSL; if the ferry cannot be reached, overnight in Tórshavn.",
    },
    {
      from: "Vágar Airport",
      to: "Farstøðin, Tórshavn",
      mode: "Confirmed AirportTaxi",
      departureTime: "After RC 415 lands",
      arrivalTime: "Before 21:10 gate closure",
      scheduledBuffer: "Taxi monitors RC 415",
      minimumBuffer: "Ferry gate closes 21:10",
      risk: "medium",
      consequence: "The taxi is booked specifically to make the 21:15 Smyril; keep its contact details offline.",
      backup: "If the ferry cannot be reached: overnight in Tórshavn.",
    },
    {
      from: "Tórshavn",
      to: "Krambatangi",
      mode: "M/F Smyril",
      departureTime: "21:15",
      arrivalTime: "23:20",
      scheduledBuffer: "Return transfer pre-booked",
      minimumBuffer: "—",
      risk: "medium",
      consequence: "Use the confirmed local transfer rather than relying on a late bus connection.",
      backup: "If the local transfer fails: contact the host and arrange a Suðuroy taxi.",
    },
    {
      from: "Krambatangi",
      to: "Øravík (Við á 7)",
      mode: "Pre-booked local transfer",
      departureTime: "After ferry arrival",
      arrivalTime: "Øravík check-in",
      scheduledBuffer: "—",
      minimumBuffer: "—",
      risk: "low",
      consequence: "Final destination. Gist self check-in; host Arnbjørn says the key will be in the door on arrival.",
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
      departureTime: "~19:50",
      arrivalTime: "~20:15",
      scheduledBuffer: "~55 min to ferry",
      minimumBuffer: "15 min",
      risk: "low",
      consequence: "Normal time: comfortable. Extra time/pens: very tight.",
      backup: "Taxi from Gundadalur to Farstøðin (~DKK 80, 3 min).",
    },
    {
      from: "Farstøðin",
      to: "Krambatangi",
      mode: "M/F Smyril",
      departureTime: "21:15",
      arrivalTime: "23:20",
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
      departureTime: "09:10 WEST",
      arrivalTime: "11:25 BST",
      scheduledBuffer: "1h 35m to coach",
      minimumBuffer: "45 min",
      risk: "medium",
      consequence: "RC 416 delay: rebook coach. 15:00 is last safe option.",
      backup: "Next National Express: 14:00, 15:00 (last safe). Book flexible ticket.",
    },
    {
      from: "Gatwick South Terminal",
      to: "Stansted Airport (STN)",
      mode: "National Express",
      departureTime: "13:00",
      arrivalTime: "~15:15",
      scheduledBuffer: "4h 20m to flight",
      minimumBuffer: "2h",
      risk: "low",
      consequence: "M25 traffic can add 30-60 min. Still comfortable buffer.",
      backup: "Train LGW→STN via London (Thameslink + Stansted Express, ~2h).",
    },
    {
      from: "Stansted",
      to: "Glasgow (GLA)",
      mode: "RK 330",
      departureTime: "19:35",
      arrivalTime: "21:10",
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
      departureTime: "After landing",
      arrivalTime: "~22:00",
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
