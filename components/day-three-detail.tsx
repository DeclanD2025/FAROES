// =============================================================================
// DayThreeDetail — "A full Suðuroy day" with three fully formed day plans.
// Plan A: West Coast / Fámjin. Plan B: Tvøroyri / Froðba. Plan C: Local Øravík.
// Includes Ólavsøka handling and supplies-before-matchday checklist.
// =============================================================================

"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import type maplibregl from "maplibre-gl";
import { TripReadiness } from "@/components/trip-readiness";
import { DecisionTreeView } from "@/components/decision-tree";
import { SourceRegister } from "@/components/source-register";
import { DAY3_DECISION } from "@/lib/data/decision-trees";
import { provisional, verified } from "@/lib/data/sources";
import { SOURCE_LIBRARY } from "@/lib/data/sources";
import {
  type TimelineStep,
  type SummaryItem,
  TripStatusPanel,
  MobileTripStatus,
  SummaryStrip,
  JourneyTimeline,
  MobileTimeline,
} from "@/components/day-widgets";

const FaroesMap = dynamic(() => import("@/components/map/faroes-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full border border-basalt/15 bg-fog/20 flex items-center justify-center" style={{ minHeight: 280 }}>
      <p className="caption">Loading map…</p>
    </div>
  ),
});

// =============================================================================
// PLAN A — WEST COAST / FÁMJIN
// =============================================================================

const PLAN_A = {
  id: "d3-plan-a",
  title: "Plan A: Fámjin — the flag church",
  condition: "Western weather clear (good visibility, no persistent rain)",
  timeline: [
    { time: "~09:00", action: "Slow start · breakfast at Við á 7 · check yr.no for west coast" },
    { time: "~10:00", action: "Bus 701 from Tvøroyri towards Fámjin. NOTE: Bus 701 may require request — marked 'T' in timetable. Call +298 239550 the day before." },
    { time: "~10:30", action: "Arrive Fámjin. Visit the church — houses the original Faroese flag (Merkið) from 1919. Free entry, but confirm opening with Visit Suðuroy." },
    { time: "~11:00", action: "Walk behind the church to the small waterfall. Short shoreline walk either direction from the village." },
    { time: "~12:30", action: "Return bus to Tvøroyri. If Bus 701 is request-only, confirm return time with driver or pre-arrange." },
    { time: "~13:30", action: "Lunch at Café MorMor, Tvøroyri (open Wed–Fri 12:00–18:00). The island gem — soup, cake, cosy." },
    { time: "~15:00", action: "Afternoon: browse Tvøroyri shops, visit the harbour, restock at Bónus (open until 19:00)." },
    { time: "~17:00", action: "Bus 700 back to Øravík. Relaxed evening — pack and prep for tomorrow's matchday." },
  ],
  transport: "Bus 701 from Tvøroyri — request in advance. Call +298 239550.",
  weather: "Clear or partly cloudy. Light wind. No fog.",
  notes: "The flag church is a significant cultural site. The original Merkið was made here in 1919. The waterfall and shoreline walks are free and accessible.",
};

// =============================================================================
// PLAN B — TVØROYRI / FROÐBA
// =============================================================================

const PLAN_B = {
  id: "d3-plan-b",
  title: "Plan B: Tvøroyri & Froðba — basalt & culture",
  condition: "Eastern weather better (west coast foggy/rainy, east clearer)",
  timeline: [
    { time: "~09:00", action: "Slow start · breakfast at Við á 7 · check weather" },
    { time: "~10:00", action: "Bus 700 north 2 stops to Tvøroyri (~10 min, DKK 20)" },
    { time: "~10:15", action: "Walk to Froðba (~20 min from Tvøroyri). Red basalt cliffs, blowhole, columnar formations. Works in most weather." },
    { time: "~12:00", action: "Explore Tvøroyri harbour and town centre. Shops, pharmacy, ATM." },
    { time: "~13:00", action: "Lunch at Café MorMor (Wed–Fri 12–18:00)." },
    { time: "~14:00", action: "Visit Tvøroyri museum (confirm hours — may be affected by Ólavsøka)." },
    { time: "~15:30", action: "Restock at Bónus — supplies for matchday (open until 19:00)." },
    { time: "~17:00", action: "Bus 700 back to Øravík. Relax. Pack for matchday." },
  ],
  transport: "Bus 700 — regular service, no request needed.",
  weather: "Any weather works. Froðba is walkable in rain. Indoor options in Tvøroyri if persistent.",
  notes: "Froðba is one of the few places on Suðuroy with notable geological features visible without a car. Easy coastal path, suitable for any fitness level.",
};

