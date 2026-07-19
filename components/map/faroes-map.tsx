// =============================================================================
// FaroesMap — client-only interactive MapLibre GL map of the Faroe Islands.
//
// Initialised once, cleaned up on unmount. Adds GeoJSON sources for journey
// stops, saved places, and route legs. Markers use MapLibre circle + symbol
// layers with hardcoded hex palette colours (CSS var() does not work in
// MapLibre paint expressions). Route lines use styled line layers.
// =============================================================================

"use client";

import {
  useRef,
  useEffect,
  useCallback,
  useState,
  type RefObject,
} from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { JOURNEY_STOPS, ALL_PLACES, FAROE_BOUNDS, FAROE_MAX_BOUNDS, type TripPlace } from "@/lib/data/faroes-places";
import { JOURNEY_LEGS, type JourneyLeg } from "@/lib/data/faroes-journey-legs";

// ---------------------------------------------------------------------------
// Palette — hardcoded hex to match the project design tokens.
// CSS custom properties are not interpreted by MapLibre paint expressions.
// ---------------------------------------------------------------------------
const P = {
  yellow: "#D4A43B",
  rust:   "#A64B36",
  moss:   "#637260",
  fjord:  "#173747",
  basalt: "#283035",
  wool:   "#F2EFE7",
  navy:   "#0D2433",
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type SelectedFeature =
  | { kind: "place"; place: TripPlace }
  | { kind: "leg"; leg: JourneyLeg }
  | null;

export type MapFilter = "journey" | "places" | "match" | "stay";

interface FaroesMapProps {
  onSelect: (feature: SelectedFeature) => void;
  selected: SelectedFeature;
  filter: MapFilter;
  mapRef: RefObject<maplibregl.Map | null>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const MAP_STYLE =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL ??
  "https://tiles.openfreemap.org/styles/positron";

// Source/layer IDs
const SOURCE_PLACES = "faroes-places";
const SOURCE_LEGS = "faroes-legs";
const LAYER_PLACE_CIRCLES = "faroes-place-circles";
const LAYER_PLACE_CIRCLES_SEL = "faroes-place-circles-selected";
const LAYER_PLACE_LABELS = "faroes-place-labels";
const LAYER_PLACE_NUMBERS = "faroes-place-numbers";
const LAYER_LEG_LINES = "faroes-leg-lines";
const LAYER_LEG_LINES_SELECTED = "faroes-leg-lines-selected";

// ---------------------------------------------------------------------------
// Build GeoJSON FeatureCollection from TripPlace[]
// ---------------------------------------------------------------------------
function placesToGeoJSON(places: TripPlace[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: places.map((p) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: p.coordinates,
      },
      properties: {
        id: p.id,
        name: p.name,
        category: p.category,
        routeSequence: p.routeSequence ?? null,
        status: p.status ?? null,
      },
    })),
  };
}

// ---------------------------------------------------------------------------
// Build GeoJSON FeatureCollection from JourneyLeg[]
// ---------------------------------------------------------------------------
function legsToGeoJSON(legs: JourneyLeg[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: legs.map((l) => ({
      type: "Feature" as const,
      geometry: l.geometry,
      properties: {
        id: l.id,
        mode: l.mode,
        status: l.status ?? null,
        fromPlaceId: l.fromPlaceId,
        toPlaceId: l.toPlaceId,
        service: l.service ?? "",
      },
    })),
  };
}

// ---------------------------------------------------------------------------
// Reduced-motion check
// ---------------------------------------------------------------------------
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function moveTo(map: maplibregl.Map, center: [number, number], zoom: number) {
  if (prefersReducedMotion()) {
    map.jumpTo({ center, zoom });
  } else {
    map.flyTo({ center, zoom, duration: 800 });
  }
}

