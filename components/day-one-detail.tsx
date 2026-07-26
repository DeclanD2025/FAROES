// =============================================================================
// DayOneDetail — "The journey north" with connection chain diagram.
// Heavily expanded operational detail: each leg has full instructions,
// backup plans, source links, and risk assessment.
// =============================================================================

"use client";

import { TripReadiness } from "@/components/trip-readiness";
import { ConnectionChain } from "@/components/connection-chain";
import { SourceRegister } from "@/components/source-register";
import { CONNECTION_CHAINS } from "@/lib/data/transport-matrices";
import { provisional } from "@/lib/data/sources";
import { SOURCE_LIBRARY } from "@/lib/data/sources";
import { FlightRouteGraphic } from "@/components/flight-route-graphic";
import {
  type TimelineStep,
  type SummaryItem,
  TripStatusPanel,
  MobileTripStatus,
  SummaryStrip,
  JourneyTimeline,
  MobileTimeline,
} from "@/components/day-widgets";

// =============================================================================
// Timeline data — expanded with complete operational detail
// =============================================================================

const TIMELINE_STEPS: TimelineStep[] = [
  {
    num: 1, title: "Home → Bellshill Station",
    subtitle: "40 Liberty Road, Bellshill ML4 2EX",
    middleLabel: "Walk", middleValue: "~6 min",
    rightLabel: "Leave by", rightValue: "11:30",
    footer: "Walk east on Liberty Rd to Main St. Station entrance on Main St. Door-to-platform: budget 8 min with luggage. Taxi contingency: Bellshill Taxis +44 1698 747447. If delayed: next train at 12:59.",
  },
  {
    num: 2, title: "ScotRail · Bellshill → Haymarket",
    subtitle: "Recommended: 11:59 departure",
    middleLabel: "Departs", middleValue: "11:59",
    middleLabel2: "Arrives", middleValue2: "13:02",
    rightLabel: "Journey", rightValue: "1h 03m",
    footer: "RECOMMENDED SERVICE. Direct. Arrive EDI ~3h 30m before flight — comfortable buffer. Backup: 12:59 (still fine). Latest safe: 13:59 (EDI by ~15:00, 2h before flight). If all trains fail: taxi from Bellshill to EDI ~£45, 35 min.",
    footerLink: { label: "Live times on ScotRail →", href: "https://www.scotrail.co.uk/plan-your-journey" },
  },
  {
    num: 3, title: "Haymarket → Edinburgh Airport",
    subtitle: "Edinburgh Tram · every 7–8 min",
    middleLabel: "Departs", middleValue: "~13:05",
    middleLabel2: "Arrives", middleValue2: "~13:35",
    rightLabel: "Journey", rightValue: "~30 min",
    footer: "Tram stop is DIRECTLY OUTSIDE Haymarket station — no street crossing needed. Tap-on tap-off contactless or ticket machine. Alternative: Airport Bus 100 (every 10 min, ~30 min). Taxi ~£25, 20 min.",
  },
  {
    num: 4, title: "Edinburgh Airport · pre-flight",
    subtitle: "Domestic departures · check-in desks",
    middleLabel: "Arrive by", middleValue: "~13:40",
    rightLabel: "Contingency", rightValue: "~3h 20m",
    footer: "Check-in online before leaving home. Bag drop if needed. Security: budget 30 min (summer Monday lunchtime — moderate queues). Airside food: All Bar One (bar+dining), Wetherspoons (pub food), Pret (coffee+food). Flight boards ~30 min before departure from gates 7–10.",
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
    rightLabel: "Onward", rightValue: "Booked taxi",
    footer: "Walk across tarmac. Non-Schengen passport control — passport stamp on request. Arrivals duty-free open. No SIM vendor — buy eSIM before departure. Your AirportTaxi booking monitors RC 415 and goes directly to Farstøðin — no Bus 300 decision needed.",
  },
  {
    num: 7, title: "Confirmed AirportTaxi · Vágar Airport → Farstøðin",
    subtitle: "Flogvøllin → Farstøðin, Eystara Bryggja, Tórshavn",
    middleLabel: "Trigger", middleValue: "RC 415 arrival",
    middleLabel2: "Passengers", middleValue2: "2",
    rightLabel: "Luggage", rightValue: "Cabin only",
    footer: "CONFIRMED BOOKING · Taxi og AirportTaxi will monitor RC 415 on Monday 27 July and drive directly to the ferry terminal. Booking note: reach Farstøðin for the 21:15 Smyril; the taxi starts its approach two hours before the flight arrival. Keep the service number and booking email saved offline. This replaces the assumed Bus 300 connection.",
  },
  {
    num: 8, title: "Farstøðin · ferry connection",
    subtitle: "Booked AirportTaxi → Smyril foot-passenger gate",
    middleLabel: "Arrive", middleValue: "~19:45",
    rightLabel: "Ferry", rightValue: "21:15",
    footer: "AirportTaxi drops you at Farstøðin. Your two-person 21:15 Route 7 ferry booking is confirmed. Keep the QR ticket ready; the foot-passenger gate closes at 21:10. Use the remaining buffer for food, water and a warm layer — the ferry café also serves food and drinks.",
  },
  {
    num: 9, title: "M/F Smyril · Route 7 · LAST SAILING",
    subtitle: "Tórshavn → Krambatangi · Suðuroy",
    middleLabel: "Departs", middleValue: "21:15",
    middleLabel2: "Arrives", middleValue2: "23:20",
    rightLabel: "Crossing", rightValue: "2h 05m",
    footer: "BOOKED · two adult foot passengers. Foot-passenger gate closes 5 min before departure (21:10); queue from ~20:30. Café, indoor seating, outdoor deck and free Wi-Fi onboard. Dark, exposed pier at Krambatangi — bring a layer. If flight delay makes the sailing unreachable: overnight in Tórshavn. Emergency: Hotel Hafnia +298 313233.",
    footerLink: { label: "Book at ssl.fo →", href: "https://booking.ssl.fo" },
  },
  {
    num: 10, title: "Krambatangi → Gist · Øravík",
    subtitle: "Bus 700 or walk · 2 km",
    middleLabel: "Arrive gate", middleValue: "~23:25",
    rightLabel: "Transfer", rightValue: "Bus 700",
    footer: "Bus 700 from Krambatangi (Ferjuleðan stop) — two stops to Øravík, ~8 min, DKK 20. If bus doesn't run that late: pre-book taxi +298 239550 (~DKK 150, 5 min). Last resort: walk 2 km (25 min, uphill, unlit road — not recommended with luggage). At Við á 7, look for the “Gist” sign; host Arnbjørn confirms the key will be in the door on arrival. Still twilight at midnight — eye mask essential.",
  },
];

