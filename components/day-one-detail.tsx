// =============================================================================
// DayOneDetail — "The journey north" with connection chain diagram.
// Heavily expanded operational detail: each leg has full instructions,
// backup plans, source links, and risk assessment.
// =============================================================================

"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import type maplibregl from "maplibre-gl";
import { TripReadiness } from "@/components/trip-readiness";
import { ConnectionChain } from "@/components/connection-chain";
import { SourceRegister } from "@/components/source-register";
import { CONNECTION_CHAINS } from "@/lib/data/transport-matrices";
import { provisional } from "@/lib/data/sources";
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
// Timeline data — expanded with complete operational detail
// =============================================================================

const TIMELINE_STEPS: TimelineStep[] = [
  {
    num: 1, title: "Home → Bellshill Station",
    subtitle: "40 Liberty Road, Bellshill ML4 2EX",
    middleLabel: "Walk", middleValue: "~6 min",
    rightLabel: "Leave by", rightValue: "08:30",
    footer: "Walk east on Liberty Rd to Main St. Station entrance on Main St. Door-to-platform: budget 8 min with luggage. Taxi contingency: Bellshill Taxis +44 1698 747447. If delayed: next train at 09:59.",
  },
  {
    num: 2, title: "ScotRail · Bellshill → Haymarket",
    subtitle: "Recommended: 08:59 departure",
    middleLabel: "Departs", middleValue: "08:59",
    middleLabel2: "Arrives", middleValue2: "10:02",
    rightLabel: "Journey", rightValue: "1h 03m",
    footer: "RECOMMENDED SERVICE. Direct. Arrive EDI ~6h 30m before flight — massive buffer. Backup: 09:59 (still fine). Latest safe: 13:59 (EDI by ~15:00, 2h before flight). If all trains fail: taxi from Bellshill to EDI ~£45, 35 min.",
    footerLink: { label: "Live times on ScotRail →", href: "https://www.scotrail.co.uk/plan-your-journey" },
  },
  {
    num: 3, title: "Haymarket → Edinburgh Airport",
    subtitle: "Edinburgh Tram · every 7–8 min",
    middleLabel: "Departs", middleValue: "~10:05",
    middleLabel2: "Arrives", middleValue2: "~10:35",
    rightLabel: "Journey", rightValue: "~30 min",
    footer: "Tram stop is DIRECTLY OUTSIDE Haymarket station — no street crossing needed. Tap-on tap-off contactless or ticket machine. Alternative: Airport Bus 100 (every 10 min, ~30 min). Taxi ~£25, 20 min.",
  },
  {
    num: 4, title: "Edinburgh Airport · pre-flight",
    subtitle: "Domestic departures · check-in desks",
    middleLabel: "Arrive by", middleValue: "~10:40",
    rightLabel: "Contingency", rightValue: "~6h 20m",
    footer: "Check-in online before leaving home. Bag drop if needed. Security: budget 30 min (summer Monday morning — moderate queues). Airside food: All Bar One (bar+dining), Wetherspoons (pub food), Pret (coffee+food). Flight boards ~30 min before departure from gates 7–10.",
  },
  {
    num: 5, title: "Atlantic Airways RC 415",
    subtitle: "Edinburgh → Vágar · Airbus A320neo",
    middleLabel: "Departs", middleValue: "17:10 BST",
    middleLabel2: "Lands", middleValue2: "18:35 WEST",
    rightLabel: "Flight", rightValue: "1h 25m",
    footer: "Forth bridges ~3 min after takeoff (right side). Cairngorms to the right. ~45 min over North Sea. RNP approach curves between fjord walls into Sørvágur — one of Europe's more demanding commercial approaches. Buy onboard: Faroese beer, snacks, duty-free.",
    footerLink: { label: "Flight status →", href: "https://www.flightradar24.com/data/flights/rc415" },
  },
  {
    num: 6, title: "Vágar Airport · arrival",
    subtitle: "Sørvágur, Vágar · single terminal",
    middleLabel: "Arrive", middleValue: "18:35",
    rightLabel: "Onward", rightValue: "Bus 300",
    footer: "Walk across tarmac. Non-Schengen passport control — passport stamp on request. Arrivals duty-free open. No SIM vendor — buy eSIM before departure. Bus stop 50 m from terminal exit. Bus 300 typically meets RC 415 — but NOT guaranteed.",
  },
  {
    num: 7, title: "Bus 300 · Vágar Airport → Tórshavn",
    subtitle: "Via Vágatunnilin subsea tunnel",
    middleLabel: "Departs", middleValue: "~19:00",
    middleLabel2: "Arrives", middleValue2: "~19:45",
    rightLabel: "Journey", rightValue: "~45 min",
    footer: "DKK 90 pp or 7-day SSL Travel Card (DKK 700 ≈ £80 pp — covers all buses and foot ferries). Bus terminates at Tórshavn bus station. Ferry terminal (Farstøðin) is ~10 min walk or short taxi.",
  },
  {
    num: 8, title: "Tórshavn · ferry connection",
    subtitle: "Bus station → Farstøðin ferry terminal",
    middleLabel: "Arrive", middleValue: "~19:45",
    rightLabel: "Ferry", rightValue: "21:15",
    footer: "~1h 30m buffer. Walk to the harbour: ~10 min (800 m). Grab food near the harbour — Irish Pub, Etika, or Burger House. Ferry café also serves hot food, beer, and coffee onboard. FREE WI-FI at ferry terminal.",
  },
  {
    num: 9, title: "M/F Smyril · Route 7 · LAST SAILING",
    subtitle: "Tórshavn → Krambatangi · Suðuroy",
    middleLabel: "Departs", middleValue: "21:15",
    middleLabel2: "Arrives", middleValue2: "23:20",
    rightLabel: "Crossing", rightValue: "2h 05m",
    footer: "LAST SAILING OF THE DAY. Pre-book at booking.ssl.fo. Foot-passenger gate closes 5 min before departure (21:10). Queue from ~20:30. Café, indoor seating, outdoor deck, free Wi-Fi onboard. Dark, exposed pier at Krambatangi — bring a layer. If flight delayed enough to miss this: overnight in Tórshavn. Emergency: Hotel Hafnia +298 313233.",
    footerLink: { label: "Book at ssl.fo →", href: "https://booking.ssl.fo" },
  },
  {
    num: 10, title: "Krambatangi → Øravík · Við á 7",
    subtitle: "Bus 700 or walk · 2 km",
    middleLabel: "Arrive gate", middleValue: "~23:25",
    rightLabel: "Transfer", rightValue: "Bus 700",
    footer: "Bus 700 from Krambatangi (Ferjuleðan stop) — two stops to Øravík, ~8 min, DKK 20. If bus doesn't run that late: pre-book taxi +298 239550 (~DKK 150, 5 min). Last resort: walk 2 km (25 min, uphill, unlit road — not recommended with luggage). Self check-in: lockbox at Við á 7. Still twilight at midnight — eye mask essential.",
  },
];

