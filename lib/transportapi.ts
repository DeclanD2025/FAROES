// =============================================================================
// TransportAPI integration for ScotRail departures from Bellshill (BLH).
// Free tier: 30 req/day. Key set via NEXT_PUBLIC_TRANSPORTAPI_KEY or
// localStorage "faroe-api-key-transportapi".
//
// Note: for a future date like July 2026, the API may return an empty
// timetable. The LiveBoard will gracefully fall back to hardcoded data.
// =============================================================================

import { getApiKey } from "@/lib/api-keys";
import type { LiveRow } from "@/components/live-board";

const BASE = "https://transportapi.com/v3/uk/train/station";

export function getBlhDeparturesUrl(): string | null {
  const key = getApiKey("transportapi", "NEXT_PUBLIC_TRANSPORTAPI_KEY");
  if (!key) return null;
  // BLH is the CRS code for Bellshill. "timetable" endpoint works for future dates.
  // app_id: register at transportapi.com and set NEXT_PUBLIC_TRANSPORTAPI_APP_ID
  const appId = (process.env as Record<string, string | undefined>).NEXT_PUBLIC_TRANSPORTAPI_APP_ID ?? "faroe-islands";
  return `${BASE}/BLH/2026-07-27/12:00/timetable.json?api_key=${key}&app_id=${appId}&train_status=passenger&to=HYM`;
}

/** Transform TransportAPI response → LiveRow[]. Returns null on empty/error. */
export function transformBlhDepartures(json: unknown): LiveRow[] | null {
  const data = json as { departures?: { all?: Array<{
    aimed_departure_time?: string;
    aimed_arrival_time?: string;
    destination_name?: string;
    platform?: string;
    operator_name?: string;
    status?: string;
  }> } };
  if (!data?.departures?.all?.length) return null;

  return data.departures.all.slice(0, 10).map((d) => {
    const dep = (d.aimed_departure_time ?? "").slice(0, 5) || "—";
    const arr = (d.aimed_arrival_time ?? "").slice(0, 5) || "—";
    const status = d.status === "STARTS HERE" ? "On time"
      : d.status === "DELAYED" ? "Delayed"
      : d.status === "CANCELLED" ? "Cancelled"
      : d.status === "ON TIME" ? "On time"
      : d.status ?? "—";

    return {
      dep: dep,
      arr: arr,
      notes: status === "—" ? "" : status,
    };
  });
}
