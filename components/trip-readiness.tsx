// =============================================================================
// TripReadiness — compact persistent trip readiness layer.
// Shows current day, next deadline, pending items, risk count.
// Replaces the hardcoded countdown with a dynamic day-aware display.
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { TRIP } from "@/lib/data/itinerary";

const TRIP_START = new Date("2026-07-27T00:00:00Z");
const TRIP_END = new Date("2026-08-02T00:00:00Z");
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getTripDay(now: Date): { dayNum: number | null; label: string; totalDays: number } {
  if (now < TRIP_START) {
    const daysUntil = Math.ceil((TRIP_START.getTime() - now.getTime()) / 86_400_000);
    return {
      dayNum: null,
      label: daysUntil === 1 ? "1 day until departure" : `${daysUntil} days until departure`,
      totalDays: 6,
    };
  }
  if (now >= TRIP_END) {
    return { dayNum: null, label: "Trip completed", totalDays: 6 };
  }
  const diffFromStart = now.getTime() - TRIP_START.getTime();
  const dayNum = Math.floor(diffFromStart / 86_400_000) + 1;
  return {
    dayNum: Math.min(dayNum, 6),
    label: `Day ${Math.min(dayNum, 6)} of 6`,
    totalDays: 6,
  };
}

export function TripReadiness() {
  const [tripDay, setTripDay] = useState(() => getTripDay(new Date()));

  useEffect(() => {
    const tick = () => setTripDay(getTripDay(new Date()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const { dayNum, label } = tripDay;

  return (
    <div className="border border-basalt/15 rounded-[8px] p-4 bg-basalt/[0.01]">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60">
          Trip readiness
        </p>
        <span className={`text-[11px] font-medium ${dayNum ? "text-moss" : "text-yellow"}`}>
          {label}
        </span>
      </div>

      {dayNum ? (
        /* On-trip view */
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]">
          <ReadinessItem label="Today" value={`Day ${dayNum}`} />
          <ReadinessItem label="Next hard deadline" value="Check ferry" emphasis />
          <ReadinessItem label="Unresolved bookings" value="1 pending" />
          <ReadinessItem label="Critical risks" value="Match ferry" risk />
        </div>
      ) : (
        /* Pre-trip view */
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]">
          <ReadinessItem label="Ferry bookings" value="4 of 4" ok />
          <ReadinessItem label="Checklist" value="12 of 18" />
          <ReadinessItem label="Match ticket" value="Bought" emphasis />
          <ReadinessItem label="Offline maps" value="Ready" ok />
        </div>
      )}
    </div>
  );
}

function ReadinessItem({
  label,
  value,
  emphasis,
  risk,
  ok,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  risk?: boolean;
  ok?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.08em] text-basalt/50 mb-0.5">{label}</p>
      <p className={`font-medium ${emphasis ? "text-rust" : risk ? "text-rust" : ok ? "text-moss" : "text-basalt"}`}>
        {value}
      </p>
    </div>
  );
}
