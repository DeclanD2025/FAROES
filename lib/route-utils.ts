// =============================================================================
// Route utilities — GPX → GeoJSON, split at distance, markers, elevation.
// Uses @tmcw/togeojson for parsing and @turf/turf for distance calculations.
// All functions are pure; no side effects.
// =============================================================================

import { gpx } from "@tmcw/togeojson";
import { length, lineString, point, distance as turfDistance } from "@turf/turf";

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
// Coordinate-based nearest-point lookup
// ---------------------------------------------------------------------------

/**
 * Find the index of the coordinate in coords that is nearest to the target.
 */
export function findNearestIndex(coords: LngLat[], targetLon: number, targetLat: number): number {
  const target = point([targetLon, targetLat]);
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < coords.length; i++) {
    const d = turfDistance(target, point([coords[i][0], coords[i][1]]), { units: "kilometers" });
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }
  return bestIdx;
}

/**
 * Split a coordinate array at the point nearest to a given coordinate.
 */
export function splitAtCoordinate(
  coords: LngLat[],
  targetLon: number,
  targetLat: number,
): { before: LngLat[]; after: LngLat[]; splitPoint: LngLat; splitIndex: number; distanceKm: number } | null {
  const idx = findNearestIndex(coords, targetLon, targetLat);
  if (idx <= 0 || idx >= coords.length - 1) return null;
  const dists = cumulativeDistances(coords);
  const before = coords.slice(0, idx + 1);
  const after = coords.slice(idx);
  return { before, after, splitPoint: coords[idx], splitIndex: idx, distanceKm: dists[idx] };
}

// ---------------------------------------------------------------------------
// Fell-loop validation
// ---------------------------------------------------------------------------

/** Audited start coordinate (Bønhúsið). */
export const FELL_LOOP_START: LngLat = [-6.810877108946443, 61.53244980610907];

/** Audited trail-to-road transition coordinate. */
export const FELL_LOOP_TRANSITION: LngLat = [-6.831779228523374, 61.525677144527435];

/** Audited expected distance in km. */
export const FELL_LOOP_EXPECTED_KM = 4.131;

/** Display distance in km. */
export const FELL_LOOP_DISPLAY_KM = 4.13;

/** Audited transition distance from start in km. */
export const FELL_LOOP_TRANSITION_KM = 1.532;

/** Audited approximate ascent in metres. */
export const FELL_LOOP_ASCENT_M = 222;

/** Audited approximate highest point in metres. */
export const FELL_LOOP_HIGHEST_M = 189;

export interface FellLoopValidation {
  valid: boolean;
  totalKm: number;
  errors: string[];
  coords: LngLat[] | null;
}

/**
 * Dedicated validator for the Øravík fell-loop GPX.
 * Checks distance, closure, start proximity, transition proximity, and continuity.
 */
export function validateFellLoop(coords: LngLat[] | null): FellLoopValidation {
  const errors: string[] = [];

  // Rule 1: GPX contains a LineString with at least 2 coordinates
  if (!coords || coords.length < 2) {
    return { valid: false, totalKm: 0, errors: ["No route coordinates found in GPX file."], coords: null };
  }

  // Rule 2: Turf-calculated distance between 4.05 and 4.22 km
  const totalKm = length(lineString(coords), { units: "kilometers" });
  if (totalKm < 4.05 || totalKm > 4.22) {
    errors.push(`Route length is ${totalKm.toFixed(3)} km — expected between 4.05 and 4.22 km.`);
  }

  // Rule 3: Route is closed — first and last track points within 20 m
  const firstPt = point([coords[0][0], coords[0][1]]);
  const lastPt = point([coords[coords.length - 1][0], coords[coords.length - 1][1]]);
  const closureDist = turfDistance(firstPt, lastPt, { units: "kilometers" }) * 1000;
  if (closureDist > 20) {
    errors.push(`Route is not closed: start and end are ${closureDist.toFixed(1)} m apart (must be ≤ 20 m).`);
  }

  // Rule 4: Start point within 35 m of Bønhúsið
  const startDist = turfDistance(point([FELL_LOOP_START[0], FELL_LOOP_START[1]]), firstPt, { units: "kilometers" }) * 1000;
  if (startDist > 35) {
    errors.push(`Start point is ${startDist.toFixed(1)} m from Bønhúsið (must be ≤ 35 m).`);
  }

  // Rule 5: Route passes within 30 m of audited transition
  const nearestIdx = findNearestIndex(coords, FELL_LOOP_TRANSITION[0], FELL_LOOP_TRANSITION[1]);
  const nearestPt = point([coords[nearestIdx][0], coords[nearestIdx][1]]);
  const transitionDist = turfDistance(point([FELL_LOOP_TRANSITION[0], FELL_LOOP_TRANSITION[1]]), nearestPt, { units: "kilometers" }) * 1000;
  if (transitionDist > 30) {
    errors.push(`No route point within 30 m of the audited trail-to-road transition (nearest: ${transitionDist.toFixed(1)} m).`);
  }

  // Rule 6: No segment > 150 m discontinuity
  for (let i = 1; i < coords.length; i++) {
    const segDist = turfDistance(
      point([coords[i - 1][0], coords[i - 1][1]]),
      point([coords[i][0], coords[i][1]]),
      { units: "kilometers" },
    ) * 1000;
    if (segDist > 150) {
      errors.push(`Segment ${i} is ${segDist.toFixed(1)} m — exceeds 150 m discontinuity limit.`);
      break;
    }
  }

  return {
    valid: errors.length === 0,
    totalKm,
    errors,
    coords,
  };
}

// ---------------------------------------------------------------------------
// Generic validation (kept for backwards compatibility)
// ---------------------------------------------------------------------------

export interface ValidationResult {
  valid: boolean;
  totalKm: number;
  error: string | null;
  coords: LngLat[] | null;
}

/**
 * Validate parsed route data: must have coordinates and be approximately expected km.
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
