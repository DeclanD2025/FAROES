"use client";

import { useState, useEffect } from "react";

// =============================================================================
// LiveBoard — wraps a static table and tries to replace it with live data.
// Shows a status indicator: "live" (green) or "static" (with verify note).
// =============================================================================

interface LiveBoardProps {
  title: string;
  fetchUrl?: string;
  /** Transform the raw API response into an array of rows. Return null on failure. */
  transform?: (json: unknown) => LiveRow[] | null;
  /** Hardcoded rows shown while loading and on fetch failure. */
  fallbackRows: LiveRow[];
  /** Link to the official live source. */
  sourceUrl: string;
  sourceLabel: string;
  columns: { key: string; label: string; mono?: boolean; narrow?: boolean }[];
  highlightKey?: string;
  highlightValue?: string;
}

export interface LiveRow {
  [key: string]: string;
}

export function LiveBoard({
  title,
  fetchUrl,
  transform,
  fallbackRows,
  sourceUrl,
  sourceLabel,
  columns,
  highlightKey,
  highlightValue,
}: LiveBoardProps) {
  const [rows, setRows] = useState<LiveRow[]>(fallbackRows);
  const canFetch = !!(fetchUrl && transform);
  const [status, setStatus] = useState<"loading" | "live" | "static">(canFetch ? "loading" : "static");

  useEffect(() => {
    if (!fetchUrl || !transform) {
      setStatus("static");
      return;
    }

    let cancelled = false;
    const fetchLive = async () => {
      try {
        const res = await fetch(fetchUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;
        const live = transform(json);
        if (live && live.length > 0) {
          setRows(live);
          setStatus("live");
        } else {
          setStatus("static");
        }
      } catch {
        if (!cancelled) setStatus("static");
      }
    };
    fetchLive();
    return () => { cancelled = true; };
  }, [fetchUrl, transform]);

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <p className="label">{title}</p>
        <div className="flex items-center gap-3">
          <span className={`text-[10px] uppercase tracking-[0.08em] font-medium ${status === "live" ? "text-moss" : "text-fjord/50"}`}>
            {status === "live" ? "● Live" : status === "loading" ? "○ Loading…" : "◉ Static · confirm near date"}
          </span>
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] uppercase tracking-[0.08em] underline underline-offset-4 decoration-basalt/20 text-fjord/60 hover:text-rust transition-colors"
          >
            {sourceLabel} ↗
          </a>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b-2 border-basalt/20 text-left">
              {columns.map((col) => (
                <th key={col.key} className={`pb-2 ${col.narrow ? "pr-2" : "pr-4"} label`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isHighlighted = highlightKey && highlightValue
                ? row[highlightKey] === highlightValue
                : false;
              return (
                <tr key={i} className={`border-b border-basalt/10 ${isHighlighted ? "bg-rust/5" : ""}`}>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-2.5 ${col.narrow ? "pr-2" : "pr-4"} ${col.mono ? "code tnum" : ""} ${isHighlighted && col.key === highlightKey ? "text-rust font-medium" : "text-fjord"}`}
                    >
                      {row[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
