// =============================================================================
// DayTwoDetail — "Suðuroy: Run and primary hike" carless rebuild.
// Explicit no-car plan: morning run, realistic bus-accessible hike,
// weather decision tree, poor-weather alternatives.
// =============================================================================

"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import type maplibregl from "maplibre-gl";
import { TripReadiness } from "@/components/trip-readiness";
import { DecisionTreeView } from "@/components/decision-tree";
import { SourceRegister } from "@/components/source-register";
import { DAY2_DECISION } from "@/lib/data/decision-trees";
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
// MORNING RUN — Við á 7 loop
// =============================================================================

const RUN_PLAN = {
  title: "Morning run · Øravík loop",
  start: "Við á 7, Øravík 827",
  duration: "20–35 min",
  distance: "~3–5 km",
  route: "Við á 7 → Øravík harbour road → loop back via Ferjuleðan → Við á 7",
  elevation: "Gentle inclines — harbour road is mostly flat. Some short climbs on return.",
  wind: "Exposed along the harbour. South-westerly wind pushes against you on return.",
  caution: "Narrow roads, no pavement in sections. Blind bends near the harbour. Run facing traffic. High-vis recommended in low light.",
  extensions: "Add an out-and-back along the fjord-side path towards Trongisvágsfjørður (~1 km each way, flat).",
};

// =============================================================================
// PRIMARY HIKE — Bus-accessible option
// =============================================================================

const PRIMARY_HIKE = {
  name: "Hvannhagi Ridge",
  trailhead: "Hov village (reachable by Bus 700 from Ferjuleðan)",
  trailheadAccess: "Bus 700 from Øravík (Ferjuleðan) · 4 stops south · ~15 min · DKK 20",
  routeType: "Out-and-back · orange T-marked posts",
  distance: "~5 km round trip",
  ascent: "~200 m total ascent",
  duration: "2–3 hrs at moderate pace",
  terrain: "Grassy ridge, some rocky sections, boggy after rain, lake at turnaround",
  navigation: "Follow orange T-marked posts from Hov. Posts may be hard to see in fog — do NOT attempt in poor visibility.",
  exposure: "Moderate. Some ridge sections with drop-offs. Cliff edge near the lake.",
  weatherThreshold: "Do NOT attempt if: wind > 15 m/s, visibility < 500 m, persistent rain (posts become invisible in fog).",
  food: "No facilities. Bring water (at least 1L pp), snacks, lunch.",
  water: "Stream water available but treat before drinking. Bring your own as primary.",
  returnTransport: "Bus 700 north from Hov to Øravík. Last bus ~22:00 but check SSL timetable.",
  taxiFallback: "Suðuroy taxi +298 239550. ~DKK 200 from Hov to Øravík.",
  missedBus: "Hov is ~8 km from Øravík. Walkable in ~2h along Route 14 (road walking, narrow shoulders). Last resort only.",
};

const ALT_HIKE_LOWER = {
  name: "Hov chieftain-mound loop",
  trailhead: "Hov village centre",
  distance: "~1.5 km",
  duration: "~30–45 min",
  terrain: "Well-trodden path, village road, grassy mound",
  notes: "Viking chieftain's burial mound overlooking the harbour. Quick, easy, works in any weather. Combine with the village harbour walk.",
};

const ALT_HIKE_POOR = {
  name: "Tvøroyri town walk + Froðba basalt columns",
  trailhead: "Tvøroyri town centre (Bus 700, 2 stops north)",
  distance: "~3–5 km total walking",
  duration: "1–2 hrs",
  terrain: "Paved town streets + coastal path",
  notes: "Froðba's red basalt cliffs and blowhole are an easy walk from Tvøroyri (~20 min). Works in rain. Combine with café, museum, and Bónus restock.",
};

// =============================================================================
// NOTE ON BEINISVØRÐ
// =============================================================================

