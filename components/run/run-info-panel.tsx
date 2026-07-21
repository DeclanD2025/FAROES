// =============================================================================
// RunInfoPanel — route facts, character, scenery, navigation, conditions.
// Desktop: side panel. Mobile: stacked below map.
// =============================================================================

"use client";

import { useState, useEffect } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RunInfoPanelProps {
  totalKm: number | null;
  mobile?: boolean;
}

// ---------------------------------------------------------------------------
// Route facts
// ---------------------------------------------------------------------------

const ROUTE_FACTS = [
  { label: "Distance", value: "4.0 km" },
  { label: "Format", value: "Out & back" },
  { label: "Surface", value: "Road" },
  { label: "Profile", value: "Rolling" },
  { label: "Est. time", value: "30–36 min" },
];

const ROUTE_CHARACTER = {
  title: "Route character",
  body: "Begin at Við á 7, pass through Øravík and continue along the exposed old coastal road toward Tjaldavík. Turn after 2 km and retrace the route.",
};

const SCENERY = {
  title: "Scenery",
  body: "Village, church, open mountainside, coastline and Tjaldavík views.",
};

const NAVIGATION = {
  title: "Important navigation",
  body: "Stay on the surface road at the eastern junction. Do not enter Hovstunnilin.",
  warning: true,
};

const CONDITIONS = {
  title: "Conditions",
  body: "Limited pavement, possible traffic, exposed wind, mist, wet roads and sheep.",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RunInfoPanel({ totalKm, mobile }: RunInfoPanelProps) {
  const [gpxUrl, setGpxUrl] = useState("/routes/oravik-4km-scenic-run.gpx");

  useEffect(() => {
    setGpxUrl(new URL("../../routes/oravik-4km-scenic-run.gpx", window.location.href).href);
  }, []);

  const displayKm = totalKm !== null ? totalKm.toFixed(1) : "4.0";

  const content = (
    <>
      {/* Facts grid */}
      <div className={`grid grid-cols-2 ${mobile ? "sm:grid-cols-5" : "grid-cols-2"} gap-3`}>
        {ROUTE_FACTS.map((f) => (
          <div key={f.label}>
            <p className="text-[10px] uppercase tracking-[0.08em] text-basalt/50">
              {f.label}
            </p>
            <p className="text-[14px] font-medium text-basalt mt-0.5">
              {f.label === "Distance" ? `${displayKm} km` : f.value}
            </p>
          </div>
        ))}
      </div>

      {/* Route character */}
      <div className="mt-4 pt-4 border-t border-basalt/10">
        <p className="text-[10px] uppercase tracking-[0.1em] text-basalt/60 mb-1">
          {ROUTE_CHARACTER.title}
        </p>
        <p className="text-[13px] text-basalt/70 leading-relaxed">
          {ROUTE_CHARACTER.body}
        </p>
      </div>

      {/* Scenery */}
      <div className="mt-3">
        <p className="text-[10px] uppercase tracking-[0.1em] text-basalt/60 mb-1">
          {SCENERY.title}
        </p>
        <p className="text-[13px] text-basalt/70">{SCENERY.body}</p>
      </div>

      {/* Navigation warning */}
      <div className="mt-3 border border-rust/20 bg-rust/[0.03] rounded-[6px] p-3">
        <p className="text-[10px] uppercase tracking-[0.1em] text-rust font-medium mb-1">
          {NAVIGATION.title}
        </p>
        <p className="text-[13px] text-basalt/80 font-medium">
          {NAVIGATION.body}
        </p>
      </div>

      {/* Conditions */}
      <div className="mt-3">
        <p className="text-[10px] uppercase tracking-[0.1em] text-basalt/60 mb-1">
          {CONDITIONS.title}
        </p>
        <p className="text-[13px] text-basalt/70">{CONDITIONS.body}</p>
      </div>

      {/* Download GPX */}
      <div className="mt-4 pt-4 border-t border-basalt/10">
        <a
          href={gpxUrl}
          download="oravik-4km-scenic-run.gpx"
          className="inline-flex items-center gap-2 border border-basalt/25 rounded-[6px] px-4 py-2 text-[12px] font-medium text-basalt hover:border-claret/30 hover:text-claret transition-colors focus-visible:outline-2 focus-visible:outline-navy"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download GPX
        </a>
      </div>
    </>
  );

  if (mobile) {
    return (
      <div className="mt-4" role="complementary" aria-label="Run route information">
        {content}
      </div>
    );
  }

  return (
    <div className="space-y-0" role="complementary" aria-label="Run route information">
      {content}
    </div>
  );
}
