// =============================================================================
// Day widgets — shared components used across all 6 day pages.
// Extracted to eliminate ~400 lines of duplication.
// =============================================================================

"use client";

import { useState, useEffect } from "react";

// =============================================================================
// Types
// =============================================================================

export interface TimelineStep {
  num: number;
  title: string;
  subtitle: string;
  middleLabel: string;
  middleValue: string;
  middleLabel2?: string;
  middleValue2?: string;
  rightLabel: string;
  rightValue: string;
  footer?: string;
  footerLink?: { label: string; href: string };
}

export interface SummaryItem {
  icon: string;
  label: string;
  time: string;
  note: string;
}

interface WeatherData {
  temp: number | null;
  wind: number | null;
  desc: string;
  loading: boolean;
  error: boolean;
}

// =============================================================================
// formatSymbol — yr.no weather code → readable English
// =============================================================================

export function formatSymbol(code: string): string {
  const m: Record<string, string> = {
    clearsky_day: "Clear sky", clearsky_night: "Clear sky",
    fair_day: "Fair", fair_night: "Fair",
    partlycloudy_day: "Partly cloudy", partlycloudy_night: "Partly cloudy",
    cloudy: "Cloudy",
    rainshowers_day: "Rain showers", rainshowers_night: "Rain showers",
    heavyrainshowers_day: "Heavy rain showers",
    rain: "Rain", lightrain: "Light rain", heavyrain: "Heavy rain",
    lightrainshowers_day: "Light rain showers",
    fog: "Fog",
    snow: "Snow", lightsnow: "Light snow", heavysnow: "Heavy snow",
    snowshowers_day: "Snow showers",
    sleet: "Sleet",
    rainshowersandthunder_day: "Rain & thunder",
    heavyrainshowersandthunder_day: "Heavy rain & thunder",
  };
  return m[code] ?? code.replace(/_/g, " ");
}

// =============================================================================
// FaroeClock — live Faroe Islands time (updates every 30s, no seconds)
// =============================================================================

export function FaroeClock() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Atlantic/Faroe",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(now)
      );
      setDate(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Atlantic/Faroe",
          weekday: "short",
          day: "numeric",
          month: "short",
        }).format(now)
      );
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <p className="text-[11px] text-basalt/60 mb-0.5">Faroe Islands</p>
      <p className="code tnum text-[22px] font-medium text-basalt leading-none">
        {time || "—:—"}
      </p>
      <p className="text-[10.5px] text-basalt/45 mt-0.5">
        {date || "—"} · WEST · UTC+1
      </p>
    </div>
  );
}

// =============================================================================
// WeatherBlock — live yr.no weather for a given location
// =============================================================================