function fitTo(map: maplibregl.Map, bounds: [[number, number], [number, number]]) {
  if (prefersReducedMotion()) {
    map.fitBounds(bounds, { padding: 40, animate: false });
  } else {
    map.fitBounds(bounds, { padding: 40, duration: 800 });
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function FaroesMap({
  onSelect,
  selected,
  filter,
  mapRef,
}: FaroesMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initRef = useRef(false);

  // Keep callbacks in refs so map event handlers never go stale.
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  });

  const placeById = useCallback(
    (id: string) => ALL_PLACES.find((p) => p.id === id) ?? null,
    [],
  );
  const legById = useCallback(
    (id: string) => JOURNEY_LEGS.find((l) => l.id === id) ?? null,
    [],
  );

  // ---- Determine which places to show based on filter ----
  const getVisiblePlaces = useCallback((f: MapFilter): TripPlace[] => {
    switch (f) {
      case "journey":
        return JOURNEY_STOPS;
      case "places":
        return ALL_PLACES;
      case "match":
        return ALL_PLACES.filter(
          (p) =>
            p.id === "torsvollur" ||
            p.id === "torshavn-ferry" ||
            p.id === "torshavn",
        );
      case "stay":
        return ALL_PLACES.filter(
          (p) => p.id === "oravik" || p.id === "krambatangi",
        );
      default:
        return JOURNEY_STOPS;
    }
  }, []);

  // ---- Reset to full archipelago view ----
  const resetView = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    fitTo(map, FAROE_BOUNDS);
  }, [mapRef]);

  // ---- Filter → viewport ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    if (filter === "match") {
      const venue = ALL_PLACES.find((p) => p.id === "torsvollur");
      if (venue) {
        map.fitBounds(
          [
            [venue.coordinates[0] - 0.02, venue.coordinates[1] - 0.01],
            [venue.coordinates[0] + 0.02, venue.coordinates[1] + 0.02],
          ],
          { padding: 40, duration: prefersReducedMotion() ? 0 : 600 },
        );
      }
    } else if (filter === "stay") {
      map.fitBounds(
        [
          [-6.84, 61.52],
          [-6.78, 61.56],
        ],
        { padding: 40, duration: prefersReducedMotion() ? 0 : 600 },
      );
    } else {
      fitTo(map, FAROE_BOUNDS);
    }
  }, [filter, mapRef]);

  // ---- Initialise map once ----
  useEffect(() => {
    if (initRef.current || !containerRef.current) return;
    initRef.current = true;

    try {
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: MAP_STYLE,
        bounds: FAROE_BOUNDS,
        maxBounds: FAROE_MAX_BOUNDS,
        minZoom: 7,
        maxZoom: 15,
        bearing: 0,
        pitch: 0,
        dragRotate: false,
        touchPitch: false,
        renderWorldCopies: false,
        cooperativeGestures: true,
        attributionControl: {},
      });

      // Navigation + fullscreen controls
      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "top-right",
      );
      map.addControl(new maplibregl.FullscreenControl(), "top-right");

      mapRef.current = map;

      map.on("load", () => {
        // Add sources
        map.addSource(SOURCE_PLACES, {
          type: "geojson",
          data: placesToGeoJSON(getVisiblePlaces(filter)),
        });
        map.addSource(SOURCE_LEGS, {
          type: "geojson",
          data: legsToGeoJSON(JOURNEY_LEGS),
        });

        // ---- Place circle layer ----
        map.addLayer({
          id: LAYER_PLACE_CIRCLES,
          type: "circle",
          source: SOURCE_PLACES,
          paint: {
            "circle-radius": [
              "case",
              ["has", "routeSequence"],
              10,
              6,
            ],
            "circle-color": [
              "case",
              ["has", "routeSequence"],
              P.yellow,
              ["match", ["get", "category"],
                "match", P.rust,
                "accommodation", P.moss,
                "airport", P.fjord,
                "harbour", P.fjord,
                P.basalt,
              ],
            ],
            "circle-stroke-color": P.basalt,
            "circle-stroke-width": 1.2,
            "circle-opacity": 1,
          },
        });

        // ---- Selected place halo (larger, semi-transparent ring) ----
        map.addLayer({
          id: LAYER_PLACE_CIRCLES_SEL,
          type: "circle",
          source: SOURCE_PLACES,
          filter: ["==", ["get", "id"], ""],
          paint: {
            "circle-radius": 16,
            "circle-color": "transparent",
            "circle-stroke-color": P.yellow,
            "circle-stroke-width": 3,
            "circle-opacity": 1,
          },
        });

        // ---- Place number labels (for numbered stops) ----
        map.addLayer({
          id: LAYER_PLACE_NUMBERS,
          type: "symbol",
          source: SOURCE_PLACES,
          filter: ["has", "routeSequence"],
          layout: {
            "text-field": ["to-string", ["get", "routeSequence"]],
            "text-font": ["Noto Sans Bold"],
            "text-size": 10,
            "text-offset": [0, 0],
          },
          paint: {
            "text-color": P.basalt,
          },
        });

        // ---- Place name labels ----
        map.addLayer({
          id: LAYER_PLACE_LABELS,
          type: "symbol",
          source: SOURCE_PLACES,
          layout: {
            "text-field": ["get", "name"],
            "text-font": ["Noto Sans Regular"],
            "text-size": 11,
            "text-offset": [0, 1.6],
            "text-anchor": "top",
            "text-optional": true,
          },
          paint: {
            "text-color": P.basalt,
            "text-halo-color": P.wool,
            "text-halo-width": 1.5,
          },
          minzoom: 9,
        });

        // ---- Route leg lines ----
        map.addLayer({
          id: LAYER_LEG_LINES,
          type: "line",
          source: SOURCE_LEGS,
          paint: {
            "line-color": [
              "match",
              ["get", "mode"],
              "ferry", P.yellow,
              "bus", P.rust,
              "walk", P.moss,
              P.fjord,
            ],
            "line-width": [
              "match",
              ["get", "mode"],
              "ferry", 2.5,
              "bus", 2.2,
              "walk", 1.8,
              2,
            ],
            "line-dasharray": [
              "match",
              ["get", "mode"],
              "ferry", ["literal", [4, 3]],
              ["literal", [1, 0]],
            ],
            "line-opacity": 0.85,
          },
        });

        // ---- Selected leg line (brighter, thicker overlay) ----
        map.addLayer({
          id: LAYER_LEG_LINES_SELECTED,
          type: "line",
          source: SOURCE_LEGS,
          filter: ["==", ["get", "id"], ""],
          paint: {
            "line-color": [
              "match",
              ["get", "mode"],
              "ferry", P.yellow,
              "bus", P.rust,
              "walk", P.moss,
              P.fjord,
            ],
            "line-width": 4,
            "line-opacity": 1,
          },
        });

        // ---- Click handlers (use ref to avoid stale closures) ----
        map.on("click", LAYER_PLACE_CIRCLES, (e) => {
          if (!e.features?.[0]) return;
          const props = e.features[0].properties;
          const place = placeById(props.id);
          if (place) onSelectRef.current({ kind: "place", place });
        });

        map.on("click", LAYER_LEG_LINES, (e) => {
          if (!e.features?.[0]) return;
          const props = e.features[0].properties;
          const leg = legById(props.id);
          if (leg) onSelectRef.current({ kind: "leg", leg });
        });

        // Cursor styles
        map.on("mouseenter", LAYER_PLACE_CIRCLES, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", LAYER_PLACE_CIRCLES, () => {
          map.getCanvas().style.cursor = "";
        });
        map.on("mouseenter", LAYER_LEG_LINES, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", LAYER_LEG_LINES, () => {
          map.getCanvas().style.cursor = "";
        });

        setLoaded(true);
      });

      map.on("error", (e) => {
        console.error("MapLibre error:", e.error);
        if (!map.loaded()) {
          queueMicrotask(() => {
            setError("Map failed to load. Check your connection and try again.");
          });
        }
      });

      return () => {
        map.remove();
        mapRef.current = null;
        initRef.current = false;
      };
    } catch (err) {
      console.error("Map initialisation error:", err);
      initRef.current = false;
      queueMicrotask(() => {
        setError("Could not create the map. Your journey details are shown below.");
      });
      return;
    }
    // Run once — we update sources imperatively on filter/select changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Update place source when filter changes ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource(SOURCE_PLACES) as maplibregl.GeoJSONSource | undefined;
    if (src) {
      src.setData(placesToGeoJSON(getVisiblePlaces(filter)));
    }
  }, [filter, getVisiblePlaces, mapRef]);

  // ---- Update selected leg highlight ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const selectedLegId =
      selected?.kind === "leg" ? selected.leg.id : "";
    map.setFilter(LAYER_LEG_LINES_SELECTED, [
      "==",
      ["get", "id"],
      selectedLegId,
    ]);
  }, [selected, mapRef]);

  // ---- Update selected place halo ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const selectedPlaceId =
      selected?.kind === "place" ? selected.place.id : "";
    map.setFilter(LAYER_PLACE_CIRCLES_SEL, [
      "==",
      ["get", "id"],
      selectedPlaceId,
    ]);
  }, [selected, mapRef]);

  // ---- Fly to selected place ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    if (selected?.kind === "place") {
      moveTo(map, selected.place.coordinates, Math.max(map.getZoom(), 11));
    }
  }, [selected, mapRef]);

  // ---- Resize handling ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const onResize = () => map.resize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [mapRef]);

  return (
    <div className="relative w-full" style={{ height: "clamp(420px, 65vh, 820px)" }}>
      {/* Map container */}
      <div
        ref={containerRef}
        className="w-full h-full border border-basalt/15"
        role="application"
        aria-label="Interactive map of the Faroe Islands showing trip route"
      />

      {/* ---- Custom reset-view button ---- */}
      {loaded && (
        <button
          type="button"
          onClick={resetView}
          className="absolute top-2 left-2 z-10 bg-wool/90 border border-basalt/20 px-2.5 py-1.5 text-[12px] font-medium text-basalt hover:bg-fog/40 transition-colors min-h-[36px] min-w-[36px]"
          aria-label="Reset map to Faroe Islands view"
        >
          ⌂ Reset
        </button>
      )}

      {/* Loading state */}
      {!loaded && !error && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-wool/80 z-10"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-basalt/20 border-t-fjord rounded-full animate-spin" />
            <p className="caption">Loading map…</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-wool/90 z-10"
          aria-live="assertive"
        >
          <div className="max-w-xs text-center">
            <p className="font-medium text-basalt mb-2">Interactive map unavailable</p>
            <p className="caption mb-4">{error}</p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setLoaded(false);
              }}
              className="border border-basalt/30 px-4 py-2 text-[14px] font-medium hover:bg-fog/40 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