const SUMMARY_ITEMS: SummaryItem[] = [
  { icon: "H", label: "Leave home", time: "08:30", note: "Bellshill" },
  { icon: "T", label: "Train", time: "11:59", note: "→ Haymarket" },
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
        <SafeTime label="Leave home by" time="11:30" note="Catch 11:59 from Bellshill. Comfortable buffer at every stage." />
        <SafeTime label="Latest train from Bellshill" time="13:59" note="Arrives Haymarket 15:02. Tram to EDI ~15:30. Still 1h 40m before flight." />
        <SafeTime label="Abandon-rails deadline" time="15:00" note="If not on a train by now: take taxi straight to EDI from Bellshill (~£45, 35 min)." />
        <SafeTime label="EDI security latest" time="16:30" note="Gate closes ~16:40. 40 min before departure. Do NOT cut it closer." />
        <SafeTime label="FAE → Tórshavn latest bus" time="~19:00" note="If RC 415 is delayed past ~19:45, Bus 300 may have departed. Taxi ~DKK 1,200, 30 min." />
      </div>
    </div>
  );
}

const FALLBACK_STAYS = [
  {
    name: "Hotel Hafnia",
    type: "Hotel · central",
    detail: "City-centre hotel with 79 rooms and three cabins; a sensible first call if you need a staffed fallback near the harbour.",
    href: "https://www.hotelhafnia.com",
  },
  {
    name: "Hotel Djurhuus",
    type: "Hotel · harbour side",
    detail: "51-room, three-star option by the waterfront, about 0.5 km from the centre. Breakfast is included.",
    href: "https://www.hoteldjurhuus.fo",
  },
  {
    name: "Hotel Tórshavn",
    type: "Hotel · central",
    detail: "Central 43-room option with a café and bar; useful when you need to stay walkable to food and the next-day ferry.",
    href: "https://hoteltorshavn.fo/en/",
  },
  {
    name: "62N Guesthouse",
    type: "Hostel · city centre",
    detail: "The lower-cost hostel option, at Dr. Jakobsens gøta 14–16. Ask specifically about a late, same-night arrival.",
    href: "https://www.62n.fo",
  },
  {
    name: "BookLocal",
    type: "Local apartment or home",
    detail: "Use these for self-check-in apartments or rooms. Filter for Tórshavn, two guests, and an arrival after 22:00 before paying.",
    href: "https://booklocal.fo",
  },
  {
    name: "Airbnb Tórshavn",
    type: "Apartment or room",
    detail: "A second self-check-in search. Confirm the host can accept a same-night late arrival before booking.",
    href: "https://www.airbnb.co.uk/s/T%C3%B3rshavn--Faroe-Islands/homes",
  },
];

