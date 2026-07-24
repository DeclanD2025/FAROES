// =============================================================================
// OravikRunMap — interactive MapLibre GL map for the Øravík Fell Loop.
// Liberty style, loop rendered in two sections (trail + road return),
// Client-only: imported dynamically with SSR disabled.
// =============================================================================

"use client";

import { useRef, useEffect, useState, useCallback, type RefObject } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  parseGpxToGeoJSON,
  extractTrackCoords,
  cumulativeDistances,
  routeBounds,
  splitAtDistance,
  pointAtDistance,
} from "@/lib/route-utils";
import type { LngLat } from "@/lib/route-utils";
import { length, lineString } from "@turf/turf";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

function getGpxUrl(): string {
  if (typeof window === "undefined") return "/routes/oravik-fell-loop.gpx";
  return new URL("../../routes/oravik-fell-loop.gpx", window.location.href).href;
}

const LIBERTY_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const TERRAIN_TILES =
  "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";

// Design tokens
const CLARET = "#7c1834";
const OCHRE = "#d78b25";
const CREAM = "#f7f1e8";
const START_GREEN = "#2b8a62";
const WARNING_RED = "#c7463d";
const ACCOMMODATION_BLUE = "#4a6fa5";

// MapLibre source/layer IDs
const SRC_ROUTE = "oravik-route";
const SRC_TRAIL = "oravik-trail";
const SRC_ROAD = "oravik-road";
const SRC_CHEVRONS = "oravik-chevrons";
const SRC_MARKERS = "oravik-markers";
const SRC_CROSSHAIR = "oravik-crosshair";
const SRC_TERRAIN = "oravik-terrain";

const LAYER_HALO = "oravik-halo";
const LAYER_TRAIL = "oravik-trail-line";
const LAYER_ROAD = "oravik-road-line";
const LAYER_CHEVRONS = "oravik-chevrons-sym";
const LAYER_MARKER_CIRCLES = "oravik-marker-circles";
const LAYER_MARKER_LABELS = "oravik-marker-labels";
const LAYER_CROSSHAIR = "oravik-crosshair-layer";

// Route constants
const TRANSITION_KM = 1.532;
const EXPECTED_KM = 4.131;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ViewMode = "plan" | "terrain";

