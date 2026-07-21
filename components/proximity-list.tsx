// =============================================================================
// ProximityList — renders distance-banded list of shops, food, drink, and
// practical services near Við á 7, Øravík 827. Groups by distance from the
// guesthouse: on foot, nearby, short bus/taxi, half-day trip.
// =============================================================================

"use client";

import { useState, useMemo } from "react";
import { ORAVIK_BASE_GUIDE, type ProximityItem } from "@/lib/data/day-intel";

// ---------------------------------------------------------------------------
// Filter tabs
// ---------------------------------------------------------------------------

type FilterTab = "all" | "supplies" | "food-drink" | "practical" | "nearby" | "trips";

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "supplies", label: "Supplies" },
  { id: "food-drink", label: "Food & Drink" },
  { id: "practical", label: "Practical" },
  { id: "nearby", label: "Nearby" },
  { id: "trips", label: "Trips" },
];

const FILTER_CATEGORIES: Record<FilterTab, string[]> = {
  all: [],
  supplies: ["supermarket", "pharmacy"],
  "food-drink": ["food", "cafe", "restaurant", "bar"],
  practical: ["transport", "atm", "pharmacy"],
  nearby: ["village", "harbour", "walk", "town"],
  trips: ["visit", "viewpoint"],
};

function itemMatchesFilter(item: ProximityItem, tab: FilterTab): boolean {
  if (tab === "all") return true;
  return FILTER_CATEGORIES[tab].includes(item.category);
}

// ---------------------------------------------------------------------------
// Category colour map
// ---------------------------------------------------------------------------

const CATEGORY_STYLES: Record<string, string> = {
  supermarket: "bg-moss/10 text-moss border-moss/25",
  food: "bg-amber/10 text-amber border-amber/25",
  cafe: "bg-amber/10 text-amber border-amber/25",
  restaurant: "bg-amber/10 text-amber border-amber/25",
  bar: "bg-rust/10 text-rust border-rust/25",
  pharmacy: "bg-fjord/10 text-fjord border-fjord/25",
  atm: "bg-basalt/10 text-basalt border-basalt/25",
  transport: "bg-fjord/10 text-fjord border-fjord/25",
  village: "bg-basalt/10 text-basalt border-basalt/25",
  harbour: "bg-fjord/10 text-fjord border-fjord/25",
  walk: "bg-moss/10 text-moss border-moss/25",
  town: "bg-basalt/10 text-basalt border-basalt/25",
  visit: "bg-moss/10 text-moss border-moss/25",
  viewpoint: "bg-moss/10 text-moss border-moss/25",
};

function categoryStyle(cat: string): string {
  return CATEGORY_STYLES[cat] ?? "bg-basalt/10 text-basalt border-basalt/25";
}

