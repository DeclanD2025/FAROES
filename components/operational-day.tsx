"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type maplibregl from "maplibre-gl";
import { DAY_OPERATIONS, OFFICIAL_SOURCES } from "@/lib/data/operations";
import type { MapFilter, SelectedFeature } from "@/components/map/faroes-map";
import { DayThreeFieldGuide } from "@/components/day-three-field-guide";

const FaroesMap = dynamic(() => import("@/components/map/faroes-map"), {
  ssr: false,
  loading: () => <div className="h-[22rem] border border-basalt/15 bg-fog/20 flex items-center justify-center"><p className="caption">Loading map…</p></div>,
});

const MAPS: Record<number, { filter: MapFilter; title: string; detail: string }> = {
  3: { filter: "journey", title: "Ólavsøka crossing map", detail: "Øravík → Krambatangi → Tórshavn on the 14:30 Smyril, then the 21:15 return to Suðuroy." },
  5: { filter: "journey-outbound", title: "Northbound repositioning map", detail: "The geographical sequence remains Suðuroy → Tórshavn → Sørvágur; confirm the Friday connection before travelling." },
};

const PRACTICAL_NOTES: Record<number, { title: string; body: string; href?: string; label?: string }[]> = {
  5: [
    { title: "Pack as a travel day", body: "Keep every charger, medication, passport, ferry record and Guesthouse Hugo confirmation in one day bag. Do not put the Friday transfer essentials in checked or inaccessible luggage." },
    { title: "Food and water before the ferry", body: "Buy food on Suðuroy before the selected sailing. Treat Tórshavn only as a contingency stop: onward transport to Sørvágur is not operational until it has been confirmed or replaced with a taxi." },
    { title: "Arrival at Sørvágur", body: "Message Hugo before the ferry leaves with the realistic arrival time, then save the self-check-in instructions offline. If the later ferry is chosen, confirm that a late arrival remains accepted before you board." },
  ],
};

export function OperationalDay({ number }: { number: number }) {
  const day = DAY_OPERATIONS.find((item) => item.number === number);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [selected, setSelected] = useState<SelectedFeature>(null);
  const [completedActions, setCompletedActions] = useState<boolean[]>([]);
  const map = MAPS[number];
  const onSelect = useCallback((feature: SelectedFeature) => setSelected(feature), []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(`faroe-trip:day-${number}:actions`);
      setCompletedActions(stored ? JSON.parse(stored) as boolean[] : []);
    } catch {
      setCompletedActions([]);
    }
  }, [number]);

  const toggleAction = (index: number) => {
    setCompletedActions((current) => {
      const next = [...current];
      next[index] = !next[index];
      try { window.localStorage.setItem(`faroe-trip:day-${number}:actions`, JSON.stringify(next)); } catch { /* storage is optional */ }
      return next;
    });
  };

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

      {number === 3 ? (
        <DayThreeFieldGuide actions={day.actions} completedActions={completedActions} onToggleAction={toggleAction} />
      ) : (
      <section className="mt-10 max-w-[48rem]">
        <h2 className="label border-b border-basalt/15 pb-2">The day, in order</h2>
        <ol className="mt-1 divide-y divide-basalt/10">
          {day.actions.map(([time, action], index) => (
            <li key={time} className={`grid grid-cols-[7.5rem_1fr_auto] gap-4 py-4 ${completedActions[index] ? "bg-moss/[0.025]" : ""}`}>
              <p className="code text-fjord tnum text-[13px]">{time}</p>
              <p className="text-[14px] leading-relaxed text-basalt">{action}</p>
              <button type="button" onClick={() => toggleAction(index)} aria-pressed={Boolean(completedActions[index])} className={`h-fit border px-2.5 py-1.5 text-[10px] uppercase tracking-[.08em] focus-visible:outline-2 focus-visible:outline-navy ${completedActions[index] ? "border-moss/35 text-moss" : "border-basalt/20 text-basalt/60 hover:border-moss/35"}`}>{completedActions[index] ? "Done" : "Mark done"}</button>
            </li>
          ))}
        </ol>
      </section>
      )}

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

      {PRACTICAL_NOTES[number] && (
        <section className="mt-10 max-w-[58rem]">
          <h2 className="label border-b border-basalt/15 pb-2">Supplies, places and local context</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            {PRACTICAL_NOTES[number].map((note) => <article key={note.title} className="border border-basalt/15 rounded-[7px] p-4"><h3 className="text-[14px] font-medium text-basalt">{note.title}</h3><p className="mt-2 text-[12px] leading-relaxed text-basalt/70">{note.body}</p>{note.href && <a href={note.href} target="_blank" rel="noreferrer" className="mt-3 inline-block text-[12px] text-fjord underline underline-offset-4">{note.label}</a>}</article>)}
          </div>
        </section>
      )}

      <nav className="mt-10 max-w-[48rem] flex items-center justify-between border-t border-basalt/15 pt-5">
        {number > 1 ? <Link href={`/day/${number - 1}`} className="code text-[13px] underline underline-offset-4 decoration-basalt/30">← Day {number - 1}</Link> : <span />}
        {number < 6 ? <Link href={`/day/${number + 1}`} className="code text-[13px] underline underline-offset-4 decoration-basalt/30">Day {number + 1} →</Link> : <span />}
      </nav>
    </article>
  );
}
