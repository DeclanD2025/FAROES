// =============================================================================
// InfoPanel — anchored overlay inside the map, showing selected place or
// journey-leg details. Desktop-only; mobile uses the bottom sheet.
// =============================================================================

import type { SelectedFeature } from "./faroes-map";

interface InfoPanelProps {
  selected: SelectedFeature;
  onClose: () => void;
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

export default function InfoPanel({ selected, onClose }: InfoPanelProps) {
  if (!selected) return null;

  return (
    <div
      className="hidden sm:block absolute top-3 right-3 z-10 w-[300px] lg:w-[340px] bg-wool/95 backdrop-blur-sm border border-basalt/20 shadow-sm"
      role="region"
      aria-label="Selected location details"
    >
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center text-basalt/60 hover:text-basalt text-[16px] leading-none"
        aria-label="Close details panel"
      >
        ×
      </button>

      <div className="p-4 pt-3 pr-9">
        {selected.kind === "place" ? (
          <PlaceContent place={selected.place} />
        ) : (
          <LegContent leg={selected.leg} />
        )}
      </div>
    </div>
  );
}

function PlaceContent({ place }: { place: import("@/lib/data/faroes-places").TripPlace }) {
  return (
    <>
      <p className="label mb-1">
        {place.routeSequence != null
          ? `Stop ${place.routeSequence} · ${place.category}`
          : place.category}
      </p>
      <h3 className="font-medium text-basalt text-[17px] leading-snug">
        {place.displayName}
      </h3>
      {place.time && (
        <p className="code text-fjord tnum text-[14px] mt-1">{place.time}</p>
      )}
      {place.day && (
        <p className="caption mt-0.5">{place.day}</p>
      )}
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
          className="inline-block mt-3 code text-[13px] underline decoration-basalt/30 underline-offset-4 hover:decoration-basalt"
        >
          Open link ↗
        </a>
      )}
    </>
  );
}

function LegContent({ leg }: { leg: import("@/lib/data/faroes-journey-legs").JourneyLeg }) {
  const modeLabel =
    leg.mode === "ferry" ? "Ferry" : leg.mode === "bus" ? "Bus" : leg.mode === "walk" ? "Walk" : "Transfer";
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
          <span className="text-basalt/30" aria-hidden>→</span>
        )}
        {leg.arrivalTime && (
          <span className="code text-fjord tnum">{leg.arrivalTime}</span>
        )}
      </div>
      {leg.duration && (
        <p className="caption mt-0.5">{leg.duration}</p>
      )}
      <StatusBadge status={leg.status} />
      {leg.practicalNote && (
        <p className="caption mt-3">{leg.practicalNote}</p>
      )}
    </>
  );
}
