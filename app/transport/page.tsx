// =============================================================================
// /transport — Operational transport command centre.
// Flights, ferries, buses, taxis, walking routes, ticketing, payment,
// timetables, boardings, final services, delay contingencies.
// =============================================================================

"use client";

import { useState } from "react";
import { PRACTICAL } from "@/lib/data/itinerary";

// =============================================================================
// Types
// =============================================================================

interface TransportCard {
  mode: "flight" | "ferry" | "bus" | "taxi" | "walk";
  icon: string;
  title: string;
  operator: string;
  route: string;
  dates: string;
  dep: string;
  arr: string;
  duration: string;
  cost: string;
  ticket: string;
  boarding: string;
  source: string;
  verified: "confirmed" | "provisional" | "needs-check";
  notes: string;
  fallback: string;
}

interface FerrySchedule {
  dep: string;
  arr: string;
  note?: string;
  highlight?: boolean;
}

// =============================================================================
// Transport data
// =============================================================================

const TRANSPORT_LEGS: TransportCard[] = [
  {
    mode: "flight",
    icon: "✈",
    title: "Edinburgh → Vágar",
    operator: "Atlantic Airways",
    route: "RC 415 · Airbus A320neo",
    dates: "Mon 27 Jul 2026",
    dep: "EDI 17:10 BST",
    arr: "FAE 18:35 WEST",
    duration: "1h 25m",
    cost: "Booked",
    ticket: "Online check-in 48h before. Boarding pass in Atlantic Airways app. Save offline PDF.",
    boarding: "Edinburgh Airport · Gate TBC · Security: allow 45 min · Check-in closes 40 min before departure.",
    source: "atlanticairways.com",
    verified: "confirmed",
    notes: "Under-seat bag only: 40×30×20 cm. No hold luggage. Wear heavier shoes to save bag weight. Mykines visible on climb-out (left side window, 5 min after takeoff).",
    fallback: "If cancelled: next flight is Wednesday 29 Jul. Atlantic Airways rebooking: +298 341000. Travel insurance claim if delay exceeds 3h.",
  },
  {
    mode: "bus",
    icon: "🚌",
    title: "Vágar Airport → Tórshavn",
    operator: "SSL",
    route: "Bus 300",
    dates: "Mon 27 Jul",
    dep: "FAE 19:00 (connects from RC 415)",
    arr: "Tórshavn 19:45",
    duration: "45 min",
    cost: "DKK 90 pp or SSL Travel Card",
    ticket: "Pay onboard (card accepted). SSL Travel Card covers all buses + foot ferries. 7-day card: DKK 700 (~£80). Buy at Tórshavn ferry terminal or onboard.",
    boarding: "Bus stop outside terminal exit. Bus 300 is the blue SSL bus. Sign says 'Tórshavn'. Timed to meet RC 415.",
    source: "ssl.fo",
    verified: "provisional",
    notes: "Last Bus 300 from airport: ~20:00. If RC 415 is delayed past 19:30, taxi to Tórshavn: ~DKK 250, 30 min. Taxi rank at terminal exit.",
    fallback: "Taxi +298 313131 if bus missed. DKK ~250, 30 min. If arriving too late for 21:15 ferry: book Hotel Hafnia +298 313233.",
  },
  {
    mode: "ferry",
    icon: "⛴",
    title: "Tórshavn → Krambatangi (Suðuroy)",
    operator: "Strandfaraskip Landsins",
    route: "Route 7 · M/F Smyril · foot passenger",
    dates: "Mon 27 Jul",
    dep: "Tórshavn 21:15",
    arr: "Krambatangi 23:20",
    duration: "2h 05m",
    cost: "Pre-booked · foot passenger",
    ticket: "Pre-booked at booking.ssl.fo. Show QR code at gate. Gate closes 21:10 — 5 min before departure. Queue from 20:15.",
    boarding: "Farstøðin ferry terminal, Tórshavn harbour. 5 min walk from Bus 300 stop. Foot-passenger queue forms on lower level.",
    source: "booking.ssl.fo",
    verified: "confirmed",
    notes: "LAST BOAT OF THE DAY. Café onboard: hot food, beer, coffee. Upper deck for fjord views. Midships lower deck if rough. Approach into Krambatangi is dark — bring a layer. Bus 700 from Krambatangi to Øravík: 2 stops, ~DKK 20, ~8 min. Or taxi +298 239550.",
    fallback: "Miss it = sleep in Tórshavn. Hotel Hafnia +298 313233. First ferry next morning: 08:45 → arrives 10:50.",
  },
  {
    mode: "bus",
    icon: "🚌",
    title: "Krambatangi → Øravík (Suðuroy spine)",
    operator: "SSL",
    route: "Bus 700",
    dates: "Daily on Suðuroy",
    dep: "Connects from ferry arrivals",
    arr: "Øravík (Ferjuleðan stop) · 2 stops",
    duration: "~8 min",
    cost: "DKK 20 pp or SSL Travel Card",
    ticket: "Pay onboard. Card accepted. SSL Travel Card valid. Bus meets every ferry at Krambatangi.",
    boarding: "Bus stop at Krambatangi terminal exit. Wait on the pier side. Bus 700 is the blue SSL bus — runs the full Suðuroy spine (Sumba–Vágur–Tvøroyri).",
    source: "ssl.fo",
    verified: "provisional",
    notes: "Ferjuleðan stop is 2 stops from Krambatangi. Við á 7 is a short walk from Ferjuleðan. Taxi alternative: +298 239550 (~DKK 150, 5 min). Last Bus 700: ~21:00 southbound. If ferry arrives late: taxi.",
    fallback: "Taxi +298 239550. Or walk: Krambatangi → Øravík is ~2 km along the road (20 min, lit in sections, face traffic).",
  },
  {
    mode: "ferry",
    icon: "⛴",
    title: "Krambatangi → Tórshavn (northbound)",
    operator: "Strandfaraskip Landsins",
    route: "Route 7 · M/F Smyril · foot passenger",
    dates: "Wed 29 Jul · Thu 30 Jul · Fri 31 Jul",
    dep: "11:30 (best departure for all 3 days)",
    arr: "Tórshavn 13:35",
    duration: "2h 05m",
    cost: "Pre-booked · foot passenger",
    ticket: "Pre-booked at booking.ssl.fo. Same booking system as southbound. Show QR at gate.",
    boarding: "Krambatangi ferry terminal. Bus 700 from Ferjuleðan to Krambatangi: depart by ~10:45. Gate closes 5 min before departure.",
    source: "booking.ssl.fo",
    verified: "confirmed",
    notes: "Café onboard. Wednesday (Ólavsøka): ferry busy — queue early. Thursday (matchday): arrive Tórshavn with ~4.5h before kick-off. Friday: arrive with ~4h Vágar exploration time. 09:00 and 16:00 departures also available — see Day 5 for comparison.",
    fallback: "If 11:30 cancelled: 09:00 or 16:00 may still run. Check ssl.fo. If all cancelled: plan B on current island. If matchday: you miss the match.",
  },
  {
    mode: "ferry",
    icon: "⛴",
    title: "Tórshavn → Krambatangi (southbound returns)",
    operator: "Strandfaraskip Landsins",
    route: "Route 7 · M/F Smyril · foot passenger",
    dates: "Wed 29 Jul · Thu 30 Jul",
    dep: "21:15 (last sailing both nights)",
    arr: "Krambatangi 23:20",
    duration: "2h 05m",
    cost: "Pre-booked · foot passenger",
    ticket: "Pre-booked at booking.ssl.fo. Gate closes 21:10.",
    boarding: "Farstøðin ferry terminal, Tórshavn harbour. Matchday: walk from Tórsvøllur ~1 km, 15–20 min. Leave stadium at final whistle. Do NOT linger.",
    source: "booking.ssl.fo",
    verified: "confirmed",
    notes: "LAST BOAT BOTH NIGHTS. Miss it = sleep in Tórshavn. The Thursday 21:15 is the tightest — see matchday page for full countdown scenarios. No Plan B after this boat.",
    fallback: "Hotel Hafnia +298 313233. First ferry next morning: 08:45. Friday return: 16:00 ferry also available (arrives 18:05) — see Day 5.",
  },
  {
    mode: "bus",
    icon: "🚌",
    title: "Tórshavn → Sørvágur (Vágar)",
    operator: "SSL",
    route: "Bus 300",
    dates: "Fri 31 Jul",
    dep: "Tórshavn 14:00 (connects from 13:35 ferry)",
    arr: "Sørvágur ~14:45",
    duration: "~45 min",
    cost: "DKK 90 pp or SSL Travel Card",
    ticket: "Pay onboard. Card accepted. SSL Travel Card valid. Bus departs from Tórshavn bus station (5 min walk from ferry terminal).",
    boarding: "Tórshavn bus station. Timed to connect from ferry. Wait on platform — bus 300 is clearly marked. Via Vágatunnilin (subsea tunnel).",
    source: "ssl.fo",
    verified: "provisional",
    notes: "Stops at Vágar Airport en route. Get off at Sørvágur village centre (not airport). Guesthouse Hugo is 2 min walk from the stop.",
    fallback: "Taxi Tórshavn → Sørvágur: +298 313131, ~DKK 450, 35 min. Or wait for next Bus 300. Friday evening frequency: check ssl.fo.",
  },
  {
    mode: "bus",
    icon: "🚌",
    title: "Sørvágur → Vágar Airport",
    operator: "SSL",
    route: "Bus 300",
    dates: "Sat 1 Aug",
    dep: "Sørvágur 07:40",
    arr: "Vágar Airport 07:50",
    duration: "10 min",
    cost: "DKK 20 pp or SSL Travel Card",
    ticket: "Pay onboard. Card accepted.",
    boarding: "Sørvágur village centre bus stop. 2 min walk from Guesthouse Hugo. Allow 5 min slack for tunnel traffic.",
    source: "ssl.fo",
    verified: "provisional",
    notes: "FIRST BUS OF THE DAY. Confirm Saturday timetable at ssl.fo. If the 07:40 doesn't run on Saturday: taxi to airport: +298 212121 (~DKK 100, 5 min). Transfer to airport is short but the flight won't wait.",
    fallback: "Taxi +298 212121 if bus missed. Or walk: 3 km, ~35 min — viable with backpacks if you leave by 06:50. Not recommended in rain or darkness.",
  },
  {
    mode: "flight",
    icon: "✈",
    title: "Vágar → London Gatwick",
    operator: "Atlantic Airways",
    route: "RC 416 · Airbus A320neo",
    dates: "Sat 1 Aug 2026",
    dep: "FAE 09:10 WEST",
    arr: "LGW 11:25 BST",
    duration: "2h 15m",
    cost: "Booked",
    ticket: "Online check-in 48h before. Boarding pass offline. Check in before leaving Guesthouse Hugo.",
    boarding: "Vágar Airport · single terminal · desks open ~07:10 · boarding ~08:40 · gate closes 08:50. One café airside. Security quick — single scanner.",
    source: "atlanticairways.com",
    verified: "confirmed",
    notes: "Self-transfer at Gatwick — this is a separate booking. Faroes disappear into cloud within 5 minutes. Forth bridges on descent.",
    fallback: "Delay <2h: rebook National Express. Delay 2–3h: train LGW→STN via Thameslink + Stansted Express (~2h, ~£35). Delay 3h+: contact Ryanair about RK 330 rebooking. Travel insurer for missed connection. See Day 6 for full self-transfer risk analysis.",
  },
  {
    mode: "bus",
    icon: "🚌",
    title: "Gatwick → Stansted (self-transfer)",
    operator: "National Express",
    route: "Coach · LGW South → STN",
    dates: "Sat 1 Aug",
    dep: "13:00 (best option — 1h 35m buffer at LGW)",
    arr: "STN ~15:15",
    duration: "~2h 15m",
    cost: "~£15–25 pp · book at nationalexpress.com",
    ticket: "Book online — flexible ticket recommended. Save booking ref offline. Show QR to driver.",
    boarding: "Gatwick South Terminal · lower level coach station. Free monorail from North to South Terminal (every 3 min, 2 min). Arrive from RC 416 at ~12:00 after baggage + transfer.",
    source: "nationalexpress.com",
    verified: "needs-check",
    notes: "This is the self-transfer on purpose. Book a flexible ticket so you can rebook if RC 416 is delayed. Wi-Fi, USB, toilet onboard. M25 can be slow Saturday afternoon.",
    fallback: "Train: Thameslink LGW → St Pancras (30 min) → walk to King's Cross → Stansted Express → STN (50 min). ~2h total, ~£35. Taxi: ~£150, 2h. Last safe coach: 15:00 (arrives 17:15 — 2h 15m before RK 330).",
  },
  {
    mode: "flight",
    icon: "✈",
    title: "Stansted → Glasgow",
    operator: "Ryanair UK",
    route: "RK 330 · Boeing 737-800",
    dates: "Sat 1 Aug 2026",
    dep: "STN 19:35",
    arr: "GLA 21:10",
    duration: "1h 35m",
    cost: "Booked",
    ticket: "Online check-in 24h–2h before departure. Ryanair app. Check-in closes 40 min before departure (18:55). Gate announced ~40 min before.",
    boarding: "Stansted Airport. Food before security: Leon, Pret, Burger King. Wetherspoons airside (The Windmill). Buffer from 15:15 arrival: ~4h 20m.",
    source: "ryanair.com",
    verified: "confirmed",
    notes: "Last leg. Glasgow's lights on approach. Left side window for Clyde views. Domestic arrivals — no passport control.",
    fallback: "Missed flight: contact Ryanair via app/chat. Next STN→GLA is next day. Alternative: train from central London (King's Cross → Glasgow Central ~4.5h) but expensive last-minute.",
  },
  {
    mode: "taxi",
    icon: "🚕",
    title: "Glasgow Airport → Bellshill",
    operator: "Glasgow Taxis / Uber",
    route: "M8 eastbound",
    dates: "Sat 1 Aug",
    dep: "Arrive GLA 21:10",
    arr: "Bellshill ~22:00",
    duration: "~35 min (taxi) or ~50 min (bus + train)",
    cost: "Taxi ~£35 · Bus 500 + ScotRail ~£10",
    ticket: "Taxi: rank outside domestic arrivals. Uber: app, pickup at designated zone. Bus 500: £5.50 to city centre. ScotRail: Glasgow Central → Bellshill ~£5, ~20 min, runs until ~23:30.",
    boarding: "Domestic arrivals — quick exit. Taxi rank immediately outside. Bus 500 stop outside terminal. Glasgow Central: 15 min from city centre on bus.",
    source: "glasgowairport.com · scotrail.co.uk",
    verified: "provisional",
    notes: "Final leg. After 6 days of travel, the taxi is worth the money. Confirm ScotRail Saturday evening service — engineering works possible in summer.",
    fallback: "If ScotRail not running: taxi from Glasgow city centre to Bellshill ~£20. Or direct taxi from GLA to Bellshill ~£35.",
  },
];

