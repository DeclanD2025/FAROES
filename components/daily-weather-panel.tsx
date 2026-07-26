"use client";

import { useEffect, useMemo, useState } from "react";

type Hour = {
  time: string; temperature: number; apparent: number; rainChance: number; rain: number;
  wind: number; gusts: number; direction: number; cloud: number; visibility: number; humidity: number; code: number;
};
type Forecast = { hours: Hour[]; sunrise?: string; sunset?: string; fetchedAt: string; cached?: boolean };

const WEATHER_CODES: Record<number, string> = { 0: "Clear", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast", 45: "Fog", 48: "Rime fog", 51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain", 71: "Light snow", 73: "Snow", 75: "Heavy snow", 80: "Rain showers", 81: "Rain showers", 82: "Heavy showers", 95: "Thunderstorm" };
const icon = (code: number) => code < 2 ? "☀" : code < 4 ? "☁" : code === 45 || code === 48 ? "≋" : code >= 71 && code < 80 ? "❄" : "☂";
const dir = (degrees: number) => ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(degrees / 45) % 8];
const localTime = (iso: string) => new Intl.DateTimeFormat("en-GB", { timeZone: "Atlantic/Faroe", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));

export function DailyWeatherPanel({ date, location, lat, lon, activityHours, implication }: { date: string; location: string; lat: number; lon: number; activityHours: number[]; implication: string }) {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);
  const key = `faroe-weather:${date}:${lat.toFixed(3)}:${lon.toFixed(3)}`;

  useEffect(() => {
    let dead = false;
    const cached = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
    if (cached) { try { setForecast({ ...(JSON.parse(cached) as Forecast), cached: true }); } catch { /* ignore invalid storage */ } }
    const start = `${date}T00:00`;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,relative_humidity_2m,cloud_cover,visibility,wind_speed_10m,wind_gusts_10m,wind_direction_10m&daily=sunrise,sunset&timezone=Atlantic%2FFaroe&start_date=${date}&end_date=${date}`, { cache: "no-store" })
      .then((res) => { if (!res.ok) throw new Error("forecast unavailable"); return res.json(); })
      .then((data) => {
        if (dead) return;
        const h = data.hourly;
        const next: Forecast = { hours: h.time.map((time: string, i: number) => ({ time, temperature: h.temperature_2m[i], apparent: h.apparent_temperature[i], rainChance: h.precipitation_probability[i], rain: h.precipitation[i], wind: h.wind_speed_10m[i], gusts: h.wind_gusts_10m[i], direction: h.wind_direction_10m[i], cloud: h.cloud_cover[i], visibility: h.visibility[i], humidity: h.relative_humidity_2m[i], code: h.weather_code[i] })), sunrise: data.daily?.sunrise?.[0], sunset: data.daily?.sunset?.[0], fetchedAt: new Date().toISOString() };
        setForecast(next); setError(false);
        try { window.localStorage.setItem(key, JSON.stringify(next)); } catch { /* optional cache */ }
      }).catch(() => { if (!dead) setError(true); });
    return () => { dead = true; };
  }, [date, key, lat, lon]);

  const hours = useMemo(() => forecast?.hours.filter((hour) => activityHours.includes(new Date(hour.time).getHours())) ?? [], [forecast, activityHours]);
  const full = forecast?.hours ?? [];
  const stale = forecast?.cached && error;
  return <section className="border border-basalt/15 rounded-[8px] overflow-hidden bg-wool/30">
    <div className="p-4 border-b border-basalt/10 flex flex-wrap items-start justify-between gap-3">
      <div><p className="label text-fjord">Hourly weather · {location}</p><p className="mt-1 text-[13px] text-basalt/65">Activity-window forecast in Atlantic/Faroe time. Wind, gusts and visibility are decisive outdoors.</p></div>
      <p className={`text-[11px] ${stale ? "text-rust" : "text-basalt/50"}`}>{forecast ? `${stale ? "Cached" : "Live"} · ${new Intl.DateTimeFormat("en-GB", { timeZone: "Atlantic/Faroe", hour: "2-digit", minute: "2-digit" }).format(new Date(forecast.fetchedAt))}` : error ? "Unavailable" : "Loading…"}</p>
    </div>
    {forecast ? <>
      <div className="px-4 py-3 text-[12px] text-basalt/70 flex flex-wrap gap-x-5 gap-y-1"><span>Sunrise {forecast.sunrise ? localTime(forecast.sunrise) : "—"}</span><span>Sunset {forecast.sunset ? localTime(forecast.sunset) : "—"}</span><span>{implication}</span></div>
      <div className="overflow-x-auto border-t border-basalt/10"><div className="flex min-w-max divide-x divide-basalt/10">{hours.map((hour) => <div key={hour.time} className="w-[8.6rem] px-3 py-3"><p className="code text-[13px] text-fjord">{localTime(hour.time)}</p><p className="mt-1 text-[18px] text-basalt">{icon(hour.code)} <span className="code">{Math.round(hour.temperature)}°</span></p><p className="text-[11px] text-basalt/65 truncate">{WEATHER_CODES[hour.code] ?? "Conditions"}</p><p className="mt-2 text-[11px] text-basalt/60">Feels {Math.round(hour.apparent)}° · {hour.rainChance}%</p><p className="text-[11px] text-basalt/60">Wind {Math.round(hour.wind)} / gust {Math.round(hour.gusts)} km/h {dir(hour.direction)}</p></div>)}</div></div>
      <button type="button" onClick={() => setOpen((value) => !value)} className="w-full text-left px-4 py-3 border-t border-basalt/10 text-[12px] font-medium text-fjord hover:bg-fog/20 focus-visible:outline-2 focus-visible:outline-fjord">{open ? "Hide full hourly detail" : "Show full hourly detail"} <span aria-hidden>↓</span></button>
      {open && <div className="overflow-x-auto border-t border-basalt/10"><table className="w-full min-w-[44rem] text-left text-[11px]"><thead className="text-basalt/50"><tr><th className="p-3">Time</th><th>Conditions</th><th>Air / feels</th><th>Rain</th><th>Wind / gust</th><th>Cloud</th><th>Visibility</th><th>Humidity</th></tr></thead><tbody>{full.map((hour) => <tr key={hour.time} className="border-t border-basalt/10 text-basalt/70"><td className="p-3 code">{localTime(hour.time)}</td><td>{icon(hour.code)} {WEATHER_CODES[hour.code]}</td><td className="code">{Math.round(hour.temperature)}° / {Math.round(hour.apparent)}°</td><td>{hour.rainChance}% · {hour.rain.toFixed(1)} mm</td><td>{Math.round(hour.wind)} / {Math.round(hour.gusts)} km/h {dir(hour.direction)}</td><td>{hour.cloud}%</td><td>{(hour.visibility / 1000).toFixed(1)} km</td><td>{hour.humidity}%</td></tr>)}</tbody></table></div>}
    </> : <p className="p-4 text-[13px] text-basalt/65">{error ? "Live forecast is unavailable. A saved forecast will be shown automatically if one exists; verify conditions with the meteorological provider before departure." : "Loading the live, date-specific forecast…"}</p>}
    <p className="px-4 py-3 border-t border-basalt/10 text-[11px] text-basalt/50">Source: <a className="underline underline-offset-2" target="_blank" rel="noreferrer" href="https://open-meteo.com/en/docs">Open-Meteo forecast API</a> · Forecast data is live/cached only; no invented fallback values.</p>
  </section>;
}
