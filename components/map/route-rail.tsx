// =============================================================================
// RouteRail — compact text-based journey rail below the map.
// Each item displays sequence number, name, time, service, and status.
// Clicking selects the corresponding marker on the map.
// =============================================================================

import { JOURNEY_STOPS } from "@/lib/data/faroes-places";
import { JOURNEY_LEGS } from "@/lib/data/faroes-journey-legs";
import type { SelectedFeature } from "./faroes-map";

interface RouteRailProps {
  onSelect: (feature: SelectedFeature) => void;
  selected: SelectedFeature;
}

function StatusDot({ status }: { status?: string }) {
  if (status === "confirmed") {
    return <span className="status-dot text-moss" aria-label="Confirmed" />;
  }
  if (status === "needs-booking") {
    return <span className="status-dot text-rust" aria-label="Needs booking" />;
  }
  return <span className="status-dot text-yellow" aria-label="Pending" />;
}

export default function RouteRail({ onSelect, selected }: RouteRailProps) {
  return (
    <nav aria-label="Journey route sequence" className="mt-6">
      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
        {JOURNEY_STOPS.map((place) => {
          const isSelected =
            selected?.kind === "place" && selected.place.id === place.id;
          const leg = JOURNEY_LEGS.find(
            (l) => l.fromPlaceId === place.id,
          );
          return (
            <li key={place.id}>
              <button
                type="button"
                onClick={() => onSelect({ kind: "place", place })}
                aria-pressed={isSelected}
                className={`w-full text-left p-3 border transition-colors ${
                  isSelected
                    ? "border-basalt/40 bg-fog/40"
                    : "border-basalt/10 hover:bg-fog/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="code text-fjord tnum font-medium text-[16px]" aria-hidden>
                    {String(place.routeSequence).padStart(2, "0")}
                  </span>
                  <StatusDot status={place.status} />
                </div>
                <p className="font-medium text-basalt text-[14.5px] leading-tight">
                  {place.name}
                </p>
                {place.time && (
                  <p className="code text-fjord tnum text-[13px] mt-0.5">
                    {place.service ?? place.time}
                  </p>
                )}
                {leg && (
                  <p className="caption mt-1 line-clamp-1">
                    {leg.service} · {leg.duration}
                  </p>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
