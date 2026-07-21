"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  cumulativeDistances,
  extractTrackCoords,
  generateMarkers,
  parseGpxToGeoJSON,
  pointAtDistance,
  routeBounds,
  splitAtDistance,
  validateRoute,
  type LngLat,
  type SplitResult,
} from "@/lib/route-utils";

const MAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";
const TERRAIN_TILES = "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";
const TRAIL_END_KM = 1.532;
const ACCOMMODATION: LngLat = [-6.81211389, 61.53326111];

interface Props {
  mapRef: RefObject<maplibregl.Map | null>;
  onRouteLoaded?: (coords: LngLat[], split: SplitResult, totalKm: number) => void;
  onMapError?: (error: string) => void;
  crosshairPoint?: { coordinates: LngLat } | null;
}

function routeUrl() {
  if (typeof window === "undefined") return "/routes/oravik-4km-scenic-run.gpx";
  return new URL("../../routes/oravik-4km-scenic-run.gpx", window.location.href).href;
}

function markerFeature(coordinates: LngLat, label: string, kind: string) {
  return { type: "Feature" as const, geometry: { type: "Point" as const, coordinates }, properties: { label, kind } };
}

export default function OravikRunMap({ mapRef, onRouteLoaded, onMapError, crosshairPoint }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"plan" | "terrain">("terrain");
  const routeRef = useRef<LngLat[] | null>(null);
  const callbackRef = useRef(onRouteLoaded);
  useEffect(() => { callbackRef.current = onRouteLoaded; });

  const fitRoute = useCallback((map: maplibregl.Map, coords: LngLat[]) => {
    map.fitBounds(routeBounds(coords, 0.0025), {
      padding: window.innerWidth < 700 ? { top: 55, right: 35, bottom: 80, left: 35 } : { top: 65, right: 70, bottom: 80, left: 70 },
      pitch: mode === "terrain" ? 42 : 0,
      bearing: mode === "terrain" ? 72 : 0,
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 700,
    });
  }, [mode]);

  useEffect(() => {
    if (!container.current || mapRef.current) return;
    const map = new maplibregl.Map({ container: container.current, style: MAP_STYLE, center: [-6.82, 61.529], zoom: 13, attributionControl: false, renderWorldCopies: false });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    const fail = (message: string) => { setError(message); setLoading(false); onMapError?.(message); };
    map.on("load", async () => {
      try {
        const response = await fetch(routeUrl());
        if (!response.ok) throw new Error(`Route file returned ${response.status}`);
        const coords = extractTrackCoords(parseGpxToGeoJSON(await response.text()));
        const validation = validateRoute(coords, 4.13, 0.25);
        if (!validation.valid || !validation.coords) throw new Error(validation.error || "Invalid route geometry");
        const route = validation.coords;
        routeRef.current = route;
        const split = splitAtDistance(route, TRAIL_END_KM);
        if (!split) throw new Error("Could not identify trail-to-road transition");

        map.addSource("dem", { type: "raster-dem", tiles: [TERRAIN_TILES], tileSize: 256, encoding: "terrarium" });
        map.addLayer({ id: "hillshade", type: "hillshade", source: "dem", paint: { "hillshade-exaggeration": 0.35, "hillshade-shadow-color": "#263341", "hillshade-highlight-color": "#f1eadc" } });
        map.setTerrain({ source: "dem", exaggeration: 1.15 });

        const full = { type: "Feature" as const, geometry: { type: "LineString" as const, coordinates: route }, properties: {} };
        const trail = { type: "Feature" as const, geometry: { type: "LineString" as const, coordinates: split.before }, properties: {} };
        const road = { type: "Feature" as const, geometry: { type: "LineString" as const, coordinates: split.after }, properties: {} };
        map.addSource("route-full", { type: "geojson", data: full });
        map.addSource("route-trail", { type: "geojson", data: trail });
        map.addSource("route-road", { type: "geojson", data: road });
        map.addLayer({ id: "route-halo", type: "line", source: "route-full", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#f7f1e8", "line-width": ["interpolate", ["linear"], ["zoom"], 11, 7, 15, 12], "line-opacity": 0.95 } });
        map.addLayer({ id: "route-trail-line", type: "line", source: "route-trail", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#7c1834", "line-width": ["interpolate", ["linear"], ["zoom"], 11, 4, 15, 7] } });
        map.addLayer({ id: "route-road-line", type: "line", source: "route-road", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#d78b25", "line-width": ["interpolate", ["linear"], ["zoom"], 11, 4, 15, 7] } });

        const dists = cumulativeDistances(route);
        const markers = generateMarkers(route, [1, 2, 3, 4]).map(m => markerFeature(m.coordinates, `${m.km.toFixed(0)} km`, "km"));
        const features = [
          markerFeature(route[0], "Bønhúsið · Start / Finish", "start"),
          markerFeature(split.splitPoint, "Leave trail · join old road", "transition"),
          markerFeature(ACCOMMODATION, "Við á 7 · 112 m walk", "accommodation"),
          ...markers,
        ];
        map.addSource("route-markers", { type: "geojson", data: { type: "FeatureCollection", features } });
        map.addLayer({ id: "marker-circles", type: "circle", source: "route-markers", paint: { "circle-radius": ["match", ["get", "kind"], "start", 8, "transition", 7, "accommodation", 5, 4.5], "circle-color": ["match", ["get", "kind"], "start", "#2b8a62", "transition", "#7c1834", "accommodation", "#44546a", "#d78b25"], "circle-stroke-color": "#fffaf0", "circle-stroke-width": 2 } });
        map.addLayer({ id: "marker-labels", type: "symbol", source: "route-markers", layout: { "text-field": ["get", "label"], "text-size": ["match", ["get", "kind"], "km", 10, 12], "text-font": ["Open Sans Semibold", "Noto Sans Regular"], "text-offset": [0, 1.15], "text-anchor": "top", "text-allow-overlap": false }, paint: { "text-color": "#202a34", "text-halo-color": "#fffdf8", "text-halo-width": 2 } });
        map.addSource("crosshair", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
        map.addLayer({ id: "crosshair-dot", type: "circle", source: "crosshair", paint: { "circle-radius": 6, "circle-color": "#ffffff", "circle-stroke-color": "#7c1834", "circle-stroke-width": 3 } });
        fitRoute(map, route);
        callbackRef.current?.(route, split, validation.totalKm);
        setLoading(false);
      } catch (cause) { fail(cause instanceof Error ? cause.message : "Could not load route"); }
    });
    map.on("error", event => { if (!routeRef.current && event.error) fail(event.error.message); });
    return () => { map.remove(); mapRef.current = null; };
  }, [fitRoute, mapRef, onMapError]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getSource("crosshair")) return;
    const source = map.getSource("crosshair") as maplibregl.GeoJSONSource;
    source.setData(crosshairPoint ? markerFeature(crosshairPoint.coordinates, "", "crosshair") : { type: "FeatureCollection", features: [] });
  }, [crosshairPoint, mapRef]);

  const setView = (next: "plan" | "terrain") => {
    setMode(next);
    const map = mapRef.current;
    if (!map || !routeRef.current) return;
    if (next === "terrain") map.setTerrain({ source: "dem", exaggeration: 1.15 }); else map.setTerrain(null);
    map.easeTo({ pitch: next === "terrain" ? 42 : 0, bearing: next === "terrain" ? 72 : 0, duration: 500 });
  };

  return (
    <div className="relative w-full h-full min-h-[420px] xl:min-h-[650px] bg-fog/30">
      <div ref={container} className="absolute inset-0" aria-label="Interactive map of the Øravík mixed-surface loop" />
      {loading && !error && <div className="absolute inset-0 z-10 grid place-items-center bg-fog/70"><p className="caption">Loading validated loop…</p></div>}
      {error && <div className="absolute inset-0 z-20 flex items-center justify-center p-6 bg-fog"><div className="max-w-md"><p className="font-medium text-rust">Route map unavailable</p><p className="text-sm text-basalt/70 mt-2">{error}</p><p className="text-sm text-basalt/70 mt-2">Start at Bønhúsið, 112 m from Við á 7. Follow the official village path to route 99, then return via the old road, Fámjinsvegur and Bóndatún. Never enter either tunnel.</p></div></div>}
      {!loading && !error && <div className="absolute left-3 bottom-3 z-10 flex gap-2"><button onClick={() => setView(mode === "terrain" ? "plan" : "terrain")} className="rounded-md border border-basalt/20 bg-fog/95 px-3 py-2 text-[10px] uppercase tracking-wider text-basalt">{mode === "terrain" ? "Plan" : "Terrain"}</button><button onClick={() => routeRef.current && mapRef.current && fitRoute(mapRef.current, routeRef.current)} className="rounded-md border border-basalt/20 bg-fog/95 px-3 py-2 text-[10px] uppercase tracking-wider text-basalt">Reset</button></div>}
      {!loading && !error && <div className="absolute left-3 top-3 z-10 rounded-md bg-fog/90 px-3 py-2 text-[11px] text-basalt shadow-sm"><span className="font-semibold text-claret">Trail 1.53 km</span><span className="mx-2">·</span><span className="font-semibold text-amber">Road 2.60 km</span></div>}
    </div>
  );
}
