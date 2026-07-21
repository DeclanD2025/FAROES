// =============================================================================
// /hikes — Hiking routes index with difficulty filters and detail view.
// =============================================================================

"use client";

import { useState, useMemo } from "react";
import { HIKES, type HikeRoute, type HikeDifficulty, getDifficultyLabel, getDifficultyColor } from "@/lib/data/faroe-hikes";
import { JOURNEY_STOPS } from "@/lib/data/faroes-places";

const DIFFICULTIES: (HikeDifficulty | "all")[] = ["all", "easy", "moderate", "hard", "very-hard"];

function locName(id: string) { return JOURNEY_STOPS.find(l => l.id === id)?.name ?? id; }

export default function HikesPage() {
  const [difficultyFilter, setDifficultyFilter] = useState<HikeDifficulty | "all">("all");
  const [selectedHike, setSelectedHike] = useState<HikeRoute | null>(null);

  const filtered = useMemo(() => {
    if (difficultyFilter === "all") return HIKES;
    return HIKES.filter(h => h.difficulty === difficultyFilter);
  }, [difficultyFilter]);

  if (selectedHike) {
    return <HikeDetail hike={selectedHike} onBack={() => setSelectedHike(null)} />;
  }

  return (
    <article className="px-6 sm:px-8 lg:px-12 pt-10 pb-20 max-w-[64rem]">
      <header className="pb-6 border-b border-basalt/15">
        <p className="norse text-[13px] text-rust/80">Routes of the North Atlantic</p>
        <h1 className="font-sans font-medium text-[clamp(2rem,4.4vw,3rem)] leading-[1.04] mt-3 text-basalt tracking-[-0.012em]">
          Hiking routes.
        </h1>
        <p className="caption mt-3 max-w-[36rem]">
          Route data requires verification from official sources. Do not rely on unverified data for navigation.
          Check conditions before each hike.
        </p>
      </header>

      {/* Difficulty filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        {DIFFICULTIES.map(d => (
          <button
            key={d}
            type="button"
            onClick={() => setDifficultyFilter(d)}
            className={`px-3 py-1.5 text-[12.5px] font-medium tracking-[0.04em] uppercase transition-colors border ${
              difficultyFilter === d
                ? "border-basalt bg-basalt text-wool"
                : "border-basalt/20 text-basalt/70 hover:border-basalt/40"
            }`}
          >
            {d === "all" ? "All" : getDifficultyLabel(d)}
          </button>
        ))}
      </div>

      {/* Route index */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map(hike => (
          <button
            key={hike.id}
            type="button"
            onClick={() => setSelectedHike(hike)}
            className="text-left border border-basalt/15 p-5 hover:bg-fog/20 transition-colors"
          >
            <h3 className="font-medium text-[1.05rem] text-basalt">{hike.name}</h3>
            <p className="caption mt-1">{hike.locationIds.map(locName).join(", ")}</p>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
              {hike.distanceKm && (
                <span className="text-[13px]">
                  <span className="code text-fjord">{hike.distanceKm} km</span>
                  <span className="caption"> distance</span>
                </span>
              )}
              {hike.durationMinutes?.typical && (
                <span className="text-[13px]">
                  <span className="code text-fjord">{Math.round(hike.durationMinutes.typical / 60)}h {hike.durationMinutes.typical % 60}m</span>
                  <span className="caption"> typical</span>
                </span>
              )}
              {hike.elevationGainM && (
                <span className="text-[13px]">
                  <span className="code text-fjord">{hike.elevationGainM} m</span>
                  <span className="caption"> ascent</span>
                </span>
              )}
              <span className={`text-[12.5px] font-medium tracking-[0.04em] uppercase ${getDifficultyColor(hike.difficulty)}`}>
                {getDifficultyLabel(hike.difficulty)}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {hike.terrain.slice(0, 3).map(t => (
                <span key={t} className="text-[11px] text-basalt/50 tracking-[0.04em] uppercase">{t}</span>
              ))}
            </div>

            <p className="caption mt-2 line-clamp-2">{hike.summary}</p>
          </button>
        ))}
      </div>

      {/* Safety note */}
      <aside className="harbour-notice mt-12 py-3 max-w-[40rem]">
        <p className="label text-rust mb-1">Hiking safety</p>
        <p className="caption">
          Faroe Islands weather can change rapidly. Check conditions before each hike. Carry waterproofs, food, water,
          and a fully charged phone with offline maps. Tell someone your route and expected return time.
          In an emergency, call <span className="code">112</span>.
        </p>
      </aside>
    </article>
  );
}

