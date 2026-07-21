// =============================================================================
// FilterBar — compact segmented control for Journey / Places / Match / Stay.
// =============================================================================

import type { MapFilter } from "./faroes-map";

const FILTERS: { key: MapFilter; label: string }[] = [
  { key: "journey", label: "Journey" },
  { key: "places", label: "Places" },
  { key: "match", label: "Match" },
  { key: "stay", label: "Stay" },
];

interface FilterBarProps {
  active: MapFilter;
  onChange: (f: MapFilter) => void;
}

export default function FilterBar({ active, onChange }: FilterBarProps) {
  return (
    <div className="flex gap-1" role="tablist" aria-label="Map view filter">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          type="button"
          role="tab"
          aria-selected={active === f.key}
          aria-controls="faroes-map-panel"
          onClick={() => onChange(f.key)}className={`px-4 py-2.5 text-[13px] font-medium border transition-colors min-h-[44px] min-w-[44px] ${
                active === f.key
                  ? "border-basalt/40 bg-basalt text-wool"
                  : "border-basalt/15 text-basalt hover:bg-fog/30"
              }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
