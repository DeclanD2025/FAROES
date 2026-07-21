// =============================================================================
// DayFiveDetail — "Repositioning north" with ferry comparison table.
// Shows all plausible Friday sailings, Vágar exploration modules,
// luggage strategy, and source verification.
// =============================================================================

"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import type maplibregl from "maplibre-gl";
import { TripReadiness } from "@/components/trip-readiness";
import { DecisionTreeView } from "@/components/decision-tree";
import { SourceRegister } from "@/components/source-register";
import { DAY5_DECISION } from "@/lib/data/decision-trees";
import { FRIDAY_FERRY_OPTIONS, type FerryOption } from "@/lib/data/transport-matrices";
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
// VÁGAR EXPLORATION MODULES
// =============================================================================

interface VagarModule {
  id: string;
  name: string;
  transport: string;
  timeNeeded: string;
  luggage: string;
  notes: string;
  feasible: "yes" | "if-taxi" | "no";
}

const VAGAR_MODULES: VagarModule[] = [
  {
    id: "sorvagur-village",
    name: "Sørvágur village & harbour",
    transport: "Walk from Guesthouse Hugo (2 min)",
    timeNeeded: "30–60 min",
    luggage: "Drop bags at Hugo first",
    notes: "Small village, working harbour, quiet streets. Good for an evening walk when you arrive.",
    feasible: "yes",
  },
  {
    id: "bour",
    name: "Bøur village",
    transport: "Bus 300 from Sørvágur (1 stop, ~5 min) or taxi (~DKK 80)",
    timeNeeded: "30–60 min",
    luggage: "Leave at Hugo",
    notes: "Classic Faroese village with turf-roofed houses and a view of Tindholmur and Drangarnir sea stacks. Excellent photo spot. Short walk around the village.",
    feasible: "yes",
  },
  {
    id: "gasadalur",
    name: "Gásadalur & Múlafossur waterfall",
    transport: "Taxi only from Sørvágur (~DKK 150–200 one way, ~15 min through tunnel). No bus service to Gásadalur.",
    timeNeeded: "1–2 hrs",
    luggage: "Leave at Hugo",
    notes: "The iconic waterfall dropping into the ocean. Accessible through a single-lane tunnel. No public bus — taxi only. The walk from Sørvágur is NOT practical (~12 km over mountain pass — not doable with luggage or limited daylight).",
    feasible: "if-taxi",
  },
  {
    id: "mulafossur-walk-from-sorvagur",
    name: "Múlafossur — distance from Sørvágur",
    transport: "NOT walkable from Sørvágur — this is a common misconception",
    timeNeeded: "N/A",
    luggage: "N/A",
    notes: "The previous version of this page incorrectly described Múlafossur as 'a 25 min walk east from the village.' This is WRONG. Gásadalur (where Múlafossur is located) is ~12 km from Sørvágur over a mountain pass with ~400 m elevation gain. The road goes through a single-lane tunnel not suitable for pedestrians. You MUST take a taxi to reach it.",
    feasible: "no",
  },
  {
    id: "airport-area",
    name: "Vágar Airport area",
    transport: "Bus 300 from Sørvágur (1 stop, ~10 min)",
    timeNeeded: "15–30 min",
    luggage: "Can bring",
    notes: "Familiarise yourself with the terminal for tomorrow's flight. Check bus stop location, café hours, and security layout.",
    feasible: "yes",
  },
];

// =============================================================================
// Timeline (mid-morning ferry — best balance)
// =============================================================================

