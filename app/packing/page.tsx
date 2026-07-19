// Prepare — the field checklist notebooks.
// Six brief-aligned categories. Real checkboxes, persistent on this device.
// Each completed row gets a small moss-green stamp; each urgent row carries a
// small rust-red dot. No card grid. State persists under "faroe-pack-state".

"use client";

import { CHECKLIST, PACKING } from "@/lib/data/itinerary";
import { useChecklist } from "@/lib/hooks/use-checklist";

type Cat = "DOCUMENTS" | "CLOTHING" | "MATCH DAY" | "TECHNOLOGY" | "HEALTH" | "TRANSPORT";

type PrepareItem = {
  id: string;
  what: string;
  why?: string;
  urgent?: boolean;
};

const PREPARE: Record<Cat, PrepareItem[]> = {
  DOCUMENTS: CHECKLIST.filter((c) => c.group === "Book" || c.group === "Confirm").map((c) => ({ id: c.id, what: c.what, why: c.why })),
  CLOTHING: PACKING.filter((p) => p.zone === "Wear" || p.zone === "Pack").map((p) => ({ id: p.id, what: p.what, why: p.why })),
  "MATCH DAY": CHECKLIST.filter((c) => c.group === "Carry" && /scarf|top|ticket|match|shirt/i.test(c.what)).map((c) => ({ id: c.id, what: c.what, why: c.why })),
  TECHNOLOGY: PACKING.filter((p) => /laptop|charger|power|adapter|cable/i.test(p.what)).map((p) => ({ id: p.id, what: p.what, why: p.why })),
  HEALTH: PACKING.filter((p) => /medic|toilet|sanit|first|tooth|wash|vitamin|pill/i.test(p.what)).map((p) => ({ id: p.id, what: p.what, why: p.why })),
  TRANSPORT: PACKING.filter((p) => /shoes|jacket|passport|under-seat|trail|tickets|bus/i.test(p.what)).map((p) => ({ id: p.id, what: p.what, why: p.why })),
};

const ALL_IDS = Object.values(PREPARE).flat().map((i) => i.id);

export default function PreparePage() {
  const checklist = useChecklist(ALL_IDS);

  return (
    <article className="px-6 sm:px-8 lg:px-12 pt-10 pb-28 max-w-[64rem]">
      <header className="pb-8">
        <p className="label">Prepare · runs on this device</p>
        <h1 className="font-sans font-medium text-[clamp(2rem,4.4vw,3rem)] leading-[1.04] mt-3 text-basalt tracking-[-0.012em]">
          Field checklist.
        </h1>
        <p className="caption mt-3 max-w-[40rem]">
          Six notebook sections. Tick as you pack. State persists on this device
          under <span className="code">faroe-pack-state</span> and never leaves the
          browser. Urgent items carry a rust-red dot.
        </p>
      </header>

      {checklist.phrase ? (
        <p className="caption pb-6 border-b border-basalt/15">
          <span className="label">Progress</span>{" · "}
          <span className="tnum">{checklist.phrase}</span>
          {" · "}
          <span className="caption">{checklist.total} items</span>
        </p>
      ) : (
        <p className="caption pb-6 border-b border-basalt/15">
          <span className="label">Progress</span>{" · "}Nothing ticked yet — start with DOCUMENTS.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-14 mt-10">
        {(Object.keys(PREPARE) as Cat[]).map((cat) => (
          <Category key={cat} cat={cat} items={PREPARE[cat]} checklistId={checklist.isChecked} onToggle={checklist.toggle} />
        ))}
      </div>
    </article>
  );
}

function Category({
  cat,
  items,
  checklistId,
  onToggle,
}: {
  cat: Cat;
  items: PrepareItem[];
  checklistId: (id: string) => boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <section aria-labelledby={`cat-${cat.toLowerCase().replace(/\s+/g, "-")}`}>
      <header className="mb-3 border-b border-basalt/15 pb-2">
        <h2
          id={`cat-${cat.toLowerCase().replace(/\s+/g, "-")}`}
          className="label"
        >
          {cat}
        </h2>
        <p className="caption mono-label tnum mt-1">
          {items.length} item{items.length === 1 ? "" : "s"}
        </p>
      </header>
      <ul>
        {items.map((it) => {
          const done = checklistId(it.id);
          return (
            <li key={it.id} className="py-2">
              <label htmlFor={it.id} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id={it.id}
                  checked={done}
                  onChange={() => onToggle(it.id)}
                  className="sr-only"
                />
                <span
                  aria-hidden
                  className={`mt-1 block w-3.5 h-3.5 shrink-0 border ${done ? "border-moss" : "border-basalt/35"}`}
                  style={{ background: done ? "color-mix(in oklab, var(--moss) 30%, transparent)" : "transparent" }}
                  data-tone={done ? "ok" : "info"}
                >
                  {done ? (
                    <svg viewBox="0 0 12 12" className="block w-full h-full" stroke="var(--moss)" strokeWidth="1.6" fill="none">
                      <path d="M2 6 L5 9 L10 3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </span>
                <span className="flex-1">
                  <span
                    className={`block text-[14.5px] leading-snug ${done ? "text-basalt/50 line-through" : "text-basalt"}`}
                  >
                    {it.what}
                  </span>
                  {it.why ? <span className="block caption mt-1">{it.why}</span> : null}
                </span>
                {it.urgent ? (
                  <span className="status-dot text-rust mt-2" aria-label="Urgent" />
                ) : null}
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
