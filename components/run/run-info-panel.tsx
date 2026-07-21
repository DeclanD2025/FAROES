"use client";

import { useEffect, useState } from "react";

interface RunInfoPanelProps {
  totalKm: number | null;
  mobile?: boolean;
}

const FACTS = [
  { label: "Format", value: "True loop" },
  { label: "Surface", value: "Trail + road" },
  { label: "Ascent", value: "~222 m" },
  { label: "Est. time", value: "42–60 min" },
];

export function RunInfoPanel({ totalKm, mobile }: RunInfoPanelProps) {
  const [gpxUrl, setGpxUrl] = useState("/routes/oravik-4km-scenic-run.gpx");
  useEffect(() => {
    setGpxUrl(new URL("../../routes/oravik-4km-scenic-run.gpx", window.location.href).href);
  }, []);

  const distance = totalKm === null ? "4.13" : totalKm.toFixed(2);
  const content = (
    <>
      <div className={`grid grid-cols-2 ${mobile ? "sm:grid-cols-5" : ""} gap-3`}>
        <div>
          <p className="text-[10px] uppercase tracking-[0.08em] text-basalt/50">Distance</p>
          <p className="text-[14px] font-medium text-basalt mt-0.5">{distance} km</p>
        </div>
        {FACTS.map((fact) => (
          <div key={fact.label}>
            <p className="text-[10px] uppercase tracking-[0.08em] text-basalt/50">{fact.label}</p>
            <p className="text-[14px] font-medium text-basalt mt-0.5">{fact.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-basalt/10">
        <p className="text-[10px] uppercase tracking-[0.1em] text-basalt/60 mb-1">Start</p>
        <p className="text-[13px] text-basalt/75 leading-relaxed">
          Walk roughly 112 metres from Við á 7 to Bønhúsið and the official Øravík–Fámjin village-path entrance. The run starts and finishes there.
        </p>
      </div>

      <div className="mt-3">
        <p className="text-[10px] uppercase tracking-[0.1em] text-basalt/60 mb-1">Route</p>
        <p className="text-[13px] text-basalt/75 leading-relaxed">
          Climb west on the official village path for about 1.53 km. Where it meets route 99 near Øraskarð, turn onto the tunnel-free old-road return and follow route 99, the old track, Fámjinsvegur and Bóndatún back to Bønhúsið.
        </p>
      </div>

      <div className="mt-3 border border-rust/25 bg-rust/[0.04] rounded-[6px] p-3">
        <p className="text-[10px] uppercase tracking-[0.1em] text-rust font-medium mb-1">Not a normal road run</p>
        <p className="text-[13px] text-basalt/80 leading-relaxed">
          The first section is grassy fell terrain and can be wet. Ground near Fámjinsklovn and Øraskarð is stony, steep and less obvious. Wear trail shoes. Do not use this route in poor visibility, heavy rain or strong wind.
        </p>
      </div>

      <div className="mt-3">
        <p className="text-[10px] uppercase tracking-[0.1em] text-basalt/60 mb-1">Road return</p>
        <p className="text-[13px] text-basalt/75 leading-relaxed">
          The return uses live roads. Face oncoming traffic and remain alert. The route explicitly excludes Fámjinstunnilin and Hovstunnilin.
        </p>
      </div>

      <div className="mt-3 border border-amber/20 bg-amber/[0.04] rounded-[6px] p-3">
        <p className="text-[10px] uppercase tracking-[0.1em] text-amber font-medium mb-1">Fallback</p>
        <p className="text-[13px] text-basalt/75">
          When the fell section is unsuitable, use the separate coastal road out-and-back instead. Do not improvise a shortcut across fields.
        </p>
      </div>

      <div className="mt-4 pt-4 border-t border-basalt/10">
        <a href={gpxUrl} download="oravik-village-path-old-road-loop.gpx" className="inline-flex items-center gap-2 border border-basalt/25 rounded-[6px] px-4 py-2 text-[12px] font-medium text-basalt hover:border-claret/30 hover:text-claret transition-colors focus-visible:outline-2 focus-visible:outline-navy">
          Download verified GPX
        </a>
      </div>
    </>
  );

  return <div className={mobile ? "mt-4" : "space-y-0"} role="complementary" aria-label="Run route information">{content}</div>;
}
