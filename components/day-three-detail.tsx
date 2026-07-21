// =============================================================================
// DayThreeDetail — Ólavsøka: the national day in Tórshavn.
// Primary plan: ferry to Tórshavn for boat races, harbour celebrations, and
// the biggest day of the Faroese year. Backup plans stay on Suðuroy.
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
  TripStatusPanel,
  MobileTripStatus,
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
// PRIMARY PLAN — TÓRSHAVN FOR ÓLAVSØKA
// =============================================================================

const PLAN_TORSHAVN = {
  id: "d3-torshavn",
  title: "Tórshavn for Ólavsøka — the national day",
  condition: "Ferry running, weather manageable, energy for a 13-hour day",
  ferryOut: {
    vessel: "M/F Smyril",
    route: "Route 7",
    dep: "Krambatangi 11:30",
    arr: "Tórshavn 13:35",
    duration: "2h 05m",
    note: "Café onboard. Upper deck for fjord approach views. Pre-booked at ssl.fo.",
  },
  ferryBack: {
    vessel: "M/F Smyril",
    route: "Route 7",
    dep: "Tórshavn 21:15",
    arr: "Krambatangi 23:20",
    duration: "2h 05m",
    note: "LAST SAILING. Gate closes 21:10 — 5 min before departure. Board from Farstøðin. Café open onboard. Dark, exposed pier at Krambatangi.",
    critical: true,
  },
  timeline: [
    { time: "~08:00", action: "Wake up · breakfast at Við á 7. ESLA supplies, coffee. Check yr.no for Tórshavn." },
    { time: "~09:30", action: "Pack day bag: waterproof layer, phone charger, match ticket saved offline, SSL Travel Card." },
    { time: "~10:15", action: "Bus 700 from Ferjuleðan to Krambatangi (2 stops, ~8 min, DKK 20 or Travel Card)." },
    { time: "~10:30", action: "Arrive Krambatangi. Foot-passenger queue. Boarding from ~11:00." },
    { time: "11:30", action: "Ferry departs. Café: hot food, beer, coffee. Upper deck — the approach into Tórshavn is the best 20 minutes of the crossing." },
    { time: "13:35", action: "Arrive Tórshavn. Walk to Tinganes (2 min from ferry) — the old town peninsula, government since 1848." },
    { time: "~14:00", action: "Ólavsøka boat races at the harbour. National rowing finals — the main sporting event. Crowds gather along the waterfront. Free to watch." },
    { time: "~15:30", action: "Explore the harbour festival. Chain dancing, street music, food stalls, national costumes. Parliament ceremony concluded — the city is in full celebration." },
    { time: "~16:30", action: "OY Brewing (5 min from harbour). Site-brewed beer, food. The pre-match room tomorrow — scope it today. Also nearby: Tórshøll (cheap Faroese pints, working-class football crowd)." },
    { time: "~18:00", action: "Dinner in town. Irish Pub Tórshavn (fish & chips, harbour), or Etika (Faroese-Japanese, book ahead). Mikkeller (craft bar, old lanes) for a post-dinner beer." },
    { time: "~19:30", action: "Evening concerts and festivities. The city stays alive deep into the night — but we have a ferry to catch." },
    { time: "~20:30", action: "Start heading toward Farstøðin (ferry terminal). ~10 min walk from the harbour. Don't leave it later than this." },
    { time: "21:15", action: "Ferry departs Tórshavn. Café onboard. 2h 05m crossing. Seasickness: sit midships lower deck if rough." },
    { time: "23:20", action: "Arrive Krambatangi. Bus 700 two stops to Øravík or taxi +298 239550 (~DKK 150, 5 min). Self check-in at Við á 7." },
    { time: "~23:45", action: "Back at base. Shower, wind down. Tomorrow: matchday. Same ferry again at 11:30. Set alarm for 09:00." },
  ],
  transport: "Ferry M/F Smyril Route 7 both ways. Bus 700 to/from Krambatangi. SSL Travel Card covers all. Pre-book ferries at ssl.fo.",
  weather: "Check yr.no for Tórshavn (not Øravík). The boat races and harbour are outdoors — waterproof layer essential. Tórshavn is more sheltered than Suðuroy but still Faroese weather.",
  notes: "This is the same ferry schedule as matchday (Day 4). You'll do this crossing twice in two days — worth it. The midnight singing (Midnáttarsangurin) happens after our ferry departs — we miss the finale but catch the full day of celebrations. If the ferry is cancelled, Plan B/C/D on Suðuroy are the fallback.",
};