const SUMMARY_ITEMS: SummaryItem[] = [
  { icon: "H", label: "Leave home", time: "08:30", note: "Bellshill" },
  { icon: "T", label: "Train", time: "08:59", note: "→ Haymarket" },
  { icon: "F", label: "Flight", time: "EDI 17:10", note: "RC 415" },
  { icon: "S", label: "Ferry", time: "21:15", note: "M/F Smyril" },
  { icon: "A", label: "Arrive", time: "~23:30", note: "Øravík" },
];

// =============================================================================
// LATEST SAFE DEPARTURES
// =============================================================================

function LatestSafeDepartures() {
  return (
    <div className="border border-basalt/15 rounded-[7px] p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">
        Latest safe departures · Home → FAE
      </p>
      <div className="space-y-2 text-[12px]">
        <SafeTime label="Leave home by" time="08:30" note="Catch 08:59 from Bellshill. Comfortable buffer at every stage." />
        <SafeTime label="Latest train from Bellshill" time="13:59" note="Arrives Haymarket 15:02. Tram to EDI ~15:30. Still 1h 40m before flight." />
        <SafeTime label="Abandon-rails deadline" time="15:00" note="If not on a train by now: take taxi straight to EDI from Bellshill (~£45, 35 min)." />
        <SafeTime label="EDI security latest" time="16:30" note="Gate closes ~16:40. 40 min before departure. Do NOT cut it closer." />
        <SafeTime label="FAE → Tórshavn latest bus" time="~19:00" note="If RC 415 is delayed past ~19:45, Bus 300 may have departed. Taxi ~DKK 1,200, 30 min." />
      </div>
    </div>
  );
}

