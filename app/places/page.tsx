// =============================================================================
// /places — Interactive geographic map of the Faroe Islands trip.
//
// Composition:
//   1. Compact header (eyebrow + heading + caption)
//   2. Origin strip (Edinburgh → Vágar flight)
//   3. Filter bar (Journey / Places / Match / Stay)
//   4. Interactive MapLibre GL map with markers, route lines, info panel
//   5. Route rail (numbered journey sequence below the map)
//   6. Mobile bottom sheet (narrow-width detail view)
//
// Edinburgh is shown only in the origin strip — not plotted on the map.
// =============================================================================

"use client";

import { useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type maplibregl from "maplibre-gl";

import OriginStrip from "@/components/map/origin-strip";
import FilterBar from "@/components/map/filter-bar";
import RouteRail from "@/components/map/route-rail";
import MobileBottomSheet from "@/components/map/mobile-bottom-sheet";
import type { SelectedFeature, MapFilter } from "@/components/map/faroes-map";

// ---------------------------------------------------------------------------
// Lazy-load the map component so maplibre-gl is never imported during SSR.
// ---------------------------------------------------------------------------
const FaroesMap = dynamic(() => import("@/components/map/faroes-map"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full border border-basalt/15 bg-fog/20 flex items-center justify-center"
      style={{ height: "clamp(420px, 65vh, 820px)" }}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-basalt/20 border-t-fjord rounded-full animate-spin" />
        <p className="caption">Loading map…</p>
      </div>
    </div>
  ),
});

// Lazy-load InfoPanel — not needed on mobile.
const InfoPanel = dynamic(() => import("@/components/map/info-panel"), {
  ssr: false,
});

export default function PlacesPage() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [selected, setSelected] = useState<SelectedFeature>(null);
  const [filter, setFilter] = useState<MapFilter>("journey");

  const handleSelect = useCallback((feature: SelectedFeature) => {
    setSelected(feature);
  }, []);

  const handleClose = useCallback(() => {
    setSelected(null);
  }, []);

  const handleFilterChange = useCallback((f: MapFilter) => {
    setFilter(f);
    setSelected(null);
  }, []);

  return (
    <article className="px-6 sm:px-8 lg:px-12 pt-10 pb-20 max-w-[64rem]">
      {/* ---- Compact header ---- */}
      <header className="pb-6">
        <p className="label">Map · Interactive route chart</p>
        <h1 className="font-sans font-medium text-[clamp(2rem,4.4vw,3rem)] leading-[1.04] mt-3 text-basalt tracking-[-0.012em]">
          Across the Faroes
        </h1>
        <p className="caption mt-3 max-w-[36rem]">
          From Vágar Airport to Tórshavn, south aboard Smyril to Krambatangi,
          then onward to Øravík.
        </p>
      </header>

      {/* ---- Origin strip ---- */}
      <div className="mb-4">
        <OriginStrip />
      </div>

      {/* ---- Filter bar ---- */}
      <div className="mb-3">
        <FilterBar active={filter} onChange={handleFilterChange} />
      </div>

      {/* ---- Map region ---- */}
      <div className="relative" id="faroes-map-panel">
        <FaroesMap
          onSelect={handleSelect}
          selected={selected}
          filter={filter}
          mapRef={mapRef}
        />
        <InfoPanel selected={selected} onClose={handleClose} />
      </div>

      {/* ---- Route rail ---- */}
      <RouteRail onSelect={handleSelect} selected={selected} />

      {/* ---- Mobile bottom sheet ---- */}
      <MobileBottomSheet
        selected={selected}
        onClose={handleClose}
        mapRef={mapRef}
      />

      {/* ---- Footer note ---- */}
      <p className="caption mt-6 max-w-[40rem]">
        Map data ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          className="underline decoration-basalt/20 underline-offset-4 hover:decoration-basalt/60"
          target="_blank"
          rel="noopener noreferrer"
        >
          OpenStreetMap contributors
        </a>
        . Tiles via{" "}
        <a
          href="https://openfreemap.org"
          className="underline decoration-basalt/20 underline-offset-4 hover:decoration-basalt/60"
          target="_blank"
          rel="noopener noreferrer"
        >
          OpenFreeMap
        </a>
        . Route geometry is curated and approximate — verify timetables at{" "}
        <a
          href="https://ssl.fo"
          className="underline decoration-basalt/20 underline-offset-4 hover:decoration-basalt/60"
          target="_blank"
          rel="noopener noreferrer"
        >
          ssl.fo
        </a>
        {" "}before travel.
      </p>
    </article>
  );
}