// =============================================================================
// BACKUP PLAN B — FÁMJIN (flag church)
// =============================================================================

const PLAN_FAMJIN = {
  id: "d3-plan-a",
  title: "Plan B: Fámjin — the flag church",
  condition: "Western weather clear, ferry cancelled or choosing to stay local",
  timeline: [
    { time: "~09:00", action: "Slow start · breakfast at Við á 7 · check yr.no for west coast" },
    { time: "~10:00", action: "Bus 701 from Tvøroyri towards Fámjin. NOTE: Bus 701 may require request — marked 'T' in timetable. Call +298 239550 the day before." },
    { time: "~10:30", action: "Arrive Fámjin. Visit the church — houses the original Faroese flag (Merkið) from 1919. Particularly fitting on Ólavsøka — the national day." },
    { time: "~11:00", action: "Walk behind the church to the small waterfall. Short shoreline walk either direction from the village." },
    { time: "~12:30", action: "Return bus to Tvøroyri. If Bus 701 is request-only, confirm return time with driver or pre-arrange." },
    { time: "~13:30", action: "Lunch at Café MorMor, Tvøroyri (open Wed–Fri 12:00–18:00 — confirm Ólavsøka hours). The island gem — soup, cake, cosy." },
    { time: "~15:00", action: "Afternoon: browse Tvøroyri harbour. Hotel Tvøroyri for an Ólavsøka pint. Restock at Bónus if open (confirm holiday hours)." },
    { time: "~17:00", action: "Bus 700 back to Øravík. Relaxed evening — pack and prep for tomorrow's matchday." },
  ],
  transport: "Bus 701 from Tvøroyri — request in advance. Call +298 239550.",
  weather: "Clear or partly cloudy. Light wind. No fog.",
  notes: "Fámjin church houses the original Merkið (Faroese flag) — deeply meaningful to visit on the national day. The waterfall and shoreline walks are free and accessible.",
};

// =============================================================================
// BACKUP PLAN C — TVØROYRI / FROÐBA
// =============================================================================

const PLAN_FRODBA = {
  id: "d3-plan-b",
  title: "Plan C: Tvøroyri & Froðba — basalt & culture",
  condition: "Eastern weather better, or want an easier Suðuroy day",
  timeline: [
    { time: "~09:00", action: "Slow start · breakfast at Við á 7 · check weather" },
    { time: "~10:00", action: "Bus 700 north 2 stops to Tvøroyri (~10 min, DKK 20)" },
    { time: "~10:15", action: "Walk to Froðba (~20 min from Tvøroyri). Red basalt cliffs, blowhole, columnar formations. Works in most weather." },
    { time: "~12:00", action: "Explore Tvøroyri harbour and town centre. Shops, pharmacy, ATM. Hotel Tvøroyri for an Ólavsøka pint." },
    { time: "~13:00", action: "Lunch at Café MorMor (Wed–Fri 12–18:00 — confirm Ólavsøka hours)." },
    { time: "~14:00", action: "Visit Tvøroyri museum (confirm hours — may be affected by Ólavsøka)." },
    { time: "~15:30", action: "Restock at Bónus — supplies for matchday (confirm holiday hours)." },
    { time: "~17:00", action: "Bus 700 back to Øravík. Relax. Pack for matchday." },
  ],
  transport: "Bus 700 — regular service, no request needed.",
  weather: "Any weather works. Froðba is walkable in rain. Indoor options in Tvøroyri if persistent.",
  notes: "Froðba is one of the few places on Suðuroy with notable geological features visible without a car. Easy coastal path, suitable for any fitness level.",
};