function SafeTime({ label, time, note }: { label: string; time: string; note: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="code tnum text-fjord font-medium shrink-0 w-20">{time}</span>
      <div>
        <span className="text-basalt font-medium">{label}</span>
        <span className="text-basalt/50"> — {note}</span>
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
      <p className="text-[10px] uppercase tracking-[0.12em] text-fjord/60">Leave home by</p>
      <p className="code tnum text-[36px] font-medium text-basalt leading-none mt-1">08:30</p>
      <p className="text-[13px] text-basalt/65 mt-2">
        Catch the <strong>08:59</strong> from Bellshill. Flight <strong>EDI 17:10</strong>.
        Ferry <strong>21:15</strong> from Tórshavn — the LAST boat. Arrive Øravík <strong>~23:30</strong>.
      </p>
      <div className="flex gap-6 mt-3 pt-3 border-t border-basalt/10">
        <div><p className="text-[10px] uppercase tracking-[0.1em] text-basalt/45">Flight</p><p className="code tnum text-[15px] font-medium text-basalt">17:10</p></div>
        <div><p className="text-[10px] uppercase tracking-[0.1em] text-basalt/45">Arrive</p><p className="code tnum text-[15px] font-medium text-basalt">~23:30</p></div>
      </div>
    </div>
  );
}

// =============================================================================
// SOURCES
// =============================================================================

const DAY1_SOURCES = [
  {
    claim: "ScotRail Bellshill → Haymarket: ~hourly, ~1h 03m",
    verification: provisional(
      "ScotRail timetable — July 2026",
      "Confirm near travel date at scotrail.co.uk — engineering works possible",
      { title: SOURCE_LIBRARY.scotrail.title, url: SOURCE_LIBRARY.scotrail.url },
    ),
  },
  {
    claim: "RC 415 Edinburgh → Vágar: 17:10–18:35, 1h 25m",
    verification: provisional(
      "Atlantic Airways schedule — summer 2026",
      "Confirm flight times at atlanticairways.com",
      { title: SOURCE_LIBRARY.atlanticAirways.title, url: SOURCE_LIBRARY.atlanticAirways.url },
    ),
  },
  {
    claim: "Bus 300 Vágar Airport → Tórshavn: ~45 min, DKK 90",
    verification: provisional(
      "SSL Bus 300 timetable",
      "Check summer 2026 timetable at ssl.fo",
      { title: SOURCE_LIBRARY.ssl.title, url: SOURCE_LIBRARY.ssl.url },
    ),
  },
  {
    claim: "M/F Smyril Tórshavn → Krambatangi: 21:15–23:20, 2h 05m",
    verification: provisional(
      "SSL Route 7 ferry timetable",
      "Pre-book at booking.ssl.fo. Confirm sailing near travel date.",
      { title: SOURCE_LIBRARY.sslBooking.title, url: SOURCE_LIBRARY.sslBooking.url, note: "Last sailing of the day" },
    ),
  },
];

// =============================================================================
// Main export
// =============================================================================