function FlightDelayFallback() {
  return (
    <section className="border border-rust/25 bg-rust/[0.025] rounded-[7px] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label text-rust">If RC 415 breaks the ferry connection</p>
          <h2 className="mt-1 text-[18px] font-medium text-basalt">Tórshavn fallback stays</h2>
        </div>
        <a href="https://www.visittorshavn.fo/accommodation/" target="_blank" rel="noreferrer" className="text-[12px] text-fjord underline underline-offset-4">All local options ↗</a>
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-basalt/75">Do not wait for the ferry to leave before arranging a room. If Atlantic Airways shows a material delay, ask AirportTaxi to switch the drop-off to your stay, contact SSL about the ticket, and message the Øravík host.</p>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {FALLBACK_STAYS.map((stay) => (
          <a key={stay.name} href={stay.href} target="_blank" rel="noreferrer" className="block border border-basalt/15 bg-white/35 p-3 hover:border-fjord/35 transition-colors">
            <p className="text-[13px] font-medium text-basalt">{stay.name} <span className="text-fjord">↗</span></p>
            <p className="mt-0.5 label text-fjord/65">{stay.type}</p>
            <p className="mt-2 text-[12px] leading-relaxed text-basalt/65">{stay.detail}</p>
          </a>
        ))}
      </div>
      <div className="mt-4 border-t border-rust/15 pt-3">
        <p className="label text-rust">Forecast snapshot · checked Sunday 26 July</p>
        <p className="mt-1 text-[13px] leading-relaxed text-basalt/75"><strong className="text-basalt">Low–moderate weather delay risk.</strong> Edinburgh is forecast overcast around the 17:10 departure, with a 40–50% rain chance and moderate westerly gusts. Vágar’s airport forecast for Monday is much calmer: 0.3 mm rain and 8 m/s wind. Nothing currently points to a weather-led cancellation, but Vágar conditions and airline operations can change quickly.</p>
        <p className="mt-2 text-[12px] text-basalt/60">Recheck Atlantic Airways and the <a href="https://weather.metoffice.gov.uk/forecast/gcvw7ch6q" target="_blank" rel="noreferrer" className="text-fjord underline underline-offset-4">Edinburgh forecast</a> before leaving home; use the <a href="https://www.fae.fo/en/about-vagar-airport/information/weather-at-vaga-airport" target="_blank" rel="noreferrer" className="text-fjord underline underline-offset-4">Vágar Airport forecast</a> at the airport.</p>
      </div>
    </section>
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
      <p className="code tnum text-[36px] font-medium text-basalt leading-none mt-1">11:30</p>
      <p className="text-[13px] text-basalt/65 mt-2">
        Catch the <strong>11:59</strong> from Bellshill. Flight <strong>EDI 17:10</strong>.
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

function FlightGateCard() {
  return (
    <section className="border border-claret/25 bg-claret/[0.025] rounded-[7px] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label text-rust">Your Edinburgh departure</p>
          <h2 className="mt-1 text-[19px] font-medium text-basalt">RC 415 · Edinburgh → Vágar</h2>
        </div>
        <a href="https://www.flightradar24.com/data/flights/rc415" target="_blank" rel="noreferrer" className="text-[12px] text-fjord underline underline-offset-4">Track flight ↗</a>
      </div>
      <div className="mt-4 grid grid-cols-3 border-y border-basalt/10 divide-x divide-basalt/10">
        <div className="py-3 pr-3"><p className="label">Departure</p><p className="code tnum mt-1 text-fjord">17:10 BST</p></div>
        <div className="px-3 py-3"><p className="label">Destination</p><p className="code mt-1 text-fjord">FAE · Vágar</p></div>
        <div className="pl-3 py-3"><p className="label">Gate</p><p className="code tnum mt-1 text-rust">9</p></div>
      </div>
      <p className="caption mt-3">Gate 9 is the current planning detail. Check the airport boards and Atlantic Airways app on the day; gates can change.</p>
    </section>
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
    claim: "AirportTaxi: Vágar Airport → Farstøðin for RC 415 arrival",
    verification: provisional(
      "Taxi og AirportTaxi booking confirmation",
      "Taxi monitors RC 415; keep the confirmation and contact details offline.",
      { title: "Taxi og AirportTaxi", url: "https://taxi.fo" },
    ),
  },
  {
    claim: "M/F Smyril Tórshavn → Krambatangi: 21:15–23:20, 2h 05m",
    verification: provisional(
      "SSL Route 7 ferry timetable",
      "Booking confirmed for two adult foot passengers. Save the QR ticket offline and reconfirm only if SSL issues a service notice.",
      { title: SOURCE_LIBRARY.sslBooking.title, url: SOURCE_LIBRARY.sslBooking.url, note: "Last sailing of the day" },
    ),
  },
];