const BEINISVORD_NOTE = {
  title: "Why Beinisvørð is not today's primary route",
  reason: "The Beinisvørð trailhead is ~20 km from Øravík, near the island's south-west corner. There is no public bus to the lighthouse road trailhead. The nearest bus stop (Sumba, Bus 700) is ~8 km from the trailhead — a 2+ hour walk each way on narrow roads. Without a car, Beinisvørð is only practical by taxi (~DKK 400–500 return from Øravík, booked in advance).",
  alternative: "If you want to see the big cliffs: consider a taxi to Beinisvørð on Day 3 (free day), booking the night before. Otherwise, Hvannhagi and Froðba are the best no-car options.",
};

// =============================================================================
// Timeline data
// =============================================================================

const DAY_TWO_TIMELINE: TimelineStep[] = [
  {
    num: 1, title: "Morning run · Øravík loop",
    subtitle: "Við á 7 → harbour → Ferjuleðan → return",
    middleLabel: "Duration", middleValue: "20–35 min",
    rightLabel: "Leave by", rightValue: "07:30–08:00",
    footer: "Run facing traffic on narrow roads. No pavement in sections — high-vis recommended. Harbour road is the flattest section. Exposed to south-westerly wind.",
  },
  {
    num: 2, title: "Breakfast & weather check",
    subtitle: "Við á 7 · ESLA supplies",
    middleLabel: "Decide by", middleValue: "08:30",
    rightLabel: "Check", rightValue: "yr.no",
    footer: "Check wind, visibility, and rain on yr.no for Øravík and Hov. If wind > 15 m/s or visibility < 500 m, switch to lower-risk plan.",
  },
  {
    num: 3, title: "Bus 700 → Hov",
    subtitle: "Ferjuleðan stop · 4 stops south",
    middleLabel: "Depart", middleValue: "~09:30",
    rightLabel: "Fare", rightValue: "DKK 20",
    footer: "DKK 20 pp or SSL Travel Card. Tell the driver 'Hov' — they know. Journey ~15 min. Bus meets the road at the village centre.",
  },
  {
    num: 4, title: "Hvannhagi ridge walk",
    subtitle: "Orange T-marked posts from Hov · out-and-back",
    middleLabel: "Distance", middleValue: "~5 km",
    middleLabel2: "Duration", middleValue2: "2–3 hrs",
    rightLabel: "Ascent", rightValue: "~200 m",
    footer: "Ridge walk above a lake facing Stóra Dímun island. Posts vanish in fog — do NOT attempt in poor visibility. Turnaround at the lake viewpoint. Pack water, waterproofs, snacks.",
  },
  {
    num: 5, title: "Hov village · chieftain's mound",
    subtitle: "30 min loop · burial mound overlooking harbour",
    middleLabel: "Walk", middleValue: "~30 min",
    rightLabel: "Free", rightValue: "loop",
    footer: "Viking chieftain's burial mound. Quick, easy, works in any weather. Good add-on after the ridge walk or as a complete Plan B if conditions are poor.",
  },
  {
    num: 6, title: "Bus 700 → Tvøroyri",
    subtitle: "2 stops north · dinner at Hotel Tvøroyri",
    middleLabel: "Depart", middleValue: "~17:00",
    rightLabel: "Arrive", rightValue: "~17:10",
    footer: "Pizzeria, bar, the same locals every night. Cash and card accepted. Last Bus 700 north to Øravík ~22:00 — check SSL timetable. If walking back: ~3.5 km, 45 min on narrow road — not recommended after dark.",
  },
];

const DAY_TWO_SUMMARY: SummaryItem[] = [
  { icon: "R", label: "Run", time: "20–35 min", note: "Øravík loop" },
  { icon: "Bs", label: "Bus route", time: "700", note: "Coastal spine" },
  { icon: "Hk", label: "Primary hike", time: "2–3 hrs", note: "Hvannhagi" },
  { icon: "Wk", label: "Walking total", time: "~3–4 hrs", note: "~8–10 km" },
  { icon: "Dn", label: "Dinner", time: "~17:00", note: "Hotel Tvøroyri" },
];

// =============================================================================
// WHY THIS ROUTE panel
// =============================================================================

