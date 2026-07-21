// =============================================================================
// DayFourDetail — "Matchday" full operational page.
// Sections: Pre-departure, Ferry north, Tórshavn pre-match, Match,
// Return ferry countdown with scenarios, Emergency plan.
// =============================================================================

"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import type maplibregl from "maplibre-gl";
import { TripReadiness } from "@/components/trip-readiness";
import { DecisionTreeView } from "@/components/decision-tree";
import { SourceRegister } from "@/components/source-register";
import { DAY4_DECISION } from "@/lib/data/decision-trees";
import { CONNECTION_CHAINS } from "@/lib/data/transport-matrices";
import { ConnectionChain } from "@/components/connection-chain";
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
// A. PRE-DEPARTURE CHECKLIST
// =============================================================================

const PRE_DEPARTURE_ITEMS = [
  { icon: "T", text: "Wake 08:00–09:00 · breakfast at Við á 7" },
  { icon: "W", text: "Check yr.no for Tórshavn · wind, rain, temperature at kick-off" },
  { icon: "Pk", text: "Pack: match ticket (offline PDF + paper), waterproof layer, scarf, ID, portable charger" },
  { icon: "Bs", text: "Bus 700 from Ferjuleðan to Krambatangi · depart by 10:45" },
  { icon: "Fd", text: "Food for return ferry — buy at Bónus Tvøroyri on Wed or bring from base" },
];

// =============================================================================
// Timeline data
// =============================================================================

const DAY_FOUR_TIMELINE: TimelineStep[] = [
  {
    num: 1, title: "Bus 700 → Krambatangi",
    subtitle: "Ferjuleðan stop · 2 stops from Øravík",
    middleLabel: "Depart", middleValue: "~10:45",
    rightLabel: "Transfer", rightValue: "~8 min",
    footer: "DKK 20 pp or SSL Travel Card. Walk to ferry terminal is 2 min from bus stop. Foot passengers queue at terminal — gate closes 5 min before sailing.",
  },
  {
    num: 2, title: "M/F Smyril northbound · Route 7",
    subtitle: "Krambatangi → Tórshavn",
    middleLabel: "Departs", middleValue: "11:30",
    middleLabel2: "Arrives", middleValue2: "13:35",
    rightLabel: "Crossing", rightValue: "2h 05m",
    footer: "Café onboard: hot food, beer, coffee. Upper deck for fjord views. Approach into Tórshavn harbour is worth being outside for. Seasickness: sit midships lower deck if rough.",
  },
  {
    num: 3, title: "Tinganes & the harbour",
    subtitle: "Old-town peninsula · turf-roofed houses · free to walk",
    middleLabel: "Arrive", middleValue: "13:35",
    rightLabel: "Free time", rightValue: "~2.5 hrs",
    footer: "Walk Tinganes end-to-end. Government sits here since 1848. Gravel lanes, timber houses, harbour one minute from ferry dock. Public toilets near the harbour.",
  },
  {
    num: 4, title: "OY Brewing · pre-match",
    subtitle: "5 min walk from Tórsvøllur · site-brewed beer + food",
    middleLabel: "Open from", middleValue: "16:00",
    rightLabel: "Walk", rightValue: "5 min",
    footer: "CONFIRM Thursday hours before matchday. Also nearby: Tórshøll (cheap Faroese pints, harbour, 15 min walk), Mikkeller (craft bar, old lanes, opens 16:00 Thu). Food near ground: The Burger House (takeaway, until 21:30).",
    footerLink: { label: "OY Brewing →", href: "https://oy.fo" },
  },
  {
    num: 5, title: "Kick-off · Tórsvøllur",
    subtitle: "Gundadalur · HB Tórshavn v Motherwell FC",
    middleLabel: "KO", middleValue: "18:00 WEST",
    rightLabel: "Full time", rightValue: "~19:50",
    footer: "UEFA Conference League · Qualifying Round 1. National stadium, ~6,000 capacity. Away end: north terrace — exposed, no roof. Late-July evening cools fast — layer up. Cash/card at kiosk.",
    footerLink: { label: "UEFA match info →", href: "https://www.uefa.com" },
  },
  {
    num: 6, title: "Walk to Farstøðin ferry terminal",
    subtitle: "Tórsvøllur → harbour · ~1 km",
    middleLabel: "Distance", middleValue: "~1 km",
    rightLabel: "Walk time", rightValue: "15–20 min",
    footer: "Exit stadium north-east exit, follow the main road downhill towards the harbour. The ferry terminal is visible from the waterfront. Do NOT linger — the 21:15 is the last boat.",
  },
  {
    num: 7, title: "M/F Smyril southbound · LAST SAILING",
    subtitle: "Tórshavn → Krambatangi · Route 7",
    middleLabel: "Departs", middleValue: "21:15",
    middleLabel2: "Arrives", middleValue2: "23:20",
    rightLabel: "Crossing", rightValue: "2h 05m",
    footer: "Gate closes 21:10 — 5 min before departure. Café open onboard. Dark, exposed pier at Krambatangi — bring a layer. Bus 700 two stops to Øravík. Taxi: +298 239550 (~DKK 150).",
    footerLink: { label: "SSL ferry status →", href: "https://ssl.fo" },
  },
];

