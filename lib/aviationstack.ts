// =============================================================================
// AviationStack API integration for live departure boards.
// Free tier: 100 req/month. Key set via NEXT_PUBLIC_AVIATIONSTACK_KEY or
// localStorage "faroe-api-key-aviationstack".
// =============================================================================

import { getApiKey } from "@/lib/api-keys";
import type { LiveRow } from "@/components/live-board";

export const FLIGHT_COLUMNS = [
  { key: "time", label: "Time", mono: true, narrow: true },
  { key: "flight", label: "Flight", mono: true, narrow: true },
  { key: "destination", label: "To", narrow: true },
  { key: "gate", label: "Gate", mono: true, narrow: true },
  { key: "status", label: "Status" },
];

const BASE = "https://api.aviationstack.com/v1/flights";

// ---- EDI departures (Day 1 · RC 415) ----

export function getEdiDeparturesUrl(): string | null {
  const key = getApiKey("aviationstack", "NEXT_PUBLIC_AVIATIONSTACK_KEY");
  if (!key) return null;
  return `${BASE}?access_key=${key}&dep_iata=EDI&flight_date=2026-07-27&limit=20`;
}

// ---- FAE departures (Day 6 · RC 416) ----

export function getFaeDeparturesUrl(): string | null {
  const key = getApiKey("aviationstack", "NEXT_PUBLIC_AVIATIONSTACK_KEY");
  if (!key) return null;
  return `${BASE}?access_key=${key}&dep_iata=FAE&flight_date=2026-08-01&limit=10`;
}

// ---- STN departures (Day 6 · RK 330) ----

export function getStnDeparturesUrl(): string | null {
  const key = getApiKey("aviationstack", "NEXT_PUBLIC_AVIATIONSTACK_KEY");
  if (!key) return null;
  return `${BASE}?access_key=${key}&dep_iata=STN&flight_date=2026-08-01&limit=10`;
}

// ---- Shared transform ----

function mapStatus(raw: string | undefined): string {
  if (!raw) return "—";
  switch (raw) {
    case "scheduled": return "Scheduled";
    case "active":    return "Departed";
    case "landed":    return "Landed";
    case "cancelled": return "Cancelled";
    case "delayed":   return "Delayed";
    default:          return raw;
  }
}

interface AviationStackFlight {
  flight_date?: string;
  flight_status?: string;
  departure?: { scheduled?: string; estimated?: string; terminal?: string; gate?: string; delay?: number };
  arrival?: { airport?: string; iata?: string };
  airline?: { name?: string };
  flight?: { iata?: string; number?: string };
}

function transformFlights(data: unknown, limit?: number): LiveRow[] | null {
  const parsed = data as { data?: AviationStackFlight[] };
  if (!parsed?.data?.length) return null;
  const flights = limit ? parsed.data.slice(0, limit) : parsed.data;

  return flights.map((f) => {
    const flightCode = f.flight?.iata ?? f.flight?.number ?? "—";
    const dest = f.arrival?.iata ?? f.arrival?.airport ?? "—";
    const gate = f.departure?.gate ?? "—";
    const status = mapStatus(f.flight_status);
    const t = (f.departure?.scheduled ?? "").slice(11, 16) || "—";
    return { time: t, flight: flightCode, destination: dest, gate, status };
  });
}

/** Transform AviationStack response → LiveRow[] for EDI departures. */
export function transformEdiDepartures(json: unknown): LiveRow[] | null {
  return transformFlights(json, 10);
}

/** Transform AviationStack response → LiveRow[] for FAE departures. */
export function transformFaeDepartures(json: unknown): LiveRow[] | null {
  return transformFlights(json, 5);
}

/** Transform AviationStack response → LiveRow[] for STN departures. */
export function transformStnDepartures(json: unknown): LiveRow[] | null {
  return transformFlights(json, 5);
}
