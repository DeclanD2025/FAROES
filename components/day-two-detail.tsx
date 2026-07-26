// =============================================================================
// DayTwoDetail — "Suðuroy: Run and primary hike" carless rebuild.
// Explicit no-car plan: morning run, realistic bus-accessible hike,
// weather decision tree, poor-weather alternatives.
// =============================================================================

"use client";

import { useState, useRef, useCallback } from "react";
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
import { ElevationProfile } from "@/components/run/elevation-profile";
import { RunInfoPanel } from "@/components/run/run-info-panel";
import {
  type ElevationSample,
  type LngLat,
  sampleElevation,
} from "@/lib/route-utils";
import { OravikFamjinVagurMap } from "@/components/oravik-famjin-vagur-map";

const FaroesMap = dynamic(() => import("@/components/map/faroes-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full border border-basalt/15 bg-fog/20 flex items-center justify-center" style={{ minHeight: 280 }}>
      <p className="caption">Loading map…</p>
    </div>
  ),
});

const OravikRunMap = dynamic(() => import("@/components/run/oravik-run-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full border border-basalt/15 bg-fog/20 flex items-center justify-center" style={{ minHeight: 380 }}>
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-basalt/20 border-t-claret rounded-full animate-spin" />
        <p className="caption">Loading route map…</p>
      </div>
    </div>
  ),
});

// =============================================================================
// MORNING RUN — Øravík Fell Loop (GPX-powered)
// =============================================================================

// =============================================================================
// PRIMARY HIKE — Bus-accessible option
// =============================================================================

const PRIMARY_HIKE = {
  name: "Hvannhagi Ridge",
  trailhead: "Above Suðuroyar Sjúkrahús, Tvøroyri",
  trailheadAccess: "Use Route 700 from Øravík towards Tvøroyri, then walk uphill to the hospital trailhead. Confirm the actual Tuesday service with SSL before leaving.",
  routeType: "Out-and-back · orange waymarked posts",
  distance: "~5–6 km round trip",
  ascent: "~200 m total ascent",
  duration: "~2 hrs moving, allow 2½–3 hrs door to door",
  terrain: "Grassy valley path, steep sections and boggy ground after rain",
  navigation: "Follow the orange waymarkers from above the hospital. They can disappear in fog — do NOT attempt in poor visibility.",
  exposure: "Moderate. Some ridge sections with drop-offs. Cliff edge near the lake.",
  weatherThreshold: "Do NOT attempt if: wind > 15 m/s, visibility < 500 m, persistent rain (posts become invisible in fog).",
  food: "No facilities. Bring water (at least 1L pp), snacks, lunch.",
  water: "Stream water available but treat before drinking. Bring your own as primary.",
  returnTransport: "Return to Tvøroyri, then use Route 700 back to Øravík. Timetables and special services must be checked on the day.",
  taxiFallback: "Suðuroy taxi +298 239550. Pre-book if you need a fixed return after the hike.",
  missedBus: "Stay in Tvøroyri for food or supplies while you confirm the next service; do not rely on an unverified late road walk.",
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
    num: 1, title: "Wake, fuel & make the go / no-go call",
    subtitle: "Við á 7 · weather, kit and offline navigation",
    middleLabel: "Window", middleValue: "07:00–08:00",
    rightLabel: "Leave", rightValue: "~08:00",
    footer: "Decision point 1. Check visibility, wind, rain, equipment and everyone’s condition. Komoot is primary; Organic Maps is the phone backup. Keep all three GPX tracks offline; charge phones, watches and power banks. Carry waterproofs, a warm layer, food, water, inhaler, first aid and blister treatment.",
  },
  {
    num: 2, title: "Leg 1 · Øravík → Fámjin",
    subtitle: "Øraskarð · Kirkjuvatn · Fámjin Church",
    middleLabel: "Official", middleValue: "5 km · 1h 30m",
    rightLabel: "Target", rightValue: "09:30–10:00",
    footer: "Start by the stone-wall gate and follow the official village path via Øraskarð and Kirkjuvatn. Some ground is wet, stony and steep. In Fámjin, allow 20–30 minutes for the church/original Merkið, food and water.",
  },
  {
    num: 3, title: "Leg 2 · Fámjin → Vágur",
    subtitle: "Reyðabakki · Mittvatn · Ryskivatn",
    middleLabel: "Official", middleValue: "7 km · 2h 15m",
    rightLabel: "Leave", rightValue: "10:15–10:30",
    footer: "Decision point 2: reassess weather and pace before continuing. Follow the official village path from Fámjin Church via the lakes to Vágur; it includes steep ground and loose gravel. No mandatory hiking charge is identified on the three official village paths; Fámjin Church donation is optional.",
  },
  {
    num: 4, title: "Vágur · lunch & bailout decision",
    subtitle: "Trailhead / grove · food · weather check",
    middleLabel: "Target", middleValue: "12:30–13:15",
    rightLabel: "Break", rightValue: "30–45 min",
    footer: "Decision point 3. Vágur is the principal bailout point: arrange road transport to Øravík if conditions, pace or energy are not right. Do not continue merely to complete the loop.",
  },
  {
    num: 5, title: "Leg 3 · Vágur → Øravík",
    subtitle: "Hvannadal · Vágsskarð · Hovsdalur · Mannaskarð · Tingstovan",
    middleLabel: "Official", middleValue: "8 km · 2h 40m",
    rightLabel: "Begin", rightValue: "13:15–14:00",
    footer: "The final village path climbs steeply out of Vágur and returns via Mannaskarð and Tingstovan. Officially medium, but serious as a combined full-day loop. Never improvise a Borgarknappur summit route.",
  },
  {
    num: 6, title: "Return, recovery & optional run",
    subtitle: "Øravík accommodation",
    middleLabel: "Expected", middleValue: "16:00–18:00",
    rightLabel: "Emergency", rightValue: "112",
    footer: "The full plan is approximately 20 km, 6h 25m official moving time and a realistic 8–9 hours door-to-door. The 4 km run is only an optional recovery outing after everyone returns safely and still feels physically sound—not a fixed obligation.",
  },
];