const DAY_FOUR_SUMMARY: SummaryItem[] = [
  { icon: "S", label: "Ferry out", time: "11:30", note: "Krambatangi" },
  { icon: "KO", label: "Kick-off", time: "18:00", note: "Tórsvøllur" },
  { icon: "⏻", label: "Last boat", time: "21:15", note: "CRITICAL" },
  { icon: "A", label: "Arrive", time: "~23:30", note: "Øravík" },
  { icon: "Pm", label: "Pre-match", time: "OY Brewing", note: "5 min walk" },
];

// =============================================================================
// E. FERRY COUNTDOWN SCENARIOS
// =============================================================================

interface FerryScenario {
  id: string;
  title: string;
  matchEndTime: string;
  walkTime: string;
  terminalArrival: string;
  buffer: string;
  risk: "low" | "medium" | "high" | "critical";
  action: string;
}

const FERRY_SCENARIOS: FerryScenario[] = [
  {
    id: "normal",
    title: "Scenario 1: Match ends in normal time",
    matchEndTime: "~19:50",
    walkTime: "15–20 min",
    terminalArrival: "~20:10",
    buffer: "~1h 5m",
    risk: "low",
    action: "Walk briskly to the terminal. Comfortable buffer. Grab a coffee at the ferry café if it's open.",
  },
  {
    id: "extra-time",
    title: "Scenario 2: Match enters extra time",
    matchEndTime: "~20:20",
    walkTime: "15–20 min",
    terminalArrival: "~20:40",
    buffer: "~30 min",
    risk: "medium",
    action: "Leave at the final whistle. Walk purposefully. Do NOT stop for food or drink on the way.",
  },
  {
    id: "penalties",
    title: "Scenario 3: Penalty shootout",
    matchEndTime: "~20:35",
    walkTime: "12–15 min (brisk)",
    terminalArrival: "~20:50",
    buffer: "~20 min",
    risk: "high",
    action: "Leave IMMEDIATELY after the last penalty. Move fast. Consider taxi from Gundadalur (~DKK 80, 3 min).",
  },
  {
    id: "crowd",
    title: "Scenario 4: Crowd exit / policing delay",
    matchEndTime: "Varies",
    walkTime: "20–25 min",
    terminalArrival: "Varies",
    buffer: "Reduced",
    risk: "high",
    action: "If the crowd exit is slow or there's policing: taxi from Gundadalur immediately. +298 313131.",
  },
  {
    id: "cancelled",
    title: "Scenario 5: Ferry delayed or cancelled",
    matchEndTime: "N/A",
    walkTime: "N/A",
    terminalArrival: "N/A",
    buffer: "N/A",
    risk: "critical",
    action: "Check ssl.fo for disruption status. Emergency accommodation: Hotel Hafnia +298 313233, Hotel Føroyar +298 317500, AirBnB last-minute. Inform Øravík host if not returning.",
  },
];