interface OravikRunMapProps {
  mapRef: RefObject<maplibregl.Map | null>;
  onRouteLoaded?: (coords: LngLat[], totalKm: number) => void;
  onMapError?: (error: string) => void;
  crosshairPoint?: { coordinates: LngLat } | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
  const [viewMode, setViewMode] = useState<ViewMode>("terrain");
  const [mapReady, setMapReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routeTotalKm, setRouteTotalKm] = useState<number | null>(null);
  const initRef = useRef(false);
  const routeCoordsRef = useRef<LngLat[] | null>(null);
  const viewModeRef = useRef<ViewMode>("terrain");
  const onRouteLoadedRef = useRef(onRouteLoaded);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    onRouteLoadedRef.current = onRouteLoaded;
  });

  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

  // ---- Reset view ----
  const resetView = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    setViewMode("plan");
    map.easeTo({ bearing: 0, pitch: 0, duration: prefersReducedMotion() ? 0 : 600 });
  }, []);

  // ---- Toggle terrain (does NOT recreate map) ----
  const toggleTerrain = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const current = viewModeRef.current;
    const next: ViewMode = current === "plan" ? "terrain" : "plan";
    setViewMode(next);
    if (next === "terrain") {
      map.setTerrain({ source: SRC_TERRAIN, exaggeration: 1.1 });
      map.easeTo({ bearing: 72, pitch: 43, duration: prefersReducedMotion() ? 0 : 800 });
    } else {
      map.setTerrain(null);
      map.easeTo({ bearing: 0, pitch: 0, duration: prefersReducedMotion() ? 0 : 600 });
    }
  }, []);

  // ---- Crosshair updates ----
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource(SRC_CROSSHAIR) as maplibregl.GeoJSONSource | undefined;
    if (!src) return;
    if (crosshairPoint?.coordinates) {
      src.setData({
        type: "FeatureCollection",
        features: [{
          type: "Feature",
          geometry: { type: "Point", coordinates: crosshairPoint.coordinates },
          properties: {},
        }],
      });
    } else {
      src.setData({ type: "FeatureCollection", features: [] });
    }
  }, [crosshairPoint]);

  // ---- Map initialisation (once only) ----
  useEffect(() => {
    if (initRef.current || !containerRef.current) return;
    initRef.current = true;

    let map: maplibregl.Map;

    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: LIBERTY_STYLE,
        center: [-6.819, 61.529],
        zoom: 13.2,
        minZoom: 11,
        maxZoom: 16,
        bearing: 72,
        pitch: 43,
        dragRotate: true,
        touchPitch: true,
        renderWorldCopies: false,
        cooperativeGestures: true,
        attributionControl: { compact: true },
      });

      mapRef.current = map;
      mapInstanceRef.current = map;

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
        map.setTerrain({ source: SRC_TERRAIN, exaggeration: 1.1 });

        setMapReady(true);

        // Fetch and parse GPX
        try {
          const gpxUrl = getGpxUrl();
          const resp = await fetch(gpxUrl, { cache: "no-cache" });
          if (!resp.ok) {
            throw new Error(`GPX fetch failed: ${resp.status} ${resp.statusText}`);
          }
          const xml = await resp.text();

          // Check for XML parse errors
          const parser = new DOMParser();
          const testDoc = parser.parseFromString(xml, "text/xml");
          if (testDoc.querySelector("parsererror")) {
            throw new Error("Failed to parse GPX XML — file may be corrupt.");
          }

          const fc = parseGpxToGeoJSON(xml);
          const coords = extractTrackCoords(fc);

          if (!coords || coords.length < 2) {
            setError("No route coordinates found in GPX file.");
            setLoading(false);
            return;
          }

          // Validate distance with Turf
          const totalKm = length(lineString(coords), { units: "kilometers" });
          if (totalKm < 3.5 || totalKm > 5.0) {
            setError(`Route length is ${totalKm.toFixed(2)} km — outside expected range.`);
            setLoading(false);
            return;
          }

          routeCoordsRef.current = coords;
          setRouteTotalKm(totalKm);

          // Split at the trail-to-road transition (~1.53 km)
          const split = splitAtDistance(coords, TRANSITION_KM);
          if (!split) {
            setError("Could not determine trail-to-road transition point.");
            setLoading(false);
            return;
          }

          // Build layers
          addRouteLayers(map, coords, split.before, split.after);

          // Fit to route
          const bounds = routeBounds(coords, 0.012);
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

          onRouteLoadedRef.current?.(coords, totalKm);

          // Re-apply terrain view after fitBounds
          map.easeTo({ bearing: 72, pitch: 43, duration: prefersReducedMotion() ? 0 : 800 });

          setLoading(false);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Failed to load route data.";
          setError(msg);
          onMapError?.(msg);
          setLoading(false);
        }
      });

      map.on("error", (e) => {
        console.error("MapLibre error:", e.error);
        if (!map.loaded()) {
          setError("Map failed to load. Check your connection and try again.");
          setLoading(false);
        }
      });

      return () => {
        map.remove();
        mapRef.current = null;
        mapInstanceRef.current = null;
        initRef.current = false;
      };
    } catch (err) {
      console.error("Map init error:", err);
      initRef.current = false;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("Could not create the map. Route details are shown below.");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Resize handler ----
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const onResize = () => map.resize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ---- Fallback panel ----
  const routeFallback = (
    <div className="border border-basalt/15 bg-fog/10 rounded-[7px] p-5" role="alert">
      <p className="font-medium text-basalt mb-1">Øravík Fell Loop</p>
      <p className="text-[13px] text-basalt/70">
        Bønhúsið → official village path west → route 99 / old-track return → Bønhúsið.
      </p>
      <p className="text-[12px] text-rust/70 mt-2 font-medium">
        Challenging mixed-surface fell run. Do not use in fog, darkness, heavy rain or strong wind.
        Do not enter Fámjinstunnilin or Hovstunnilin.
      </p>
      <p className="text-[12px] text-basalt/50 mt-1">
        ~4.13 km loop. Trail + road. ~222 m ascent. ~55–75 min.
      </p>
    </div>
  );

  const displayKm = routeTotalKm !== null ? routeTotalKm.toFixed(2) : "4.13";

  return (
    <div className="relative w-full" role="region" aria-label="Øravík Fell Loop route map">
      <div
        ref={containerRef}
        className="w-full"
        style={{ height: "clamp(380px, 58vh, 680px)" }}
        role="application"
        aria-label="Interactive fell-running route map"
      />

      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-wool/80 z-10" aria-live="polite">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-basalt/20 border-t-claret rounded-full animate-spin" />
            <p className="text-[13px] text-basalt/60">Loading route…</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-wool/95 z-10" aria-live="assertive">
          <div className="max-w-sm text-center px-4">
            <p className="text-[11px] text-rust font-medium mb-2 break-words">Map error: {error}</p>
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

      {mapReady && !error && (
        <div className="absolute bottom-3 left-3 flex gap-2 z-10 flex-wrap">
          <button
            type="button"
            onClick={toggleTerrain}
            className="bg-wool/95 backdrop-blur-sm border border-basalt/20 rounded-[6px] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-basalt hover:border-claret/30 transition-colors focus-visible:outline-2 focus-visible:outline-navy shadow-sm"
            aria-pressed={viewMode === "terrain"}
            aria-label={viewMode === "terrain" ? "Switch to plan view" : "Switch to terrain view"}
          >
            {viewMode === "terrain" ? "PLAN" : "TERRAIN"}
          </button>
          <button
            type="button"
            onClick={resetView}
            className="bg-wool/95 backdrop-blur-sm border border-basalt/20 rounded-[6px] px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-basalt hover:border-claret/30 transition-colors focus-visible:outline-2 focus-visible:outline-navy shadow-sm"
            aria-label="Reset map view"
          >
            Reset
          </button>
          {routeTotalKm !== null && (
            <span className="bg-wool/95 backdrop-blur-sm border border-basalt/20 rounded-[6px] px-3 py-1.5 text-[11px] font-medium text-basalt/70 shadow-sm hidden sm:flex items-center gap-2">
              <span className="code tnum">{displayKm} km</span>
              <span className="text-basalt/30">·</span>
              <span>Loop</span>
            </span>
          )}
        </div>
      )}

      {mapReady && !error && (
        <div className="absolute top-3 right-10 z-10 flex gap-3 text-[10px] uppercase tracking-[0.06em]" role="complementary" aria-label="Route legend">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 block" style={{ backgroundColor: CLARET }} />
            <span className="text-basalt/70">Trail</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 block" style={{ backgroundColor: OCHRE }} />
            <span className="text-basalt/70">Road return</span>
          </span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// addRouteLayers — adds sources and layers to the map. Extracted from
// component to avoid re-creating callbacks.
// ---------------------------------------------------------------------------

function addRouteLayers(
  map: maplibregl.Map,
  coords: LngLat[],
  trail: LngLat[],
  road: LngLat[],
) {
  // Full route source (halo)
  map.addSource(SRC_ROUTE, {
    type: "geojson",
    data: {
      type: "Feature",
      geometry: { type: "LineString", coordinates: coords },
      properties: {},
    },
  });

  // Trail section
  map.addSource(SRC_TRAIL, {
    type: "geojson",
    data: {
      type: "Feature",
      geometry: { type: "LineString", coordinates: trail },
      properties: {},
    },
  });

  // Road return section
  map.addSource(SRC_ROAD, {
    type: "geojson",
    data: {
      type: "Feature",
      geometry: { type: "LineString", coordinates: road },
      properties: {},
    },
  });

  // Chevrons — 3 on trail, 3 on road
  const trailDists = cumulativeDistances(trail);
  const roadDists = cumulativeDistances(road);

  const chevrons: GeoJSON.Feature[] = [];
  for (const { seg, distArr, count, section } of [
    { seg: trail, distArr: trailDists, count: 3, section: "trail" },
    { seg: road, distArr: roadDists, count: 3, section: "road" },
  ]) {
    const total = distArr[distArr.length - 1];
    const step = total / (count + 1);
    for (let i = 1; i <= count; i++) {
      const km = step * i;
      const pt = pointAtDistance(seg, distArr, km);
      let si = 0;
      for (let j = 1; j < distArr.length; j++) {
        if (distArr[j] >= km) { si = j - 1; break; }
      }
      const brg = bearingDeg(si < seg.length - 2 ? seg[si + 1] : seg[si], seg[si + 1] ?? seg[si]);
      chevrons.push({
        type: "Feature",
        geometry: { type: "Point", coordinates: pt },
        properties: { bearing: brg, section },
      });
    }
  }

  map.addSource(SRC_CHEVRONS, {
    type: "geojson",
    data: { type: "FeatureCollection", features: chevrons },
  });

  // Markers — compute dists once
  const dists = cumulativeDistances(coords);
  const markers: { coordinates: LngLat; label: string; sublabel: string; isMajor: boolean; color: string; km: number }[] = [
    { coordinates: [-6.810877108946443, 61.53244980610907], label: "Bønhúsið", sublabel: "Start and finish", isMajor: true, color: START_GREEN, km: 0 },
    { coordinates: [-6.81211389, 61.53326111], label: "Við á 7", sublabel: "112 m walk to start", isMajor: true, color: ACCOMMODATION_BLUE, km: -1 },
    { coordinates: [-6.831779228523374, 61.525677144527435], label: "Leave village path", sublabel: "Join route 99 / old-road return", isMajor: true, color: OCHRE, km: 1.5 },
    { coordinates: pointAtDistance(coords, dists, 1.0), label: "1 km", sublabel: "", isMajor: false, color: CLARET, km: 1 },
    { coordinates: pointAtDistance(coords, dists, 2.0), label: "2 km", sublabel: "", isMajor: false, color: CLARET, km: 2 },
    { coordinates: pointAtDistance(coords, dists, 3.0), label: "3 km", sublabel: "", isMajor: false, color: CLARET, km: 3 },
    { coordinates: pointAtDistance(coords, dists, 4.0), label: "4 km", sublabel: "", isMajor: false, color: CLARET, km: 4 },
  ];

  map.addSource(SRC_MARKERS, {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: markers.map((m) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: m.coordinates },
        properties: { label: m.label, sublabel: m.sublabel, isMajor: m.isMajor, color: m.color, km: m.km },
      })),
    },
  });

  // Crosshair
  map.addSource(SRC_CROSSHAIR, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });

  // ---- Layers ----

  // 1. Cream halo
  map.addLayer({
    id: LAYER_HALO,
    type: "line",
    source: SRC_ROUTE,
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": CREAM,
      "line-width": ["interpolate", ["linear"], ["zoom"], 12, 7, 15, 12],
      "line-opacity": 0.9,
    },
  });

  // 2. Claret trail
  map.addLayer({
    id: LAYER_TRAIL,
    type: "line",
    source: SRC_TRAIL,
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": CLARET,
      "line-width": ["interpolate", ["linear"], ["zoom"], 12, 3, 15, 5.5],
      "line-opacity": 0.92,
    },
  });

  // 3. Ochre road return
  map.addLayer({
    id: LAYER_ROAD,
    type: "line",
    source: SRC_ROAD,
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": OCHRE,
      "line-width": ["interpolate", ["linear"], ["zoom"], 12, 3, 15, 5.5],
      "line-opacity": 0.9,
    },
  });

  // 4. Directional chevrons
  map.addLayer({
    id: LAYER_CHEVRONS,
    type: "symbol",
    source: SRC_CHEVRONS,
    layout: {
      "text-field": "▶",
      "text-font": ["Open Sans Bold", "Noto Sans Bold"],
      "text-size": ["interpolate", ["linear"], ["zoom"], 12, 10, 15, 13],
      "text-rotate": ["get", "bearing"],
      "text-rotation-alignment": "map",
      "text-allow-overlap": true,
      "text-ignore-placement": true,
    },
    paint: {
      "text-color": ["case", ["==", ["get", "section"], "trail"], CLARET, OCHRE],
      "text-opacity": 0.75,
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
      "circle-radius": ["case", ["get", "isMajor"], 7, 4.5],
      "circle-color": ["case", ["has", "color"], ["get", "color"], CLARET],
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
      "text-field": [
        "case",
        ["get", "isMajor"],
        ["concat", ["get", "label"], " - ", ["get", "sublabel"]],
        ["get", "label"],
      ],
      "text-font": ["Open Sans Semibold", "Noto Sans Regular"],
      "text-size": ["case", ["get", "isMajor"], 10.5, 8.5],
      "text-offset": [0, -1.8],
      "text-anchor": "bottom",
      "text-allow-overlap": false,
      "text-optional": true,
    },
    paint: {
      "text-color": "#1a1a1a",
      "text-halo-color": CREAM,
      "text-halo-width": 2.5,
    },
  });

  // 7. Crosshair
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
}
