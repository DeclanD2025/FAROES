// =============================================================================
// FaroesMap — clean, minimal interactive map.
// Positron basemap, built-in nav controls, compact route lines and markers.
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

import { JOURNEY_STOPS, ALL_PLACES, FAROE_MAX_BOUNDS, type TripPlace } from "@/lib/data/faroes-places";
import { JOURNEY_LEGS, type JourneyLeg } from "@/lib/data/faroes-journey-legs";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type SelectedFeature =
  | { kind: "place"; place: TripPlace }
  | { kind: "leg"; leg: JourneyLeg }
  | null;

export type MapFilter = "journey" | "places" | "match" | "stay" | "suðuroy" | "run-oravik";

interface FaroesMapProps {
  onSelect: (feature: SelectedFeature) => void;
  selected: SelectedFeature;
  filter: MapFilter;
  mapRef: RefObject<maplibregl.Map | null>;
  height?: string | number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const MAP_STYLE =
  process.env.NEXT_PUBLIC_MAP_STYLE_URL ??
  "https://tiles.openfreemap.org/styles/positron";

const SOURCE_PLACES = "faroes-places";
const SOURCE_LEGS = "faroes-legs";

const LAYER_LEG_LINES = "faroes-leg-lines";
const LAYER_LEG_LINES_SEL = "faroes-leg-lines-selected";
const LAYER_PLACE_CIRCLES = "faroes-place-circles";
const LAYER_PLACE_CIRCLES_SEL = "faroes-place-circles-selected";
const LAYER_PLACE_NUMBERS = "faroes-place-numbers";
const LAYER_PLACE_LABELS = "faroes-place-labels";

const RUST = "#C44338";
const AMBER = "#d69a32";
const BASALT = "#283035";

// ---------------------------------------------------------------------------
// Itinerary boundary
// ---------------------------------------------------------------------------
function itineraryBounds(): [[number, number], [number, number]] {
  const coords = ALL_PLACES.map((p) => p.coordinates);
  const lons = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);
  const pad = 0.06;
  return [
    [Math.min(...lons) - pad, Math.min(...lats) - pad],
    [Math.max(...lons) + pad, Math.max(...lats) + pad],
  ];
}