// =============================================================================
// BACKUP PLAN D — LOCAL ØRAVÍK / HOV
// =============================================================================

const PLAN_LOCAL = {
  id: "d3-plan-c",
  title: "Plan D: Local Øravík & Hov — minimal transport",
  condition: "Persistent rain, reduced transport, or tired legs",
  timeline: [
    { time: "~09:30", action: "Late start · breakfast at Við á 7 · no rush today" },
    { time: "~10:30", action: "Walk to Øravík harbour and along the fjord (~30 min easy walk)" },
    { time: "~12:00", action: "Bus 700 south to Hov (4 stops, ~15 min). Chieftain's mound and harbour walk (30 min)." },
    { time: "~13:30", action: "Return bus to Tvøroyri. Hotel Tvøroyri for an Ólavsøka pint + lunch." },
    { time: "~15:00", action: "Short walk around Tvøroyri. Pharmacy if needed. Bónus if open." },
    { time: "~16:00", action: "Bus 700 back to Øravík. Early evening — pack, prep matchday bag, charge devices." },
    { time: "Evening", action: "Self-cater at Við á 7. Final weather check for matchday. Ólavsøka on TV or radio." },
  ],
  transport: "Bus 700 — regular. Minimal bus dependence. Everything walkable from stops.",
  weather: "Any weather. Mostly indoor and sheltered options. Short walks only.",
  notes: "The lowest-effort plan. Works on tired legs or if Ólavsøka has affected bus services. Still gets you out of the house.",
};

// =============================================================================
// ÓLAVSØKA BRIEFING
// =============================================================================

const OLAVSOKA_BRIEFING = {
  title: "Ólavsøka · 29 July 2026",
  summary: "The Faroese national holiday — the biggest day of the year. Parliament opens, boat race finals fill the harbour, chain dancing runs through the old town, and Tórshavn swells with people in national costume. We're taking the ferry north to be part of it.",
  keyEvents: [
    { event: "Boat race finals", time: "Afternoon, Tórshavn harbour", note: "National rowing championships. Free to watch from the waterfront. The sporting heart of Ólavsøka." },
    { event: "Harbour festival", time: "All afternoon and evening", note: "Chain dancing, street music, food stalls, national costumes. The old town (Tinganes) and harbour are the centre of it." },
    { event: "Parliament ceremony", time: "Morning (we miss this)", note: "Formal opening at the cathedral and parliament house. Concluded before we arrive at 13:35." },
    { event: "Midnight singing", time: "~00:00 (we miss this)", note: "Midnáttarsangurin at the town square — thousands gather. Our ferry departs 21:15 so we can't stay for it." },
  ],
  practical: [
    "Ferry both ways is pre-booked. Same M/F Smyril, same Route 7 as matchday tomorrow.",
    "SSL Travel Card covers all bus and ferry travel for the day.",
    "Stock up on matchday supplies on Tuesday 28 July — Bónus and most shops are closed on Ólavsøka.",
    "Restaurants and bars ARE open. Hotel Tvøroyri, OY Brewing, Tórshøll, and the Irish Pub will all be serving.",
    "Wear something red, white, and blue — the Faroese colours. You'll blend in with the national costume crowd.",
    "Bring waterproofs. The boat races are outdoors and Faroese weather doesn't take a holiday.",
  ],
};

// =============================================================================
// MATCHDAY PREP CHECKLIST
// =============================================================================

const MATCHDAY_PREP = [
  { item: "Breakfast supplies", detail: "Buy at Bónus on Tuesday — everything for Thursday morning. Bónus closed on Ólavsøka." },
  { item: "Ferry snacks", detail: "Buy in Tórshavn or bring from base. Sandwiches, fruit, water for the 2h crossing each way." },
  { item: "Phone charging", detail: "Charge phone + portable charger overnight. No car charging on matchday." },
  { item: "Layers", detail: "Pack waterproof jacket, fleece, scarf. Stadium is exposed, evening cools fast." },
  { item: "Match ticket", detail: "Save offline PDF + carry paper copy. Match ticket bought." },
  { item: "Return transport", detail: "Save taxi numbers. Know the walk from stadium to ferry terminal (~1 km). Same terminal as today." },
  { item: "Ferry pre-booked", detail: "Both Thursday ferries booked: Krambatangi 11:30 → Tórshavn and Tórshavn 21:15 → Krambatangi." },
];

