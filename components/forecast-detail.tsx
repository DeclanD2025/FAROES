// =============================================================================
// ForecastDetail — live weather forecast for Øravík and Tórshavn.
// Fetches from api.met.no (yr.no) — the most accurate Faroese forecast.
// Shows current conditions + 48-hour forecast in 6-hour intervals.
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { formatSymbol } from "@/components/day-widgets";

// =============================================================================
// Types
// =============================================================================

interface ForecastEntry {
  time: string;       // ISO 8601
  temp: number;       // °C
  wind: number;       // m/s
  windDir: number;    // degrees
  humidity: number;   // %
  symbol: string;     // yr.no symbol_code
  precip: number;     // mm / 6h
}

interface LocationData {
  current: ForecastEntry | null;
  forecast: ForecastEntry[];
  loading: boolean;
  error: boolean;
}

interface MetNoTimeseries {
  time: string;
  data: {
    instant: {
      details: {
        air_temperature: number;
        wind_speed: number;
        wind_from_direction: number;
        relative_humidity: number;
      };
    };
    next_6_hours?: {
      summary: { symbol_code: string };
      details?: { precipitation_amount?: number };
    };
  };
}

const LOCATIONS = [
  { name: "Øravík, Suðuroy", lat: 61.536, lon: -6.81 },
  { name: "Tórshavn, Streymoy", lat: 62.0097, lon: -6.7716 },
] as const;

// =============================================================================
// Helpers
// =============================================================================

function windDirLabel(degrees: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(degrees / 22.5) % 16] ?? "—";
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDayTime(iso: string): string {
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-GB", { weekday: "short" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  return `${day} ${time}`;
}

// =============================================================================
// useForecast hook
// =============================================================================