// =============================================================================
// PLAN C — LOCAL ØRAVÍK / HOV
// =============================================================================

const PLAN_C = {
  id: "d3-plan-c",
  title: "Plan C: Local Øravík & Hov — minimal transport",
  condition: "Persistent rain, reduced transport (Ólavsøka disruption), or tired legs",
  timeline: [
    { time: "~09:30", action: "Late start · breakfast at Við á 7 · no rush today" },
    { time: "~10:30", action: "Walk to Øravík harbour and along the fjord (~30 min easy walk)" },
    { time: "~12:00", action: "Bus 700 south to Hov (4 stops, ~15 min). Chieftain's mound and harbour walk (30 min)." },
    { time: "~13:30", action: "Return bus to Tvøroyri for Café MorMor lunch (12–18:00)." },
    { time: "~15:00", action: "Short walk around Tvøroyri. Bónus restock. Pharmacy if needed." },
    { time: "~16:00", action: "Bus 700 back to Øravík. Early evening — pack, prep matchday bag, charge devices." },
    { time: "Evening", action: "Self-cater from Bónus supplies at Við á 7. Final weather check for matchday." },
  ],
  transport: "Bus 700 — regular. Minimal bus dependence. Everything walkable from stops.",
  weather: "Any weather. Mostly indoor and sheltered options. Short walks only.",
  notes: "This is the lowest-effort plan. Good for tired legs after Day 2 hiking, or if Ólavsøka has disrupted bus services. Still gets you out of the house.",
};

// =============================================================================
// ÓLAVSØKA NOTICE
// =============================================================================

const OLAVSOKA_NOTICE = {
  title: "Ólavsøka — 29 July 2026",
  summary: "29 July is Ólavsøka, the Faroese national holiday — the biggest day of the year. The major events (parade, boat races, concerts) are in Tórshavn, NOT on Suðuroy. However, some services on Suðuroy may be affected.",
  transport: "Bus services may run on a Sunday/holiday timetable. Confirm with SSL. Ferry services generally run as normal but may be busier than usual.",
  shops: "Bónus is normally CLOSED on public holidays (and already closed on Wednesdays in some locations — but Tvøroyri Bónus is normally open Mon–Thu). Confirm with the store. ESLA in Tórshavn may operate reduced hours.",
  businesses: "Café MorMor: confirm if open on Ólavsøka (normally open Wed–Fri). Hotel Tvøroyri: likely open as usual.",
  localEvents: "Some local Suðuroy celebrations may occur — check Visit Suðuroy closer to the date. But the main national events are in Tórshavn and are not part of the current overnight plan (we're staying on Suðuroy).",
  action: "Stock up on supplies on Tuesday 28 July. Don't rely on shops being open on the 29th.",
};

// =============================================================================
// MATCHDAY PREP CHECKLIST
// =============================================================================

const MATCHDAY_PREP = [
  { item: "Breakfast supplies", detail: "Buy at Bónus on Wednesday — everything for Thursday morning." },
  { item: "Ferry snacks", detail: "Sandwiches, fruit, water for the 2h crossing each way." },
  { item: "Phone charging", detail: "Charge phone + portable charger overnight. No car charging on matchday." },
  { item: "Layers", detail: "Pack waterproof jacket, fleece, scarf. Stadium is exposed, evening cools fast." },
  { item: "Match ticket", detail: "Save offline PDF + carry paper copy. Match ticket bought." },
  { item: "Return transport", detail: "Save taxi numbers. Know the walk from stadium to ferry terminal (~1 km)." },
  { item: "Friday packing", detail: "Separate overnight bag for Sørvágur. Leave main bag packed for morning checkout." },
];

// =============================================================================
// Main export
// =============================================================================