// =============================================================================
// Main export
// =============================================================================

export function DayOneDetail() {
  return (
    <>
      {/* DESKTOP */}
      <article className="hidden lg:block px-8 pt-8 pb-20 max-w-[1280px]">
        {/* Header — full width */}
        <div className="mb-6">
          <p className="text-[12px] tracking-[0.14em] uppercase text-rust font-medium">Day 1 · Monday · 27 July 2026</p>
          <h1 className="text-[clamp(2.5rem,3.5vw,3.2rem)] leading-[1.04] mt-1.5 text-basalt tracking-[-0.01em]" style={{ fontFamily: "var(--font-cinzel)" }}>The journey north</h1>
          <p className="text-[20px] font-medium text-basalt/80 mt-2">Bellshill → Edinburgh → Vágar → Tórshavn → Øravík</p>
          <p className="text-[14px] text-basalt/60 mt-2 max-w-[38rem]">
            One train, one tram, one flight, one confirmed airport taxi, one ferry, one final short hop.
            ~15 hours door to door across Scotland and the North Atlantic.
          </p>
        </div>

        {/* Two columns — aligned below header */}
        <div className="grid grid-cols-[1fr_340px] gap-8">
          <div className="min-w-0">
            {/* Trip Readiness */}
            <section className="mb-6"><TripReadiness /></section>

            {/* LAYER A — Day at a glance */}
            <section className="mb-6"><SummaryStrip items={SUMMARY_ITEMS} /></section>

            {/* Connection chain diagram */}
            <section className="mb-6">
              <ConnectionChain chain={CONNECTION_CHAINS.day1!} />
            </section>

            <section className="mb-6"><FlightGateCard /></section>

            {/* Latest safe departures */}
            <section className="mb-6"><LatestSafeDepartures /></section>

            <section className="mb-6"><FlightDelayFallback /></section>

            {/* LAYER B — Operating plan */}
            <section className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-3">Journey timeline</p>
              <JourneyTimeline steps={TIMELINE_STEPS} completionKey="day-1" />
            </section>

            {/* LAYER E — Sources */}
            <SourceRegister items={DAY1_SOURCES} />
          </div>

          {/* Sidebar */}
          <aside className="min-w-0">
            <div className="space-y-6">
              <TripStatusPanel
                dateLine1="Monday 27 July 2026"
                dateLine2="Flight RC 415 · EDI 17:10 → FAE 18:35"
                weatherLat={62.0097} weatherLon={-6.7716}
                weatherLabel="Tórshavn"
              />
              <div>
                <FlightRouteGraphic />
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
          <p className="text-[14px] text-basalt/60 mt-2">One flight, one confirmed airport taxi, one ferry, one short hop. ~15 hours door to door.</p>
        </div>
        <section className="mb-6"><TripReadiness /></section>
        <section className="mb-6"><MobileDecisionPanel /></section>
        <section className="mb-6"><MobileTripStatus dateLine1="Monday 27 July 2026" dateLine2="Flight at 17:10 from Edinburgh Airport" weatherLat={62.0097} weatherLon={-6.7716} weatherLabel="Tórshavn" /></section>
        <section className="mb-6"><p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">Journey</p><MobileTimeline steps={TIMELINE_STEPS} completionKey="day-1" /></section>
        <section className="mb-6"><LatestSafeDepartures /></section>
        <section className="mb-6"><FlightDelayFallback /></section>
        <section><FlightRouteGraphic /></section>
      </article>
    </>
  );
}