function useForecast(lat: number, lon: number): LocationData {
  const [data, setData] = useState<LocationData>({
    current: null,
    forecast: [],
    loading: true,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      // Can't cancel a fetch in progress, but we can ignore the result
      const res = await fetch(
        `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
        {
          headers: {
            "User-Agent": "faroe-islands-expedition-log/1.0 github.com/DeclanD2025",
          },
        }
      );
      if (cancelled) return;
      if (!res.ok) {
        setData((prev) => ({ ...prev, loading: false, error: true }));
        return;
      }
      const json = await res.json();
      if (cancelled) return;
      const timeseries: MetNoTimeseries[] = json.properties.timeseries;

      const first = timeseries[0];
      const current: ForecastEntry = {
        time: first.time,
        temp: first.data.instant.details.air_temperature,
        wind: first.data.instant.details.wind_speed,
        windDir: first.data.instant.details.wind_from_direction,
        humidity: first.data.instant.details.relative_humidity,
        symbol: first.data.next_6_hours?.summary.symbol_code ?? "cloudy",
        precip: first.data.next_6_hours?.details?.precipitation_amount ?? 0,
      };

      const forecast: ForecastEntry[] = timeseries
        .filter((t) => t.data.next_6_hours)
        .slice(0, 8)
        .map((t) => ({
          time: t.time,
          temp: t.data.instant.details.air_temperature,
          wind: t.data.instant.details.wind_speed,
          windDir: t.data.instant.details.wind_from_direction,
          humidity: t.data.instant.details.relative_humidity,
          symbol: t.data.next_6_hours!.summary.symbol_code,
          precip: t.data.next_6_hours?.details?.precipitation_amount ?? 0,
        }));

      setData({ current, forecast, loading: false, error: false });
    };

    setData({ current: null, forecast: [], loading: true, error: false });
    run();
    const id = setInterval(run, 1_800_000); // refresh every 30 min
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [lat, lon]);

  return data;
}

// =============================================================================
// CurrentConditions — large display for right-now conditions
// =============================================================================

function CurrentConditions({ entry }: { entry: ForecastEntry }) {
  return (
    <div className="text-center py-5">
      <p className="text-[64px] font-bold text-basalt leading-none" style={{ fontFamily: "var(--font-cinzel)" }}>
        {entry.temp.toFixed(0)}°
      </p>
      <p className="text-[15px] font-medium text-basalt mt-1">
        {formatSymbol(entry.symbol)}
      </p>
      <div className="flex items-center justify-center gap-5 mt-3 text-[13px] text-basalt/60">
        <span>Wind {entry.wind.toFixed(0)} m/s {windDirLabel(entry.windDir)}</span>
        <span>Humidity {entry.humidity}%</span>
      </div>
      {entry.precip > 0 && (
        <p className="text-[12px] text-rust mt-2">
          {entry.precip.toFixed(1)} mm precipitation
        </p>
      )}
    </div>
  );
}

// =============================================================================
// ForecastTable — 6-hourly forecast rows
// =============================================================================

function ForecastTable({ entries }: { entries: ForecastEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <div className="border-t border-basalt/10">
      <div className="divide-y divide-basalt/5">
        {entries.map((entry, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            {/* Time */}
            <p className="text-[11px] text-basalt/50 w-[90px] shrink-0 code">
              {formatDayTime(entry.time)}
            </p>

            {/* Conditions */}
            <p className="text-[12px] text-basalt/60 flex-1 min-w-0 truncate">
              {formatSymbol(entry.symbol)}
            </p>

            {/* Precip */}
            <p className="text-[11px] text-rust/80 w-[50px] shrink-0 text-right code">
              {entry.precip > 0 ? `${entry.precip.toFixed(1)}mm` : "—"}
            </p>

            {/* Wind */}
            <p className="text-[11px] text-basalt/50 w-[80px] shrink-0 text-right">
              {entry.wind.toFixed(0)} m/s {windDirLabel(entry.windDir)}
            </p>

            {/* Temp */}
            <p className="text-[15px] font-medium text-basalt w-[45px] shrink-0 text-right code tnum">
              {entry.temp.toFixed(0)}°
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// LocationPanel — one location's full forecast block
// =============================================================================

function LocationPanel({
  name,
  lat,
  lon,
}: {
  name: string;
  lat: number;
  lon: number;
}) {
  const data = useForecast(lat, lon);

  return (
    <div className="border border-basalt/15 rounded-[7px] overflow-hidden">
      {/* Header */}
      <div className="bg-navy px-5 py-3">
        <p className="text-[12px] uppercase tracking-[0.14em] text-wool/70">Forecast</p>
        <p className="text-[17px] font-medium text-wool mt-0.5" style={{ fontFamily: "var(--font-cinzel)" }}>
          {name}
        </p>
      </div>

      {/* Content */}
      {data.loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-basalt/20 border-t-amber rounded-full animate-spin" />
            <p className="text-[13px] text-basalt/50">Loading forecast…</p>
          </div>
        </div>
      ) : data.error ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-[14px] text-rust/70">Could not load forecast. Check your connection.</p>
        </div>
      ) : data.current ? (
        <>
          <CurrentConditions entry={data.current} />
          {data.forecast.length > 0 && (
            <>
              <div className="px-4 pb-2">
                <p className="text-[10px] uppercase tracking-[0.12em] text-fjord/50">
                  48-hour outlook · 6-hour intervals
                </p>
              </div>
              <ForecastTable entries={data.forecast} />
            </>
          )}
          <div className="px-4 py-3 border-t border-basalt/10 bg-fog/20">
            <p className="text-[10px] text-basalt/35">
              Data from yr.no (Met Norway) · Updates every 30 minutes
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}

// =============================================================================
// Main export
// =============================================================================

export default function ForecastDetail() {
  return (
    <>
      {/* DESKTOP */}
      <article className="hidden lg:block px-8 pt-8 pb-20 max-w-[1280px]">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[12px] tracking-[0.14em] uppercase text-rust font-medium">Weather</p>
          <h1 className="text-[clamp(2.5rem,3.5vw,3.2rem)] leading-[1.04] mt-1.5 text-basalt tracking-[-0.01em]" style={{ fontFamily: "var(--font-cinzel)" }}>
            Live forecast
          </h1>
          <p className="text-[20px] font-medium text-basalt/80 mt-2">Øravík · Tórshavn</p>
          <p className="text-[14px] text-basalt/60 mt-2 max-w-[38rem]">
            Current conditions and 48-hour outlook from the Norwegian Meteorological Institute — the most reliable
            Faroese weather data. Updated every 30 minutes. Check before any hike, ferry, or exposed ridge walk.
          </p>
        </div>

        {/* Forecast panels */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {LOCATIONS.map((loc) => (
            <LocationPanel key={loc.name} name={loc.name} lat={loc.lat} lon={loc.lon} />
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-8 border border-basalt/15 rounded-[7px] p-4 max-w-[48rem]">
          <p className="text-[10px] uppercase tracking-[0.14em] text-fjord/60 mb-1">About Faroese weather</p>
          <p className="text-[13px] text-basalt/65">
            The Faroe Islands sit where warm Gulf Stream air meets cold Arctic currents. Conditions can change in minutes —
            you can experience sun, rain, fog, and wind on the same walk. Always check the forecast before committing to
            exposed routes like Hvannhagi, Beinisvørð, or any ridge walk. Wind above 15 m/s and visibility below 500 m
            are the thresholds for calling off a hike.
          </p>
          <p className="text-[12px] text-basalt/45 mt-2">
            Forecast source:{' '}
            <a href="https://www.yr.no/en" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 decoration-basalt/25 hover:text-rust transition-colors">
              yr.no (Met Norway)
            </a>
            {' · '}
            <a href="https://api.met.no" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 decoration-basalt/25 hover:text-rust transition-colors">
              api.met.no
            </a>
          </p>
        </div>
      </article>

      {/* MOBILE */}
      <article className="lg:hidden px-4 pt-6 pb-24 max-w-[640px] mx-auto">
        <div className="mb-6">
          <p className="text-[11px] tracking-[0.14em] uppercase text-rust font-medium">Weather</p>
          <h1 className="text-[clamp(2rem,8vw,2.6rem)] leading-[1.06] mt-1 text-basalt tracking-[-0.01em]" style={{ fontFamily: "var(--font-cinzel)" }}>
            Live forecast
          </h1>
          <p className="text-[17px] font-medium text-basalt/80 mt-1.5">Øravík · Tórshavn</p>
          <p className="text-[14px] text-basalt/60 mt-2">
            Current conditions and 48-hour outlook from yr.no. Check before any hike, ferry, or exposed ridge walk.
          </p>
        </div>

        <div className="space-y-4">
          {LOCATIONS.map((loc) => (
            <LocationPanel key={loc.name} name={loc.name} lat={loc.lat} lon={loc.lon} />
          ))}
        </div>

        <div className="mt-6 border border-basalt/15 rounded-[8px] p-4">
          <p className="text-[10px] uppercase tracking-[0.14em] text-fjord/60 mb-1">About Faroese weather</p>
          <p className="text-[13px] text-basalt/65">
            Wind above 15 m/s and visibility below 500 m are the thresholds for calling off a hike.
            Always check before committing to exposed routes.
          </p>
          <p className="text-[12px] text-basalt/45 mt-2">
            Data:{' '}
            <a href="https://www.yr.no/en" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 decoration-basalt/25">
              yr.no
            </a>
          </p>
        </div>
      </article>
    </>
  );
}