export function DayOneDetail() {
  const mapRef = useRef<maplibregl.Map | null>(null);

  return (
    <>
      {/* DESKTOP */}
      <article className="hidden lg:block px-8 pt-8 pb-20 max-w-[1280px]">
        <div className="grid grid-cols-[1fr_340px] gap-8">
          <div className="min-w-0">
            {/* Header */}
            <div className="mb-6">
              <p className="text-[12px] tracking-[0.14em] uppercase text-rust font-medium">Day 1 · Monday · 27 July 2026</p>
              <h1 className="text-[clamp(2.5rem,3.5vw,3.2rem)] leading-[1.04] mt-1.5 text-basalt tracking-[-0.01em]" style={{ fontFamily: "var(--font-cinzel)" }}>The journey north</h1>
              <p className="text-[20px] font-medium text-basalt/80 mt-2">Bellshill → Edinburgh → Vágar → Tórshavn → Øravík</p>
              <p className="text-[14px] text-basalt/60 mt-2 max-w-[38rem]">
                One train, one tram, one flight, one bus, one ferry, one final short hop.
                ~15 hours door to door across Scotland and the North Atlantic.
              </p>
            </div>

            {/* Trip Readiness */}
            <section className="mb-6"><TripReadiness /></section>

            {/* LAYER A — Day at a glance */}
            <section className="mb-6"><SummaryStrip items={SUMMARY_ITEMS} /></section>

            {/* Connection chain diagram */}
            <section className="mb-6">
              <ConnectionChain chain={CONNECTION_CHAINS.day1!} />
            </section>

            {/* Latest safe departures */}
            <section className="mb-6"><LatestSafeDepartures /></section>

            {/* LAYER B — Operating plan */}
            <section className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-3">Journey timeline</p>
              <JourneyTimeline steps={TIMELINE_STEPS} />
            </section>

            {/* LAYER E — Sources */}
            <SourceRegister items={DAY1_SOURCES} />
          </div>

          {/* Sidebar */}
          <aside className="min-w-0">
            <div className="space-y-6" style={{ paddingTop: 220 }}>
              <TripStatusPanel
                dateLine1="Monday 27 July 2026"
                dateLine2="Flight RC 415 · EDI 17:10 → FAE 18:35"
                weatherLat={62.0097} weatherLon={-6.7716}
                weatherLabel="Tórshavn"
              />
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">SCOTLAND → FØROYAR</p>
                <div style={{ minHeight: 420 }}><FaroesMap onSelect={() => {}} selected={null} filter="journey" mapRef={mapRef} /></div>
              </div>
            </div>
          </aside>
        </div>
      </article>

      {/* MOBILE */}
      <article className="lg:hidden px-4 pt-6 pb-24 max-w-[640px] mx-auto">
        <div className="mb-6">
          <p className="text-[11px] tracking-[0.14em] uppercase text-rust font-medium">Day 1 · Monday · 27 July</p>
          <h1 className="text-[clamp(2rem,8vw,2.6rem)] leading-[1.06] mt-1 text-basalt tracking-[-0.01em]" style={{ fontFamily: "var(--font-cinzel)" }}>The journey north</h1>
          <p className="text-[17px] font-medium text-basalt/80 mt-1.5">Bellshill → Edinburgh → Vágar → Øravík</p>
          <p className="text-[14px] text-basalt/60 mt-2">One flight, one bus, one ferry, one short hop. ~15 hours door to door.</p>
        </div>
        <section className="mb-6"><TripReadiness /></section>
        <section className="mb-6"><MobileDecisionPanel /></section>
        <section className="mb-6"><MobileTripStatus dateLine1="Monday 27 July 2026" dateLine2="Flight at 17:10 from Edinburgh Airport" weatherLat={62.0097} weatherLon={-6.7716} weatherLabel="Tórshavn" /></section>
        <section className="mb-6"><p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">Journey</p><MobileTimeline steps={TIMELINE_STEPS} /></section>
        <section className="mb-6"><LatestSafeDepartures /></section>
        <section><p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">SCOTLAND → FØROYAR</p><div style={{ minHeight: 420 }}><FaroesMap onSelect={() => {}} selected={null} filter="journey" mapRef={mapRef} /></div></section>
      </article>
    </>
  );
}
