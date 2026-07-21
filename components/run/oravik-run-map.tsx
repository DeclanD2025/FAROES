// =============================================================================
// OravikRunMap — interactive MapLibre GL map for the Øravík 4 km scenic run.
// OpenFreeMap Fiord style, route rendered from GPX, PLAN/TERRAIN views.
// Client-only: imported dynamically with SSR disabled.
// =============================================================================

"use client";

import { useRef, useEffect, useState, useCallback, type RefObject } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  parseGpxToGeoJSON,
  extractTrackCoords,
  validateRoute,
  splitAtDistance,
  generateMarkers,
  routeBounds,
  cumulativeDistances,
  type SplitResult,
  type RouteMarker,
} from "@/lib/route-utils";
import type { LngLat } from "@/lib/route-utils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GPX_PATH = `${process.env.BASE_PATH ?? ""}/routes/oravik-4km-scenic-run.gpx`;
const FIORD_STYLE = "https://tiles.openfreemap.org/styles/fiord";
const TERRAIN_TILES =
  "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";

// Design tokens
const CLARET = "#7c1834";
const AMBER = "#e8aa3c";
const CREAM = "#f7f1e8";
const START_GREEN = "#2b8a62";
const WARNING_RED = "#c7463d";

// MapLibre source/layer IDs
const SRC_ROUTE = "oravik-route";
const SRC_OUTBOUND = "oravik-outbound";
const SRC_RETURN = "oravik-return";
const SRC_ARROWS = "oravik-arrows";
const SRC_MARKERS = "oravik-markers";
const SRC_CROSSHAIR = "oravik-crosshair";
const SRC_TERRAIN = "oravik-terrain";

const LAYER_HALO = "oravik-halo";
const LAYER_OUTBOUND = "oravik-outbound-line";
const LAYER_RETURN = "oravik-return-line";
const LAYER_ARROWS = "oravik-arrows-sym";
const LAYER_MARKER_CIRCLES = "oravik-marker-circles";
const LAYER_MARKER_LABELS = "oravik-marker-labels";
const LAYER_CROSSHAIR = "oravik-crosshair-layer";

// Route constants
const TURNAROUND_KM = 2.0;
const MARKER_INTERVALS = [0, 0.5, 1.0, 1.5, 2.0];
const ARROW_INTERVAL_KM = 0.3; // place an arrow every 300m

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ViewMode = "plan" | "terrain";

interface OravikRunMapProps {
  mapRef: RefObject<maplibregl.Map | null>;
  onRouteLoaded?: (coords: LngLat[], split: SplitResult, totalKm: number) => void;
  onMapError?: (error: string) => void;
  crosshairPoint?: { coordinates: LngLat } | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Compute bearing (degrees clockwise from north) from a to b. */
function bearingDeg(a: LngLat, b: LngLat): number {
  const lon1 = (a[0] * Math.PI) / 180;
  const lat1 = (a[1] * Math.PI) / 180;
  const lon2 = (b[0] * Math.PI) / 180;
  const lat2 = (b[1] * Math.PI) / 180;
  const dLon = lon2 - lon1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Generate arrow marker features along a set of coordinates. */
function arrowFeatures(
  coords: LngLat[],
  dists: number[],
  intervalKm: number,
): GeoJSON.Feature[] {
  const total = dists[dists.length - 1];
  if (total < intervalKm) return [];
  const features: GeoJSON.Feature[] = [];
  for (let km = intervalKm / 2; km < total; km += intervalKm) {
    // find segment
    let si = 0;
    for (let i = 1; i < dists.length; i++) {
      if (dists[i] >= km) {
        si = i - 1;
        break;
      }
    }
    const segLen = dists[si + 1] - dists[si];
    const t = segLen > 0 ? (km - dists[si]) / segLen : 0;
    const a = coords[si];
    const b = coords[si + 1];
    const pt: LngLat = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const brg = bearingDeg(si < coords.length - 2 ? coords[si + 1] : a, b);
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: pt },
      properties: { bearing: brg },
    });
  }
  return features;
}

