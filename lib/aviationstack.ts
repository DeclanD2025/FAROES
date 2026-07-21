// =============================================================================
// AviationStack API integration for EDI departure board.
// Free tier: 100 req/month. Key set via NEXT_PUBLIC_AVIATIONSTACK_KEY or
// localStorage "faroe-api-key-aviationstack".
// =============================================================================

import { getApiKey } from "@/lib/api-keys";
import type { LiveRow } from "@/components/live-board";

const BASE = "https://api.aviationstack.com/v1/flights";

export function getEdiDeparturesUrl(): string | null {
  const key = getApiKey("aviationstack", "NEXT_PUBLIC_AVIATIONSTACK_KEY");
  if (!key) return null;
  return `${BASE}?access_key=${key}&dep_iata=EDI&flight_date=2026-07-27&limit=20`;
}

/** Transform AviationStack response → LiveRow[]. Returns null on empty/error. */
export function transformEdiDepartures(json: unknown): LiveRow[] | null {
  const data = json as { data?: Array<{
    flight_date?: string;
    flight_status?: string;
    departure?: { scheduled?: string; estimated?: string; terminal?: string; gate?: string; delay?: number };
    arrival?: { airport?: string; iata?: string };
    airline?: { name?: string };
    flight?: { iata?: string; number?: string };
  }> };
  if (!data?.data?.length) return null;

  return data.data.slice(0, 10).map((f) => {
    const flightCode = f.flight?.iata ?? f.flight?.number ?? "—";
    const dest = f.arrival?.iata ?? f.arrival?.airport ?? "—";
    const gate = f.departure?.gate ?? "—";
    const status = f.flight_status === "scheduled" ? "Scheduled"
      : f.flight_status === "active" ? "Departed"
      : f.flight_status === "landed" ? "Landed"
      : f.flight_status === "cancelled" ? "Cancelled"
      : f.flight_status === "delayed" ? "Delayed"
      : f.flight_status ?? "—";

    // Format time as HH:MM from ISO string
    const t = (f.departure?.scheduled ?? "").slice(11, 16) || "—";

    return {
      time: t,
      flight: flightCode,
      destination: dest,
      gate: gate,
      status: status,
    };
  });
}
