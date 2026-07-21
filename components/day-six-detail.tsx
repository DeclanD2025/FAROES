// =============================================================================
// DaySixDetail — "Homeward" with self-transfer risk diagram.
// Includes: check-out, bus to FAE, RC 416 to LGW, National Express to STN,
// RK 330 to GLA, final journey to Bellshill.
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
// Self-transfer risk analysis
// =============================================================================

const SELF_TRANSFER_RISK = {
  title: "Self-transfer risk analysis",
  summary: "This is a self-transfer — two separate bookings. If RC 416 is delayed and you miss the coach, the second booking (RK 330) is NOT protected. Travel insurance with missed-connection cover is essential.",
  flights: {
    first: { carrier: "Atlantic Airways", flight: "RC 416", route: "FAE → LGW", dep: "09:10 WEST", arr: "11:25 BST" },
    second: { carrier: "Ryanair UK", flight: "RK 330", route: "STN → GLA", dep: "19:35", arr: "21:10" },
  },
  connection: {
    method: "National Express coach · LGW South → STN",
    bestOption: "13:00 → 15:15 (2h 15m)",
    bufferAtLGW: "1h 35m from RC 416 landing",
    bufferAtSTN: "4h 20m before RK 330",
    lastSafe: "15:00 coach (arrives STN ~17:15 — 2h 15m before RK 330)",
  },
  scenarios: [
    { delay: "RC 416 on time (11:25)", action: "Catch the 13:00 coach. Comfortable buffer at both ends.", risk: "low" },
    { delay: "RC 416 delayed 1h (12:25)", action: "Catch the 14:00 coach. Still comfortable at STN (3h 15m buffer).", risk: "low" },
    { delay: "RC 416 delayed 2h (13:25)", action: "Catch the 15:00 coach. Arrives STN 17:15 — 2h 15m before RK 330. Tight but viable.", risk: "medium" },
    { delay: "RC 416 delayed 3h+ (14:25+)", action: "Book a flexible coach ticket. If 15:00 is missed: train to STN via London (Thameslink → St Pancras → Stansted Express, ~2h). Or Uber/taxi LGW→STN (~£150, 2h).", risk: "high" },
    { delay: "RC 416 delayed 5h+ (16:25+)", action: "Ryanair check-in closes 40 min before departure (18:55). If you can't make STN by 18:55: contact Ryanair to change flight (fee applies). Next STN→GLA is next day.", risk: "critical" },
  ],
};

// =============================================================================
// Timeline
// =============================================================================

