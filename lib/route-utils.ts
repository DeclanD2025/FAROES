// =============================================================================
// Route utilities — GPX → GeoJSON, split at distance, markers, elevation.
// Uses @tmcw/togeojson for parsing and @turf/turf for distance calculations.
// All functions are pure; no side effects.
// =============================================================================

import { gpx } from "@tmcw/togeojson";
import { length, lineString } from "@turf/turf";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Longitude/latitude coordinate pair, optionally with elevation. */
export type LngLat = number[];

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const EARTH_RADIUS_KM = 6371;

// ---------------------------------------------------------------------------
// GPX parsing
// ---------------------------------------------------------------------------

/** Parse a GPX XML string into a GeoJSON FeatureCollection. */
export function parseGpxToGeoJSON(xml: string): GeoJSON.FeatureCollection {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");
  const fc = gpx(doc);
  return fc as GeoJSON.FeatureCollection;
}

/** Extract the first track LineString coordinates from a GeoJSON FeatureCollection. */
export function extractTrackCoords(fc: GeoJSON.FeatureCollection): LngLat[] | null {
  for (const f of fc.features) {
    if (f.geometry?.type === "LineString") {
      return (f.geometry as GeoJSON.LineString).coordinates;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Distance calculations
// ---------------------------------------------------------------------------

/** Haversine distance between two lat/lon positions in kilometres. */
export function haversineKm(a: LngLat, b: LngLat): number {
  const dLat = ((b[1] - a[1]) * Math.PI) / 180;
  const dLon = ((b[0] - a[0]) * Math.PI) / 180;
  const lat1 = (a[1] * Math.PI) / 180;
  const lat2 = (b[1] * Math.PI) / 180;
  const aVal =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal));
}

/** Cumulative distances (km) for each coordinate from the start. */
export function cumulativeDistances(coords: LngLat[]): number[] {
  const dists: number[] = [0];
  for (let i = 1; i < coords.length; i++) {
    dists.push(dists[i - 1] + haversineKm(coords[i - 1], coords[i]));
  }
  return dists;
}

/** Total route length in kilometres (sum of segment distances). */
export function totalRouteLength(coords: LngLat[]): number {
  const dists = cumulativeDistances(coords);
  return dists[dists.length - 1];
}

// ---------------------------------------------------------------------------
// Point at distance
// ---------------------------------------------------------------------------

/**
 * Interpolate a point at a given distance (km) along a coordinate array.
 * Uses pre-computed cumulative distances for efficiency.
 */
export function pointAtDistance(
  coords: LngLat[],
  dists: number[],
  targetKm: number,
): LngLat {
  if (targetKm <= 0) return coords[0];
  const total = dists[dists.length - 1];
  if (targetKm >= total) return coords[coords.length - 1];

  let segIndex = 0;
  for (let i = 1; i < dists.length; i++) {
    if (dists[i] >= targetKm) {
      segIndex = i - 1;
      break;
    }
  }

  const segLen = dists[segIndex + 1] - dists[segIndex];
  const t = segLen > 0 ? (targetKm - dists[segIndex]) / segLen : 0;
  const a = coords[segIndex];
  const b = coords[segIndex + 1];

  const ele =
    a.length > 2 && b.length > 2 && a[2] != null && b[2] != null
      ? a[2] + (b[2] - a[2]) * t
      : undefined;

  return ele !== undefined ? [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, ele] : [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

// ---------------------------------------------------------------------------
// Split at distance
// ---------------------------------------------------------------------------

/** Result of splitting a route at a given distance. */
export interface SplitResult {
  before: LngLat[];
  after: LngLat[];
  splitPoint: LngLat;
}

/**
 * Split a coordinate array at a target distance (km) from the start.
 * Returns two arrays (before and after the split point) and the split point itself.
 * Returns null if the split distance is at or beyond the route endpoints.
 */
export function splitAtDistance(
  coords: LngLat[],
  splitDistKm: number,
): SplitResult | null {
  const dists = cumulativeDistances(coords);
  const total = dists[dists.length - 1];

  if (splitDistKm <= 0 || splitDistKm >= total - 0.001) {
    return null;
  }

  const splitPoint = pointAtDistance(coords, dists, splitDistKm);

  // Find the segment index
  let segIndex = 0;
  for (let i = 1; i < dists.length; i++) {
    if (dists[i] >= splitDistKm) {
      segIndex = i - 1;
      break;
    }
  }

  const before = [...coords.slice(0, segIndex + 1), splitPoint];
  const after = [splitPoint, ...coords.slice(segIndex + 1)];

  return { before, after, splitPoint };
}

// ---------------------------------------------------------------------------
// Distance markers
// ---------------------------------------------------------------------------

export interface RouteMarker {
  km: number;
  coordinates: LngLat;
  label: string;
  isMajor: boolean;
}

/**
 * Generate marker positions at given kilometre intervals along a route.
 */
export function generateMarkers(
  coords: LngLat[],
  intervalsKm: number[],
): RouteMarker[] {
  const dists = cumulativeDistances(coords);
  const total = dists[dists.length - 1];

  return intervalsKm
    .filter((d) => d >= 0 && d <= total + 0.001)
    .map((km) => {
      const coordinates =
        km === 0
          ? coords[0]
          : km >= total - 0.001
            ? coords[coords.length - 1]
            : pointAtDistance(coords, dists, km);
      const isMajor = km === 0 || Math.abs(km - 2.0) < 0.01 || km >= total - 0.1;
      const label =
        km === 0
          ? "Start / Finish"
          : Math.abs(km - 2.0) < 0.01
            ? "Turnaround"
            : `${km.toFixed(1)} km`;
      return { km, coordinates, label, isMajor };
    });
}

// ---------------------------------------------------------------------------
// Bounds
// ---------------------------------------------------------------------------

/**
 * Calculate bounding box from coordinates with optional padding in degrees.
 */
export function routeBounds(
  coords: LngLat[],
  padDeg: number = 0.005,
): [[number, number], [number, number]] {
  const lons = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);
  return [
    [Math.min(...lons) - padDeg, Math.min(...lats) - padDeg],
    [Math.max(...lons) + padDeg, Math.max(...lats) + padDeg],
  ];
}

// ---------------------------------------------------------------------------
// Elevation sampling
// ---------------------------------------------------------------------------

export interface ElevationSample {
  km: number;
  elevation: number | null;
  coordinates: LngLat;
}

/**
 * Sample elevations at regular intervals (metres) along a coordinate array.
 * Returns elevation from coordinate[2] if available (inline GPX elevation data).
 */
export function sampleElevation(
  coords: LngLat[],
  intervalM: number = 25,
): ElevationSample[] {
  const dists = cumulativeDistances(coords);
  const totalKm = dists[dists.length - 1];
  const stepKm = intervalM / 1000;
  const samples: ElevationSample[] = [];

  for (let km = 0; km <= totalKm + stepKm / 2; km += stepKm) {
    const pt = pointAtDistance(coords, dists, Math.min(km, totalKm));
    const elevation = pt.length > 2 && pt[2] != null ? pt[2] : null;
    samples.push({ km, elevation, coordinates: pt });
  }

  return samples;
}

/** Calculate elevation stats from an array of samples. */
export function elevationStats(samples: ElevationSample[]) {
  const elevations = samples
    .map((s) => s.elevation)
    .filter((e): e is number => e !== null);

  if (elevations.length === 0) {
    return {
      min: null,
      max: null,
      ascent: null,
      descent: null,
    };
  }

  let ascent = 0;
  let descent = 0;

  for (let i = 1; i < elevations.length; i++) {
    const diff = elevations[i] - elevations[i - 1];
    if (diff > 0) ascent += diff;
    else descent += Math.abs(diff);
  }

  return {
    min: Math.min(...elevations),
    max: Math.max(...elevations),
    ascent: Math.round(ascent),
    descent: Math.round(descent),
  };
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export interface ValidationResult {
  valid: boolean;
  totalKm: number;
  error: string | null;
  coords: LngLat[] | null;
}

/**
 * Validate parsed route data: must have coordinates and be approximately 4 km.
 */
export function validateRoute(
  coords: LngLat[] | null,
  expectedKm: number = 4,
  tolerance: number = 0.6,
): ValidationResult {
  if (!coords || coords.length < 2) {
    return { valid: false, totalKm: 0, error: "No route coordinates found in GPX file.", coords: null };
  }

  const totalKm = length(lineString(coords), { units: "kilometers" });

  if (Math.abs(totalKm - expectedKm) > tolerance) {
    return {
      valid: false,
      totalKm,
      error: `Route length is ${totalKm.toFixed(1)} km — expected approximately ${expectedKm} km. The GPX data may be incorrect.`,
      coords,
    };
  }

  return { valid: true, totalKm, error: null, coords };
}
