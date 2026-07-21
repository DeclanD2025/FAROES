// /itinerary — the Trip page. Now an overview + ferry timetable strip.
//
// Two parts:
//   1. Overview — trip headline, stat cards, a clickable day list, and the
//      key risks (from DAYS[].couldDisrupt), all driven from the DAYS array.
//   2. The original timetable strip + route log underneath, now 6 columns.
//
// Interactivity needs a client component so the day selection is local
// state. Each stage is rendered from the DayPlan.stages array; ferry /
// bus / flight kinds carry dep+arr+note, anchors carry time+title+detail.

"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { DAYS, TRIP, BOOKINGS, type DayPlan, type DayStage } from "@/lib/data/itinerary";
import { useCountdown } from "@/lib/hooks/use-countdown";

// =============================================================================
// Overview sub-components
// =============================================================================

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="border border-basalt/15 rounded-[6px] p-3 text-center bg-wool">
      <p className="code tnum text-[20px] font-medium text-basalt leading-none">{value}</p>
      <p className="text-[10px] uppercase tracking-[0.12em] text-fjord/60 mt-1.5">{label}</p>
    </div>
  );
}

function OverviewSection({ onSelectDay }: { onSelectDay: (i: number) => void }) {
  const countdown = useCountdown(TRIP.countdownTarget);
  const nights = BOOKINGS.airbnb.nights + BOOKINGS.hugo.nights;
  const flights = 3; // RC 415, RC 416, RK 330
  const bases = 2; // Øravík + Guesthouse Hugo
  // Days flagged as risky in their couldDisrupt text (heuristic: matchday +
  // any day whose disruption mentions "last boat" or "self-transfer").
  const riskDays = DAYS.filter(
    (d) => d.composition === "match-climax" || /last boat|self-transfer/i.test(d.couldDisrupt)
  );

  return (
    <section className="mb-10" aria-label="Trip overview">
      {/* Headline */}
      <div className="border border-basalt/15 rounded-[8px] p-5 bg-fog/20 mb-5">
        <p className="label text-rust">{TRIP.dates}</p>
        <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.06] mt-2 text-basalt tracking-[-0.01em]" style={{ fontFamily: "var(--font-cinzel)" }}>
          Six chapters across the North Atlantic.
        </h2>
        <p className="caption mt-2 max-w-[40rem]">
          {TRIP.route}. {TRIP.fixture.home} v {TRIP.fixture.away} on {TRIP.fixture.kickoff}.
          Base in {TRIP.base}, last night in {TRIP.baseLastNight}.
        </p>
        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 mt-4">
          <p className="code tnum text-[22px] font-medium text-basalt leading-none">
            {countdown.phrase ?? "—"}
          </p>
          <Link
            href="/match-day"
            className="text-[12px] font-medium text-basalt underline decoration-basalt/30 underline-offset-4 hover:decoration-rust transition-colors"
          >
            Match guide →
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
        <StatCard value={String(DAYS.length)} label="Days" />
        <StatCard value={String(flights)} label="Flights" />
        <StatCard value={String(nights)} label="Nights" />
        <StatCard value={String(bases)} label="Bases" />
        <StatCard value={String(riskDays.length)} label="Risks" />
        <StatCard value="2 ppl" label="Travellers" />
      </div>

      {/* Day list */}
      <p className="label text-fjord mb-3">Day-by-day</p>
      <ul className="divide-y divide-basalt/10 border-y border-basalt/10 mb-6">
        {DAYS.map((d, i) => (
          <li key={d.num}>
            <button
              type="button"
              onClick={() => onSelectDay(i)}
              className="w-full text-left py-3.5 flex items-baseline gap-4 hover:bg-fog/30 transition-colors px-2 -mx-2 rounded-[4px]"
            >
              <span className="code tnum text-[13px] text-fjord w-20 shrink-0">{d.date}</span>
              <span className="flex-1 min-w-0">
                <span className="font-medium text-[15px] text-basalt block truncate">{d.chapter}</span>
                <span className="caption block truncate">{d.location}</span>
              </span>
              {d.composition === "match-climax" && (
                <span className="text-[10px] uppercase tracking-[0.12em] text-rust border border-rust/30 px-1.5 py-0.5 shrink-0">
                  Match
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* Key risks */}
      {riskDays.length > 0 && (
        <>
          <p className="label text-rust mb-3">Key risks</p>
          <div className="space-y-2 mb-6">
            {riskDays.map((d) => (
              <div key={d.num} className="border border-rust/20 bg-rust/[0.02] rounded-[6px] p-3">
                <p className="text-[13px] font-medium text-basalt">
                  {d.date} · {d.chapter}
                </p>
                <p className="caption mt-1">{d.couldDisrupt}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

// =============================================================================
// Timetable + route log (existing, now 6 columns)
// =============================================================================

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

// =============================================================================
// Page
// =============================================================================

export default function TripPage() {
  const [active, setActive] = useState(0);
  const day: DayPlan = DAYS[active];
  const timetableRef = useRef<HTMLParagraphElement>(null);

  // Clicking a day in the overview highlights the timetable column AND
  // scrolls it into view, so the connection is obvious on mobile.
  const selectDay = (i: number) => {
    setActive(i);
    timetableRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <article className="px-6 sm:px-8 lg:px-12 pt-10 pb-16 max-w-[64rem]">
      <header className="pb-8">
        <p className="label">Trip · 6 days</p>
        <h1 className="font-sans font-medium text-[clamp(2rem,4.4vw,3rem)] leading-[1.04] mt-3 text-basalt tracking-[-0.012em]">
          The whole trip on one page.
        </h1>
        <p className="caption mt-3 max-w-[36rem]">
          An overview of the six days, then the ferry timetable and route log
          underneath. The match on Day 4 is{" "}
          <a href="/match-day" className="text-basalt underline decoration-basalt/30 underline-offset-4 hover:decoration-basalt">
            on its own page
          </a>
          .
        </p>
      </header>

      {/* Overview */}
      <OverviewSection onSelectDay={selectDay} />

      {/* Ferry timetable strip — 6 narrow columns. Active column gets a
          wool off-white background and a rust-red underline. */}
      <p ref={timetableRef} className="label text-fjord mb-3 mt-4 scroll-mt-20">Timetable &amp; route log</p>
      <div className="border-y border-basalt/15 grid grid-cols-3 sm:grid-cols-6">
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
