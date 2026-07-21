// =============================================================================
// DayDetail — client component for a single trip day.
// Shows narrative, timeline of stages, disruption risk, map, and day nav.
// =============================================================================

"use client";

import { useMemo, useCallback, useState, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { DAYS, type DayStage } from "@/lib/data/itinerary";
import type { SelectedFeature } from "@/components/map/faroes-map";
import type maplibregl from "maplibre-gl";
import { DayOneDetail } from "@/components/day-one-detail";
import { DayTwoDetail } from "@/components/day-two-detail";
import { DayThreeDetail } from "@/components/day-three-detail";
import { DayFourDetail } from "@/components/day-four-detail";
import { DayFiveDetail } from "@/components/day-five-detail";
import { DaySixDetail } from "@/components/day-six-detail";

const FaroesMap = dynamic(() => import("@/components/map/faroes-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full border border-basalt/15 bg-fog/20 flex items-center justify-center" style={{ minHeight: 280 }}>
      <p className="caption">Loading map…</p>
    </div>
  ),
});

// =============================================================================
// Sub-components
// =============================================================================

function StageKindLabel({ kind }: { kind: DayStage["kind"] }) {
  const labels: Record<string, string> = {
    flight: "Flight",
    ferry: "Ferry",
    bus: "Bus",
    anchor: "Stop",
  };
  return <span className="text-[11px] uppercase tracking-[0.1em] text-fjord/70">{labels[kind] || kind}</span>;
}

function StageRow({ stage }: { stage: DayStage }) {
  if (stage.kind === "anchor") {
    return (
      <li className="py-4 border-b border-basalt/10">
        <p className="code text-[14px] text-fjord tnum">{stage.time}</p>
        <p className="font-medium text-[15px] mt-0.5 text-basalt">{stage.title}</p>
        <p className="caption mt-1">{stage.detail}</p>
      </li>
    );
  }

  const isCritical = stage.kind === "ferry" && stage.critical;

  return (
    <li className={`py-4 border-b border-basalt/10 ${isCritical ? "border-l-2 border-l-rust pl-4" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          <StageKindLabel kind={stage.kind} />
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <p className="font-medium text-[15px] text-basalt">
              <span className="code text-fjord">{stage.ref}</span>
            </p>
            {isCritical && (
              <span className="text-[11px] text-rust font-medium uppercase tracking-[0.08em] border border-rust/30 px-1.5 py-px">
                Critical
              </span>
            )}
          </div>
          <p className="code text-[13px] text-fjord tnum mt-0.5">
            {stage.dep} → {stage.arr}
          </p>
          {stage.note && <p className="caption mt-1">{stage.note}</p>}
        </div>
      </div>
    </li>
  );
}

// =============================================================================
// Component
// =============================================================================

export function DayDetail({ num: rawNum }: { num: string }) {
  // Normalize: accept both "1" and "01"
  const num = rawNum?.padStart(2, "0");

  const mapRef = useRef<maplibregl.Map | null>(null);
  const [selected, setSelected] = useState<SelectedFeature>(null);
  const handleSelect = useCallback((f: SelectedFeature) => setSelected(f), []);

  const day = useMemo(() => DAYS.find((d) => d.num === num), [num]);

  if (!day) {
    return (
      <article className="px-6 sm:px-8 lg:px-12 pt-10 pb-20 max-w-[72rem]">
        <p className="caption text-rust">Day not found.</p>
        <p className="mt-2">
          <Link href="/day/1" className="code underline underline-offset-4 decoration-basalt/30">
            Go to Day 1
          </Link>
        </p>
      </article>
    );
  }

  const dayNum = parseInt(day.num, 10);

  // Day 1 gets the full operational brief, Day 2 the Suðuroy cliffs, Day 3 a free day,
  // Day 4 the match, Day 5 the repositioning, Day 6 the homeward run.
  if (dayNum === 1) return <DayOneDetail />;
  if (dayNum === 2) return <DayTwoDetail />;
  if (dayNum === 3) return <DayThreeDetail />;
  if (dayNum === 4) return <DayFourDetail />;
  if (dayNum === 5) return <DayFiveDetail />;
  if (dayNum === 6) return <DaySixDetail />;

  return (
    <article className="px-6 sm:px-8 lg:px-12 pt-8 sm:pt-10 pb-20 max-w-[72rem]">
      {/* ============================================================
          Header
          ============================================================ */}
      <header className="pb-6 border-b border-basalt/15 mb-6">
        <p className="label text-rust">
          Day {dayNum} · {day.weekday} · {day.date}
        </p>
        <h1 className="font-sans font-medium text-[clamp(1.5rem,3vw,2.2rem)] leading-[1.08] mt-2 text-basalt tracking-[-0.01em]">
          {day.chapter}
        </h1>
        <p className="caption mt-2 max-w-[40rem]">{day.narrative}</p>
        <p className="label mt-3 text-fjord">{day.location}</p>
      </header>

      {/* ============================================================
          Grid: Timeline + Map
          ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-[5fr_4fr] gap-8">
        <div>
          <h2 className="label mb-3">Timeline</h2>
          <ul className="divide-y divide-basalt/10">
            {day.stages.map((stage, i) => (
              <StageRow key={i} stage={stage} />
            ))}
          </ul>
        </div>
        <div className="relative min-h-[280px] lg:min-h-[360px]">
          <div className="sticky top-8">
            <FaroesMap onSelect={handleSelect} selected={selected} filter="journey" mapRef={mapRef} />
          </div>
        </div>
      </div>

      {/* ============================================================
          Could Disrupt
          ============================================================ */}
      <section className="mt-8 max-w-[48rem]">
        <div className="harbour-notice">
          <p className="label text-rust mb-1">Could disrupt the day</p>
          <p className="text-[14px]">{day.couldDisrupt}</p>
        </div>
      </section>

      {/* ============================================================
          Match day link (Day 4 only)
          ============================================================ */}
      {dayNum === 4 && (
        <section className="mt-8 max-w-[48rem]">
          <Link
            href="/match-day"
            className="inline-block border border-basalt/20 px-4 py-3 text-[14px] font-medium hover:border-rust transition-colors"
          >
            Full match-day briefing → departure plan, pubs near the ground, the last boat
          </Link>
        </section>
      )}

      {/* ============================================================
          Day navigation
          ============================================================ */}
      <section className="mt-10 max-w-[48rem]">
        <div className="flex items-center justify-between border-t border-basalt/15 pt-5">
          {dayNum > 1 ? (
            <Link
              href={`/day/${dayNum - 1}`}
              className="code text-[13px] underline underline-offset-4 decoration-basalt/30 hover:text-rust transition-colors"
            >
              ← Day {dayNum - 1}
            </Link>
          ) : (
            <span />
          )}
          {dayNum < 6 ? (
            <Link
              href={`/day/${dayNum + 1}`}
              className="code text-[13px] underline underline-offset-4 decoration-basalt/30 hover:text-rust transition-colors"
            >
              Day {dayNum + 1} →
            </Link>
          ) : (
            <span />
          )}
        </div>
      </section>
    </article>
  );
}