const DAY_FIVE_TIMELINE: TimelineStep[] = [
  {
    num: 1, title: "Morning in Øravík · pack & clean",
    subtitle: "Við á 7, Øravík 827",
    middleLabel: "Checkout", middleValue: "By 12:00",
    rightLabel: "Morning", rightValue: "Free",
    footer: "Leave the key in the lockbox. Final walk round the village. Pack everything — you're leaving Suðuroy permanently. Bus 700 to Krambatangi from Ferjuleðan.",
  },
  {
    num: 2, title: "Bus 700 → Krambatangi",
    subtitle: "Ferjuleðan stop · 2 stops",
    middleLabel: "Depart", middleValue: "~10:45",
    rightLabel: "Transfer", rightValue: "~8 min",
    footer: "DKK 20 pp or SSL Travel Card. Aim for the 11:30 ferry. If taking the 09:00 ferry, depart Øravík by 08:30.",
  },
  {
    num: 3, title: "M/F Smyril northbound · Friday sailing",
    subtitle: "Krambatangi → Tórshavn",
    middleLabel: "Departs", middleValue: "11:30",
    middleLabel2: "Arrives", middleValue2: "13:35",
    rightLabel: "Crossing", rightValue: "2h 05m",
    footer: "RECOMMENDED SAILING. Arrives with ~4–5h usable daylight in Vágar. Café onboard. If taking the 09:00 instead: arrive Tórshavn 11:05, Bus 300 at 11:30 → Sørvágur ~12:15 (~7h Vágar time, but early wake after matchday).",
    footerLink: { label: "SSL ferry status →", href: "https://ssl.fo" },
  },
  {
    num: 4, title: "Bus 300 · Tórshavn → Sørvágur",
    subtitle: "Via Vágatunnilin · stops at airport",
    middleLabel: "Departs", middleValue: "14:00",
    middleLabel2: "Arrives", middleValue2: "~14:45",
    rightLabel: "Journey", rightValue: "~45 min",
    footer: "Connects from the 13:35 ferry arrival. DKK 90 pp or SSL Travel Card. Bus drops at Sørvágur village centre. Airport is one more stop on the same route.",
  },
  {
    num: 5, title: "Guesthouse Hugo · check-in",
    subtitle: "2 Bakkavegur, 380 Sørvágur",
    middleLabel: "Arrive", middleValue: "~14:45",
    rightLabel: "Check-in", rightValue: "From 14:00",
    footer: "Confirmation: 5924180270. Phone: +298 232101. Self check-in. PIN concealed for security — check your booking confirmation. 10 min from the airport. Drop bags, then explore Vágar.",
  },
  {
    num: 6, title: "Vágar afternoon · exploration",
    subtitle: "Bøur / Sørvágur / Gásadalur (by taxi)",
    middleLabel: "Available", middleValue: "~4–5 hrs",
    rightLabel: "Sunset", rightValue: "~22:15",
    footer: "Options: Sørvágur village walk (2 min), Bøur by Bus 300 (5 min, DKK 20), Gásadalur by taxi (~DKK 150–200 one way). Múlafossur is NOT walkable from Sørvágur — it's ~12 km away over a mountain pass. Must taxi.",
  },
];

const DAY_FIVE_SUMMARY: SummaryItem[] = [
  { icon: "Ck", label: "Checkout", time: "12:00", note: "Øravík" },
  { icon: "Sf", label: "Ferry", time: "11:30", note: "Krambatangi" },
  { icon: "Bs", label: "Bus 300", time: "14:00", note: "→ Sørvágur" },
  { icon: "⌂", label: "Check-in", time: "~14:45", note: "Hugo" },
  { icon: "Ex", label: "Explore", time: "4–5 hrs", note: "Vágar" },
];

// =============================================================================
// FERRY COMPARISON TABLE
// =============================================================================

