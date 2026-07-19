"use client";

// Hydration-safe countdown helper.
// Why this shape: this site is a static export. Anything computed at build
// time freezes on the build date — the countdown has to come from the
// client. We use useSyncExternalStore with a null server snapshot, so the
// prerendered HTML carries no value, and React's hydration layer doesn't
// see a mismatch when the first client effect runs.
//
// Note: the ticker's get() returns a per-minute stable value rather than
// raw Date.now(), because useSyncExternalStore compares snapshots with
// Object.is on every render. Raw Date.now() would force a re-render on
// every other change in the React tree.

import { useSyncExternalStore } from "react";

type Listener = () => void;

interface Ticker {
  subscribe(listener: Listener): () => void;
  get(): number;              // minute-granular snapshot
  server(): null;
}

function minuteStamp(): number {
  // Stable within a minute, re-evaluated only when the minute changes.
  return Math.floor(Date.now() / 60_000) * 60_000;
}

function makeTicker(): Ticker {
  const listeners = new Set<Listener>();
  let timer: ReturnType<typeof setInterval> | null = null;

  function ensureTimer() {
    if (timer || typeof window === "undefined") return;
    timer = setInterval(() => {
      // Within a single tick, get() returns a stable minute stamp.
      const listenersCopy = Array.from(listeners);
      for (const l of listenersCopy) l();
    }, 60_000);
  }
  function dropTimer() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      ensureTimer();
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) dropTimer();
      };
    },
    get: minuteStamp,
    server: () => null,
  };
}

const ticker = makeTicker();

export interface Countdown {
  days: number | null;
  hours: number | null;
  minutes: number | null;
  phrase: string | null;
  arrived: boolean;
}

function compute(targetIso: string): Countdown {
  const target = new Date(targetIso).getTime();
  const now = ticker.get();
  const diff = target - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, phrase: "We’re here", arrived: true };
  }

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);

  let phrase: string;
  if (days >= 2)         phrase = `${days} days to go`;
  else if (days === 1)  phrase = `1 day to go`;
  else if (hours >= 1)  phrase = `${hours} h to go`;
  else                  phrase = `${Math.max(0, minutes)} min to go`;

  return { days, hours, minutes, phrase, arrived: false };
}

export function useCountdown(targetIso: string): Countdown {
  const stamp = useSyncExternalStore(
    ticker.subscribe,
    ticker.get,
    ticker.server,
  );
  if (stamp === null) {
    return { days: null, hours: null, minutes: null, phrase: null, arrived: false };
  }
  return compute(targetIso);
}