const FERRY_SCHEDULE_MON_NORTH: FerrySchedule[] = [
  { dep: "Krambatangi 06:00", arr: "→ Tórshavn 08:05" },
  { dep: "Krambatangi 11:30", arr: "→ Tórshavn 13:35" },
  { dep: "Krambatangi 17:30", arr: "→ Tórshavn 19:35" },
];

const FERRY_SCHEDULE_MON_SOUTH: FerrySchedule[] = [
  { dep: "Tórshavn 08:45", arr: "→ Krambatangi 10:50" },
  { dep: "Tórshavn 14:15", arr: "→ Krambatangi 16:20" },
  { dep: "Tórshavn 21:15", arr: "→ Krambatangi 23:20", highlight: true, note: "last boat" },
];

const FERRY_SCHEDULE_FRI: FerrySchedule[] = [
  { dep: "Krambatangi 09:00", arr: "→ Tórshavn 11:05", note: "early" },
  { dep: "Krambatangi 11:30", arr: "→ Tórshavn 13:35", note: "recommended" },
  { dep: "Krambatangi 16:00", arr: "→ Tórshavn 18:05", note: "most rest" },
  { dep: "Krambatangi 21:15", arr: "→ Tórshavn 23:20", note: "too late" },
];

// =============================================================================
// Sub-components
// =============================================================================