function FerryComparisonTable() {
  const [selected, setSelected] = useState<string>("friday-mid");

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-0.5">
            Ferry options comparison
          </p>
          <p className="text-[14px] font-medium text-basalt">
            Which Friday sailing gives us meaningful Vágar time?
          </p>
        </div>
      </div>

      <p className="text-[12px] text-basalt/60 mb-3">
        After a late matchday return (~23:30), an early ferry means less sleep but more Vágar daylight.
        The late ferry means rest but almost no time on Vágar.
      </p>

      {/* Comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {FRIDAY_FERRY_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setSelected(opt.id)}
            className={`text-left border rounded-[7px] p-4 transition-colors ${
              selected === opt.id
                ? "border-basalt/40 bg-basalt/[0.04]"
                : "border-basalt/15 hover:border-basalt/25"
            }`}
          >
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-[10px] uppercase tracking-[0.1em] text-basalt/60">
                {opt.departure}
              </span>
              {opt.recommendation.includes("Best") && (
                <span className="text-[9px] uppercase tracking-[0.1em] text-moss bg-moss/[0.08] px-1.5 py-0.5 rounded-[3px]">
                  Recommended
                </span>
              )}
            </div>
            <p className="code tnum text-[16px] font-medium text-basalt mb-2">{opt.arrival} arrival</p>
            <div className="space-y-1 text-[11px] text-basalt/55">
              <p>Sleep: {opt.sleepAfterMatchday}</p>
              <p>Vágar time: {opt.usableVagarTime}</p>
              <p>Resilience: <span className={
                opt.disruptionResilience === "high" ? "text-moss" : "text-yellow"
              }>{opt.disruptionResilience}</span></p>
            </div>
          </button>
        ))}
      </div>

      {/* Recommendation box */}
      <div className="border border-moss/25 bg-moss/[0.02] rounded-[7px] p-4">
        <p className="text-[10px] uppercase tracking-[0.12em] text-moss/80 mb-1">Recommendation</p>
        <p className="text-[13px] text-basalt/80">
          <strong>The 11:30 ferry is the best balance.</strong> Sleep ~8–9 hours after matchday, arrive Sørvágur by ~14:45, with 4–5 hours to explore Vágar. 
          The 09:00 gives more Vágar time but requires waking at ~07:00 after returning at ~23:30 the night before. 
          The 16:00 gives the most rest but arrives Sørvágur at ~19:15 — only an evening walk in the village.
        </p>
      </div>
    </div>
  );
}

// =============================================================================
// LUGGAGE STRATEGY
// =============================================================================

function LuggageStrategy() {
  return (
    <div className="border border-basalt/15 rounded-[7px] p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">
        Luggage strategy
      </p>
      <div className="space-y-2 text-[13px] text-basalt/70">
        <p>• <strong>Early bag drop:</strong> Guesthouse Hugo check-in is from 14:00. Drop bags first, then explore Vágar.</p>
        <p>• <strong>Hugo storage:</strong> Contact host (+298 232101) to ask if bags can be left before 14:00 if arriving on an early ferry.</p>
        <p>• <strong>Vágar Airport:</strong> No luggage storage at the airport. Cannot leave bags there.</p>
        <p>• <strong>Carrying luggage:</strong> If exploring before check-in, Bus 300 and village walks are manageable with backpacks. Gásadalur taxi with luggage is fine — leave bags in the taxi while you photograph.</p>
        <p>• <strong>Tórshavn layover:</strong> If there's a gap between ferry arrival and Bus 300 departure, the bus station has basic seating but no lockers. Keep bags with you.</p>
      </div>
    </div>
  );
}

// =============================================================================
// Mobile
// =============================================================================

function MobileDecisionPanel() {
  return (
    <div className="border border-basalt/15 rounded-[8px] p-4">
      <p className="text-[10px] uppercase tracking-[0.12em] text-fjord/60">Game plan</p>
      <p className="code tnum text-[36px] font-medium text-basalt leading-none mt-1">Ferry 11:30</p>
      <p className="text-[13px] text-basalt/65 mt-2">
        Pack up Øravík. <strong>11:30 ferry</strong> north (best balance of rest + Vágar time).
        Bus 300 to Sørvágur. <strong>Guesthouse Hugo</strong> is 10 min from the airport.
      </p>
      <div className="flex gap-6 mt-3 pt-3 border-t border-basalt/10">
        <div><p className="text-[10px] uppercase tracking-[0.1em] text-basalt/45">Arrive</p><p className="code tnum text-[15px] font-medium text-basalt">~14:45</p></div>
        <div><p className="text-[10px] uppercase tracking-[0.1em] text-basalt/45">Explore</p><p className="code tnum text-[15px] font-medium text-basalt">4–5 hrs</p></div>
      </div>
    </div>
  );
}

