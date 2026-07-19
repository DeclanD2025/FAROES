// Tailwind-aware className joiner. Mirrors what `clsx` + `tailwind-merge` would
// give us, but as a one-purpose shim so we don't pull an extra dependency onto
// the static-export footprint.
export function cn(...parts: Array<string | false | null | undefined>): string {
  const out: string[] = [];
  for (const p of parts) {
    if (!p) continue;
    if (out.length && out[out.length - 1]?.length) out.push(" ");
    out.push(p);
  }
  return out.join("");
}

// Apply a tonal wash without invoking a Tailwind class lookup at runtime —
// used for the claret match-day background where Tailwind's color-mix tokens
// are easier to author inline than to round-trip through the theme.
export function tone(color: string, opacity: number): string {
  const o = Math.max(0, Math.min(1, opacity));
  return `color-mix(in oklab, ${color} ${(o * 100).toFixed(1)}%, transparent)`;
}