/** Check for reduced motion preference. */
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function OravikRunMap({
  mapRef,
  onRouteLoaded,
  onMapError,
  crosshairPoint,
}: OravikRunMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("plan");
  const [mapReady, setMapReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routeTotalKm, setRouteTotalKm] = useState<number | null>(null);
  const initRef = useRef(false);
  const routeCoordsRef = useRef<LngLat[] | null>(null);
  const splitRef = useRef<SplitResult | null>(null);
  const onRouteLoadedRef = useRef(onRouteLoaded);
  useEffect(() => {
    onRouteLoadedRef.current = onRouteLoaded;
  });

  // ---- Fit map to route ----
  const fitRoute = useCallback((map: maplibregl.Map, coords: LngLat[]) => {
    const bounds = routeBounds(coords, 0.008);
    if (prefersReducedMotion()) {
      map.fitBounds(bounds, {
        padding: { top: 70, right: 80, bottom: 70, left: 80 },
        animate: false,
      });
    } else {
      map.fitBounds(bounds, {
        padding: { top: 70, right: 80, bottom: 70, left: 80 },
        duration: 900,
      });
    }
  }, []);

  // ---- Add route layers to the map ----
  const addRouteLayers = useCallback(
    (
      map: maplibregl.Map,
      coords: LngLat[],
      outbound: LngLat[],
      returnCoords: LngLat[],
      markers: RouteMarker[],
    ) => {
      // Full route (halo)
      map.addSource(SRC_ROUTE, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: { type: "LineString", coordinates: coords },
          properties: {},
        },
      });

      // Outbound leg
      map.addSource(SRC_OUTBOUND, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: { type: "LineString", coordinates: outbound },
          properties: {},
        },
      });

      // Return leg
      map.addSource(SRC_RETURN, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: { type: "LineString", coordinates: returnCoords },
          properties: {},
        },
      });

      // Arrow markers
      const outDists = cumulativeDistances(outbound);
      const retDists = cumulativeDistances(returnCoords);
      const arrows = [
        ...arrowFeatures(outbound, outDists, ARROW_INTERVAL_KM),
        ...arrowFeatures(returnCoords, retDists, ARROW_INTERVAL_KM).map(
          (f) => ({
            ...f,
            properties: { bearing: (f.properties!.bearing + 180) % 360 },
          }),
        ),
      ];
      map.addSource(SRC_ARROWS, {
        type: "geojson",
        data: { type: "FeatureCollection", features: arrows },
      });

      // Marker circles
      map.addSource(SRC_MARKERS, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: markers.map((m) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: m.coordinates },
            properties: {
              label: m.label,
              isMajor: m.isMajor,
              km: m.km,
            },
          })),
        },
      });

      // Crosshair source (initially empty)
      map.addSource(SRC_CROSSHAIR, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      // ---- Layers (bottom to top) ----

      // 1. Cream halo (full route, thick)
      map.addLayer({
        id: LAYER_HALO,
        type: "line",
        source: SRC_ROUTE,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": CREAM,
          "line-width": ["interpolate", ["linear"], ["zoom"], 12, 8, 15, 14],
          "line-opacity": 0.9,
        },
      });

      // 2. Claret outbound (solid, offset left)
      map.addLayer({
        id: LAYER_OUTBOUND,
        type: "line",
        source: SRC_OUTBOUND,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": CLARET,
          "line-width": ["interpolate", ["linear"], ["zoom"], 12, 3.5, 15, 6],
          "line-opacity": 0.92,
          "line-offset": ["interpolate", ["linear"], ["zoom"], 12, 2.5, 15, 4],
        },
      });

      // 3. Amber return (dashed, offset right)
      map.addLayer({
        id: LAYER_RETURN,
        type: "line",
        source: SRC_RETURN,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": AMBER,
          "line-width": ["interpolate", ["linear"], ["zoom"], 12, 3.5, 15, 6],
          "line-opacity": 0.92,
          "line-dasharray": [6, 4],
          "line-offset": [
            "interpolate",
            ["linear"],
            ["zoom"],
            12,
            -2.5,
            15,
            -4,
          ],
        },
      });

      // 4. Direction arrows
      map.addLayer({
        id: LAYER_ARROWS,
        type: "symbol",
        source: SRC_ARROWS,
        layout: {
          "text-field": "▶",
          "text-font": ["Open Sans Bold", "Noto Sans Bold"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 12, 9, 15, 12],
          "text-rotate": ["get", "bearing"],
          "text-rotation-alignment": "map",
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: {
          "text-color": [
            "case",
            [">=", ["get", "bearing"], 180],
            AMBER,
            CLARET,
          ],
          "text-opacity": 0.7,
          "text-halo-color": CREAM,
          "text-halo-width": 1.5,
        },
      });

      // 5. Marker circles
      map.addLayer({
        id: LAYER_MARKER_CIRCLES,
        type: "circle",
        source: SRC_MARKERS,
        paint: {
          "circle-radius": [
            "case",
            ["get", "isMajor"],
            7,
            5,
          ],
          "circle-color": [
            "case",
            ["==", ["get", "km"], 0],
            START_GREEN,
            ["==", ["get", "km"], 2],
            AMBER,
            CLARET,
          ],
          "circle-stroke-color": CREAM,
          "circle-stroke-width": 2,
          "circle-opacity": 1,
        },
      });

      // 6. Marker labels
      map.addLayer({
        id: LAYER_MARKER_LABELS,
        type: "symbol",
        source: SRC_MARKERS,
        layout: {
          "text-field": ["get", "label"],
          "text-font": ["Open Sans Semibold", "Noto Sans Regular"],
          "text-size": ["case", ["get", "isMajor"], 10, 9],
          "text-offset": [0, -1.8],
          "text-anchor": "bottom",
          "text-allow-overlap": false,
          "text-optional": true,
        },
        paint: {
          "text-color": ["case", ["get", "isMajor"], "#1a1a1a", "#3a3a3a"],
          "text-halo-color": CREAM,
          "text-halo-width": 2,
        },
      });

      // 7. Crosshair layer (responsive, always on top)
      map.addLayer({
        id: LAYER_CROSSHAIR,
        type: "circle",
        source: SRC_CROSSHAIR,
        paint: {
          "circle-radius": 8,
          "circle-color": WARNING_RED,
          "circle-stroke-color": "#fff",
          "circle-stroke-width": 3,
          "circle-opacity": 1,
        },
      });
    },
    [],
  );

  // ---- Reset to PLAN view ----
  const resetView = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    setViewMode("plan");
    map.easeTo({ bearing: 0, pitch: 0, duration: prefersReducedMotion() ? 0 : 600 });
  }, [mapRef]);

  // ---- Toggle PLAN / TERRAIN ----
  const toggleTerrain = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const next = viewMode === "plan" ? "terrain" : "plan";
    setViewMode(next);
    if (next === "terrain") {
      map.easeTo({
        bearing: -12,
        pitch: 42,
        duration: prefersReducedMotion() ? 0 : 800,
      });
    } else {
      map.easeTo({
        bearing: 0,
        pitch: 0,
        duration: prefersReducedMotion() ? 0 : 600,
      });
    }
  }, [mapRef, viewMode]);

  // ---- Update crosshair ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource(SRC_CROSSHAIR) as maplibregl.GeoJSONSource | undefined;
    if (!src) return;
    if (crosshairPoint?.coordinates) {
      src.setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "Point", coordinates: crosshairPoint.coordinates },
            properties: {},
          },
        ],
      });
    } else {
      src.setData({ type: "FeatureCollection", features: [] });
    }
  }, [crosshairPoint, mapRef]);

  // ---- Map initialisation ----
  useEffect(() => {
    if (initRef.current || !containerRef.current) return;
    initRef.current = true;

    let map: maplibregl.Map;

    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: FIORD_STYLE,
        center: [-6.795, 61.531],
        zoom: 13,
        minZoom: 11,
        maxZoom: 16,
        bearing: 0,
        pitch: 0,
        dragRotate: true,
        touchPitch: true,
        renderWorldCopies: false,
        cooperativeGestures: true,
        attributionControl: { compact: true },
      });

      mapRef.current = map;

      map.addControl(
        new maplibregl.NavigationControl({ showCompass: true, showZoom: true }),
        "top-right",
      );

      map.on("load", async () => {
        // Add terrain DEM source
        map.addSource(SRC_TERRAIN, {
          type: "raster-dem",
          tiles: [TERRAIN_TILES],
          tileSize: 256,
          encoding: "terrarium",
          maxzoom: 15,
        });
        map.setTerrain({ source: SRC_TERRAIN, exaggeration: 1.2 });

        setMapReady(true);

        // Fetch and parse GPX
        try {
          const resp = await fetch(GPX_PATH, { cache: "no-cache" });
          if (!resp.ok) {
            throw new Error(`GPX fetch failed: ${resp.status} ${resp.statusText}`);
          }
          const xml = await resp.text();
          const fc = parseGpxToGeoJSON(xml);
          const coords = extractTrackCoords(fc);

          const validation = validateRoute(coords, 4.0, 1.5);
          if (!validation.valid || !validation.coords) {
            setError(validation.error ?? "Invalid route data.");
            onMapError?.(validation.error ?? "Invalid route.");
            setLoading(false);
            return;
          }

          const validCoords = validation.coords;
          routeCoordsRef.current = validCoords;
          setRouteTotalKm(validation.totalKm);

          const split = splitAtDistance(validCoords, TURNAROUND_KM);
          if (!split) {
            setError("Could not determine turnaround point. Route data may be incorrect.");
            setLoading(false);
            return;
          }
          splitRef.current = split;

          const markers = generateMarkers(validCoords, MARKER_INTERVALS);

          addRouteLayers(map, validCoords, split.before, split.after, markers);
          fitRoute(map, validCoords);

          onRouteLoadedRef.current?.(validCoords, split, validation.totalKm);
          setLoading(false);
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "Failed to load route data.";
          setError(msg);
          onMapError?.(msg);
          setLoading(false);
        }
      });

      map.on("error", (e) => {
        console.error("MapLibre error:", e.error);
      });

      return () => {
        map.remove();
        mapRef.current = null;
        initRef.current = false;
      };
    } catch (err) {
      console.error("Map init error:", err);
      initRef.current = false;
      setError("Could not create the map. Route details are shown below.");
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Resize handler ----
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const onResize = () => map.resize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [mapRef]);

  // ---- Fallback text if map fails ----
  const routeFallback = (
    <div className="border border-basalt/15 bg-fog/10 rounded-[7px] p-5" role="alert">
      <p className="font-medium text-basalt mb-1">Øravík 4 km Scenic Run</p>
      <p className="text-[13px] text-basalt/70">
        Við á 7 → old surface road → Tjaldavík turnaround (2 km) → retrace.
      </p>
      <p className="text-[12px] text-rust/70 mt-2 font-medium">
        Stay on the surface road. Do not enter Hovstunnilin.
      </p>
    </div>
  );

  return (
    <div className="relative w-full" role="region" aria-label="Øravík 4 km run route map">
      {/* Map container */}
      <div
        ref={containerRef}
        className="w-full"
        style={{ height: "clamp(380px, 58vh, 680px)" }}
        role="application"
        aria-label="Interactive running route map"
      />

      {/* Loading overlay */}
      {loading && !error && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-wool/80 z-10"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-basalt/20 border-t-claret rounded-full animate-spin" />
            <p className="text-[13px] text-basalt/60">Loading route…</p>
          </div>
        </div>
      )}

      {/* Error overlay with fallback */}
      {error && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-wool/95 z-10"
          aria-live="assertive"
        >
          <div className="max-w-sm text-center px-4">
            {routeFallback}
            <button
              type="button"
              onClick={() => {
                setError(null);
                setLoading(true);
                initRef.current = false;
              }}
              className="mt-3 border border-basalt/30 px-4 py-2 text-[13px] font-medium hover:bg-fog/20 transition-colors focus-visible:outline-2 focus-visible:outline-navy"
            >
              Retry map
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      {mapReady && !error && (
        <div className="absolute bottom-3 left-3 flex gap-2 z-10">
          {/* VIEW MODE TOGGLE */}
          <button
            type="button"
            onClick={toggleTerrain}
            className="bg-wool/95 backdrop-blur-sm border border-basalt/20 rounded-[6px] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-basalt hover:border-claret/30 transition-colors focus-visible:outline-2 focus-visible:outline-navy shadow-sm"
            aria-pressed={viewMode === "terrain"}
          >
            {viewMode === "terrain" ? "PLAN" : "TERRAIN"}
          </button>

          {/* RESET VIEW */}
          <button
            type="button"
            onClick={resetView}
            className="bg-wool/95 backdrop-blur-sm border border-basalt/20 rounded-[6px] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-basalt hover:border-claret/30 transition-colors focus-visible:outline-2 focus-visible:outline-navy shadow-sm"
          >
            Reset
          </button>

          {/* Route stats */}
          {routeTotalKm !== null && (
            <span className="bg-wool/95 backdrop-blur-sm border border-basalt/20 rounded-[6px] px-3 py-1.5 text-[11px] font-medium text-basalt/70 shadow-sm hidden sm:flex items-center gap-2">
              <span className="code tnum">{routeTotalKm.toFixed(1)} km</span>
              <span className="text-basalt/30">·</span>
              <span>Out &amp; back</span>
            </span>
          )}
        </div>
      )}

      {/* Legend */}
      {mapReady && !error && (
        <div className="absolute top-3 right-10 z-10 flex gap-3 text-[10px] uppercase tracking-[0.06em]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#7c1834]" />
            <span className="text-basalt/70">Outbound</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-0.5"
              style={{
                background: `repeating-linear-gradient(90deg, #e8aa3c 0px, #e8aa3c 5px, transparent 5px, transparent 8px)`,
              }}
            />
            <span className="text-basalt/70">Return</span>
          </span>
        </div>
      )}
    </div>
  );
}
