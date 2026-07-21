"use client";

// -----------------------------------------------------------------------------
// Hydration-safe localStorage-backed checklist.
//
// Pattern (mirrors use-countdown): server snapshot is null, client snapshot
// is the parsed value from localStorage under "faroe-pack-state". The shape
// is `{ [id]: true }` so consumers can index items by their canonical id.
//
// We deliberately keep the ready/total count hidden until at least one item is
// checked — the brief says "0% readiness" should not appear as a headline
// when the checklist hasn't been used yet.
// -----------------------------------------------------------------------------

import { useCallback, useSyncExternalStore } from "react";

const KEY = "faroe-pack-state";

type Listener = () => void;
type Snapshot = Record<string, boolean> | null;

const listeners = new Set<Listener>();

function read(): Snapshot {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as Record<string, boolean>;
    return {};
  } catch {
    return {};
  }
}

function write(next: Snapshot): void {
  if (typeof window === "undefined") return;
  try {
    if (!next) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Quota or disabled storage — silently no-op, the UI still works in-memory.
  }
  for (const l of listeners) l();
}

// The store pins the snapshot in memory. We only read from localStorage once
// per subscribe cycle; the rest is a plain object reference, so React’s
// Object.is comparison treats the snapshot as stable within a render.
let cache: Snapshot = null;

function ensureHydrated() {
  if (cache === null && typeof window !== "undefined") {
    cache = read();
  }
}

const store = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot(): Snapshot {
    ensureHydrated();
    return cache ?? {};
  },
  getServerSnapshot(): Snapshot {
    return null;
  },
};

export interface ChecklistAPI {
  state: Snapshot;
  isChecked(id: string): boolean;
  toggle(id: string): void;
  set(id: string, value: boolean): void;
  reset(): void;
  ready: number;       // ready count, 0 when state is null
  total: number;       // total items passed by the caller
  // Phrase shown next to the progress bar — null when zero items are checked
  // so we don't reveal "0%" before the user has touched anything.
  phrase: string | null;
  // Ready/total ratio 0..1 — convenient for bar widths.
  ratio: number;
}

export function useChecklist(ids: readonly string[]): ChecklistAPI {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const total = ids.length;
  const effectiveState = state ?? {};
  const ready = ids.reduce((acc, id) => (effectiveState[id] ? acc + 1 : acc), 0);
  const ratio = total === 0 ? 0 : ready / total;

  const toggle = useCallback((id: string) => {
    const next = { ...(store.getSnapshot() ?? {}) };
    next[id] = !next[id];
    if (!next[id]) delete next[id];
    cache = next;
    write(next);
  }, []);
  const set = useCallback((id: string, value: boolean) => {
    const next = { ...(store.getSnapshot() ?? {}) };
    if (value) next[id] = true;
    else delete next[id];
    cache = next;
    write(next);
  }, []);
  const reset = useCallback(() => {
    cache = {};
    write({});
  }, []);

  const phrase = ready === 0 ? null : `${ready} of ${total} ready`;

  return {
    state,
    isChecked: (id) => Boolean(effectiveState[id]),
    toggle,
    set,
    reset,
    ready,
    total,
    phrase,
    ratio,
  };
}