function TransportLegCard({ leg }: { leg: TransportCard }) {
  const verifiedColors = {
    confirmed: "text-moss bg-moss/[0.08]",
    provisional: "text-yellow bg-yellow/[0.08]",
    "needs-check": "text-rust bg-rust/[0.06]",
  };

  return (
    <div className="border border-basalt/15 rounded-[7px] p-4">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-[24px] shrink-0" aria-hidden>{leg.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[15px] font-medium text-basalt">{leg.title}</p>
            <span className={`text-[10px] uppercase tracking-[0.08em] px-1.5 py-0.5 rounded-[3px] shrink-0 ${verifiedColors[leg.verified]}`}>
              {leg.verified === "needs-check" ? "Needs check" : leg.verified}
            </span>
          </div>
          <p className="text-[12px] text-basalt/55 mt-0.5">{leg.operator} · {leg.route} · {leg.dates}</p>
        </div>
      </div>

      {/* Key times */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-[12px]">
        <div>
          <p className="text-[10px] uppercase tracking-[0.08em] text-basalt/45">Depart</p>
          <p className="code tnum text-fjord font-medium">{leg.dep}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.08em] text-basalt/45">Arrive</p>
          <p className="code tnum text-fjord font-medium">{leg.arr}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.08em] text-basalt/45">Duration</p>
          <p className="code tnum text-fjord font-medium">{leg.duration}</p>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1.5 text-[12px] border-t border-basalt/8 pt-3">
        <DetailRow label="Cost" value={leg.cost} />
        <DetailRow label="Ticket" value={leg.ticket} />
        <DetailRow label="Boarding" value={leg.boarding} />
        <DetailRow label="Notes" value={leg.notes} />
        <DetailRow label="Source" value={leg.source} />
      </div>

      {/* Fallback */}
      <div className="mt-3 pt-3 border-t border-rust/15">
        <p className="text-[10px] uppercase tracking-[0.08em] text-rust/70 font-medium mb-0.5">Fallback</p>
        <p className="text-[12px] text-basalt/60">{leg.fallback}</p>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-basalt/40 shrink-0 w-14 text-[11px]">{label}</span>
      <span className="text-basalt/65">{value}</span>
    </div>
  );
}

