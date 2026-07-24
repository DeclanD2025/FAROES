// =============================================================================
// RunInfoPanel — route facts, character, scenery, trail conditions,
// road return guidance, weather decision, and GPX download.
// Desktop: side panel. Mobile: stacked below map.
// =============================================================================

"use client";

import { useMemo } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RunInfoPanelProps {
  totalKm: number | null;
  mobile?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGpxDownloadUrl(): string {
  if (typeof window === "undefined") return "/routes/oravik-fell-loop.gpx";
  return new URL("../../routes/oravik-fell-loop.gpx", window.location.href).href;
}

// ---------------------------------------------------------------------------
// Route facts
// ---------------------------------------------------------------------------

const ROUTE_FACTS = [
  { label: "Distance", value: "4.13 km" },
  { label: "Format", value: "True loop" },
  { label: "Surface", value: "Trail + road" },
  { label: "Profile", value: "Challenging" },
  { label: "Ascent", value: "~222 m" },
  { label: "Est. time", value: "55–75 min" },
];

const START_INFO = {
  title: "Start",
  body: "Walk approximately 112 metres from Við á 7 to Bønhúsið. From the prayer house, follow Vestan Garða uphill for about 195 metres to the stone-wall gate. Pass through the gate and begin the marked village path. Close any gate behind you.",
};

const ROUTE_INFO = {
  title: "Route",
  body: "Climb west on the official Øravík–Fámjin village path. The path is grassy and climbs steeply above Øravík. After approximately 1.53 km, leave the village path where it meets route 99 and begin the tunnel-free return. Follow route 99, the old track, Fámjinsvegur and Bóndatún back to Bønhúsið.",
};

const ROUTE_CHARACTER = {
  title: "Route character",
  body: "This is a run-hike rather than an easy continuous road run. Expect to power-walk parts of the climb. The first half gains roughly 180 metres in around 1.5 km before the route descends by track and road.",
};

const SCENERY = {
  title: "Scenery",
  body: "Views over Øravík, the surrounding valley, streams, open fell and the mountain road towards Øraskarð.",
};

const TRAIL_CONDITIONS = {
  title: "Trail conditions",
  body: "The village path is mostly grass-covered and can be wet. The climb is steep and may be slippery. Wear trail shoes with dependable grip.",
};

const ROAD_RETURN = {
  title: "Road return",
  body: "The return includes an old track and live narrow roads. Face approaching traffic, remain visible and take care at blind bends. Do not enter Fámjinstunnilin or Hovstunnilin.",
};

const WEATHER_DECISION = {
  title: "Weather decision",
  body: "Only use this route in clear visibility and reasonably dry, calm conditions. Do not use it in fog, darkness, heavy rain or strong wind.",
};

const FALLBACK = {
  title: "Fallback",
  body: "When the fell section is unsuitable, use the separate coastal road out-and-back. Do not improvise a shortcut across fields.",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RunInfoPanel({ totalKm, mobile }: RunInfoPanelProps) {
  const gpxUrl = useMemo(() => {
    if (typeof window === "undefined") return "/routes/oravik-fell-loop.gpx";
    return new URL("../../routes/oravik-fell-loop.gpx", window.location.href).href;
  }, []);

  const displayKm = totalKm !== null ? totalKm.toFixed(2) : "4.13";

  const content = (
    <>
      {/* Heading */}
      <p
        className="font-medium text-basalt mb-0.5"
        style={{ fontFamily: "var(--font-cinzel)", fontSize: 18 }}
      >
        Øravík Fell Loop
      </p>
      <p className="text-[12px] text-basalt/60 leading-relaxed">
        A steep village-path climb and tunnel-free old-road return.
      </p>

      {/* Facts grid */}
      <div className={`grid grid-cols-2 ${mobile ? "sm:grid-cols-3" : "grid-cols-2"} gap-3 mt-4`}>
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

      {/* Start */}
      <div className="mt-4 pt-4 border-t border-basalt/10">
        <p className="text-[10px] uppercase tracking-[0.1em] text-basalt/60 mb-1">
          {START_INFO.title}
        </p>
        <p className="text-[13px] text-basalt/70 leading-relaxed">
          {START_INFO.body}
        </p>
      </div>

      {/* Route */}
      <div className="mt-3">
        <p className="text-[10px] uppercase tracking-[0.1em] text-basalt/60 mb-1">
          {ROUTE_INFO.title}
        </p>
        <p className="text-[13px] text-basalt/70 leading-relaxed">
          {ROUTE_INFO.body}
        </p>
      </div>

      {/* Route character */}
      <div className="mt-3">
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

      {/* Trail conditions */}
      <div className="mt-3">
        <p className="text-[10px] uppercase tracking-[0.1em] text-basalt/60 mb-1">
          {TRAIL_CONDITIONS.title}
        </p>
        <p className="text-[13px] text-basalt/70">{TRAIL_CONDITIONS.body}</p>
      </div>

      {/* Road return */}
      <div className="mt-3">
        <p className="text-[10px] uppercase tracking-[0.1em] text-basalt/60 mb-1">
          {ROAD_RETURN.title}
        </p>
        <p className="text-[13px] text-basalt/70">{ROAD_RETURN.body}</p>
      </div>

      {/* Weather decision — prominent warning */}
      <div className="mt-3 border border-rust/20 bg-rust/[0.03] rounded-[6px] p-3">
        <p className="text-[10px] uppercase tracking-[0.1em] text-rust font-medium mb-1">
          {WEATHER_DECISION.title}
        </p>
        <p className="text-[13px] text-basalt/80 font-medium">
          {WEATHER_DECISION.body}
        </p>
      </div>

      {/* Fallback */}
      <div className="mt-3">
        <p className="text-[10px] uppercase tracking-[0.1em] text-basalt/60 mb-1">
          {FALLBACK.title}
        </p>
        <p className="text-[13px] text-basalt/70">{FALLBACK.body}</p>
      </div>

      {/* Download GPX */}
      <div className="mt-4 pt-4 border-t border-basalt/10">
        <a
          href={gpxUrl}
          download="oravik-fell-loop.gpx"
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
          Download loop GPX
        </a>
        <p className="text-[10px] text-basalt/40 mt-1.5">
          Audited route — generated from official trail and mapped road data.
        </p>
      </div>
    </>
  );

  if (mobile) {
    return (
      <div className="mt-4" role="complementary" aria-label="Fell loop route information">
        {content}
      </div>
    );
  }

  return (
    <div className="space-y-0" role="complementary" aria-label="Fell loop route information">
      {content}
    </div>
  );
}