const DAY_TWO_SUMMARY: SummaryItem[] = [
  { icon: "01", label: "Leg 1", time: "5 km", note: "Øravík → Fámjin" },
  { icon: "02", label: "Leg 2", time: "7 km", note: "Fámjin → Vágur" },
  { icon: "03", label: "Leg 3", time: "8 km", note: "Vágur → Øravík" },
  { icon: "Σ", label: "Official moving", time: "6h 25m", note: "~20 km" },
  { icon: "!", label: "Bailout", time: "Vágur", note: "Road transport" },
];

// =============================================================================
// WHY THIS ROUTE panel
// =============================================================================

function WhyThisRoute() {
  return (
    <div className="border border-basalt/15 rounded-[7px] p-4">
      <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">
        Why this is today’s route
      </p>
      <ul className="space-y-2 text-[13px] text-basalt/70">
        <li>• This is the planned three-leg route: Øravík → Fámjin (5 km / 1h 30m), Fámjin → Vágur (7 km / 2h 15m), then Vágur → Øravík (8 km / 2h 40m).</li>
        <li>• Each leg is officially graded medium; together they are a serious full-day undertaking, not a casual circuit.</li>
        <li>• The website map is deliberately schematic. Use Komoot and the downloaded official GPX tracks for every navigation decision.</li>
        <li>• Fámjin is the cultural pause; Vágur is the practical bailout. Treat road transport back to Øravík as a good decision, not a failure.</li>
        <li>• A 4 km run can happen later only if everyone is safely back, fed and genuinely fresh.</li>
      </ul>
    </div>
  );
}