const TIMELINE_STEPS: TimelineStep[] = [
  {
    num: 1, title: "Wake up · Guesthouse Hugo",
    subtitle: "2 Bakkavegur, 380 Sørvágur",
    middleLabel: "Alarm", middleValue: "06:30",
    rightLabel: "Check", rightValue: "yr.no",
    footer: "Final morning in the Faroes. Pack everything — double-check drawers and chargers. Check Vágar visibility on yr.no. Atlantic Airways is used to fog, but coach transfer might need rebooking if delayed.",
  },
  {
    num: 2, title: "Walk to Sørvágur bus stop",
    subtitle: "Village centre · 2 min from Hugo",
    middleLabel: "Walk", middleValue: "~2 min",
    rightLabel: "Leave by", rightValue: "07:35",
    footer: "Bus 300 stops at village centre, not the airport. The airport is one stop further. Allow 5 min slack for tunnel traffic.",
  },
  {
    num: 3, title: "Bus 300 · Sørvágur → Vágar Airport",
    subtitle: "Via Vágatunnilin · 1 stop",
    middleLabel: "Departs", middleValue: "07:40",
    rightLabel: "Arrive", rightValue: "07:50",
    footer: "DKK 20 pp or SSL Travel Card. 10 min hop. Bus drops at terminal entrance — walk straight in.",
  },
  {
    num: 4, title: "Vágar Airport · check-in",
    subtitle: "Single terminal · Atlantic Airways desks",
    middleLabel: "Desks open", middleValue: "~07:10",
    middleLabel2: "Boarding", middleValue2: "~08:40",
    rightLabel: "Gate closes", rightValue: "08:50",
    footer: "One café airside (coffee, pastries, sandwiches). Duty-free for Faroese wool and beer. No lounge. Security is quick — single scanner, rarely a queue. Check in online before leaving Hugo.",
  },
  {
    num: 5, title: "Atlantic Airways RC 416",
    subtitle: "Vágar → London Gatwick · Airbus A320neo",
    middleLabel: "Departs", middleValue: "09:10 WEST",
    middleLabel2: "Lands", middleValue2: "11:25 BST",
    rightLabel: "Flight", rightValue: "2h 15m",
    footer: "Mykines on climb-out. Forth bridges on descent. Faroes disappear into cloud within 5 minutes.",
    footerLink: { label: "Flight status →", href: "https://www.flightradar24.com/data/flights/rc416" },
  },
  {
    num: 6, title: "Gatwick · North Terminal arrivals",
    subtitle: "UK border · baggage reclaim",
    middleLabel: "Land", middleValue: "11:25",
    rightLabel: "Clear", rightValue: "~30 min",
    footer: "UK passport e-gates usually fast. Collect checked bags. Follow signs to inter-terminal shuttle — free monorail to South Terminal, every 3 min, 2 min journey. Coach station at South Terminal lower level.",
  },
  {
    num: 7, title: "Gatwick South · coach station",
    subtitle: "National Express · lower level",
    middleLabel: "Arrive", middleValue: "~12:00",
    rightLabel: "Coach", rightValue: "13:00",
    footer: "M&S Food, Pret, Costa in South Terminal. The coach station has seating and a departures board. Book at nationalexpress.com — flexible ticket recommended in case of flight delay.",
    footerLink: { label: "Book National Express →", href: "https://www.nationalexpress.com" },
  },
  {
    num: 8, title: "National Express · LGW → STN",
    subtitle: "Gatwick South → Stansted Airport · via M25/M11",
    middleLabel: "Departs", middleValue: "13:00",
    middleLabel2: "Arrives", middleValue2: "~15:15",
    rightLabel: "Coach", rightValue: "~2h 15m",
    footer: "Wi-Fi, USB charging, toilet onboard. M25 can be slow on Saturday afternoon — if Google Maps shows heavy traffic, consider train alternative (Thameslink → St Pancras → Stansted Express, ~2h).",
  },
  {
    num: 9, title: "Stansted Airport",
    subtitle: "Ryanair check-in · RK 330 to Glasgow",
    middleLabel: "Arrive", middleValue: "~15:15",
    rightLabel: "Buffer", rightValue: "~4h 20m",
    footer: "Food court before security: Leon, Pret, Burger King. Wetherspoons airside (The Windmill). Ryanair check-in closes 40 min before departure. Gate announced ~40 min before. Do online check-in before leaving Faroes.",
  },
  {
    num: 10, title: "Ryanair RK 330",
    subtitle: "Stansted → Glasgow · Boeing 737-800",
    middleLabel: "Departs", middleValue: "19:35",
    middleLabel2: "Lands", middleValue2: "21:10",
    rightLabel: "Flight", rightValue: "1h 35m",
    footer: "Last leg. Glasgow's lights on approach. Left side window for Clyde views.",
    footerLink: { label: "Flight status →", href: "https://www.flightradar24.com/data/flights/rk330" },
  },
  {
    num: 11, title: "Glasgow Airport → Bellshill",
    subtitle: "Domestic arrivals · baggage reclaim",
    middleLabel: "Land", middleValue: "21:10",
    rightLabel: "Home", rightValue: "~22:00",
    footer: "Quick exit — domestic, no passport control. Options: taxi ~£35 (35 min, rank outside domestic arrivals), or Bus 500 to Glasgow city centre then ScotRail Glasgow Central → Bellshill (~20 min, runs until ~23:30).",
  },
];

const SUMMARY_ITEMS: SummaryItem[] = [
  { icon: "Bs", label: "Bus to FAE", time: "07:40", note: "Hugo" },
  { icon: "F1", label: "Flight 1", time: "RC 416", note: "FAE → LGW" },
  { icon: "Ch", label: "Coach", time: "13:00", note: "LGW → STN" },
  { icon: "F2", label: "Flight 2", time: "RK 330", note: "STN → GLA" },
  { icon: "Hm", label: "Home", time: "~22:00", note: "Bellshill" },
];

// =============================================================================
// HOME OPTIONS
// =============================================================================

const HOME_OPTIONS = [
  { method: "Taxi", time: "~35 min", cost: "~£35", note: "Rank outside domestic arrivals. Fastest door-to-door. Confirm fare before departing." },
  { method: "Bus 500 + train", time: "~1h 10m", cost: "~£10", note: "Bus 500 to Glasgow city centre (15 min), then ScotRail Glasgow Central → Bellshill (20 min). Check last train ~23:30." },
  { method: "Pick-up", time: "~35 min", cost: "Free", note: "If someone's collecting you — pickup point is the short-stay car park." },
];

// =============================================================================
// Mobile
// =============================================================================

