// =============================================================================
// MobileBottomSheet — shows selected place/leg details at narrow widths.
// Collapsed state shows a summary pill; expanded state shows full details.
// =============================================================================

"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import type { SelectedFeature } from "./faroes-map";

interface MobileBottomSheetProps {
  selected: SelectedFeature;
  onClose: () => void;
  mapRef: RefObject<MapLibreMap | null>;
}

export default function MobileBottomSheet({
  selected,
  onClose,
  mapRef,
}: MobileBottomSheetProps) {
  const [expanded, setExpanded] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const prevSelectedIdRef = useRef<string | null>(null);

  // Expand when a new selection arrives. The setState inside the effect is
  // the legitimate purpose of this component — it responds to prop changes,
  // not cascading state updates.
  useEffect(() => {
    const id =
      selected?.kind === "place"
        ? selected.place.id
        : selected?.kind === "leg"
          ? selected.leg.id
          : null;
    if (id && id !== prevSelectedIdRef.current) {
      setExpanded(true);
    }
    prevSelectedIdRef.current = id;
  }, [selected]);

  // Prevent map scroll interference when touching the sheet
  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    const stop = (e: TouchEvent) => e.stopPropagation();
    el.addEventListener("touchstart", stop, { passive: true });
    el.addEventListener("touchmove", stop, { passive: true });
    return () => {
      el.removeEventListener("touchstart", stop);
      el.removeEventListener("touchmove", stop);
    };
  }, []);

  if (!selected) return null;

  const summary =
    selected.kind === "place"
      ? `${selected.place.routeSequence != null ? `0${selected.place.routeSequence} · ` : ""}${selected.place.displayName}`
      : `${selected.leg.service} · ${selected.leg.duration ?? ""}`;

  return (
    <div
      ref={sheetRef}
      className="sm:hidden fixed inset-x-0 bottom-0 z-30 bg-wool border-t border-basalt/15 shadow-sm"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      role="region"
      aria-label="Location details"
    >
      {/* Collapsed bar */}
      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="w-full text-left px-4 py-3 flex items-center justify-between"
        >
          <span className="text-[14px] font-medium text-basalt truncate">
            {summary}
          </span>
          <span className="text-basalt/40 text-[14px]" aria-hidden>
            ^
          </span>
        </button>
      )}

      {/* Expanded sheet */}
      {expanded && (
        <div className="px-4 pt-3 pb-5 max-h-[45vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <p className="label">
              {selected.kind === "place" ? "Location" : "Journey leg"}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="text-[13px] text-basalt/60 hover:text-basalt"
                aria-label="Collapse details"
              >
                ▼
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setExpanded(false);
                }}
                className="text-[13px] text-basalt/60 hover:text-basalt"
                aria-label="Close details"
              >
                ×
              </button>
            </div>
          </div>

          {selected.kind === "place" ? (
            <MobilePlaceContent place={selected.place} />
          ) : (
            <MobileLegContent leg={selected.leg} />
          )}

          {/* Fly-to button */}
          <button
            type="button"
            onClick={() => {
              const map = mapRef.current;
              if (!map) return;
              const coords =
                selected.kind === "place"
                  ? selected.place.coordinates
                  : selected.leg.geometry.coordinates[0] as [number, number];
              map.flyTo({ center: coords, zoom: Math.max(map.getZoom(), 11), duration: 600 });
            }}
            className="mt-4 border border-basalt/20 px-3 py-1.5 text-[13px] font-medium hover:bg-fog/30 transition-colors"
          >
            Show on map
          </button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const tone =
    status === "confirmed"
      ? "border-moss text-moss"
      : status === "needs-booking"
        ? "border-rust text-rust"
        : "border-yellow text-yellow";
  const label =
    status === "confirmed"
      ? "Confirmed"
      : status === "needs-booking"
        ? "Needs booking"
        : "Pending";
  return (
    <span
      className={`inline-block border ${tone} px-1.5 py-0.5 text-[10.5px] tracking-[0.14em] uppercase`}
    >
      {label}
    </span>
  );
}

function MobilePlaceContent({
  place,
}: {
  place: import("@/lib/data/faroes-places").TripPlace;
}) {
  return (
    <>
      <h3 className="font-medium text-basalt text-[17px] leading-snug">
        {place.displayName}
      </h3>
      {place.time && (
        <p className="code text-fjord tnum text-[14px] mt-1">{place.time}</p>
      )}
      {place.day && <p className="caption mt-0.5">{place.day}</p>}
      <StatusBadge status={place.status} />
      {place.description && (
        <p className="text-[14px] mt-3 leading-relaxed">{place.description}</p>
      )}
      {place.practicalNote && (
        <p className="caption mt-2">{place.practicalNote}</p>
      )}
      {place.href && (
        <a
          href={place.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 code text-[13px] underline decoration-basalt/30 underline-offset-4"
        >
          Open link ↗
        </a>
      )}
    </>
  );
}

function MobileLegContent({
  leg,
}: {
  leg: import("@/lib/data/faroes-journey-legs").JourneyLeg;
}) {
  const modeLabel =
    leg.mode === "ferry"
      ? "Ferry"
      : leg.mode === "bus"
        ? "Bus"
        : leg.mode === "walk"
          ? "Walk"
          : "Transfer";
  return (
    <>
      <p className="label mb-1">{modeLabel} leg</p>
      <h3 className="font-medium text-basalt text-[17px] leading-snug">
        {leg.service}
      </h3>
      <div className="flex items-baseline gap-x-3 mt-2">
        {leg.departureTime && (
          <span className="code text-fjord tnum">{leg.departureTime}</span>
        )}
        {leg.departureTime && leg.arrivalTime && (
          <span className="text-basalt/30" aria-hidden>
            →
          </span>
        )}
        {leg.arrivalTime && (
          <span className="code text-fjord tnum">{leg.arrivalTime}</span>
        )}
      </div>
      {leg.duration && <p className="caption mt-0.5">{leg.duration}</p>}
      <StatusBadge status={leg.status} />
      {leg.practicalNote && (
        <p className="caption mt-3">{leg.practicalNote}</p>
      )}
    </>
  );
}
