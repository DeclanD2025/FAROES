"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import type maplibregl from "maplibre-gl";
import { DAY_OPERATIONS, OFFICIAL_SOURCES } from "@/lib/data/operations";
import type { MapFilter, SelectedFeature } from "@/components/map/faroes-map";

const FaroesMap = dynamic(() => import("@/components/map/faroes-map"), {
  ssr: false,
  loading: () => <div className="h-[22rem] border border-basalt/15 bg-fog/20 flex items-center justify-center"><p className="caption">Loading map…</p></div>,
});

const MAPS: Record<number, { filter: MapFilter; title: string; detail: string }> = {
  3: { filter: "suðuroy", title: "Suðuroy base map", detail: "Keep the Ólavsøka day local; use this map to orient the Øravík, Krambatangi and Tvøroyri options." },
  5: { filter: "journey-outbound", title: "Northbound repositioning map", detail: "The geographical sequence remains Suðuroy → Tórshavn → Sørvágur; confirm the Friday connection before travelling." },
};

export function OperationalDay({ number }: { number: number }) {
  const day = DAY_OPERATIONS.find((item) => item.number === number);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [selected, setSelected] = useState<SelectedFeature>(null);
  const map = MAPS[number];
  const onSelect = useCallback((feature: SelectedFeature) => setSelected(feature), []);
  if (!day) return null;

  return (
    <article className="px-6 sm:px-8 lg:px-12 pt-10 pb-20 max-w-[64rem]">
      <header className="pb-7 border-b border-basalt/15">
        <p className="label text-rust">Day {day.number} · {day.date}</p>
        <h1 className="mt-3 text-[clamp(2rem,4.4vw,3rem)] leading-[1.04] tracking-[-0.012em] text-basalt" style={{ fontFamily: "var(--font-cinzel)" }}>
          {day.chapter}
        </h1>
        <p className="mt-3 max-w-[44rem] text-[15px] leading-relaxed text-basalt/70">{day.briefing}</p>
        <p className="caption mt-2">Base: {day.base}</p>
      </header>

      <section className="mt-8 max-w-[48rem] border border-rust/25 bg-rust/[0.035] p-4 rounded-[7px]">
        <p className="label text-rust mb-1">Operational risk</p>
        <p className="text-[14px] leading-relaxed text-basalt">{day.risk}</p>
      </section>

      <section className="mt-10 max-w-[48rem]">
        <h2 className="label border-b border-basalt/15 pb-2">The day, in order</h2>
        <ol className="mt-1 divide-y divide-basalt/10">
          {day.actions.map(([time, action]) => (
            <li key={time} className="grid grid-cols-[7.5rem_1fr] gap-4 py-4">
              <p className="code text-fjord tnum text-[13px]">{time}</p>
              <p className="text-[14px] leading-relaxed text-basalt">{action}</p>
            </li>
          ))}
        </ol>
      </section>

      {map && (
        <section className="mt-10 max-w-[58rem]">
          <header className="border-b border-basalt/15 pb-2 mb-4">
            <h2 className="label">{map.title}</h2>
            <p className="caption mt-1">{map.detail}</p>
          </header>
          <FaroesMap mapRef={mapRef} onSelect={onSelect} selected={selected} filter={map.filter} height="22rem" />
        </section>
      )}

      <section className="mt-10 max-w-[48rem]">
        <h2 className="label border-b border-basalt/15 pb-2">Carry</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {day.carry.map((item) => <li key={item} className="border border-basalt/20 px-3 py-1.5 text-[12px] text-basalt/80">{item}</li>)}
        </ul>
      </section>

      <section className="mt-10 max-w-[48rem] border-t border-basalt/15 pt-5">
        <p className="caption">
          Transport facts checked against <a href={OFFICIAL_SOURCES.sslRoute7.url} target="_blank" rel="noreferrer" className="text-fjord underline underline-offset-4">SSL</a> on {OFFICIAL_SOURCES.sslRoute7.checked}. Local buses and disruption notices still require a same-day check.
        </p>
      </section>

      <nav className="mt-10 max-w-[48rem] flex items-center justify-between border-t border-basalt/15 pt-5">
        {number > 1 ? <Link href={`/day/${number - 1}`} className="code text-[13px] underline underline-offset-4 decoration-basalt/30">← Day {number - 1}</Link> : <span />}
        {number < 6 ? <Link href={`/day/${number + 1}`} className="code text-[13px] underline underline-offset-4 decoration-basalt/30">Day {number + 1} →</Link> : <span />}
      </nav>
    </article>
  );
}