function MobileDecisionPanel() {
  return (
    <div className="border border-basalt/15 rounded-[8px] p-4">
      <p className="text-[10px] uppercase tracking-[0.12em] text-fjord/60">First move</p>
      <p className="code tnum text-[36px] font-medium text-basalt leading-none mt-1">Bus 07:40</p>
      <p className="text-[13px] text-basalt/65 mt-2">
        Walk to Sørvágur bus stop. <strong>Bus 300 at 07:40</strong> to Vágar Airport.
        RC 416 to Gatwick, National Express to Stansted, <strong>RK 330 to Glasgow</strong> at 19:35.
      </p>
      <div className="flex gap-6 mt-3 pt-3 border-t border-basalt/10">
        <div><p className="text-[10px] uppercase tracking-[0.1em] text-basalt/45">Depart FAE</p><p className="code tnum text-[15px] font-medium text-basalt">09:10</p></div>
        <div><p className="text-[10px] uppercase tracking-[0.1em] text-basalt/45">Home</p><p className="code tnum text-[15px] font-medium text-basalt">~22:00</p></div>
      </div>
    </div>
  );
}

// =============================================================================
// SOURCES
// =============================================================================

const DAY6_SOURCES = [
  {
    claim: "RC 416 Vágar → Gatwick: 09:10–11:25",
    verification: provisional(
      "Atlantic Airways schedule",
      "Confirm flight times at atlanticairways.com",
      { title: SOURCE_LIBRARY.atlanticAirways.title, url: SOURCE_LIBRARY.atlanticAirways.url },
    ),
  },
  {
    claim: "National Express LGW → STN: ~2h 15m, ~hourly",
    verification: provisional(
      "National Express timetable",
      "Book at nationalexpress.com — book flexible ticket for delay protection",
      { title: SOURCE_LIBRARY.nationalExpress.title, url: SOURCE_LIBRARY.nationalExpress.url },
    ),
  },
  {
    claim: "RK 330 Stansted → Glasgow: 19:35–21:10",
    verification: provisional(
      "Ryanair schedule",
      "Check flight times at ryanair.com. This is a SEPARATE booking — not protected.",
      { title: SOURCE_LIBRARY.ryanair.title, url: SOURCE_LIBRARY.ryanair.url },
    ),
  },
  {
    claim: "Bus 300 Sørvágur → Vágar Airport: 07:40, 10 min",
    verification: provisional(
      "SSL Bus 300 timetable",
      "Check summer 2026 Saturday timetable at ssl.fo",
      { title: SOURCE_LIBRARY.ssl.title, url: SOURCE_LIBRARY.ssl.url },
    ),
  },
];

// =============================================================================
// Main export
// =============================================================================