function SuduroyFieldGuide() {
  return (
    <section className="border border-basalt/15 rounded-[7px] p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-basalt/10 pb-3">
        <div><p className="label text-fjord">Suðuroy field notes</p><h2 className="mt-1 text-[18px] font-medium text-basalt">Make the hike day useful, not just scenic.</h2></div>
        <a href="https://visitfaroeislands.com/en/see-do/inspiration-guides/popular-guides/regional-guides/suduroy" target="_blank" rel="noreferrer" className="text-[12px] text-fjord underline underline-offset-4">Island guide ↗</a>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-5 text-[13px] leading-relaxed text-basalt/75">
        <div>
          <p className="label">Hvannhagi plan</p>
          <p className="mt-2">The official route begins above the hospital in Tvøroyri and follows orange posts to an Ice-Age lake in a grass valley beneath steep rock. Treat it as an out-and-back: keep enough time and energy for the same route back.</p>
          <p className="mt-2 text-rust">Abort for fog, persistent rain, strong wind or uncertain footing. The orange markers are not a substitute for visibility.</p>
        </div>
        <div>
          <p className="label">Supply stop</p>
          <p className="mt-2"><strong className="text-basalt">Bónus Tvøroyri:</strong> buy Wednesday breakfast, run food, water, ferry snacks and any back-up dinner before leaving town. Øravík has no proper shop; Krambatangi has only basic terminal facilities.</p>
          <p className="mt-2">Also restock a charged power bank, pain relief/plasters and a dry bag. Check the actual shop and pharmacy hours before relying on them.</p>
        </div>
        <div>
          <p className="label">History and places</p>
          <p className="mt-2"><strong className="text-basalt">Øravík:</strong> the old island assembly site, Tingstovan / Uppi millum Stovur, lies in the valley above the village. <strong className="text-basalt">Tvøroyri:</strong> its growth was tied to shipping and fishing; the Norwegian wooden church was completed in 1908.</p>
          <p className="mt-2">For another clear-weather day, Fámjin’s church holds the first Faroese flag; Hvalba’s coal-mining history and the southern cliffs are better treated as separate, transport-planned outings.</p>
        </div>
      </div>
    </section>
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
        Morning run from Við á 7 — the Øravík Fell Loop (challenging mixed-surface, ~4.13 km, ~55–75 min). Then <strong>Bus 700 to Hov</strong> for the Hvannhagi ridge walk (2–3 hrs).
        Check weather before committing — do not use the fell loop in fog, heavy rain or strong wind.
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
  const runMapRef = useRef<maplibregl.Map | null>(null);
  const mobileRunMapRef = useRef<maplibregl.Map | null>(null);
  const [activePlan, setActivePlan] = useState<string>("d2-plan-a");

  // Run route state
  const [routeCoords, setRouteCoords] = useState<LngLat[] | null>(null);
  const [routeTotalKm, setRouteTotalKm] = useState<number | null>(null);
  const [elevationSamples, setElevationSamples] = useState<ElevationSample[] | null>(null);
  const [crosshairPoint, setCrosshairPoint] = useState<{ km: number; coordinates: LngLat } | null>(null);

  const handleRouteLoaded = useCallback((coords: LngLat[], totalKm: number) => {
    setRouteCoords(coords);
    setRouteTotalKm(totalKm);
    setElevationSamples(sampleElevation(coords, 25));
  }, []);

  const handleElevationHover = useCallback((point: { km: number; coordinates: LngLat } | null) => {
    setCrosshairPoint(point);
  }, []);

  return (
    <>
      {/* DESKTOP */}
      <article className="hidden lg:block px-8 pt-8 pb-20 max-w-[1280px]">
        <div className="grid grid-cols-[1fr_340px] gap-8">
          <div className="min-w-0">
            {/* Header */}
            <div className="mb-6">
              <p className="text-[12px] tracking-[0.14em] uppercase text-rust font-medium">Day 2 · Tuesday · 28 July 2026</p>
              <h1 className="text-[clamp(2.5rem,3.5vw,3.2rem)] leading-[1.04] mt-1.5 text-basalt tracking-[-0.01em]" style={{ fontFamily: "var(--font-cinzel)" }}>The Suðuroy village paths</h1>
              <p className="text-[20px] font-medium text-basalt/80 mt-2">Øravík · Fámjin · Vágur · Øravík</p>
              <p className="text-[14px] text-basalt/60 mt-2 max-w-[38rem]">
                Three official village-path legs make a serious full-day loop. Navigation lives in Komoot and the saved GPX tracks; this page is the operational plan, not a mountain-navigation substitute.
              </p>
            </div>

            {/* Trip Readiness */}
            <section className="mb-6"><TripReadiness /></section>

            {/* LAYER A — Day at a glance */}
            <section className="mb-6"><SummaryStrip items={DAY_TWO_SUMMARY} /></section>

            <section className="mb-6"><OravikFamjinVagurMap /></section>

            {/* Morning run — GPX-powered interactive route map */}
            <section className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">Morning run · Øravík Fell Loop</p>
              {/* Map + info panel composed feature */}
              <div className="border border-basalt/15 rounded-[7px] overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  {/* Map — ~68% width on desktop */}
                  <div className="lg:w-[68%] min-w-0">
                    <OravikRunMap
                      mapRef={runMapRef}
                      onRouteLoaded={handleRouteLoaded}
                      crosshairPoint={crosshairPoint}
                    />
                  </div>
                  {/* Info panel — ~32% width on desktop */}
                  <div className="lg:w-[32%] border-t lg:border-t-0 lg:border-l border-basalt/15 p-4 bg-fog/[0.03]">
                    <RunInfoPanel totalKm={routeTotalKm} />
                  </div>
                </div>
                {/* Elevation profile — full width below */}
                {routeCoords && elevationSamples && (
                  <div className="border-t border-basalt/10 p-4">
                    <ElevationProfile
                      samples={elevationSamples}
                      coords={routeCoords}
                      onHover={handleElevationHover}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Why this route */}
            <section className="mb-6"><WhyThisRoute /></section>

            <section className="mb-6"><SuduroyFieldGuide /></section>

            {/* LAYER B — Operating plan */}
            <section className="mb-6">
              <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-3">Day plan</p>
              <JourneyTimeline steps={DAY_TWO_TIMELINE} completionKey="day-2" />
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
          <h1 className="text-[clamp(2rem,8vw,2.6rem)] leading-[1.06] mt-1 text-basalt tracking-[-0.01em]" style={{ fontFamily: "var(--font-cinzel)" }}>The Suðuroy village paths</h1>
          <p className="text-[17px] font-medium text-basalt/80 mt-1.5">Øravík · Fámjin · Vágur · Øravík</p>
          <p className="text-[14px] text-basalt/60 mt-2">Three official route sections: ~20 km, 6h 25m official moving time, 8–9 hours realistic allowance.</p>
        </div>
        <section className="mb-6"><TripReadiness /></section>
        <section className="mb-6"><MobileDecisionPanel /></section>
        <section className="mb-6"><MobileTripStatus dateLine1="Tuesday 28 July 2026" dateLine2="Suðuroy exploration day" weatherLat={61.536} weatherLon={-6.81} weatherLabel="Øravík" /></section>
        <section className="mb-6"><OravikFamjinVagurMap /></section>
        <section className="mb-6">              <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">Morning run · Øravík Fell Loop</p>
          <div className="border border-basalt/15 rounded-[8px] overflow-hidden">
            <OravikRunMap
              mapRef={mobileRunMapRef}
              onRouteLoaded={handleRouteLoaded}
              crosshairPoint={crosshairPoint}
              compact
            />
            <div className="border-t border-basalt/10 p-3">
              <RunInfoPanel totalKm={routeTotalKm} mobile />
            </div>
            {routeCoords && elevationSamples && (
              <div className="border-t border-basalt/10 p-3">
                <ElevationProfile samples={elevationSamples} coords={routeCoords} onHover={handleElevationHover} />
              </div>
            )}
          </div>
        </section>
        <section className="mb-6"><p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">Day plan</p><MobileTimeline steps={DAY_TWO_TIMELINE} completionKey="day-2" /></section>
        <section className="mb-6"><DecisionTreeView tree={DAY2_DECISION} /></section>
        <section className="mb-6"><WhyThisRoute /></section>
        <section className="mb-6"><SuduroyFieldGuide /></section>
        <section><p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-2">SUÐUROY · FAROE ISLANDS</p><div style={{ minHeight: 420 }}><FaroesMap onSelect={() => {}} selected={null} filter="suðuroy" mapRef={mapRef} /></div></section>
      </article>
    </>
  );
}