function WhyThisRoute() {
  return (
    <div className="border border-basalt/15 rounded-[7px] p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">
        Why this is today's route
      </p>
      <ul className="space-y-2 text-[13px] text-basalt/70">
        <li>• Hvannhagi is the best genuinely bus-accessible hike from Øravík — the trailhead is at Hov village, reachable by Bus 700 in ~15 min.</li>
        <li>• It's a moderate ridge walk with a spectacular lake-and-island payoff, without needing a car.</li>
        <li>• The orange-post waymarking provides navigation guidance (though not in fog).</li>
        <li>• Beinisvørð — the iconic Suðuroy cliff — is NOT bus-accessible. The trailhead is ~8 km from the nearest bus stop on narrow roads. It requires a pre-booked taxi (~DKK 400–500 return) and is a better fit for Day 3 if the weather is right.</li>
        <li>• Hov village adds a quick cultural stop (Viking chieftain's mound) that works in any weather.</li>
      </ul>
    </div>
  );
}

// =============================================================================
// Mobile
// =============================================================================

function MobileDecisionPanel() {
  return (
    <div className="border border-basalt/15 rounded-[8px] p-4">
      <p className="text-[10px] uppercase tracking-[0.12em] text-fjord/60">First move</p>
      <p className="code tnum text-[36px] font-medium text-basalt leading-none mt-1">Run 07:30</p>
      <p className="text-[13px] text-basalt/65 mt-2">
        Morning run from Við á 7. Then <strong>Bus 700 to Hov</strong> for the Hvannhagi ridge walk (2–3 hrs).
        Check fog before committing — if the hills are white, swap to the chieftain's mound loop.
      </p>
      <div className="flex gap-6 mt-3 pt-3 border-t border-basalt/10">
        <div><p className="text-[10px] uppercase tracking-[0.1em] text-basalt/45">Hike</p><p className="code tnum text-[15px] font-medium text-basalt">2–3 hrs</p></div>
        <div><p className="text-[10px] uppercase tracking-[0.1em] text-basalt/45">Dinner</p><p className="code tnum text-[15px] font-medium text-basalt">~17:00</p></div>
      </div>
    </div>
  );
}

// =============================================================================
// SOURCES
// =============================================================================

const DAY2_SOURCES = [
  {
    claim: "Bus 700 route: Øravík to Hov (~15 min, DKK 20)",
    verification: provisional(
      "SSL Route 700 timetable",
      "Check summer 2026 timetable at ssl.fo before travel",
      { title: SOURCE_LIBRARY.ssl.title, url: SOURCE_LIBRARY.ssl.url },
    ),
  },
  {
    claim: "Hvannhagi ridge walk: orange T-marked posts, ~5 km, 2–3 hrs",
    verification: provisional(
      "Visit Suðuroy hiking information",
      "Trail conditions may change — check visit-suduroy.fo for current status",
      { title: SOURCE_LIBRARY.visitSuduroy.title, url: SOURCE_LIBRARY.visitSuduroy.url, note: "Route described but not officially surveyed" },
    ),
  },
  {
    claim: "Beinisvørð not bus-accessible (~8 km from nearest bus stop)",
    verification: verified(
      "OpenStreetMap distance measurement from Sumba bus stop to Beinisvørð trailhead",
      { title: SOURCE_LIBRARY.openStreetMap.title, url: SOURCE_LIBRARY.openStreetMap.url },
    ),
  },
  {
    claim: "Hotel Tvøroyri opening hours: daily 12:00–22:00",
    verification: provisional(
      "Hotel Tvøroyri information",
      "Call to confirm summer 2026 hours",
      { title: SOURCE_LIBRARY.hotelTvoroyri.title, url: SOURCE_LIBRARY.hotelTvoroyri.url },
    ),
  },
];

// =============================================================================
// Main export
// =============================================================================

export function DayTwoDetail() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const desktopRunMapRef = useRef<maplibregl.Map | null>(null);
  const mobileRunMapRef = useRef<maplibregl.Map | null>(null);
  const [activePlan, setActivePlan] = useState<string>("d2-plan-a");

  return (
    <>
      {/* DESKTOP */}
      <article className="hidden lg:block px-8 pt-8 pb-20 max-w-[1280px]">
        <div className="grid grid-cols-[1fr_340px] gap-8">
          <div className="min-w-0">
            {/* Header */}
            <div className="mb-6">
              <p className="text-[12px] tracking-[0.14em] uppercase text-rust font-medium">Day 2 · Tuesday · 28 July 2026</p>
              <h1 className="text-[clamp(2.5rem,3.5vw,3.2rem)] leading-[1.04] mt-1.5 text-basalt tracking-[-0.01em]" style={{ fontFamily: "var(--font-cinzel)" }}>Run &amp; the ridge</h1>
              <p className="text-[20px] font-medium text-basalt/80 mt-2">Øravík · Hov · Hvannhagi · Tvøroyri</p>
              <p className="text-[14px] text-basalt/60 mt-2 max-w-[38rem]">
                A morning run along the Øravík harbour, then Bus 700 south for the Hvannhagi ridge walk.
                No car needed — every stop is on the bus route or on foot. Thursday is the match — today is the day to earn your pint.
              </p>
            </div>

            {/* Trip Readiness */}
            <section className="mb-6"><TripReadiness /></section>

            {/* LAYER A — Day at a glance */}
            <section className="mb-6"><SummaryStrip items={DAY_TWO_SUMMARY} /></section>

            {/* Morning run — map + route data */}
            <section className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">Morning run · Øravík loop</p>
              <div className="border border-basalt/15 rounded-[7px] overflow-hidden">
                <div style={{ height: 300 }}>
                  <FaroesMap onSelect={() => {}} selected={null} filter="run-oravik" mapRef={desktopRunMapRef} height={300} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border-t border-basalt/10">
                  <RunDetail label="Duration" value={RUN_PLAN.duration} />
                  <RunDetail label="Distance" value={RUN_PLAN.distance} />
                  <RunDetail label="Start" value={RUN_PLAN.start} />
                  <RunDetail label="Leave by" value="07:30–08:00" />
                </div>
                <div className="px-4 pb-4">
                  <p className="text-[12px] text-basalt/55">{RUN_PLAN.route}</p>
                  <p className="text-[11px] text-rust/70 mt-2">{RUN_PLAN.caution}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="border border-basalt/10 rounded-[7px] p-3">
                  <p className="text-[10px] uppercase tracking-[0.08em] text-basalt/50">Elevation</p>
                  <p className="text-[13px] text-basalt/70">{RUN_PLAN.elevation}</p>
                </div>
                <div className="border border-basalt/10 rounded-[7px] p-3">
                  <p className="text-[10px] uppercase tracking-[0.08em] text-basalt/50">Wind exposure</p>
                  <p className="text-[13px] text-basalt/70">{RUN_PLAN.wind}</p>
                </div>
              </div>
              <div className="mt-3 border border-amber/20 bg-amber/[0.03] rounded-[7px] p-3">
                <p className="text-[10px] uppercase tracking-[0.1em] text-amber font-medium mb-1">Extension</p>
                <p className="text-[12px] text-basalt/65">{RUN_PLAN.extensions}</p>
              </div>
            </section>

            {/* Why this route */}
            <section className="mb-6"><WhyThisRoute /></section>

            {/* LAYER B — Operating plan */}
            <section className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-3">Day plan</p>
              <JourneyTimeline steps={DAY_TWO_TIMELINE} />
            </section>

            {/* LAYER C — Decision plan */}
            <section className="mb-6">
              <DecisionTreeView tree={DAY2_DECISION} onSelectPlan={setActivePlan} activePlanId={activePlan} />
            </section>

            {/* Alternative plans */}
            <section className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-3">Alternative plans</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Plan B — lower-risk scenic */}
                <div className="border border-basalt/15 rounded-[7px] p-4">
                  <p className="text-[11px] font-medium text-basalt mb-1">Plan B: Lower-risk scenic walk</p>
                  <p className="text-[13px] text-basalt/70">{ALT_HIKE_LOWER.name}</p>
                  <p className="text-[11px] text-basalt/50 mt-1">{ALT_HIKE_LOWER.distance} · {ALT_HIKE_LOWER.duration}</p>
                  <p className="text-[11px] text-basalt/50 mt-1">{ALT_HIKE_LOWER.notes}</p>
                </div>
                {/* Plan C — poor weather */}
                <div className="border border-basalt/15 rounded-[7px] p-4">
                  <p className="text-[11px] font-medium text-basalt mb-1">Plan C: Poor-weather day</p>
                  <p className="text-[13px] text-basalt/70">{ALT_HIKE_POOR.name}</p>
                  <p className="text-[11px] text-basalt/50 mt-1">{ALT_HIKE_POOR.distance} · {ALT_HIKE_POOR.duration}</p>
                  <p className="text-[11px] text-basalt/50 mt-1">{ALT_HIKE_POOR.notes}</p>
                </div>
              </div>
            </section>

            {/* Beinisvørð note */}
            <section className="mb-6">
              <div className="harbour-notice">
                <p className="text-[10px] uppercase tracking-[0.14em] text-rust font-medium mb-1">Why not Beinisvørð today?</p>
                <p className="text-[13px]">{BEINISVORD_NOTE.reason}</p>
                <p className="text-[13px] mt-1 text-basalt/60">{BEINISVORD_NOTE.alternative}</p>
              </div>
            </section>

            {/* LAYER E — Sources */}
            <SourceRegister items={DAY2_SOURCES} />
          </div>

          {/* Sidebar */}
          <aside className="min-w-0">
            <div className="space-y-6">
              <TripStatusPanel
                dateLine1="Tuesday 28 July 2026"
                dateLine2="Suðuroy exploration day"
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
          <p className="text-[11px] tracking-[0.14em] uppercase text-rust font-medium">Day 2 · Tuesday · 28 July</p>
          <h1 className="text-[clamp(2rem,8vw,2.6rem)] leading-[1.06] mt-1 text-basalt tracking-[-0.01em]" style={{ fontFamily: "var(--font-cinzel)" }}>Run &amp; the ridge</h1>
          <p className="text-[17px] font-medium text-basalt/80 mt-1.5">Øravík · Hov · Hvannhagi</p>
          <p className="text-[14px] text-basalt/60 mt-2">Morning run, Bus 700 to Hov, Hvannhagi ridge walk. No car needed.</p>
        </div>
        <section className="mb-6"><TripReadiness /></section>
        <section className="mb-6"><MobileDecisionPanel /></section>
        <section className="mb-6"><MobileTripStatus dateLine1="Tuesday 28 July 2026" dateLine2="Suðuroy exploration day" weatherLat={61.536} weatherLon={-6.81} weatherLabel="Øravík" /></section>
        <section className="mb-6">
          <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">Morning run · Øravík loop</p>
          <div className="border border-basalt/15 rounded-[8px] overflow-hidden">
            <div style={{ height: 280 }}>
              <FaroesMap onSelect={() => {}} selected={null} filter="run-oravik" mapRef={mobileRunMapRef} height={280} />
            </div>
            <div className="p-3 border-t border-basalt/10">
              <div className="flex gap-4 text-[11px]">
                <div><span className="text-basalt/50">Duration </span><span className="font-medium text-basalt">{RUN_PLAN.duration}</span></div>
                <div><span className="text-basalt/50">Distance </span><span className="font-medium text-basalt">{RUN_PLAN.distance}</span></div>
              </div>
              <p className="text-[11px] text-basalt/55 mt-2">{RUN_PLAN.caution}</p>
            </div>
          </div>
        </section>
        <section className="mb-6"><p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">Day plan</p><MobileTimeline steps={DAY_TWO_TIMELINE} /></section>
        <section className="mb-6"><DecisionTreeView tree={DAY2_DECISION} /></section>
        <section className="mb-6"><WhyThisRoute /></section>
        <section><p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">SUÐUROY · FAROE ISLANDS</p><div style={{ minHeight: 420 }}><FaroesMap onSelect={() => {}} selected={null} filter="suðuroy" mapRef={mapRef} /></div></section>
      </article>
    </>
  );
}

function RunDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.08em] text-basalt/50">{label}</p>
      <p className="text-[13px] font-medium text-basalt">{value}</p>
    </div>
  );
}
