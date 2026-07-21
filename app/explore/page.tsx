// =============================================================================
// /explore — Local field guide across the trip locations.
// Tabs: Food / Drink / Shops / Sights / Practical with location selector.
// =============================================================================

"use client";

import { useState, useMemo } from "react";
import { LOCAL_PLACES, FIELD_GUIDE_TABS, getTabCategory, type LocalPlaceTab } from "@/lib/data/faroe-local-places";
import { JOURNEY_STOPS, SAVED_PLACES, type TripPlace } from "@/lib/data/faroes-places";

const LOCATIONS = [...JOURNEY_STOPS, ...SAVED_PLACES];

function StatusBadge({ confidence }: { confidence: string }) {
  if (confidence === "official") return null;
  const label = confidence === "verified-secondary" ? "Verified" : confidence === "provisional" ? "Provisional" : "Unverified";
  const tone = confidence === "verified-secondary" ? "text-fjord" : confidence === "provisional" ? "text-yellow" : "text-rust";
  return <span className={`text-[10.5px] tracking-[0.14em] uppercase ${tone}`}>{label}</span>;
}

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<LocalPlaceTab>("food");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  const filteredPlaces = useMemo(() => {
    const categories = getTabCategory(activeTab);
    return LOCAL_PLACES.filter(p => {
      if (locationFilter !== "all" && p.locationId !== locationFilter) return false;
      return categories.includes(p.category);
    });
  }, [activeTab, locationFilter]);

  const locName = (id: string) => LOCATIONS.find(l => l.id === id)?.name ?? id;

  return (
    <article className="px-6 sm:px-8 lg:px-12 pt-10 pb-20 max-w-[64rem]">
      {/* Header */}
      <header className="pb-6 border-b border-basalt/15">
        <p className="norse text-[13px] text-rust/80">North Atlantic · Field Guide</p>
        <h1 className="font-sans font-medium text-[clamp(2rem,4.4vw,3rem)] leading-[1.04] mt-3 text-basalt tracking-[-0.012em]">
          Explore the route.
        </h1>
        <p className="caption mt-3 max-w-[36rem]">
          Practical local information near every stop on the itinerary. Hours are indicative — verify before relying on them.
        </p>
      </header>

      {/* Location selector */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setLocationFilter("all")}
          className={`px-3 py-1.5 text-[12.5px] font-medium tracking-[0.04em] uppercase transition-colors border ${
            locationFilter === "all"
              ? "border-basalt bg-basalt text-wool"
              : "border-basalt/20 text-basalt/70 hover:border-basalt/40"
          }`}
        >
          All stops
        </button>
        {LOCATIONS.map(loc => (
          <button
            key={loc.id}
            type="button"
            onClick={() => setLocationFilter(loc.id)}
            className={`px-3 py-1.5 text-[12.5px] font-medium tracking-[0.04em] uppercase transition-colors border ${
              locationFilter === loc.id
                ? "border-basalt bg-basalt text-wool"
                : "border-basalt/20 text-basalt/70 hover:border-basalt/40"
            }`}
          >
            {loc.name}
          </button>
        ))}
      </div>

      {/* Category tabs */}
      <div className="mt-6 flex flex-wrap gap-3 border-b border-basalt/15 pb-3">
        {FIELD_GUIDE_TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 text-[13.5px] font-medium transition-colors pb-2 -mb-[13px] border-b-2 ${
              activeTab === tab.id
                ? "text-basalt border-rust"
                : "text-basalt/50 border-transparent hover:text-basalt/70"
            }`}
          >
            <span aria-hidden>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Place list */}
      <div className="mt-6">
        {filteredPlaces.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-[15px] text-basalt/60">No verified places found for this selection.</p>
            <p className="caption mt-2">Place data is being researched. Check back for updates.</p>
          </div>
        ) : (
          <ul className="divide-y divide-basalt/10">
            {filteredPlaces.map(place => (
              <li key={place.id} className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <h3 className="font-medium text-[15px] text-basalt">{place.name}</h3>
                      {place.subcategory && (
                        <span className="caption">{place.subcategory}</span>
                      )}
                      <StatusBadge confidence={place.confidence} />
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      <span className="caption text-fjord">{locName(place.locationId)}</span>
                      {place.openingHours && (
                        <span className="caption">{place.openingHours}</span>
                      )}
                      {place.priceLevel && (
                        <span className="caption">{Array(place.priceLevel).fill("£").join("")}</span>
                      )}
                    </div>

                    {place.notes && place.notes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {place.notes.map((note, i) => (
                          <span key={i} className="text-[12.5px] text-basalt/70">{note}</span>
                        ))}
                      </div>
                    )}

                    {place.website && (
                      <a
                        href={place.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 code text-[13px] underline decoration-basalt/30 underline-offset-4 hover:decoration-basalt"
                      >
                        {place.website.replace(/^https?:\/\//, "")} ↗
                      </a>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {place.indoorOutdoor && (
                      <span className="text-[11px] tracking-[0.08em] uppercase text-basalt/50">
                        {place.indoorOutdoor}
                      </span>
                    )}
                    {place.visitDuration && (
                      <span className="text-[11px] tracking-[0.08em] uppercase text-basalt/50">
                        {place.visitDuration}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Data caveat */}
      <aside className="harbour-notice mt-12 py-3 max-w-[40rem]">
        <p className="label text-rust mb-1">Provenance</p>
        <p className="caption">
          Local place data is researched from official business websites, municipality sites,
          and OpenStreetMap. Records marked &ldquo;Provisional&rdquo; or &ldquo;Unverified&rdquo; require
          confirmation before relying on them during the trip. Opening hours change seasonally —
          check official sources on the day.
        </p>
      </aside>
    </article>
  );
}