// =============================================================================
// Main export
// =============================================================================

export function DayThreeDetail() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [activePlan, setActivePlan] = useState<string>("d3-torshavn");
  const [showBriefing, setShowBriefing] = useState(true);

  const activePlanData =
    activePlan === "d3-torshavn" ? PLAN_TORSHAVN :
    activePlan === "d3-plan-a" ? PLAN_FAMJIN :
    activePlan === "d3-plan-b" ? PLAN_FRODBA :
    activePlan === "d3-plan-c" ? PLAN_LOCAL :
    PLAN_TORSHAVN;

  const isTorshavnPlan = activePlan === "d3-torshavn";
  const allBackupPlans = [PLAN_FAMJIN, PLAN_FRODBA, PLAN_LOCAL];

  return (
    <>
      {/* DESKTOP */}
      <article className="hidden lg:block px-8 pt-8 pb-20 max-w-[1280px]">
        <div className="grid grid-cols-[1fr_340px] gap-8">
          <div className="min-w-0">
            {/* Header */}
            <div className="mb-6">
              <p className="text-[12px] tracking-[0.14em] uppercase text-rust font-medium">Day 3 · Wednesday · 29 July 2026</p>
              <h1 className="text-[clamp(2.5rem,3.5vw,3.2rem)] leading-[1.04] mt-1.5 text-basalt tracking-[-0.01em]" style={{ fontFamily: "var(--font-cinzel)" }}>Ólavsøka</h1>
              <p className="text-[20px] font-medium text-basalt/80 mt-2">Øravík · Krambatangi · Tórshavn</p>
              <p className="text-[14px] text-basalt/60 mt-2 max-w-[38rem]">
                The national day. Ferry north to Tórshavn for the boat races, harbour celebrations,
                and the biggest party of the Faroese year. Same ferry as matchday tomorrow — we'll
                know the crossing by heart. The match is tomorrow.
              </p>
            </div>

            {/* Trip Readiness */}
            <section className="mb-6"><TripReadiness /></section>

            {/* Ólavsøka briefing — collapsible */}
            <section className="mb-6">
              <div className="border border-claret/25 bg-claret/[0.02] rounded-[7px] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowBriefing(!showBriefing)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-claret/[0.03] transition-colors"
                  aria-expanded={showBriefing}
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-claret/70 mb-0.5 flex items-center gap-1.5">
                      <span className="text-claret">✦</span> Ólavsøka briefing
                    </p>
                    <p className="text-[14px] font-medium text-basalt">{OLAVSOKA_BRIEFING.summary}</p>
                  </div>
                  <span className="text-[14px] text-basalt/40 shrink-0 ml-3">
                    {showBriefing ? "^" : "v"}
                  </span>
                </button>
                {showBriefing && (
                  <div className="px-4 pb-4 space-y-4">
                    {/* Key events */}
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-claret/60 mb-2">Key events</p>
                      <div className="space-y-2">
                        {OLAVSOKA_BRIEFING.keyEvents.map((ev, i) => (
                          <div key={i} className="text-[13px]">
                            <p className="font-medium text-basalt">{ev.event}</p>
                            <p className="text-basalt/55 text-[12px]">{ev.time} — {ev.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Practical */}
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-claret/60 mb-2">Practical notes</p>
                      <ul className="space-y-1.5 text-[12px] text-basalt/65">
                        {OLAVSOKA_BRIEFING.practical.map((note, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-claret/50 shrink-0">·</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Decision plan */}
            <section className="mb-6">
              <DecisionTreeView tree={DAY3_DECISION} onSelectPlan={setActivePlan} activePlanId={activePlan} />
            </section>

            {/* Active plan */}
            <section className="mb-6">
              <div className={`border rounded-[7px] p-5 ${
                isTorshavnPlan ? "border-claret/25 bg-claret/[0.02]" :
                activePlan === "d3-plan-a" ? "border-moss/30 bg-moss/[0.02]" :
                activePlan === "d3-plan-b" ? "border-fjord/30 bg-fjord/[0.02]" :
                "border-basalt/15"
              }`}>
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <p className="text-[15px] font-medium text-basalt">{activePlanData.title}</p>
                    <p className="text-[12px] text-basalt/55 mt-0.5">{activePlanData.condition}</p>
                  </div>
                  <span className={`text-[10px] uppercase tracking-[0.1em] px-1.5 py-0.5 rounded-[3px] ${
                    isTorshavnPlan ? "text-claret bg-claret/[0.08]" : "text-moss bg-moss/[0.08]"
                  }`}>
                    {isTorshavnPlan ? "Primary plan" : "Backup plan"}
                  </span>
                </div>

                {/* Ferry details — only for Tórshavn plan */}
                {isTorshavnPlan && (
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <div className="border border-basalt/12 rounded-[6px] p-3">
                      <p className="text-[10px] uppercase tracking-[0.1em] text-fjord/60 mb-1">Ferry north</p>
                      <p className="text-[13px] font-medium text-basalt">{PLAN_TORSHAVN.ferryOut.vessel} · {PLAN_TORSHAVN.ferryOut.route}</p>
                      <p className="text-[12px] text-basalt/60 mt-0.5">{PLAN_TORSHAVN.ferryOut.dep} → {PLAN_TORSHAVN.ferryOut.arr}</p>
                      <p className="text-[11px] text-basalt/45 mt-0.5">{PLAN_TORSHAVN.ferryOut.note}</p>
                    </div>
                    <div className={`border rounded-[6px] p-3 ${PLAN_TORSHAVN.ferryBack.critical ? "border-rust/25 bg-rust/[0.02]" : "border-basalt/12"}`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <p className="text-[10px] uppercase tracking-[0.1em] text-fjord/60">Ferry south</p>
                        {PLAN_TORSHAVN.ferryBack.critical && (
                          <span className="text-[9px] uppercase tracking-[0.08em] text-rust bg-rust/[0.08] px-1 py-0.5 rounded-[2px]">Last sailing</span>
                        )}
                      </div>
                      <p className="text-[13px] font-medium text-basalt">{PLAN_TORSHAVN.ferryBack.vessel} · {PLAN_TORSHAVN.ferryBack.route}</p>
                      <p className="text-[12px] text-basalt/60 mt-0.5">{PLAN_TORSHAVN.ferryBack.dep} → {PLAN_TORSHAVN.ferryBack.arr}</p>
                      <p className="text-[11px] text-basalt/45 mt-0.5">{PLAN_TORSHAVN.ferryBack.note}</p>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="space-y-2.5">
                  {activePlanData.timeline.map((t, i) => (
                    <div key={i} className="flex gap-3 text-[13px]">
                      <span className="code tnum text-fjord shrink-0 w-[72px]">{t.time}</span>
                      <span className="text-basalt/75">{t.action}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-basalt/8 grid grid-cols-2 gap-2 text-[11px] text-basalt/55">
                  <p>Transport: {activePlanData.transport}</p>
                  <p>Weather: {activePlanData.weather}</p>
                </div>
                <p className="text-[11px] text-basalt/50 mt-1.5">{activePlanData.notes}</p>
              </div>
            </section>

            {/* Other plans as collapsed cards */}
            <section className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">
                {isTorshavnPlan ? "Backup plans (if ferry cancelled or staying local)" : "Other plans"}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(!isTorshavnPlan ? [PLAN_TORSHAVN, ...allBackupPlans.filter(p => p.id !== activePlan)] : allBackupPlans)
                  .slice(0, 3)
                  .map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setActivePlan(plan.id)}
                      className={`text-left border rounded-[7px] p-3.5 transition-colors ${
                        plan.id === "d3-torshavn"
                          ? "border-claret/20 hover:border-claret/40 bg-claret/[0.01]"
                          : "border-basalt/15 hover:border-basalt/30"
                      }`}
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
                claim: "Ferry times: Krambatangi 11:30 → Tórshavn 13:35, Tórshavn 21:15 → Krambatangi 23:20",
                verification: verified(
                  "SSL Route 7 timetable · M/F Smyril",
                  { title: SOURCE_LIBRARY.ssl.title, url: SOURCE_LIBRARY.ssl.url },
                ),
              },
              {
                claim: "Ólavsøka boat races and harbour celebrations — 29 July 2026",
                verification: provisional(
                  "Visit Tórshavn · Ólavsøka programme",
                  "The boat race finals are the main afternoon event. Confirm exact times closer to the date.",
                  { title: SOURCE_LIBRARY.visitTorshavn.title, url: SOURCE_LIBRARY.visitTorshavn.url },
                ),
              },
              {
                claim: "Café MorMor hours: Wed–Fri 12:00–18:00 — confirm Ólavsøka opening",
                verification: provisional(
                  "Café MorMor Facebook page",
                  "Call to confirm holiday hours. May be closed on Ólavsøka.",
                  { title: SOURCE_LIBRARY.cafeMorMor.title, url: SOURCE_LIBRARY.cafeMorMor.url },
                ),
              },
              {
                claim: "Bus 701 to Fámjin may require request — call +298 239550",
                verification: provisional(
                  "SSL Route 701 timetable",
                  "Check timetable for 'T' marking (request required). Call at least 24h before.",
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
                dateLine2="Ólavsøka · Ferry to Tórshavn"
                weatherLat={62.0097} weatherLon={-6.7716}
                weatherLabel="Tórshavn"
              />
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">FULL JOURNEY · FAROE ISLANDS</p>
                <div style={{ minHeight: 420 }}><FaroesMap onSelect={() => {}} selected={null} filter="journey" mapRef={mapRef} /></div>
              </div>

              {/* Drink recommendations */}
              <div className="border border-basalt/12 rounded-[7px] p-4">
                <p className="text-[10px] uppercase tracking-[0.12em] text-fjord/60 mb-2">Tórshavn · Ólavsøka drinks</p>
                <div className="space-y-2.5 text-[12px]">
                  <div>
                    <p className="font-medium text-basalt">OY Brewing</p>
                    <p className="text-basalt/55">5 min from harbour · site-brewed, food · pre-match room</p>
                  </div>
                  <div>
                    <p className="font-medium text-basalt">Tórshøll</p>
                    <p className="text-basalt/55">Harbour · cheap Faroese pints · football crowd</p>
                  </div>
                  <div>
                    <p className="font-medium text-basalt">Mikkeller Tórshavn</p>
                    <p className="text-basalt/55">Old lanes · tiny craft bar · opens 16:00</p>
                  </div>
                  <div>
                    <p className="font-medium text-basalt">Irish Pub Tórshavn</p>
                    <p className="text-basalt/55">Harbour · fish & chips · full bar · away-day classic</p>
                  </div>
                  <div>
                    <p className="font-medium text-basalt">Sirkus Bar</p>
                    <p className="text-basalt/55">Central · eccentric · the right last stop before the pier</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </article>

      {/* MOBILE */}
      <article className="lg:hidden px-4 pt-6 pb-24 max-w-[640px] mx-auto">
        <div className="mb-6">
          <p className="text-[11px] tracking-[0.14em] uppercase text-rust font-medium">Day 3 · Wednesday · 29 July</p>
          <h1 className="text-[clamp(2rem,8vw,2.6rem)] leading-[1.06] mt-1 text-basalt tracking-[-0.01em]" style={{ fontFamily: "var(--font-cinzel)" }}>Ólavsøka</h1>
          <p className="text-[17px] font-medium text-basalt/80 mt-1.5">Øravík → Tórshavn</p>
          <p className="text-[14px] text-basalt/60 mt-2">The national day. Ferry north for boat races and harbour celebrations.</p>
        </div>
        <section className="mb-6"><TripReadiness /></section>
        <section className="mb-6">
          <MobileTripStatus
            dateLine1="Wednesday 29 July 2026"
            dateLine2="Ólavsøka · Tórshavn"
            weatherLat={62.0097} weatherLon={-6.7716}
            weatherLabel="Tórshavn"
          />
        </section>

        {/* Ólavsøka briefing — mobile */}
        <section className="mb-6">
          <div className="border border-claret/25 bg-claret/[0.02] rounded-[8px] p-4">
            <p className="text-[11px] uppercase tracking-[0.12em] text-claret/70 font-medium mb-2">✦ Ólavsøka · 29 July</p>
            <p className="text-[12px] text-basalt/70 mb-3">{OLAVSOKA_BRIEFING.summary}</p>
            <div className="space-y-2 text-[11px] text-basalt/60">
              <p>🚣 Boat races — afternoon at the harbour</p>
              <p>🎭 Chain dancing + street music — all day</p>
              <p>🍺 OY Brewing, Tórshøll, Irish Pub — all open</p>
              <p>⛴️ Ferry 11:30 north, 21:15 south — pre-booked</p>
              <p>⚠️ Stock up Tuesday — shops closed on Ólavsøka</p>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <DecisionTreeView tree={DAY3_DECISION} onSelectPlan={setActivePlan} activePlanId={activePlan} />
        </section>

        {/* Active plan — mobile */}
        <section className="mb-6">
          <div className={`border rounded-[8px] p-4 ${
            isTorshavnPlan ? "border-claret/25 bg-claret/[0.01]" : "border-basalt/15"
          }`}>
            <p className="text-[13px] font-medium text-basalt mb-2">{activePlanData.title}</p>

            {/* Ferry details — mobile */}
            {isTorshavnPlan && (
              <div className="mb-3 grid grid-cols-2 gap-2">
                <div className="border border-basalt/12 rounded-[5px] p-2.5">
                  <p className="text-[9px] uppercase tracking-[0.1em] text-fjord/60 mb-0.5">Ferry north</p>
                  <p className="text-[11px] font-medium text-basalt">{PLAN_TORSHAVN.ferryOut.dep}</p>
                  <p className="text-[10px] text-basalt/55">{PLAN_TORSHAVN.ferryOut.arr}</p>
                </div>
                <div className="border border-rust/25 rounded-[5px] p-2.5">
                  <p className="text-[9px] uppercase tracking-[0.1em] text-fjord/60 mb-0.5">Ferry south · LAST</p>
                  <p className="text-[11px] font-medium text-basalt">{PLAN_TORSHAVN.ferryBack.dep}</p>
                  <p className="text-[10px] text-basalt/55">{PLAN_TORSHAVN.ferryBack.arr}</p>
                </div>
              </div>
            )}

            {activePlanData.timeline.map((t, i) => (
              <p key={i} className="text-[12px] text-basalt/65 mb-1">
                <span className="code tnum text-fjord">{t.time}</span> — {t.action}
              </p>
            ))}
          </div>
        </section>

        {/* Supplies — mobile */}
        <section className="mb-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">Supplies before matchday</p>
          <div className="border border-basalt/15 rounded-[8px] divide-y divide-basalt/8">
            {MATCHDAY_PREP.map((item, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2.5 text-[12px]">
                <span className="text-rust shrink-0 mt-0.5">[ ]</span>
                <div>
                  <span className="text-basalt font-medium">{item.item}</span>
                  <span className="text-basalt/50"> — {item.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">TÓRSHAVN · STREYMOY</p>
          <div style={{ minHeight: 420 }}><FaroesMap onSelect={() => {}} selected={null} filter="journey" mapRef={mapRef} /></div>
        </section>
      </article>
    </>
  );
}
