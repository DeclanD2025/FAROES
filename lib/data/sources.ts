// =============================================================================
// Faroe Islands trip · Source Verification System
// Every actionable data item carries a verification state with source metadata.
// Never use decorative "verified" labels — only mark confirmed when
// an actual source record exists and was checked.
// =============================================================================

export type Confidence = "confirmed" | "provisional" | "unverified" | "request-only" | "seasonal";

export interface SourceRecord {
  /** Human-readable title of the source */
  title: string;
  /** Direct URL to the source */
  url: string;
  /** ISO date when this information was last checked */
  lastChecked: string;
  /** What specific claim was verified */
  whatWasVerified: string;
  /** Short note explaining uncertainty or caveats */
  note?: string;
}

export interface VerifiedData {
  confidence: Confidence;
  sources: SourceRecord[];
  /** Action the user should take to verify (null if fully confirmed) */
  actionRequired?: string;
}

// =============================================================================
// Source library — all official sources used across the application
// =============================================================================

export const SOURCE_LIBRARY = {
  ssl: {
    title: "Strandfaraskip Landsins (SSL)",
    url: "https://ssl.fo",
    category: "transport",
  },
  sslBooking: {
    title: "SSL Ferry Booking",
    url: "https://booking.ssl.fo",
    category: "transport",
  },
  sslTimetable: {
    title: "SSL Timetables",
    url: "https://ssl.fo/timetables",
    category: "transport",
  },
  yr: {
    title: "yr.no — Norwegian Meteorological Institute",
    url: "https://www.yr.no/en",
    category: "weather",
  },
  atlanticAirways: {
    title: "Atlantic Airways",
    url: "https://www.atlanticairways.com",
    category: "flight",
  },
  visitFaroe: {
    title: "Visit Faroe Islands",
    url: "https://visitfaroeislands.com",
    category: "tourism",
  },
  visitSuduroy: {
    title: "Visit Suðuroy",
    url: "https://visitsuduroy.fo",
    category: "tourism",
  },
  visitTorshavn: {
    title: "Visit Tórshavn",
    url: "https://visittorshavn.fo",
    category: "tourism",
  },
  motherwellFC: {
    title: "Motherwell FC",
    url: "https://www.motherwellfc.co.uk",
    category: "football",
  },
  hbTorshavn: {
    title: "HB Tórshavn",
    url: "https://hb.fo",
    category: "football",
  },
  uefa: {
    title: "UEFA",
    url: "https://www.uefa.com",
    category: "football",
  },
  scotrail: {
    title: "ScotRail",
    url: "https://www.scotrail.co.uk",
    category: "rail",
  },
  edinburghTram: {
    title: "Edinburgh Trams",
    url: "https://edinburghtrams.com",
    category: "tram",
  },
  nationalExpress: {
    title: "National Express",
    url: "https://www.nationalexpress.com",
    category: "coach",
  },
  ryanair: {
    title: "Ryanair",
    url: "https://www.ryanair.com",
    category: "flight",
  },
  vagarAirport: {
    title: "Vágar Airport (FAE)",
    url: "https://www.fae.fo",
    category: "airport",
  },
  guesthouseHugo: {
    title: "Guesthouse Hugo",
    url: "https://guesthousehugo.com",
    category: "accommodation",
  },
  airbnb: {
    title: "Airbnb",
    url: "https://www.airbnb.com",
    category: "accommodation",
  },
  oyBrewing: {
    title: "OY Brewing",
    url: "https://oy.fo",
    category: "food-drink",
  },
  hotelTvoroyri: {
    title: "Hotel Tvøroyri",
    url: "https://hoteltvoroyri.fo",
    category: "food-drink",
  },
  cafeMorMor: {
    title: "Café MorMor",
    url: "https://www.facebook.com/cafemormor",
    category: "food-drink",
  },
  bonus: {
    title: "Bónus Faroe Islands",
    url: "https://bonus.fo",
    category: "shops",
  },
  flightradar: {
    title: "FlightRadar24",
    url: "https://www.flightradar24.com",
    category: "flight-tracking",
  },
  openStreetMap: {
    title: "OpenStreetMap",
    url: "https://www.openstreetmap.org",
    category: "maps",
  },
} as const;

// =============================================================================
// Helper to create verified data records concisely
// =============================================================================

export function verified(
  what: string,
  ...sources: { title: string; url: string; note?: string }[]
): VerifiedData {
  return {
    confidence: "confirmed",
    sources: sources.map((s) => ({
      title: s.title,
      url: s.url,
      lastChecked: "2026-07-17",
      whatWasVerified: what,
      note: s.note,
    })),
  };
}

export function provisional(
  what: string,
  action: string,
  ...sources: { title: string; url: string; note?: string }[]
): VerifiedData {
  return {
    confidence: "provisional",
    sources: sources.map((s) => ({
      title: s.title,
      url: s.url,
      lastChecked: "2026-07-17",
      whatWasVerified: what,
      note: s.note,
    })),
    actionRequired: action,
  };
}

export function unverified(what: string, action: string): VerifiedData {
  return {
    confidence: "unverified",
    sources: [],
    actionRequired: action,
  };
}

// =============================================================================
// Confidence display helpers
// =============================================================================

export function confidenceLabel(c: Confidence): string {
  switch (c) {
    case "confirmed": return "Confirmed";
    case "provisional": return "Provisional";
    case "unverified": return "Unverified";
    case "request-only": return "Request-only";
    case "seasonal": return "Seasonal";
  }
}

export function confidenceColor(c: Confidence): string {
  switch (c) {
    case "confirmed": return "text-moss";
    case "provisional": return "text-yellow";
    case "unverified": return "text-rust";
    case "request-only": return "text-fjord";
    case "seasonal": return "text-fjord/70";
  }
}