export function DaySixDetail() {
  const mapRef = useRef<maplibregl.Map | null>(null);

  return (
    <>
      {/* DESKTOP */}
      <article className="hidden lg:block px-8 pt-8 pb-20 max-w-[1280px]">
        <div className="grid grid-cols-[1fr_340px] gap-8">
          <div className="min-w-0">
            {/* Header */}
            <div className="mb-6">
              <p className="text-[12px] tracking-[0.14em] uppercase text-rust font-medium">Day 6 · Saturday · 1 August 2026</p>
              <h1 className="text-[clamp(2.5rem,3.5vw,3.2rem)] leading-[1.04] mt-1.5 text-basalt tracking-[-0.01em]" style={{ fontFamily: "var(--font-cinzel)" }}>Homeward</h1>
              <p className="text-[20px] font-medium text-basalt/80 mt-2">Sørvágur → Gatwick → Stansted → Glasgow → Bellshill</p>
              <p className="text-[14px] text-basalt/60 mt-2 max-w-[38rem]">
                Two flights, one coach, one self-transfer. If RC 416 is on time, the connections are comfortable.
                If it's delayed, you need to know exactly how late is too late.
              </p>
            </div>

            {/* Trip Readiness */}
            <section className="mb-6"><TripReadiness /></section>

            {/* LAYER A — Day at a glance */}
            <section className="mb-6"><SummaryStrip items={SUMMARY_ITEMS} /></section>

            {/* Self-transfer risk diagram */}
            <section className="mb-6">
              <ConnectionChain chain={CONNECTION_CHAINS.day6!} />
            </section>

            {/* Self-transfer risk analysis */}
            <section className="mb-6">
              <div className="border border-rust/20 bg-rust/[0.02] rounded-[7px] p-4">
                <p className="text-[10px] uppercase tracking-[0.12em] text-rust font-medium mb-2">
                  Self-transfer — RC 416 and RK 330 are separate bookings
                </p>
                <div className="space-y-2 text-[12px]">
                  <p className="text-basalt/70">
                    <strong>{SELF_TRANSFER_RISK.flights.first.carrier} {SELF_TRANSFER_RISK.flights.first.flight}</strong> lands Gatwick {SELF_TRANSFER_RISK.flights.first.arr}.
                    <strong> {SELF_TRANSFER_RISK.flights.second.carrier} {SELF_TRANSFER_RISK.flights.second.flight}</strong> departs Stansted {SELF_TRANSFER_RISK.flights.second.dep}.
                  </p>
                  <p className="text-basalt/60">{SELF_TRANSFER_RISK.summary}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-basalt/10">
                  <p className="text-[11px] font-medium text-basalt mb-1.5">Delay scenarios</p>
                  <div className="space-y-1.5">
                    {SELF_TRANSFER_RISK.scenarios.map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-[11px]">
                        <span className={`shrink-0 mt-0.5 ${
                          s.risk === "critical" ? "text-rust" :
                          s.risk === "high" ? "text-yellow" :
                          s.risk === "medium" ? "text-fjord/70" :
                          "text-moss"
                        }`}>
                          {s.risk === "critical" ? "●" : s.risk === "high" ? "●" : "○"}
                        </span>
                        <div>
                          <span className="text-basalt/70 font-medium">{s.delay}: </span>
                          <span className="text-basalt/60">{s.action}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* LAYER B — Operating plan */}
            <section className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-3">Homeward timeline</p>
              <JourneyTimeline steps={TIMELINE_STEPS} />
            </section>

            {/* Glasgow → Bellshill options */}
            <section className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">Glasgow Airport → Bellshill</p>
              <div className="border border-basalt/15 rounded-[7px] divide-y divide-basalt/8">
                {HOME_OPTIONS.map((opt, i) => (
                  <div key={i} className="flex items-center gap-4 p-3.5 text-[13px]">
                    <p className="font-medium text-basalt w-28 shrink-0">{opt.method}</p>
                    <p className="code text-fjord w-20 shrink-0">{opt.time}</p>
                    <p className="text-basalt/55 w-16 shrink-0">{opt.cost}</p>
                    <p className="text-basalt/55">{opt.note}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* LAYER E — Sources */}
            <SourceRegister items={DAY6_SOURCES} />
          </div>

          {/* Sidebar */}
          <aside className="min-w-0">
            <div className="space-y-6">
              <TripStatusPanel
                dateLine1="Saturday 1 August 2026"
                dateLine2="RC 416 FAE→LGW 09:10 · RK 330 STN→GLA 19:35"
                weatherLat={62.0706} weatherLon={-7.3221}
                weatherLabel="Sørvágur"
              />
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">FAROES → SCOTLAND</p>
                <div style={{ minHeight: 420 }}><FaroesMap onSelect={() => {}} selected={null} filter="journey" mapRef={mapRef} /></div>
              </div>
            </div>
          </aside>
        </div>
      </article>

      {/* MOBILE */}
      <article className="lg:hidden px-4 pt-6 pb-24 max-w-[640px] mx-auto">
        <div className="mb-6">
          <p className="text-[11px] tracking-[0.14em] uppercase text-rust font-medium">Day 6 · Saturday · 1 August</p>
          <h1 className="text-[clamp(2rem,8vw,2.6rem)] leading-[1.06] mt-1 text-basalt tracking-[-0.01em]" style={{ fontFamily: "var(--font-cinzel)" }}>Homeward</h1>
          <p className="text-[17px] font-medium text-basalt/80 mt-1.5">Sørvágur → Gatwick → Stansted → Glasgow</p>
          <p className="text-[14px] text-basalt/60 mt-2">Two flights, one coach, and Glasgow's lights at the end.</p>
        </div>
        <section className="mb-6"><TripReadiness /></section>
        <section className="mb-6"><MobileDecisionPanel /></section>
        <section className="mb-6"><MobileTripStatus dateLine1="Saturday 1 August 2026" dateLine2="Homeward · 2 flights · 1 coach" weatherLat={62.0706} weatherLon={-7.3221} weatherLabel="Sørvágur" /></section>
        <section className="mb-6"><p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">Homeward timeline</p><MobileTimeline steps={TIMELINE_STEPS} /></section>
        <section className="mb-6">
          <div className="border border-rust/20 bg-rust/[0.02] rounded-[8px] p-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-rust font-medium mb-1">Self-transfer — not protected</p>
            <p className="text-[12px] text-basalt/70">If RC 416 is delayed, the RK 330 booking is not protected. Travel insurance with missed-connection cover is essential.</p>
          </div>
        </section>
        <section><p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">FAROES → SCOTLAND</p><div style={{ minHeight: 420 }}><FaroesMap onSelect={() => {}} selected={null} filter="journey" mapRef={mapRef} /></div></section>
      </article>
    </>
  );
}