// =============================================================================
// DESKTOP: Ferry Countdown Panel
// =============================================================================

function FerryCountdownPanel() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-3">
        Return ferry countdown
      </p>
      {/* Critical warning */}
      <div className="border border-rust/30 bg-rust/[0.03] rounded-[7px] p-4 mb-4">
        <p className="text-[11px] uppercase tracking-[0.12em] text-rust font-medium mb-1">
          Last boat: 21:15
        </p>
        <p className="text-[13px] text-basalt/80">
          Miss this and we sleep in Tórshavn. Stadium to terminal: ~1 km, 15–20 min walk.
          Normal full-time leaves ~1h 05m buffer. Extra time/pens: buffer becomes very tight.
        </p>
      </div>

      {/* Countdown flow */}
      <div className="space-y-1 text-[13px] mb-4">
        <CountdownRow label="Normal full-time" time="~19:50" />
        <CountdownRow label="Leave stadium" time="~19:52" muted />
        <CountdownRow label="Walk to Farstøðin" time="15–20 min" muted />
        <CountdownRow label="Arrive terminal" time="~20:10" />
        <CountdownRow label="Boarding closes" time="21:10" emphasis />
        <CountdownRow label="Smyril departs" time="21:15" critical />
      </div>

      {/* Scenarios */}
      <p className="text-[10px] uppercase tracking-[0.12em] text-fjord/60 mb-2">Scenarios</p>
      <div className="space-y-1.5">
        {FERRY_SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedScenario(selectedScenario === s.id ? null : s.id)}
            className={`w-full text-left border rounded-[6px] p-2.5 transition-colors text-[12px] ${
              selectedScenario === s.id
                ? "border-basalt/40 bg-basalt/[0.04]"
                : "border-basalt/12 hover:border-basalt/25"
            }`}
          >
            <div className="flex items-baseline justify-between">
              <span className={`font-medium ${
                s.risk === "critical" ? "text-rust" :
                s.risk === "high" ? "text-yellow" :
                "text-basalt"
              }`}>{s.title}</span>
              <span className={`text-[10px] uppercase tracking-[0.08em] ${
                s.risk === "critical" ? "text-rust" :
                s.risk === "high" ? "text-yellow" :
                s.risk === "medium" ? "text-fjord/70" :
                "text-moss"
              }`}>
                {s.risk} risk
              </span>
            </div>
            {selectedScenario === s.id && (
              <div className="mt-2 pt-2 border-t border-basalt/8 text-[11px] text-basalt/60 space-y-1">
                <p>Match ends: {s.matchEndTime} · Walk: {s.walkTime} · Terminal: {s.terminalArrival}</p>
                <p className="font-medium text-basalt/80 mt-1">{s.action}</p>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Emergency contacts */}
      <div className="border-t border-basalt/10 mt-4 pt-3">
        <p className="text-[10px] uppercase tracking-[0.12em] text-rust/70 mb-2">Emergency contacts</p>
        <div className="grid grid-cols-2 gap-2 text-[12px]">
          <ContactLine label="Tórshavn taxi" value="+298 313131" />
          <ContactLine label="Suðuroy taxi" value="+298 239550" />
          <ContactLine label="Hotel Hafnia" value="+298 313233" />
          <ContactLine label="Hotel Føroyar" value="+298 317500" />
        </div>
      </div>
    </div>
  );
}