// =========================================================================
// Hike Detail View
// =========================================================================
function HikeDetail({ hike, onBack }: { hike: HikeRoute; onBack: () => void }) {
  return (
    <article className="px-6 sm:px-8 lg:px-12 pt-10 pb-20 max-w-[64rem]">
      <button
        type="button"
        onClick={onBack}
        className="text-[13px] font-medium text-basalt/60 hover:text-basalt transition-colors mb-6"
      >
        ← Back to hikes
      </button>

      {/* Header */}
      <header className="pb-6 border-b border-basalt/15">
        <p className="norse text-[13px] text-rust/80">Route Detail</p>
        <h1 className="font-sans font-medium text-[clamp(2rem,4.4vw,3rem)] leading-[1.04] mt-3 text-basalt tracking-[-0.012em]">
          {hike.name}
        </h1>
        <p className="caption mt-2">{hike.locationIds.map(locName).join(", ")} · {getDifficultyLabel(hike.difficulty)}</p>
      </header>

      {/* Key facts strip */}
      <div className="mt-6 border border-basalt/15 p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
          <Field label="Distance" value={hike.distanceKm ? `${hike.distanceKm} km` : "Unknown"} mono />
          <Field label="Typical duration" value={hike.durationMinutes?.typical ? `${Math.round(hike.durationMinutes.typical / 60)}h ${hike.durationMinutes.typical % 60}m` : "Unknown"} mono />
          <Field label="Ascent" value={hike.elevationGainM ? `${hike.elevationGainM} m` : "Unknown"} mono />
          <Field label="Highest point" value={hike.highestPointM ? `${hike.highestPointM} m` : "Unknown"} mono />
          <Field label="Route type" value={hike.routeType} />
          <Field label="Difficulty" value={getDifficultyLabel(hike.difficulty)} />
          <Field label="Waymarking" value={hike.waymarking ?? "Unknown"} />
          <Field label="Source" value={hike.confidence === "official" ? "Official" : hike.confidence === "provisional" ? "Provisional" : "Unverified"} />
        </div>
      </div>

      {/* Summary */}
      <section className="mt-8">
        <h2 className="label">About this route</h2>
        <p className="mt-2 text-[14.5px] leading-relaxed">{hike.summary}</p>
      </section>

      {/* Terrain & Hazards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {hike.terrain.length > 0 && (
          <section>
            <h2 className="label">Terrain</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {hike.terrain.map(t => (
                <span key={t} className="text-[12.5px] border border-basalt/20 px-2 py-0.5">{t}</span>
              ))}
            </div>
          </section>
        )}

        {(hike.hazards.length > 0 || hike.exposure.length > 0) && (
          <section>
            <h2 className="label">Hazards & Exposure</h2>
            {hike.exposure.length > 0 && (
              <p className="mt-2 text-[14px] text-rust font-medium">{hike.exposure.join(" · ")}</p>
            )}
            {hike.hazards.length > 0 && (
              <ul className="mt-2 space-y-1">
                {hike.hazards.map(h => (
                  <li key={h} className="text-[13.5px] text-basalt/80">— {h}</li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>

      {/* Route stages */}
      {hike.routeStages.length > 0 && (
        <section className="mt-8">
          <h2 className="label">Route stages</h2>
          <ol className="mt-3 relative border-l border-basalt/20 pl-6 space-y-6">
            {hike.routeStages.map(stage => (
              <li key={stage.id} className="relative">
                <span aria-hidden className="absolute -left-[1.65rem] top-[0.3rem] block w-2.5 h-2.5 border-2 border-basalt/40 bg-wool" />
                <p className="font-medium text-[14.5px]">{stage.title}</p>
                <p className="caption mt-1">{stage.description}</p>
                {stage.warnings?.map(w => (
                  <p key={w} className="text-[13px] text-rust mt-1">{w}</p>
                ))}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Access */}
      <section className="mt-8">
        <h2 className="label">Access & Legal</h2>
        <div className="mt-2 text-[14px] space-y-1">
          <p>Permission required: <span className="font-medium">{hike.access.permissionRequired ? "Yes" : "No"}</span></p>
          <p>Access fee: <span className="font-medium">{hike.access.accessFee ?? "None"}</span></p>
          <p>Booking required: <span className="font-medium">{hike.access.bookingRequired ? "Yes" : "No"}</span></p>
          {hike.access.landownerNotes?.map(n => (
            <p key={n} className="caption">{n}</p>
          ))}
        </div>
      </section>

      {/* Getting there */}
      <section className="mt-8">
        <h2 className="label">Getting there</h2>
        <div className="mt-2 text-[14px] space-y-1">
          <p>Start: <span className="code text-fjord">[{hike.startCoordinates[0].toFixed(5)}, {hike.startCoordinates[1].toFixed(5)}]</span></p>
          {hike.transport.startPointDirections?.map(d => (
            <p key={d} className="text-[13.5px]">{d}</p>
          ))}
          {hike.transport.parking?.map(p => (
            <p key={p} className="text-[13.5px]">{p}</p>
          ))}
        </div>
      </section>

      {/* Facilities */}
      <section className="mt-8">
        <h2 className="label">Facilities</h2>
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-[14px]">
          <FacilityRow label="Toilets" value={hike.facilities.toilets} />
          <FacilityRow label="Water" value={hike.facilities.water} />
          <FacilityRow label="Shelter" value={hike.facilities.shelter} />
          <FacilityRow label="Food nearby" value={hike.facilities.foodNearby} />
          <FacilityRow label="Signal" value={hike.communications.mobileSignal} />
        </div>
      </section>

      {/* Weather */}
      {(hike.weatherRisks.length > 0 || hike.seasonalRisks.length > 0) && (
        <section className="mt-8 harbour-notice py-3">
          <h2 className="label text-rust mb-2">Weather considerations</h2>
          <p className="text-[14px]">{hike.weatherRisks.join(" · ")}</p>
          {hike.seasonalRisks.length > 0 && (
            <p className="text-[13.5px] mt-1">{hike.seasonalRisks.join(" · ")}</p>
          )}
          <p className="caption mt-2">Check conditions before departure. Turn back if weather deteriorates.</p>
        </section>
      )}

      {/* Equipment */}
      {hike.equipment.length > 0 && (
        <section className="mt-8">
          <h2 className="label">Recommended equipment</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {hike.equipment.map(e => (
              <span key={e} className="text-[12.5px] border border-fjord/30 text-fjord px-2 py-0.5">{e}</span>
            ))}
          </div>
        </section>
      )}

      {/* Safety */}
      {hike.emergencyNotes.length > 0 && (
        <section className="mt-8 border border-rust/30 p-5">
          <h2 className="label text-rust">Emergency</h2>
          <ul className="mt-3 space-y-1.5">
            {hike.emergencyNotes.map(n => (
              <li key={n} className="text-[14px]">{n}</li>
            ))}
          </ul>
          <p className="caption mt-3">Faroe Islands emergency number: <span className="code">112</span></p>
        </section>
      )}

      {/* Turnaround points */}
      {hike.turnaroundPoints.length > 0 && (
        <section className="mt-8">
          <h2 className="label">Shorter options & turnaround points</h2>
          <ul className="mt-2 space-y-2">
            {hike.turnaroundPoints.map(tp => (
              <li key={tp.name} className="border-l-2 border-moss/40 pl-3">
                <p className="font-medium text-[14px]">{tp.name}</p>
                {tp.distanceKm && <p className="caption">{tp.distanceKm} km</p>}
                <p className="caption">{tp.notes}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="label">{label}</p>
      <p className={`mt-0.5 text-[14px] ${mono ? "code text-fjord tnum" : "text-basalt"}`}>{value}</p>
    </div>
  );
}

function FacilityRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="label">{label}</p>
      <p className="text-[13.5px] mt-0.5">{value ?? "Unknown"}</p>
    </div>
  );
}