// ---------------------------------------------------------------------------
// Distance formatter
// ---------------------------------------------------------------------------

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function formatTime(min: number | null): string | null {
  if (min === null) return null;
  if (min < 60) return `${min} min walk`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m walk` : `${h}h walk`;
}

// ---------------------------------------------------------------------------
// Derived summary from data
// ---------------------------------------------------------------------------

function deriveSummary(bands: typeof ORAVIK_BASE_GUIDE) {
  const allItems = bands.flatMap((b) => b.items);

  const find = (category: string) =>
    allItems.find((i) => i.category === category);

  const nearestShop = find("supermarket");
  const nearestFood = find("food");
  const nearestCafe = find("cafe");

  return [
    {
      label: "Nearest shop",
      name: nearestShop?.name ?? "—",
      detail: nearestShop
        ? `${formatDistance(nearestShop.distanceKm)} · Bus ${nearestShop.busRoute}`
        : "No shop in Øravík",
    },
    {
      label: "Nearest pub",
      name: nearestFood?.name ?? "—",
      detail: nearestFood
        ? `${formatDistance(nearestFood.distanceKm)} · ${formatTime(nearestFood.walkingTimeMin)}`
        : "No pub in Øravík",
    },
    {
      label: "Nearest café",
      name: nearestCafe?.name ?? "—",
      detail: nearestCafe
        ? `${formatDistance(nearestCafe.distanceKm)} · ${nearestCafe.openingHours.split("(")[0].trim()}`
        : "No café in Øravík",
    },
    {
      label: "Øravík village",
      name: "No services",
      detail: "Plan supplies ahead",
    },
  ];
}

// ---------------------------------------------------------------------------
// Item card
// ---------------------------------------------------------------------------

function ProximityCard({ item }: { item: ProximityItem }) {
  return (
    <div className="border border-basalt/10 rounded-[7px] p-4 bg-wool">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {/* Name + category */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[14px] font-medium text-basalt leading-snug">
              {item.name}
            </h3>
            <span
              className={`shrink-0 text-[9px] uppercase tracking-[0.08em] px-2 py-0.5 rounded-[3px] border ${categoryStyle(item.category)}`}
            >
              {item.category}
            </span>
          </div>

          {/* Notes */}
          <p className="text-[12px] text-basalt/65 leading-relaxed">
            {item.notes}
          </p>

          {/* Opening hours */}
          {item.openingHours !== "N/A" && (
            <p className="text-[11px] text-basalt/50 mt-1.5">
              <span className="font-medium">Hours:</span> {item.openingHours}
            </p>
          )}

          {/* Fallback */}
          {item.fallback && (
            <p className="text-[11px] text-rust/70 mt-1">
              <span className="font-medium">Fallback:</span> {item.fallback}
            </p>
          )}
        </div>

        {/* Distance + transport */}
        <div className="shrink-0 text-right min-w-[80px]">
          <p className="code tnum text-[18px] font-medium text-fjord leading-none">
            {formatDistance(item.distanceKm)}
          </p>
          {item.walkingTimeMin !== null && (
            <p className="text-[10px] text-basalt/50 mt-0.5">
              {formatTime(item.walkingTimeMin)}
            </p>
          )}
          {item.busRoute && (
            <p className="text-[10px] text-fjord/60 mt-0.5">
              Bus {item.busRoute}
              {item.busStops !== null && ` · ${item.busStops} stops`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Band section
// ---------------------------------------------------------------------------

function DistanceBandSection({
  label,
  description,
  items,
}: {
  label: string;
  description: string;
  items: ProximityItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="mb-3">
        <p className="text-[10px] uppercase tracking-[0.14em] text-fjord/60">
          {label}
        </p>
        <p className="text-[12px] text-basalt/50 mt-0.5">{description}</p>
      </div>
      <div className="space-y-2.5">
        {items.map((item) => (
          <ProximityCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Filter tab bar
// ---------------------------------------------------------------------------

function FilterBar({
  active,
  onChange,
}: {
  active: FilterTab;
  onChange: (tab: FilterTab) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 mb-6" role="tablist" aria-label="Filter by category">
      {FILTER_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={`text-[11px] font-medium uppercase tracking-[0.08em] px-3 py-1.5 rounded-[6px] border transition-colors focus-visible:outline-2 focus-visible:outline-navy ${
            active === tab.id
              ? "bg-fjord text-wool border-fjord"
              : "border-basalt/20 text-basalt/60 hover:border-basalt/40 hover:text-basalt"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface ProximityListProps {
  defaultFilter?: FilterTab;
}

export default function ProximityList({ defaultFilter = "all" }: ProximityListProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>(defaultFilter);

  // Memoize filtered bands
  const filteredBands = useMemo(
    () =>
      ORAVIK_BASE_GUIDE.map((band) => ({
        ...band,
        items: band.items.filter((item) => itemMatchesFilter(item, activeTab)),
      })).filter((band) => band.items.length > 0),
    [activeTab],
  );

  // Derive summary from data (always shows all-category summary for orientation)
  const summary = useMemo(() => deriveSummary(ORAVIK_BASE_GUIDE), []);

  return (
    <article className="px-6 sm:px-8 lg:px-10 pt-8 pb-20 max-w-[56rem]">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[12px] tracking-[0.14em] uppercase text-rust font-medium">
          Øravík base guide
        </p>
        <h1
          className="text-[clamp(1.8rem,3vw,2.4rem)] leading-[1.06] mt-1.5 text-basalt tracking-[-0.01em]"
          style={{ fontFamily: "var(--font-cinzel)" }}
        >
          Shops, food &amp; services
        </h1>
        <p className="text-[14px] text-basalt/60 mt-2 max-w-[34rem]">
          What&rsquo;s near Við á 7, Øravík 827 — and how far away everything is.
          No shop in the village. All supplies from Tvøroyri, 3.5 km north.
        </p>
      </div>

      {/* Quick summary */}
      <div className="border border-basalt/15 rounded-[7px] p-4 mb-6 bg-fog/[0.03]">
        <p className="text-[10px] uppercase tracking-[0.12em] text-fjord/60 mb-2">
          At a glance
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]">
          {summary.map((s) => (
            <div key={s.label}>
              <p className="text-basalt/50">{s.label}</p>
              <p className="font-medium text-basalt">{s.name}</p>
              <p className="text-[11px] text-basalt/50">{s.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <FilterBar active={activeTab} onChange={setActiveTab} />

      {/* Distance bands */}
      {filteredBands.map((band) => (
        <DistanceBandSection
          key={band.label}
          label={band.label}
          description={band.description}
          items={band.items}
        />
      ))}

      {/* Footer note */}
      <div className="mt-8 pt-6 border-t border-basalt/15">
        <p className="text-[11px] text-basalt/50">
          Distances measured from Við á 7, Øravík 827. Bus 700 runs the coastal
          spine of Suðuroy — check the{" "}
          <a
            href="https://ssl.fo"
            className="underline underline-offset-2 decoration-basalt/25 hover:text-fjord transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            SSL timetable
          </a>{" "}
          for live schedules. Taxi: +298 239550 (pre-book for late arrivals).
          Confidence levels indicate how recently each listing was verified.
        </p>
      </div>
    </article>
  );
}