// =============================================================================
// SOURCES
// =============================================================================

const DAY5_SOURCES = [
  {
    claim: "Friday ferry timetable: departures from Krambatangi (09:00, 11:30, 16:00, 21:15)",
    verification: provisional(
      "SSL Route 7 timetable — summer 2026",
      "Friday timetable may differ from weekdays. Confirm at ssl.fo during week of travel.",
      { title: SOURCE_LIBRARY.ssl.title, url: SOURCE_LIBRARY.ssl.url },
    ),
  },
  {
    claim: "Bus 300 from Tórshavn to Sørvágur (~45 min, DKK 90)",
    verification: provisional(
      "SSL Bus 300 timetable",
      "Confirm Friday bus times at ssl.fo",
      { title: SOURCE_LIBRARY.ssl.title, url: SOURCE_LIBRARY.ssl.url },
    ),
  },
  {
    claim: "Gásadalur not accessible by public bus — taxi only",
    verification: verified(
      "SSL route map: no bus service to Gásadalur",
      { title: SOURCE_LIBRARY.ssl.title, url: SOURCE_LIBRARY.ssl.url },
    ),
  },
  {
    claim: "Múlafossur not walkable from Sørvágur (~12 km over mountain pass)",
    verification: verified(
      "OpenStreetMap distance measurement from Sørvágur to Gásadalur",
      { title: SOURCE_LIBRARY.openStreetMap.title, url: SOURCE_LIBRARY.openStreetMap.url },
    ),
  },
  {
    claim: "Guesthouse Hugo: 2 Bakkavegur, Sørvágur · check-in from 14:00",
    verification: provisional(
      "Guesthouse Hugo booking confirmation",
      "Check-in details in your booking. PIN not displayed for security.",
      { title: SOURCE_LIBRARY.guesthouseHugo.title, url: SOURCE_LIBRARY.guesthouseHugo.url },
    ),
  },
];

// =============================================================================
// Main export
// =============================================================================

