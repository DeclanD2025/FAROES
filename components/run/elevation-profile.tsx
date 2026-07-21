// =============================================================================
// ElevationProfile — SVG chart of elevation along the run route.
// Hover/drag interaction highlights the corresponding point on the map.
// =============================================================================

"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import type { LngLat } from "@/lib/route-utils";
import {
  type ElevationSample,
  elevationStats,
  cumulativeDistances,
  pointAtDistance,
} from "@/lib/route-utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ElevationProfileProps {
  samples: ElevationSample[];
  coords: LngLat[];
  onHover: (point: { km: number; coordinates: LngLat } | null) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CHART_PADDING = { top: 16, right: 16, bottom: 28, left: 0 };
const CHART_HEIGHT = 160;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ElevationProfile({ samples, coords, onHover }: ElevationProfileProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverKm, setHoverKm] = useState<number | null>(null);
  const [hoverScreenX, setHoverScreenX] = useState<number | null>(null);

  const stats = useMemo(() => elevationStats(samples), [samples]);
  const dists = useMemo(() => cumulativeDistances(coords), [coords]);
  const totalKm = dists[dists.length - 1];

  // If no valid elevation data, show fallback
  const hasElevation = stats.min !== null && stats.max !== null;
  if (!hasElevation || samples.length < 2) {
    return (
      <div className="border border-basalt/15 rounded-[7px] p-4">
        <p className="text-[10px] uppercase tracking-[0.1em] text-basalt/60 mb-2">Elevation</p>
        <p className="text-[13px] text-basalt/50">
          Elevation data unavailable for this route.
        </p>
      </div>
    );
  }

  const minEle = stats.min!;
  const maxEle = stats.max!;
  const eleRange = maxEle - minEle || 1;

  // Chart dimensions
  const chartW = 100; // percentage width via viewBox
  const chartH = CHART_HEIGHT;

  const innerW = chartW - CHART_PADDING.left - CHART_PADDING.right;
  const innerH = chartH - CHART_PADDING.top - CHART_PADDING.bottom;

  // Scale functions
  const xScale = (km: number) =>
    CHART_PADDING.left + (km / totalKm) * innerW;
  const yScale = (ele: number) =>
    CHART_PADDING.top + innerH - ((ele - minEle) / eleRange) * innerH;

  // Path data
  const pathD = samples
    .filter((s) => s.elevation !== null)
    .map((s, i, arr) => {
      const x = xScale(s.km);
      const y = yScale(s.elevation!);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  // Area under curve (for fill)
  const areaD = `${pathD} L${xScale(totalKm).toFixed(1)},${CHART_PADDING.top + innerH} L${xScale(0).toFixed(1)},${CHART_PADDING.top + innerH} Z`;

  // Y-axis labels
  const yTicks = [minEle, Math.round((minEle + maxEle) / 2), maxEle];

  // X-axis labels
  const xTicks = [0, 1, 2, 3, 4].filter((t) => t <= totalKm);

  // Hover handler
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const ratio = (x - CHART_PADDING.left) / innerW;
      const km = Math.max(0, Math.min(totalKm, ratio * totalKm));
      setHoverKm(km);
      setHoverScreenX(x);
      const pt = pointAtDistance(coords, dists, km);
      onHover({ km, coordinates: pt });
    },
    [totalKm, coords, dists, innerW, onHover],
  );

  const handleMouseLeave = useCallback(() => {
    setHoverKm(null);
    setHoverScreenX(null);
    onHover(null);
  }, [onHover]);

  // Get hover elevation
  const hoverElevation =
    hoverKm !== null
      ? samples.reduce((prev, curr) =>
          Math.abs(curr.km - hoverKm) < Math.abs(prev.km - hoverKm) ? curr : prev,
        ).elevation
      : null;

  const turnaroundX = xScale(2.0);

  // Touch handler for mobile
  const handleTouchMove = useCallback(
    (e: React.TouchEvent<SVGSVGElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const touch = e.touches[0];
      if (!touch) return;
      const x = touch.clientX - rect.left;
      const ratio = (x - CHART_PADDING.left) / innerW;
      const km = Math.max(0, Math.min(totalKm, ratio * totalKm));
      setHoverKm(km);
      setHoverScreenX(x);
      const pt = pointAtDistance(coords, dists, km);
      onHover({ km, coordinates: pt });
    },
    [totalKm, coords, dists, innerW, onHover],
  );

  return (
    <div className="border border-basalt/15 rounded-[7px] p-4">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.1em] text-basalt/60">
          Elevation
        </p>
        <div className="flex gap-3 text-[11px] text-basalt/60">
          {stats.ascent !== null && (
            <span>
              <span className="text-moss font-medium">+{stats.ascent} m</span> ascent
            </span>
          )}
          {stats.descent !== null && (
            <span>
              <span className="text-rust font-medium">−{stats.descent} m</span> descent
            </span>
          )}
          <span>
            <span className="text-basalt font-medium">{minEle}</span>–<span className="text-basalt font-medium">{maxEle}</span> m
          </span>
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${chartW} ${chartH}`}
        className="w-full"
        style={{ height: CHART_HEIGHT, touchAction: "none" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseLeave}
        role="img"
        aria-label={`Elevation profile: ${minEle} to ${maxEle} metres`}
      >
        {/* Grid lines */}
        {yTicks.map((tick) => (
          <line
            key={`grid-${tick}`}
            x1={CHART_PADDING.left}
            y1={yScale(tick)}
            x2={CHART_PADDING.left + innerW}
            y2={yScale(tick)}
            stroke="currentColor"
            className="text-basalt/8"
            strokeWidth={0.5}
          />
        ))}

        {/* Area fill */}
        <path d={areaD} fill="currentColor" className="text-claret/5" />

        {/* Elevation line */}
        <path
          d={pathD}
          fill="none"
          stroke="currentColor"
          className="text-claret/70"
          strokeWidth={1.8}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Turnaround marker */}
        <line
          x1={turnaroundX}
          y1={CHART_PADDING.top}
          x2={turnaroundX}
          y2={CHART_PADDING.top + innerH}
          stroke="currentColor"
          className="text-amber/40"
          strokeWidth={1}
          strokeDasharray="3,3"
        />

        {/* Turnaround label */}
        <text
          x={turnaroundX}
          y={CHART_PADDING.top - 4}
          textAnchor="middle"
          className="fill-amber/80"
          style={{ fontSize: 8, fontFamily: "var(--font-sans)" }}
        >
          2 km
        </text>

        {/* Y-axis labels */}
        {yTicks.map((tick) => (
          <text
            key={`y-${tick}`}
            x={CHART_PADDING.left - 4}
            y={yScale(tick) + 3}
            textAnchor="end"
            className="fill-basalt/40"
            style={{ fontSize: 8, fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}
          >
            {tick}
          </text>
        ))}

        {/* X-axis labels */}
        {xTicks.map((tick) => (
          <text
            key={`x-${tick}`}
            x={xScale(tick)}
            y={CHART_PADDING.top + innerH + 14}
            textAnchor="middle"
            className="fill-basalt/40"
            style={{ fontSize: 8, fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}
          >
            {tick} km
          </text>
        ))}

        {/* Hover line */}
        {hoverScreenX !== null && hoverKm !== null && (
          <>
            <line
              x1={hoverScreenX}
              y1={CHART_PADDING.top}
              x2={hoverScreenX}
              y2={CHART_PADDING.top + innerH}
              stroke="currentColor"
              className="text-basalt/30"
              strokeWidth={1}
            />
            <circle
              cx={xScale(hoverKm)}
              cy={yScale(samples.reduce((p, c) =>
                Math.abs(c.km - hoverKm) < Math.abs(p.km - hoverKm) ? c : p
              ).elevation ?? minEle)}
              r={4}
              fill="currentColor"
              className="text-claret"
            />
          </>
        )}

        {/* Hover tooltip */}
        {hoverKm !== null && hoverElevation !== null && (
          <g>
            <rect
              x={Math.max(0, Math.min(chartW - 80, xScale(hoverKm) - 40))}
              y={CHART_PADDING.top - 2}
              width={80}
              height={28}
              rx={4}
              className="fill-wool"
              stroke="currentColor"
              strokeWidth={0.5}
            />
            <text
              x={Math.max(0, Math.min(chartW - 80, xScale(hoverKm) - 40)) + 40}
              y={CHART_PADDING.top + 10}
              textAnchor="middle"
              className="fill-basalt"
              style={{ fontSize: 10, fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" }}
            >
              {hoverKm.toFixed(2)} km · {Math.round(hoverElevation)} m
            </text>
            <text
              x={Math.max(0, Math.min(chartW - 80, xScale(hoverKm) - 40)) + 40}
              y={CHART_PADDING.top + 22}
              textAnchor="middle"
              className="fill-basalt/50"
              style={{ fontSize: 9, fontFamily: "var(--font-sans)" }}
            >
              {hoverKm <= 2.0 ? "Outbound" : "Return"}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}
