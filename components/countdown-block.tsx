// Small client wrapper around useCountdown so the Home page can stay a
// server component. Visually: a small utility block aligned to the rule
// beneath the FAROE ISLANDS heading; tabular-num mono digits; fades to a
// single-line caption while the trip is still far in the future.

"use client";

import { useCountdown } from "@/lib/hooks/use-countdown";

export function Countdown({ target, label }: { target: string; label: string }) {
  const c = useCountdown(target);

  if (c.arrived) {
    return (
      <p className="caption tnum">
        <span className="label">Status</span>{" · onboard"}
      </p>
    );
  }

  return (
    <div className="flex items-baseline gap-x-3">
      <p className="text-[14px] tnum code text-fjord">
        {c.days ?? "—"}
        <span className="caption ml-2">
          {(c.days ?? 0) === 1 ? "day" : "days"} to go
        </span>
      </p>
      <p className="caption">
        <span className="label">{label}</span>
      </p>
    </div>
  );
}