// ---------------------------------------------------------------------------
// Merge overlapping Tórshavn markers
// ---------------------------------------------------------------------------
function mergeOverlapping(places: TripPlace[]): TripPlace[] {
  const result: TripPlace[] = [];
  for (const p of places) {
    if (p.id === "torshavn-ferry") continue;
    if (p.id === "torshavn") {
      result.push({
        ...p,
        displayName: "Tórshavn · Bus + Ferry",
        description:
          "Bus 300 terminates here (~19:45). Ferry terminal is a short walk. M/F Smyril departs 21:15 for Suðuroy.",
        practicalNote:
          "1h 30m between bus and ferry. Grab food near the harbour.",
        service: "Bus 300 · M/F Smyril",
      });
    } else {
      result.push(p);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// GeoJSON helpers
// ---------------------------------------------------------------------------
function placesToGeoJSON(places: TripPlace[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: mergeOverlapping(places).map((p) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: p.coordinates },
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
// Motion helpers
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

function fitBoundsAnimated(
  map: maplibregl.Map,
  bounds: [[number, number], [number, number]],
  padding: number
) {
  if (prefersReducedMotion()) {
    map.fitBounds(bounds, { padding, animate: false });
  } else {
    map.fitBounds(bounds, { padding, duration: 800 });
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
  height,
}: FaroesMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initRef = useRef(false);

  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  });

  const placeById = useCallback(
    (id: string) => ALL_PLACES.find((p) => p.id === id) ?? null,
    []
  );
  const legById = useCallback(
    (id: string) => JOURNEY_LEGS.find((l) => l.id === id) ?? null,
    []
  );

  // ---- Visible places by filter ----
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
            p.id === "torshavn" ||
            p.id === "torshavn-ferry"
        );
      case "stay":
        return ALL_PLACES.filter(
          (p) => p.id === "oravik" || p.id === "krambatangi"
        );
      case "suðuroy":
        return ALL_PLACES.filter(
          (p) =>
            p.id === "oravik" ||
            p.id === "krambatangi" ||
            p.id === "hov" ||
            p.id === "hvannhagi" ||
            p.id === "beinisvord" ||
            p.id === "tvoroyri" ||
            p.id === "akraberg"
        );
      case "run-oravik":
        return ALL_PLACES.filter(
          (p) =>
            p.id === "oravik" ||
            p.id === "krambatangi"
        );
      default:
        return JOURNEY_STOPS;
    }
  }, []);

  // ---- Fit trip ----
  const fitTrip = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const places = getVisiblePlaces(filter);
    if (places.length === 0) return;
    const coords = places.map((p) => p.coordinates);
    const lons = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);
    const pad = 0.03;
    const sw: [number, number] = [
      Math.min(...lons) - pad,
      Math.min(...lats) - pad,
    ];
    const ne: [number, number] = [
      Math.max(...lons) + pad,
      Math.max(...lats) + pad,
    ];
    fitBoundsAnimated(map, [sw, ne], 70);
  }, [mapRef, filter, getVisiblePlaces]);

  // ---- Filter → viewport ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    if (filter === "match") {
      const venue = ALL_PLACES.find((p) => p.id === "torsvollur");
      if (venue) {
        fitBoundsAnimated(
          map,
          [
            [venue.coordinates[0] - 0.02, venue.coordinates[1] - 0.01],
            [venue.coordinates[0] + 0.02, venue.coordinates[1] + 0.02],
          ],
          40
        );
      }
    } else if (filter === "stay") {
      fitBoundsAnimated(map, [[-6.84, 61.52], [-6.78, 61.56]], 40);
    } else if (filter === "suðuroy") {
      fitBoundsAnimated(map, [[-6.84, 61.38], [-6.76, 61.57]], 60);
    } else if (filter === "run-oravik") {
      fitBoundsAnimated(map, [[-6.821, 61.528], [-6.806, 61.540]], 40);
    } else {
      fitBoundsAnimated(map, itineraryBounds(), 70);
    }
  }, [filter, mapRef]);

  // ---- Map init ----
  useEffect(() => {
    if (initRef.current || !containerRef.current) return;
    initRef.current = true;

    try {
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: MAP_STYLE,
        bounds: itineraryBounds(),
        maxBounds: FAROE_MAX_BOUNDS,
        minZoom: 7,
        maxZoom: 15,
        bearing: 0,
        pitch: 0,
        dragRotate: false,
        touchPitch: false,
        renderWorldCopies: false,
        cooperativeGestures: true,
        attributionControl: { compact: true },
      });

      mapRef.current = map;

      // Built-in navigation control (clean, standard look)
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

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

        // ---- Routes: single thin line, semantic dashes ----
        map.addLayer({
          id: LAYER_LEG_LINES,
          type: "line",
          source: SOURCE_LEGS,
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": AMBER,
            "line-width": 2.5,
            "line-opacity": 0.85,
            "line-dasharray": [
              "match",
              ["get", "mode"],
              "ferry",
              ["literal", [6, 3]],
              "walk",
              ["literal", [2, 2]],
              ["literal", [1, 0]],
            ],
          },
        });

        // ---- Selected leg ----
        map.addLayer({
          id: LAYER_LEG_LINES_SEL,
          type: "line",
          source: SOURCE_LEGS,
          filter: ["==", ["get", "id"], ""],
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": RUST,
            "line-width": 3,
            "line-opacity": 1,
          },
        });

        // ---- Place markers (small, clean circles) ----
        map.addLayer({
          id: LAYER_PLACE_CIRCLES,
          type: "circle",
          source: SOURCE_PLACES,
          paint: {
            "circle-radius": ["case", ["has", "routeSequence"], 9, 6],
            "circle-color": [
              "match",
              ["get", "category"],
              "match",
              RUST,
              "accommodation",
              "#4a7c59",
              "airport",
              "#5b7fa5",
              AMBER,
            ],
            "circle-stroke-color": "#fff",
            "circle-stroke-width": 2,
            "circle-opacity": 1,
          },
        });

        // ---- Selected marker ----
        map.addLayer({
          id: LAYER_PLACE_CIRCLES_SEL,
          type: "circle",
          source: SOURCE_PLACES,
          filter: ["==", ["get", "id"], ""],
          paint: {
            "circle-radius": 13,
            "circle-color": RUST,
            "circle-stroke-color": "#fff",
            "circle-stroke-width": 3,
            "circle-opacity": 1,
          },
        });

        // ---- Sequence numbers ----
        map.addLayer({
          id: LAYER_PLACE_NUMBERS,
          type: "symbol",
          source: SOURCE_PLACES,
          filter: ["has", "routeSequence"],
          layout: {
            "text-field": ["to-string", ["get", "routeSequence"]],
            "text-font": ["Open Sans Bold", "Noto Sans Bold"],
            "text-size": 9,
            "text-offset": [0, 0],
          },
          paint: {
            "text-color": "#fff",
          },
        });

        // ---- Place labels ----
        map.addLayer({
          id: LAYER_PLACE_LABELS,
          type: "symbol",
          source: SOURCE_PLACES,
          layout: {
            "text-field": ["get", "name"],
            "text-font": ["Open Sans Semibold", "Noto Sans Regular"],
            "text-size": 10,
            "text-offset": [0, 1.5],
            "text-anchor": "top",
            "text-optional": true,
          },
          paint: {
            "text-color": BASALT,
            "text-halo-color": "rgba(255,255,255,0.85)",
            "text-halo-width": 2,
          },
          minzoom: 9,
        });

        // Click handlers
        map.on("click", LAYER_PLACE_CIRCLES, (e) => {
          if (!e.features?.[0]) return;
          const place = placeById(e.features[0].properties.id);
          if (place) onSelectRef.current({ kind: "place", place });
        });

        map.on("click", LAYER_LEG_LINES, (e) => {
          if (!e.features?.[0]) return;
          const leg = legById(e.features[0].properties.id);
          if (leg) onSelectRef.current({ kind: "leg", leg });
        });

        // Cursors
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
          queueMicrotask(() =>
            setError("Map failed to load. Check your connection and try again.")
          );
        }
      });

      return () => {
        map.remove();
        mapRef.current = null;
        initRef.current = false;
      };
    } catch (err) {
      console.error("Map init error:", err);
      initRef.current = false;
      queueMicrotask(() =>
        setError(
          "Could not create the map. Your journey details are shown below."
        )
      );
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Update place source when filter changes ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource(SOURCE_PLACES) as
      | maplibregl.GeoJSONSource
      | undefined;
    if (src) src.setData(placesToGeoJSON(getVisiblePlaces(filter)));
  }, [filter, getVisiblePlaces, mapRef]);

  // ---- Update selected leg ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    map.setFilter(LAYER_LEG_LINES_SEL, [
      "==",
      ["get", "id"],
      selected?.kind === "leg" ? selected.leg.id : "",
    ]);
  }, [selected, mapRef]);

  // ---- Update selected place ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    map.setFilter(LAYER_PLACE_CIRCLES_SEL, [
      "==",
      ["get", "id"],
      selected?.kind === "place" ? selected.place.id : "",
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

  // ---- Resize ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const onResize = () => map.resize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [mapRef]);

  return (
    <div
      className="relative w-full"
      style={{ height: height ?? "clamp(420px, 65vh, 820px)" }}
    >
      <div
        ref={containerRef}
        className="w-full h-full"
        role="application"
        aria-label="Interactive map of the Faroe Islands"
      />

      {/* Loading */}
      {!loaded && !error && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-wool/80 z-10"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-basalt/20 border-t-amber rounded-full animate-spin" />
            <p className="caption">Loading map…</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-wool/90 z-10"
          aria-live="assertive"
        >
          <div className="max-w-xs text-center">
            <p className="font-medium text-basalt mb-2">Map unavailable</p>
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