export function WeatherBlock({
  lat,
  lon,
  label,
}: {
  lat: number;
  lon: number;
  label: string;
}) {
  const [w, setW] = useState<WeatherData>({
    temp: null,
    wind: null,
    desc: "",
    loading: true,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`,
          {
            headers: {
              "User-Agent": "faroe-islands-expedition-log/1.0 github.com/DeclanD2025",
            },
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        const ts = json.properties.timeseries[0];
        const instant = ts.data.instant.details;
        const next1h = ts.data.next_1_hours;
        setW({
          temp: instant.air_temperature,
          wind: instant.wind_speed,
          desc: formatSymbol(next1h?.summary?.symbol_code ?? ""),
          loading: false,
          error: false,
        });
      } catch {
        if (!cancelled)
          setW((prev) => ({ ...prev, loading: false, error: true }));
      }
    };
    fetchWeather();
    const id = setInterval(fetchWeather, 1_800_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [lat, lon]);

  return (
    <div>
      <p className="text-[11px] text-basalt/60 mb-0.5">{label}</p>
      {w.loading ? (
        <p className="text-[13px] text-basalt/50">—</p>
      ) : w.error ? (
        <p className="text-[13px] text-rust/70">Unavailable</p>
      ) : (
        <>
          <p className="code tnum text-[22px] font-medium text-basalt leading-none">
            {w.temp?.toFixed(0) ?? "—"}°
          </p>
          <p className="text-[11px] text-basalt/55 mt-0.5">
            {w.desc || "—"}
          </p>
        </>
      )}
    </div>
  );
}

// =============================================================================
// DepartureCountdown — days until trip departure (non-animated)
// =============================================================================

export function DepartureCountdown() {
  const [days, setDays] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date("2026-07-27T16:10:00Z").getTime();
    const calc = () => {
      setDays(Math.max(0, Math.ceil((target - Date.now()) / 86_400_000)));
    };
    calc();
    const id = setInterval(calc, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <p
        className="text-[64px] font-bold text-rust leading-none"
        style={{ fontFamily: "var(--font-cinzel)" }}
      >
        {days === null ? "—" : days <= 0 ? "0" : days}
      </p>
      <p className="text-[13px] text-basalt/70 mt-1">
        {days === null ? "" : days <= 0 ? "We're here" : days === 1 ? "day until departure" : "days until departure"}
      </p>
    </>
  );
}

// =============================================================================
// TripStatusPanel — countdown + clock + weather
// =============================================================================

export function TripStatusPanel({
  dateLine1,
  dateLine2,
  weatherLat,
  weatherLon,
  weatherLabel,
}: {
  dateLine1: string;
  dateLine2: string;
  weatherLat: number;
  weatherLon: number;
  weatherLabel: string;
}) {
  return (
    <div className="border border-basalt/15 p-5">
      <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-3">
        Trip Status
      </p>
      <DepartureCountdown />
      <p className="text-[11px] text-basalt/50 mt-2">{dateLine1}</p>
      <p className="text-[11px] text-basalt/50">{dateLine2}</p>
      <hr className="my-4 border-basalt/10" />
      <div className="grid grid-cols-2 gap-4">
        <FaroeClock />
        <WeatherBlock lat={weatherLat} lon={weatherLon} label={weatherLabel} />
      </div>
      <p className="text-[10px] text-basalt/35 mt-3">
        Weather from yr.no · live data
      </p>
    </div>
  );
}

// =============================================================================
// MobileTripStatus — compact countdown + clock + weather for mobile
// =============================================================================

export function MobileTripStatus({
  dateLine1,
  dateLine2,
  weatherLat,
  weatherLon,
  weatherLabel,
}: {
  dateLine1: string;
  dateLine2: string;
  weatherLat: number;
  weatherLon: number;
  weatherLabel: string;
}) {
  return (
    <div className="border border-basalt/15 rounded-[8px] p-4">
      <div className="flex items-baseline gap-3">
        <p
          className="text-[48px] font-bold text-rust leading-none"
          style={{ fontFamily: "var(--font-cinzel)" }}
        >
          <CountdownValue />
        </p>
        <p className="text-[14px] font-medium text-basalt">
          days until departure
        </p>
      </div>
      <p className="text-[12px] text-basalt/55 mt-1">{dateLine1}</p>
      <p className="text-[12px] text-basalt/55">{dateLine2}</p>
      <hr className="my-3.5 border-basalt/10" />
      <div className="grid grid-cols-2 gap-4">
        <FaroeClock />
        <WeatherBlock lat={weatherLat} lon={weatherLon} label={weatherLabel} />
      </div>
    </div>
  );
}

/** Internal: renders just the countdown number for mobile status */
function CountdownValue() {
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => {
    const target = new Date("2026-07-27T16:10:00Z").getTime();
    const calc = () =>
      setDays(Math.max(0, Math.ceil((target - Date.now()) / 86_400_000)));
    calc();
    const id = setInterval(calc, 60_000);
    return () => clearInterval(id);
  }, []);
  return <>{days ?? "—"}</>;
}

// =============================================================================
// SummaryStrip — 5-column journey summary
// =============================================================================

export function SummaryStrip({ items }: { items: SummaryItem[] }) {
  return (
    <div
      className="grid grid-cols-5 border border-basalt/15 rounded-[8px] divide-x divide-basalt/10"
      style={{ minHeight: 96 }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className="flex flex-col justify-center px-3 py-3"
        >
          <p className="text-[11px] text-basalt/55 mb-1">
            {item.icon} {item.label}
          </p>
          <p className="code tnum text-[18px] font-medium text-basalt leading-none">
            {item.time}
          </p>
          <p className="text-[11px] text-basalt/45 mt-1">{item.note}</p>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// JourneyTimeline — vertical timeline with numbered steps (desktop)
// =============================================================================

export function JourneyTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="relative">
      <div
        className="absolute left-[17px] top-8 bottom-8 w-px border-l border-dashed border-fjord/25"
        aria-hidden
      />
      <div className="space-y-2.5">
        {steps.map((step) => (
          <div key={step.num} className="flex gap-4">
            {/* Circle + number */}
            <div
              className="flex flex-col items-center shrink-0"
              style={{ width: 36 }}
            >
              <div className="w-[34px] h-[34px] rounded-full bg-navy flex items-center justify-center shrink-0 z-10">
                <span className="text-[13px] font-medium text-wool">
                  {step.num}
                </span>
              </div>
            </div>

            {/* Content card */}
            <div className="flex-1 min-w-0">
              <div className="border border-basalt/15 rounded-[7px] p-3.5 flex items-center gap-4 flex-wrap">
                {/* Title block */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[15px] text-basalt leading-tight">
                    {step.title}
                  </p>
                  <p className="text-[12px] text-basalt/55 mt-0.5">
                    {step.subtitle}
                  </p>
                </div>

                {/* Middle detail(s) */}
                {step.middleLabel2 ? (
                  <div className="flex gap-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.1em] text-basalt/45">
                        {step.middleLabel}
                      </p>
                      <p className="code tnum text-[13px] text-fjord font-medium">
                        {step.middleValue}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.1em] text-basalt/45">
                        {step.middleLabel2}
                      </p>
                      <p className="code tnum text-[13px] text-fjord font-medium">
                        {step.middleValue2}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.1em] text-basalt/45">
                      {step.middleLabel}
                    </p>
                    <p className="code tnum text-[13px] text-fjord font-medium">
                      {step.middleValue}
                    </p>
                  </div>
                )}

                {/* Right time inset */}
                <div className="bg-basalt/[0.03] border border-basalt/8 px-3 py-2 rounded-[4px] min-w-[72px] text-center">
                  <p className="text-[10px] uppercase tracking-[0.1em] text-basalt/45">
                    {step.rightLabel}
                  </p>
                  <p className="code tnum text-[15px] font-medium text-basalt leading-tight mt-0.5">
                    {step.rightValue}
                  </p>
                </div>
              </div>

              {/* Footer note */}
              {step.footer && (
                <div className="flex items-start justify-between mt-1.5 px-1 gap-4">
                  <p className="text-[11px] text-basalt/50">{step.footer}</p>
                  {step.footerLink && (
                    <a
                      href={step.footerLink.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-fjord/70 underline underline-offset-2 decoration-fjord/30 hover:text-rust transition-colors shrink-0 mt-0.5"
                    >
                      {step.footerLink.label}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// MobileTimeline — compact vertical timeline for mobile
// =============================================================================

export function MobileTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="space-y-2.5">
      {steps.map((step) => (
        <div key={step.num} className="flex gap-3">
          <div className="w-[34px] h-[34px] rounded-full bg-navy flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-[13px] font-medium text-wool">
              {step.num}
            </span>
          </div>
          <div className="flex-1 min-w-0 border border-basalt/15 rounded-[7px] p-3">
            <p className="font-medium text-[15px] text-basalt">{step.title}</p>
            <p className="text-[12px] text-basalt/55">{step.subtitle}</p>
            <div className="flex items-baseline gap-3 mt-2">
              <p className="text-[11px] text-basalt/45">{step.rightLabel}:</p>
              <p className="code tnum text-[15px] font-medium text-basalt">
                {step.rightValue}
              </p>
              {step.middleLabel2 ? (
                <>
                  <span className="text-basalt/30">·</span>
                  <p className="code tnum text-[14px] text-fjord">
                    {step.middleValue}–{step.middleValue2}
                  </p>
                </>
              ) : (
                <>
                  <span className="text-basalt/30">·</span>
                  <p className="text-[12px] text-fjord/70">
                    {step.middleLabel}: {step.middleValue}
                  </p>
                </>
              )}
            </div>
            {step.footer && (
              <div className="mt-2 pt-2 border-t border-basalt/5">
                <p className="text-[11px] text-basalt/50">{step.footer}</p>
                {step.footerLink && (
                  <a
                    href={step.footerLink.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-[11px] text-fjord/70 underline underline-offset-2 mt-1"
                  >
                    {step.footerLink.label}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