function FerryTimetable({ title, sailings, note }: { title: string; sailings: FerrySchedule[]; note?: string }) {
  return (
    <div className="border border-basalt/15 rounded-[7px] p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-3">{title}</p>
      <div className="space-y-1">
        {sailings.map((s) => (
          <div
            key={s.dep}
            className={`flex items-center gap-4 py-2 px-2 rounded-[4px] text-[13px] ${
              s.highlight ? "bg-rust/[0.04] border border-rust/15" : ""
            }`}
          >
            <span className="code tnum text-fjord font-medium w-[10rem] shrink-0">{s.dep}</span>
            <span className="text-basalt/80 flex-1">{s.arr}</span>
            {s.highlight && (
              <span className="text-[10px] uppercase tracking-[0.08em] text-rust font-medium">LAST</span>
            )}
            {s.note && !s.highlight && (
              <span className="text-[11px] text-basalt/50">{s.note}</span>
            )}
          </div>
        ))}
      </div>
      {note && <p className="text-[11px] text-basalt/50 mt-3 pt-3 border-t border-basalt/8">{note}</p>}
    </div>
  );
}

// =============================================================================
// Page
// =============================================================================

export default function TransportPage() {
  const [activeTab, setActiveTab] = useState<"all" | "flights" | "ferries" | "buses" | "taxis">("all");

  const filteredLegs = activeTab === "all"
    ? TRANSPORT_LEGS
    : activeTab === "flights"
      ? TRANSPORT_LEGS.filter(l => l.mode === "flight")
      : activeTab === "ferries"
        ? TRANSPORT_LEGS.filter(l => l.mode === "ferry")
        : activeTab === "buses"
          ? TRANSPORT_LEGS.filter(l => l.mode === "bus")
          : TRANSPORT_LEGS.filter(l => l.mode === "taxi" || l.mode === "walk");

  const tabLabels: Record<string, string> = {
    all: "All legs", flights: "Flights", ferries: "Ferries", buses: "Buses", taxis: "Taxi & ground",
  };

  return (
    <article className="px-4 sm:px-8 pt-6 sm:pt-10 pb-20 max-w-[960px] mx-auto">
      {/* Header */}
      <header className="mb-8">
        <p className="text-[11px] tracking-[0.14em] uppercase text-rust font-medium">
          Transport command
        </p>
        <h1
          className="text-[clamp(2rem,5vw,3rem)] leading-[1.04] mt-2 text-basalt tracking-[-0.01em]"
          style={{ fontFamily: "var(--font-cinzel)" }}
        >
          Every connection, door to door
        </h1>
        <p className="text-[15px] text-basalt/60 mt-3 max-w-[36rem]">
          Three flights, four ferry crossings, six bus journeys, two taxis.
          Boarding points, ticket methods, costs, and fallback plans for every leg.
          Dates and times are provisional — verify during the week of travel.
        </p>
      </header>

      {/* Quick overview cards */}
      <section className="mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <QuickStat label="Flights" value="3" detail="EDI→FAE · FAE→LGW · STN→GLA" />
          <QuickStat label="Ferries" value="4" detail="Route 7 · pre-booked" />
          <QuickStat label="Buses" value="6" detail="300 · 700 · coach" />
          <QuickStat label="Self-transfer" value="1" detail="LGW → STN · coach" />
        </div>
      </section>

      {/* Filter tabs */}
      <section className="mb-6">
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "flights", "ferries", "buses", "taxis"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`text-[12px] px-3 py-1.5 rounded-[5px] transition-colors ${
                activeTab === tab
                  ? "bg-basalt/[0.08] text-basalt font-medium"
                  : "text-basalt/50 hover:text-basalt/70"
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>
      </section>

      {/* Transport legs */}
      <section className="mb-10">
        <div className="space-y-4">
          {filteredLegs.map((leg, i) => (
            <TransportLegCard key={i} leg={leg} />
          ))}
        </div>
      </section>

      {/* Ferry timetable reference */}
      <section className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-3">
          Ferry timetable · Route 7
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] font-medium text-basalt mb-2">Northbound · Krambatangi → Tórshavn</p>
            <FerryTimetable
              title="Monday–Thursday north"
              sailings={FERRY_SCHEDULE_MON_NORTH}
            />
            <div className="mt-4">
              <p className="text-[11px] font-medium text-basalt mb-2 mt-4">Southbound · Tórshavn → Krambatangi</p>
              <FerryTimetable
                title="Monday–Thursday south"
                sailings={FERRY_SCHEDULE_MON_SOUTH}
                note="Wednesday (Ólavsøka): ferries busy. Thursday (matchday): 21:15 is critical — see matchday page."
              />
            </div>
          </div>
          <div>
            <p className="text-[11px] font-medium text-basalt mb-2">Northbound · Krambatangi → Tórshavn</p>
            <FerryTimetable
              title="Friday"
              sailings={FERRY_SCHEDULE_FRI}
              note="Friday timetable differs. The 11:30 is recommended (best balance of rest + Vágar time). The 16:00 arrives Sørvágur ~19:15."
            />
          </div>
        </div>
      </section>

      {/* Bus reference */}
      <section className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-3">
          Bus routes · quick reference
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PRACTICAL.buses.map((bus) => (
            <div key={bus.name} className="border border-basalt/15 rounded-[7px] p-3.5">
              <p className="text-[13px] font-medium text-basalt">{bus.name}</p>
              <p className="text-[11px] text-basalt/55 mt-0.5">{bus.route}</p>
              <p className="text-[11px] text-basalt/45 mt-1">{bus.use}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Ticketing summary */}
      <section className="mb-10">
        <div className="border border-basalt/15 rounded-[7px] p-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-3">
            Ticketing & payment
          </p>
          <div className="space-y-2 text-[13px] text-basalt/70 max-w-[48rem]">
            <p>• <strong>SSL Travel Card:</strong> 7-day card covers all buses (300, 700, 701) and foot-passenger ferries (Route 7). DKK 700 (~£80). Buy at Tórshavn ferry terminal or onboard Bus 300. Best value for this trip — you'll use it on 6+ bus journeys and 4+ ferry crossings.</p>
            <p>• <strong>Ferries:</strong> Pre-book foot-passenger crossings at booking.ssl.fo. Show QR code at gate. Gate closes 5 min before departure. Queue 45–60 min before in summer.</p>
            <p>• <strong>Buses:</strong> Pay onboard with card (contactless works). No cash needed. Tell the driver your destination — they're helpful.</p>
            <p>• <strong>Taxis:</strong> All Faroese taxis take cards. Cash in DKK also accepted. Tip not expected but round up to nearest 10 DKK for good service.</p>
            <p>• <strong>National Express (UK):</strong> Book at nationalexpress.com. Flexible ticket recommended — you can change if RC 416 is delayed. Show QR to driver.</p>
            <p>• <strong>Cards:</strong> Visa and Mastercard accepted everywhere. Faroese króna = Danish krone (1:1). Cash rarely needed — card is enough for the entire trip.</p>
          </div>
        </div>
      </section>

      {/* Delay buffer reference */}
      <section>
        <div className="border border-rust/20 bg-rust/[0.02] rounded-[7px] p-4">
          <p className="text-[10px] uppercase tracking-[0.14em] text-rust font-medium mb-2">
            Delay buffers · critical connections
          </p>
          <div className="space-y-1.5 text-[13px] text-basalt/70">
            <p>• <strong>RC 415 arrival → last ferry:</strong> 2h 40m buffer. If RC 415 delayed &gt;1h: book Tórshavn hotel. The 21:15 is the last boat.</p>
            <p>• <strong>Thursday full-time → last ferry:</strong> ~1h 25m buffer (normal time). 30 min buffer (extra time). 20 min buffer (penalties). See matchday page.</p>
            <p>• <strong>RC 416 arrival → coach to STN:</strong> 1h 35m buffer to 13:00 coach. 3h 35m to 15:00 last safe coach. See Day 6 for full analysis.</p>
            <p>• <strong>Coach arrival STN → RK 330:</strong> 4h 20m buffer. Comfortable unless LGW→STN journey is severely delayed.</p>
            <p>• <strong>Bus 300 Sørvágur → FAE:</strong> 1h 20m before RC 416 departure. 10 min journey. Plenty of buffer barring tunnel closure.</p>
          </div>
        </div>
      </section>
    </article>
  );
}

function QuickStat({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="border border-basalt/15 rounded-[6px] p-3">
      <p className="text-[10px] uppercase tracking-[0.08em] text-basalt/50">{label}</p>
      <p className="code tnum text-[22px] font-medium text-basalt leading-none mt-1">{value}</p>
      <p className="text-[11px] text-basalt/45 mt-1">{detail}</p>
    </div>
  );
}