export function DayThreeDetail() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [activePlan, setActivePlan] = useState<string>("d3-plan-a");

  const activePlanData = activePlan === "d3-plan-a" ? PLAN_A :
    activePlan === "d3-plan-b" ? PLAN_B : PLAN_C;

  return (
    <>
      {/* DESKTOP */}
      <article className="hidden lg:block px-8 pt-8 pb-20 max-w-[1280px]">
        <div className="grid grid-cols-[1fr_340px] gap-8">
          <div className="min-w-0">
            {/* Header */}
            <div className="mb-6">
              <p className="text-[12px] tracking-[0.14em] uppercase text-rust font-medium">Day 3 · Wednesday · 29 July 2026</p>
              <h1 className="text-[clamp(2.5rem,3.5vw,3.2rem)] leading-[1.04] mt-1.5 text-basalt tracking-[-0.01em]" style={{ fontFamily: "var(--font-cinzel)" }}>A full Suðuroy day</h1>
              <p className="text-[20px] font-medium text-basalt/80 mt-2">Øravík · Fámjin · Froðba · Tvøroyri</p>
              <p className="text-[14px] text-basalt/60 mt-2 max-w-[38rem]">
                The most flexible day. Three fully formed plans depending on weather and energy.
                Ólavsøka (national holiday) is today — some services may be affected. The match is tomorrow.
              </p>
            </div>

            {/* Trip Readiness */}
            <section className="mb-6"><TripReadiness /></section>

            {/* Ólavsøka notice */}
            <section className="mb-6">
              <div className="border border-yellow/30 bg-yellow/[0.03] rounded-[7px] p-4">
                <p className="text-[10px] uppercase tracking-[0.12em] text-yellow/80 mb-1 flex items-center gap-1.5">
                  <span>! </span> Ólavsøka · 29 July
                </p>
                <p className="text-[13px] text-basalt/75 mb-2">{OLAVSOKA_NOTICE.summary}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] text-basalt/60">
                  <p>{OLAVSOKA_NOTICE.transport}</p>
                  <p>{OLAVSOKA_NOTICE.shops}</p>
                  <p>{OLAVSOKA_NOTICE.businesses}</p>
                  <p>{OLAVSOKA_NOTICE.localEvents}</p>
                </div>
                <p className="text-[12px] font-medium text-basalt/70 mt-2">{OLAVSOKA_NOTICE.action}</p>
              </div>
            </section>

            {/* LAYER C — Decision plan (above timeline) */}
            <section className="mb-6">
              <DecisionTreeView tree={DAY3_DECISION} onSelectPlan={setActivePlan} activePlanId={activePlan} />
            </section>

            {/* Active plan */}
            <section className="mb-6">
              <div className={`border rounded-[7px] p-4 ${
                activePlan === "d3-plan-a" ? "border-moss/30 bg-moss/[0.02]" :
                activePlan === "d3-plan-b" ? "border-fjord/30 bg-fjord/[0.02]" :
                "border-basalt/15"
              }`}>
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <p className="text-[14px] font-medium text-basalt">{activePlanData.title}</p>
                    <p className="text-[12px] text-basalt/55 mt-0.5">{activePlanData.condition}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.1em] text-moss bg-moss/[0.08] px-1.5 py-0.5 rounded-[3px]">
                    Active plan
                  </span>
                </div>
                <div className="space-y-2">
                  {activePlanData.timeline.map((t, i) => (
                    <div key={i} className="flex gap-3 text-[13px]">
                      <span className="code tnum text-fjord shrink-0 w-16">{t.time}</span>
                      <span className="text-basalt/75">{t.action}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-basalt/8 grid grid-cols-2 gap-2 text-[11px] text-basalt/55">
                  <p>Transport: {activePlanData.transport}</p>
                  <p>Weather: {activePlanData.weather}</p>
                </div>
                <p className="text-[11px] text-basalt/50 mt-1.5">{activePlanData.notes}</p>
              </div>
            </section>

            {/* Other plans as collapsed cards */}
            <section className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">Other plans (backups)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[PLAN_A, PLAN_B, PLAN_C]
                  .filter((p) => p.id !== activePlan)
                  .map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setActivePlan(plan.id)}
                      className="text-left border border-basalt/15 rounded-[7px] p-3.5 hover:border-basalt/30 transition-colors"
                    >
                      <p className="text-[13px] font-medium text-basalt">{plan.title}</p>
                      <p className="text-[11px] text-basalt/50 mt-0.5">{plan.condition}</p>
                    </button>
                  ))}
              </div>
            </section>

            {/* Supplies before matchday */}
            <section className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">Supplies before matchday</p>
              <div className="border border-basalt/15 rounded-[7px] divide-y divide-basalt/8">
                {MATCHDAY_PREP.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 text-[13px]">
                    <span className="text-rust shrink-0 mt-0.5">[ ]</span>
                    <div>
                      <span className="text-basalt font-medium">{item.item}</span>
                      <span className="text-basalt/50"> — {item.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Sources */}
            <SourceRegister items={[
              {
                claim: "Bus 701 to Fámjin may require request — call +298 239550",
                verification: provisional(
                  "SSL Route 701 timetable",
                  "Check timetable for 'T' marking (request required). Call at least 24h before.",
                  { title: SOURCE_LIBRARY.ssl.title, url: SOURCE_LIBRARY.ssl.url },
                ),
              },
              {
                claim: "Café MorMor hours: Wed–Fri 12:00–18:00",
                verification: provisional(
                  "Café MorMor Facebook page",
                  "Call to confirm — hours may vary. Also check Ólavsøka opening.",
                  { title: SOURCE_LIBRARY.cafeMorMor.title, url: SOURCE_LIBRARY.cafeMorMor.url },
                ),
              },
              {
                claim: "Ólavsøka may affect bus timetables and shop hours on 29 July",
                verification: provisional(
                  "SSL holiday timetable + Bónus holiday hours",
                  "Check ssl.fo and bonus.fo closer to 29 July for holiday schedules.",
                  { title: SOURCE_LIBRARY.ssl.title, url: SOURCE_LIBRARY.ssl.url },
                ),
              },
            ]} />
          </div>

          {/* Sidebar */}
          <aside className="min-w-0">
            <div className="space-y-6">
              <TripStatusPanel
                dateLine1="Wednesday 29 July 2026"
                dateLine2="Ólavsøka · Full Suðuroy day"
                weatherLat={61.536} weatherLon={-6.81}
                weatherLabel="Øravík"
              />
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">SUÐUROY · FAROE ISLANDS</p>
                <div style={{ minHeight: 420 }}><FaroesMap onSelect={() => {}} selected={null} filter="suðuroy" mapRef={mapRef} /></div>
              </div>
            </div>
          </aside>
        </div>
      </article>

      {/* MOBILE */}
      <article className="lg:hidden px-4 pt-6 pb-24 max-w-[640px] mx-auto">
        <div className="mb-6">
          <p className="text-[11px] tracking-[0.14em] uppercase text-rust font-medium">Day 3 · Wednesday · 29 July</p>
          <h1 className="text-[clamp(2rem,8vw,2.6rem)] leading-[1.06] mt-1 text-basalt tracking-[-0.01em]" style={{ fontFamily: "var(--font-cinzel)" }}>A full Suðuroy day</h1>
          <p className="text-[17px] font-medium text-basalt/80 mt-1.5">Øravík · Fámjin · Froðba</p>
          <p className="text-[14px] text-basalt/60 mt-2">Three plans depending on weather. Ólavsøka today — check what's open.</p>
        </div>
        <section className="mb-6"><TripReadiness /></section>
        <section className="mb-6"><MobileTripStatus dateLine1="Wednesday 29 July 2026" dateLine2="Ólavsøka · Free day on Suðuroy" weatherLat={61.536} weatherLon={-6.81} weatherLabel="Øravík" /></section>
        <section className="mb-6">
          <div className="border border-yellow/30 bg-yellow/[0.03] rounded-[8px] p-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-yellow/80 font-medium">⚠ Ólavsøka · 29 July</p>
            <p className="text-[12px] text-basalt/70 mt-1">National holiday. Bus services, shops, and cafés may run reduced hours or be closed. Stock up on Tuesday.</p>
          </div>
        </section>
        <section className="mb-6"><DecisionTreeView tree={DAY3_DECISION} onSelectPlan={setActivePlan} activePlanId={activePlan} /></section>
        <section className="mb-6">
          <div className="border border-basalt/15 rounded-[8px] p-4">
            <p className="text-[13px] font-medium text-basalt mb-2">{activePlanData.title}</p>
            {activePlanData.timeline.map((t, i) => (
              <p key={i} className="text-[12px] text-basalt/65"><span className="code tnum text-fjord">{t.time}</span> — {t.action}</p>
            ))}
          </div>
        </section>
        <section>
          <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">SUÐUROY · FAROE ISLANDS</p>
          <div style={{ minHeight: 420 }}><FaroesMap onSelect={() => {}} selected={null} filter="suðuroy" mapRef={mapRef} /></div>
        </section>
      </article>
    </>
  );
}
