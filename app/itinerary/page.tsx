// /itinerary — the Trip page. Ferry timetable strip across the top with day
// columns. The active day has a rust-red underline. The selected day's
// route log runs below as a timeline: mono time / place name / action /
// status pill / thin connecting rule between events.
//
// Interactivity needs a client component so the day selection is local
// state. Each stage is rendered from the DayPlan.stages array; ferry /
// bus / flight kinds carry dep+arr+note, anchors carry time+title+detail.

"use client";

import { useState } from "react";
import { DAYS, type DayPlan, type DayStage } from "@/lib/data/itinerary";

function StatusPill({ tone, label }: { tone: "ok" | "warn" | "info"; label: string }) {
  const cls =
    tone === "ok"
      ? "border-moss text-moss"
      : tone === "warn"
      ? "border-rust text-rust"
      : "border-basalt/30 text-basalt/80";
  return (
    <span className={`inline-block border ${cls} px-1.5 py-0.5 text-[10.5px] tracking-[0.14em] uppercase`}>
      {label}
    </span>
  );
}

function StageLine({ s }: { s: DayStage }) {
  if (s.kind === "anchor") {
    return (
      <li className="grid grid-cols-[5rem_1fr_auto] gap-x-4 py-4 border-b border-basalt/10 items-baseline">
        <span className="code text-fjord tnum">{s.time}</span>
        <div>
          <p className="font-medium text-basalt text-[15px]">{s.title}</p>
          <p className="caption mt-1 max-w-[34rem]">{s.detail}</p>
        </div>
        <span className="caption tnum">—</span>
      </li>
    );
  }
  const verb = s.kind === "flight" ? "Fly" : s.kind === "ferry" ? "Ferry" : "Bus";
  // `critical` only exists on the ferry shape; narrow explicitly so
  // TypeScript collapses safely to `flight | ferry | bus`.
  const isCritical = s.kind === "ferry" && s.critical === true;
  return (
    <li className="grid grid-cols-[5rem_1fr_auto] gap-x-4 py-4 border-b border-basalt/10 items-baseline">
      <span className="code text-fjord tnum">{s.dep.split(" ")[0]}</span>
      <div>
        <p className="font-medium text-basalt text-[15px]">
          {verb} · {s.dep.replace(/^\d+:\d+\s/, "")}{" → "}{s.arr.replace(/^\d+:\d+\s/, "")}
        </p>
        <p className="caption mt-1 max-w-[34rem]">
          <span className="code">{s.ref}</span>
          {s.note ? <span className="text-basalt/70"> · {s.note}</span> : null}
        </p>
      </div>
      <StatusPill tone={isCritical ? "warn" : "info"} label={isCritical ? "Critical" : "Booked"} />
    </li>
  );
}

export default function TripPage() {
  const [active, setActive] = useState(0);
  const day: DayPlan = DAYS[active];

  return (
    <article className="px-6 sm:px-8 lg:px-12 pt-10 pb-16 max-w-[64rem]">
      <header className="pb-8">
        <p className="label">Trip · 5 days</p>
        <h1 className="font-sans font-medium text-[clamp(2rem,4.4vw,3rem)] leading-[1.04] mt-3 text-basalt tracking-[-0.012em]">
          Five chapters across the North Atlantic.
        </h1>
        <p className="caption mt-3 max-w-[36rem]">
          Select a day along the strip; the route log underneath updates. Ferry
          crossings are highlighted. The match on Day 03 is{" "}
          <a href="/match-day" className="text-basalt underline decoration-basalt/30 underline-offset-4 hover:decoration-basalt">
            on its own page
          </a>
          .
        </p>
      </header>

      {/* Ferry timetable strip — 5 narrow columns. Active column gets a
          wool off-white background and a rust-red underline. */}
      <div className="border-y border-basalt/15 grid grid-cols-5">
        {DAYS.map((d, i) => {
          const isActive = i === active;
          return (
            <button
              key={d.num}
              type="button"
              aria-pressed={isActive}
              onClick={() => setActive(i)}
              className={`text-left p-3 sm:p-4 border-r border-basalt/10 last:border-r-0 transition-colors ${
                isActive ? "bg-wool" : "bg-transparent hover:bg-fog/40"
              }`}
              style={isActive ? { borderBottom: "2px solid var(--rust)" } : { borderBottom: "2px solid transparent" }}
            >
              <p className="label">{d.weekday.toUpperCase()}</p>
              <p className="font-mono text-[13px] mt-1 text-basalt">{d.date}</p>
              <p className="caption mt-1 line-clamp-1">{d.location.split(" · ").slice(-1)[0]}</p>
            </button>
          );
        })}
      </div>

      <section aria-label={`Route log · ${day.weekday} ${day.date}`} className="mt-8 max-w-[48rem]">
        <header className="grid grid-cols-1 sm:grid-cols-[8rem_1fr] gap-x-6 mb-4">
          <p className="caption">Chapter</p>
          <div>
            <p className="font-medium text-[1.4rem] leading-snug text-basalt">{day.chapter}</p>
            <p className="caption mt-1">{day.location}</p>
          </div>
        </header>

        {/* Vertical route log — stages with thin connecting rule. */}
        <ol>
          {day.stages.map((s, i) => (
            <StageLine key={i} s={s} />
          ))}
        </ol>

        {/* Disrupt note (could-disrupt). */}
        {day.couldDisrupt && day.couldDisrupt !== "—" ? (
          <aside className="harbour-notice mt-8 max-w-[36rem] py-3">
            <p className="label text-rust mb-1">Could disrupt</p>
            <p className="text-[14.5px]">{day.couldDisrupt}</p>
          </aside>
        ) : null}
      </section>
    </article>
  );
}