function CountdownRow({ label, time, muted, emphasis, critical }: {
  label: string; time: string; muted?: boolean; emphasis?: boolean; critical?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-1 px-2 rounded-[3px] ${
      critical ? "bg-rust/[0.06] border border-rust/15" : ""
    }`}>
      <span className={muted ? "text-basalt/45" : emphasis ? "font-medium text-rust" : critical ? "font-medium text-rust" : "text-basalt/70"}>
        {label}
      </span>
      <span className={`code tnum text-[12px] ${critical ? "text-rust font-medium" : emphasis ? "text-rust font-medium" : muted ? "text-basalt/40" : "text-fjord"}`}>
        {time}
      </span>
    </div>
  );
}

function ContactLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-basalt/50">{label}: </span>
      <span className="code text-fjord">{value}</span>
    </div>
  );
}

// =============================================================================
// Mobile Ferry Scenarios (collapsed accordion)
// =============================================================================

function MobileFerryScenarios() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-rust/20 bg-rust/[0.02] rounded-[8px]">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left"
        aria-expanded={expanded}
      >
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-rust font-medium">
            Last boat: 21:15
          </p>
          <p className="text-[12px] text-basalt/70 mt-1">
            Miss this and we sleep in Tórshavn. Stadium to terminal: ~1 km, 15–20 min walk.
          </p>
        </div>
        <span className="text-[14px] text-basalt/40 shrink-0 ml-3">
          {expanded ? "^" : "v"}
        </span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-1.5">
          {FERRY_SCENARIOS.map((s) => (
            <div key={s.id} className="border border-basalt/10 rounded-[6px] p-2.5 text-[11px]">
              <div className="flex items-baseline justify-between mb-1">
                <span className={`font-medium ${
                  s.risk === "critical" ? "text-rust" :
                  s.risk === "high" ? "text-yellow" :
                  "text-basalt"
                }`}>{s.title}</span>
                <span className={`text-[9px] uppercase tracking-[0.08em] ${
                  s.risk === "critical" ? "text-rust" :
                  s.risk === "high" ? "text-yellow" :
                  "text-fjord/60"
                }`}>{s.risk} risk</span>
              </div>
              <p className="text-basalt/60">{s.action}</p>
            </div>
          ))}
          <div className="pt-2 mt-2 border-t border-basalt/10">
            <p className="text-[10px] uppercase tracking-[0.1em] text-rust/70 mb-1">Emergency contacts</p>
            <p className="text-[11px] text-basalt/60">Taxi: +298 313131 · Hotel Hafnia: +298 313233 · Hotel Føroyar: +298 317500</p>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// Mobile
// =============================================================================

function MobileDecisionPanel() {
  return (
    <div className="border border-rust/20 bg-rust/[0.02] rounded-[8px] p-4">
      <p className="text-[10px] uppercase tracking-[0.12em] text-rust font-medium">Matchday plan</p>
      <p className="code tnum text-[36px] font-medium text-basalt leading-none mt-1">Ferry 11:30</p>
      <p className="text-[13px] text-basalt/65 mt-2">
        Northbound to <strong>Tórshavn</strong>. Tinganes, OY Brewing, then <strong>HB v Motherwell</strong> at 18:00.
        The <strong className="text-rust">21:15 is the last boat</strong> — miss it and we sleep in Tórshavn.
        Stadium to terminal: ~1 km, 15–20 min walk.
      </p>
      <div className="flex gap-6 mt-3 pt-3 border-t border-basalt/10">
        <div><p className="text-[10px] uppercase tracking-[0.1em] text-basalt/45">KO</p><p className="code tnum text-[15px] font-medium text-basalt">18:00</p></div>
        <div><p className="text-[10px] uppercase tracking-[0.1em] text-basalt/45">Last boat</p><p className="code tnum text-[15px] font-medium text-rust">21:15</p></div>
        <div><p className="text-[10px] uppercase tracking-[0.1em] text-basalt/45">Walk</p><p className="code tnum text-[15px] font-medium text-basalt">~1 km</p></div>
      </div>
    </div>
  );
}

// =============================================================================
// SOURCES
// =============================================================================

const DAY4_SOURCES = [
  {
    claim: "Ferry times: Krambatangi 11:30 → Tórshavn, Tórshavn 21:15 → Krambatangi",
    verification: provisional(
      "SSL Route 7 timetable — summer 2026",
      "Confirm timetable during week of travel at ssl.fo",
      { title: SOURCE_LIBRARY.ssl.title, url: SOURCE_LIBRARY.ssl.url },
    ),
  },
  {
    claim: "Match kick-off 18:00 at Tórsvøllur",
    verification: provisional(
      "UEFA Conference League Q1 fixture",
      "Confirm kick-off time near match date — subject to broadcast changes",
      { title: SOURCE_LIBRARY.uefa.title, url: SOURCE_LIBRARY.uefa.url, note: "Fixture date confirmed, KO time provisional" },
    ),
  },
  {
    claim: "Stadium to ferry terminal: ~1 km, 15–20 min walk",
    verification: verified(
      "OpenStreetMap distance measurement",
      { title: SOURCE_LIBRARY.openStreetMap.title, url: SOURCE_LIBRARY.openStreetMap.url },
    ),
  },
  {
    claim: "OY Brewing hours: Thursday from 16:00",
    verification: provisional(
      "OY Brewing website",
      "Call to confirm Thursday hours before matchday — opening may vary",
      { title: SOURCE_LIBRARY.oyBrewing.title, url: SOURCE_LIBRARY.oyBrewing.url },
    ),
  },
];

// =============================================================================
// Main export
// =============================================================================

export function DayFourDetail() {
  const mapRef = useRef<maplibregl.Map | null>(null);

  return (
    <>
      {/* DESKTOP */}
      <article className="hidden lg:grid grid-cols-[1fr_340px] gap-8 px-8 pt-8 pb-20 max-w-[1280px]">
        <div className="min-w-0">
          {/* Header */}
          <div className="mb-6">
            <p className="text-[12px] tracking-[0.14em] uppercase text-rust font-medium">Day 4 · Thursday · 30 July 2026</p>
            <h1 className="text-[clamp(2.5rem,3.5vw,3.2rem)] leading-[1.04] mt-1.5 text-basalt tracking-[-0.01em]" style={{ fontFamily: "var(--font-cinzel)" }}>Matchday</h1>
            <p className="text-[20px] font-medium text-basalt/80 mt-2">Øravík → Tórshavn → Tórsvøllur</p>
            <p className="text-[14px] text-basalt/60 mt-2 max-w-[38rem]">
              HB Tórshavn v Motherwell · UEFA Conference League Q1.
              Ferry north at 11:30, Tinganes, pre-match at OY Brewing, kick-off at 18:00.
              The 21:15 is the last boat of the day back to Suðuroy — miss it and we sleep in Tórshavn.
            </p>
          </div>

          {/* Trip Readiness */}
          <section className="mb-6"><TripReadiness /></section>

          {/* LAYER A — Day at a glance */}
          <section className="mb-6"><SummaryStrip items={DAY_FOUR_SUMMARY} /></section>

          {/* LAYER B — Operating plan */}
          <section className="mb-6">
            <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-3">Matchday timeline</p>
            <JourneyTimeline steps={DAY_FOUR_TIMELINE} />
          </section>

          {/* LAYER C — Decision plan */}
          <section className="mb-6">
            <DecisionTreeView tree={DAY4_DECISION} />
          </section>

          {/* Connection chain */}
          <section className="mb-6">
            <ConnectionChain chain={CONNECTION_CHAINS.day4!} />
          </section>

          {/* Pre-departure checklist */}
          <section className="mb-6">
            <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">Pre-departure · Øravík</p>
            <div className="border border-basalt/15 rounded-[7px] divide-y divide-basalt/8">
              {PRE_DEPARTURE_ITEMS.map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2.5 text-[13px]">
                  <span className="text-[14px] shrink-0">{item.icon}</span>
                  <span className="text-basalt/75">{item.text}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Pubs near the ground */}
          <section className="mb-6">
            <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">Pubs near the ground</p>
            <div className="space-y-2">
              {[
                { name: "OY Brewing", walk: "5 min", note: "Site-brewed, food. The pre-match room. Confirm Thu hours." },
                { name: "Tórshøll", walk: "15 min", note: "Cheap Faroese pints, harbour-side, working-class football crowd." },
                { name: "Mikkeller Tórshavn", walk: "10 min", note: "Tiny craft bar, old lanes. Thu open from 16:00." },
                { name: "Irish Pub Tórshavn", walk: "Harbour", note: "Fish & chips, full bar — the away-day classic." },
              ].map((pub, i) => (
                <div key={i} className="flex items-center gap-3 text-[13px] border-b border-basalt/5 pb-2">
                  <span className="code tnum text-fjord w-12 shrink-0">{pub.walk}</span>
                  <span className="font-medium text-basalt">{pub.name}</span>
                  <span className="text-basalt/50 hidden sm:inline">— {pub.note}</span>
                </div>
              ))}
            </div>
          </section>

          {/* LAYER E — Sources */}
          <SourceRegister items={DAY4_SOURCES} />
        </div>

        {/* Sidebar */}
        <aside className="min-w-0">
          <div className="space-y-6">
            {/* Ferry countdown panel */}
            <FerryCountdownPanel />

            {/* Trip status */}
            <TripStatusPanel
              dateLine1="Thursday 30 July 2026"
              dateLine2="Kick-off 18:00 · Tórsvøllur"
              weatherLat={62.0097} weatherLon={-6.7716}
              weatherLabel="Tórshavn"
            />

            {/* Map */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">TÓRSHAVN · MATCHDAY</p>
              <div style={{ minHeight: 420 }}><FaroesMap onSelect={() => {}} selected={null} filter="match" mapRef={mapRef} /></div>
            </div>

            {/* Stadium info card */}
            <div className="border border-basalt/15 rounded-[7px] p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">Stadium</p>
              <p className="text-[13px] font-medium text-basalt">Tórsvøllur · Gundadalur</p>
              <p className="text-[12px] text-basalt/55 mt-1">National stadium, ~6,000 capacity. Away end on north terrace — exposed, no roof. Late-July evening cools fast.</p>
              <p className="text-[12px] text-basalt/55 mt-1">Bag policy: confirm with Motherwell FC near match date. Cash and card accepted at kiosks.</p>
            </div>
          </div>
        </aside>
      </article>

      {/* MOBILE */}
      <article className="lg:hidden px-4 pt-6 pb-24 max-w-[640px] mx-auto">
        <div className="mb-6">
          <p className="text-[11px] tracking-[0.14em] uppercase text-rust font-medium">Day 4 · Thursday · 30 July</p>
          <h1 className="text-[clamp(2rem,8vw,2.6rem)] leading-[1.06] mt-1 text-basalt tracking-[-0.01em]" style={{ fontFamily: "var(--font-cinzel)" }}>Matchday</h1>
          <p className="text-[17px] font-medium text-basalt/80 mt-1.5">Øravík → Tórshavn → Tórsvøllur</p>
          <p className="text-[14px] text-basalt/60 mt-2">HB v Motherwell · UEFA Conference League Q1. Last boat at 21:15.</p>
        </div>
        <section className="mb-6"><TripReadiness /></section>
        <section className="mb-6"><MobileDecisionPanel /></section>
        <section className="mb-6"><MobileTripStatus dateLine1="Thursday 30 July 2026" dateLine2="Matchday · HB Tórshavn v Motherwell" weatherLat={62.0097} weatherLon={-6.7716} weatherLabel="Tórshavn" /></section>
        <section className="mb-6"><p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">Matchday timeline</p><MobileTimeline steps={DAY_FOUR_TIMELINE} /></section>
        <section className="mb-6"><DecisionTreeView tree={DAY4_DECISION} /></section>
        <section className="mb-6"><MobileFerryScenarios /></section>
        <section><p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">TÓRSHAVN · MATCHDAY</p><div style={{ minHeight: 420 }}><FaroesMap onSelect={() => {}} selected={null} filter="match" mapRef={mapRef} /></div></section>
      </article>
    </>
  );
}