export function DayFiveDetail() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [activePlan, setActivePlan] = useState<string>("d5-afternoon");

  return (
    <>
      {/* DESKTOP */}
      <article className="hidden lg:block px-8 pt-8 pb-20 max-w-[1280px]">
        <div className="grid grid-cols-[1fr_340px] gap-8">
          <div className="min-w-0">
            {/* Header */}
            <div className="mb-6">
              <p className="text-[12px] tracking-[0.14em] uppercase text-rust font-medium">Day 5 · Friday · 31 July 2026</p>
              <h1 className="text-[clamp(2.5rem,3.5vw,3.2rem)] leading-[1.04] mt-1.5 text-basalt tracking-[-0.01em]" style={{ fontFamily: "var(--font-cinzel)" }}>North to Vágar</h1>
              <p className="text-[20px] font-medium text-basalt/80 mt-2">Øravík → Tórshavn → Sørvágur → Vágar exploration</p>
              <p className="text-[14px] text-basalt/60 mt-2 max-w-[38rem]">
                One last ferry crossing, then chasing the late sun across Vágar. Bøur, Gásadalur (by taxi), and the village that puts us ten minutes from tomorrow's flight.
              </p>
            </div>

            {/* Trip Readiness */}
            <section className="mb-6"><TripReadiness /></section>

            {/* LAYER A — Day at a glance */}
            <section className="mb-6"><SummaryStrip items={DAY_FIVE_SUMMARY} /></section>

            {/* LAYER C — Ferry comparison (above timeline for decision-first flow) */}
            <section className="mb-6"><FerryComparisonTable /></section>

            {/* LAYER C — Decision plan */}
            <section className="mb-6">
              <DecisionTreeView tree={DAY5_DECISION} onSelectPlan={setActivePlan} activePlanId={activePlan} />
            </section>

            {/* LAYER B — Operating plan */}
            <section className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-3">Journey north</p>
              <JourneyTimeline steps={DAY_FIVE_TIMELINE} />
            </section>

            {/* LAYER D — Vágar exploration */}
            <section className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-3">Vágar exploration modules</p>
              <div className="space-y-2">
                {VAGAR_MODULES.map((mod) => (
                  <div key={mod.id} className="border border-basalt/15 rounded-[7px] p-3.5">
                    <div className="flex items-baseline justify-between mb-1">
                      <p className="text-[14px] font-medium text-basalt">{mod.name}</p>
                      <span className={`text-[10px] uppercase tracking-[0.08em] ${
                        mod.feasible === "yes" ? "text-moss" :
                        mod.feasible === "if-taxi" ? "text-yellow" :
                        "text-rust"
                      }`}>
                        {mod.feasible === "yes" ? "Public transport · yes" :
                         mod.feasible === "if-taxi" ? "Taxi only ◇" :
                         "Not walkable ✗"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-basalt/55">
                      <p>Transport: {mod.transport}</p>
                      <p>Time: {mod.timeNeeded}</p>
                      <p>Luggage: {mod.luggage}</p>
                    </div>
                    <p className="text-[11px] text-basalt/50 mt-1.5">{mod.notes}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Luggage strategy */}
            <section className="mb-6"><LuggageStrategy /></section>

            {/* LAYER E — Sources */}
            <SourceRegister items={DAY5_SOURCES} />
          </div>

          {/* Sidebar */}
          <aside className="min-w-0">
            <div className="space-y-6">
              <TripStatusPanel
                dateLine1="Friday 31 July 2026"
                dateLine2="Repositioning to Sørvágur"
                weatherLat={62.0706} weatherLon={-7.3221}
                weatherLabel="Sørvágur"
              />
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">SUÐUROY → VÁGAR</p>
                <div style={{ minHeight: 420 }}><FaroesMap onSelect={() => {}} selected={null} filter="journey" mapRef={mapRef} /></div>
              </div>
            </div>
          </aside>
        </div>
      </article>

      {/* MOBILE */}
      <article className="lg:hidden px-4 pt-6 pb-24 max-w-[640px] mx-auto">
        <div className="mb-6">
          <p className="text-[11px] tracking-[0.14em] uppercase text-rust font-medium">Day 5 · Friday · 31 July</p>
          <h1 className="text-[clamp(2rem,8vw,2.6rem)] leading-[1.06] mt-1 text-basalt tracking-[-0.01em]" style={{ fontFamily: "var(--font-cinzel)" }}>North to Vágar</h1>
          <p className="text-[17px] font-medium text-basalt/80 mt-1.5">Øravík → Tórshavn → Sørvágur</p>
          <p className="text-[14px] text-basalt/60 mt-2">Last ferry crossing, Bus 300 to Sørvágur, Guesthouse Hugo, then Vágar exploration.</p>
        </div>
        <section className="mb-6"><TripReadiness /></section>
        <section className="mb-6"><MobileDecisionPanel /></section>
        <section className="mb-6"><MobileTripStatus dateLine1="Friday 31 July 2026" dateLine2="Repositioning to Sørvágur" weatherLat={62.0706} weatherLon={-7.3221} weatherLabel="Sørvágur" /></section>
        <section className="mb-6"><p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">Journey north</p><MobileTimeline steps={DAY_FIVE_TIMELINE} /></section>
        <section className="mb-6"><FerryComparisonTable /></section>
        <section className="mb-6"><DecisionTreeView tree={DAY5_DECISION} /></section>
        <section><p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">SUÐUROY → VÁGAR</p><div style={{ minHeight: 420 }}><FaroesMap onSelect={() => {}} selected={null} filter="journey" mapRef={mapRef} /></div></section>
      </article>
    </>
  );
}
