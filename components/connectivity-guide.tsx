"use client";

import { useEffect, useState } from "react";
import {
  ARRIVAL_CONNECTIVITY_STEPS,
  CONNECTIVITY_PLAN,
  DATA_BUDGET,
  OFFLINE_FALLBACK,
  PRE_DEPARTURE_ESIM_STEPS,
} from "@/lib/data/connectivity";

const TABS = ["Set up", "Arrival", "Safety", "Data"] as const;
type Tab = (typeof TABS)[number];
const STORAGE_KEY = "faroe-trip:nomad-remaining-gb";

export function ArrivalConnectivityCard() {
  return (
    <div className="border border-moss/30 rounded-[8px] overflow-hidden bg-moss/[0.035]">
      <div className="px-4 py-3 border-b border-moss/20 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-moss font-medium">After landing · mobile data</p>
          <p className="text-[15px] text-basalt font-medium mt-0.5">Set the Faroe line once, before leaving Vágar.</p>
        </div>
        <span className="text-[10px] uppercase tracking-[0.1em] text-fjord/60">{CONNECTIVITY_PLAN.network}</span>
      </div>
      <ol className="px-4 py-3 grid gap-2 text-[12px] leading-[1.5] text-basalt/75">
        {ARRIVAL_CONNECTIVITY_STEPS.map((step, index) => (
          <li key={step} className="grid grid-cols-[1.25rem_1fr] gap-2"><span className="text-moss font-medium">0{index + 1}</span><span>{step}</span></li>
        ))}
      </ol>
      <p className="px-4 pb-3 text-[11px] leading-[1.45] text-rust">Keep giffgaff voice/SMS available if you need it, but leave its data roaming off.</p>
    </div>
  );
}

export function ConnectivityGuide() {
  const [tab, setTab] = useState<Tab>("Set up");
  const [remaining, setRemaining] = useState("");

  useEffect(() => setRemaining(localStorage.getItem(STORAGE_KEY) ?? ""), []);
  const updateRemaining = (value: string) => {
    const valid = value === "" || (/^\d+(\.\d)?$/.test(value) && Number(value) <= CONNECTIVITY_PLAN.allowanceGb);
    if (!valid) return;
    setRemaining(value);
    if (value) localStorage.setItem(STORAGE_KEY, value); else localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <article className="px-4 sm:px-8 lg:px-12 pt-8 pb-24 max-w-[1060px]">
      <header className="max-w-[45rem] mb-7">
        <p className="label">Field guide · mobile data</p>
        <h1 className="text-[clamp(2.25rem,4.8vw,3.6rem)] leading-[1.02] mt-3 text-basalt tracking-[-0.02em]" style={{ fontFamily: "var(--font-cinzel)" }}>Mobile data & connectivity.</h1>
        <p className="text-[15px] leading-[1.6] text-basalt/65 mt-3">One deliberate data line for travel updates and safety, with an offline plan for when the islands do what islands do.</p>
      </header>

      <section className="border-y border-basalt/15 py-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <Fact label="Plan" value={`${CONNECTIVITY_PLAN.allowanceGb} GB · ${CONNECTIVITY_PLAN.validityDays} days`} />
        <Fact label="Provider" value={`${CONNECTIVITY_PLAN.provider} · ${CONNECTIVITY_PLAN.price}`} />
        <Fact label="Network" value={CONNECTIVITY_PLAN.network} />
        <Fact label="Price checked" value={CONNECTIVITY_PLAN.checkedAt} />
      </section>

      <div className="flex gap-1 border-b border-basalt/15 mb-5 overflow-x-auto" role="tablist" aria-label="Connectivity guide sections">
        {TABS.map((item) => <button key={item} role="tab" aria-selected={tab === item} onClick={() => setTab(item)} className={`shrink-0 px-3 py-2.5 text-[11px] uppercase tracking-[0.1em] border-b-2 transition-colors ${tab === item ? "border-rust text-basalt" : "border-transparent text-basalt/50 hover:text-basalt"}`}>{item}</button>)}
      </div>

      {tab === "Set up" && <section className="grid lg:grid-cols-[1.2fr_.8fr] gap-5">
        <GuideList title="Before leaving Scotland" items={PRE_DEPARTURE_ESIM_STEPS} />
        <aside className="border border-rust/25 rounded-[7px] p-4 bg-rust/[0.025]">
          <p className="label text-rust">giffgaff warning</p>
          <p className="text-[14px] leading-[1.6] text-basalt/75 mt-2">{CONNECTIVITY_PLAN.giffgaffWarning}</p>
          <a href={CONNECTIVITY_PLAN.purchaseUrl} target="_blank" rel="noreferrer" className="inline-block mt-4 text-[12px] font-medium text-fjord underline underline-offset-4">Open Nomad Faroe plan ↗</a>
        </aside>
      </section>}
      {tab === "Arrival" && <section className="max-w-[46rem]"><ArrivalConnectivityCard /><p className="text-[12px] leading-[1.55] text-basalt/55 mt-4">{CONNECTIVITY_PLAN.activation} iPhone menus can vary slightly by iOS version.</p></section>}
      {tab === "Safety" && <section className="grid lg:grid-cols-[1.1fr_.9fr] gap-5"><GuideList title="Signal, sharing & watch safety" items={OFFLINE_FALLBACK} /><div className="border border-basalt/15 rounded-[7px] p-4"><p className="label">Before every hike</p><p className="text-[14px] leading-[1.6] text-basalt/70 mt-2">Download the route, start a GPS workout if useful, share your intended finish time, carry a power bank and do not count on live tracking as a rescue plan.</p><p className="text-[12px] text-rust mt-3">Emergency: 112.</p></div></section>}
      {tab === "Data" && <section className="grid lg:grid-cols-[1.1fr_.9fr] gap-5"><div className="divide-y divide-basalt/10 border-y border-basalt/15">{DATA_BUDGET.map((item) => <div key={item.label} className="py-3 grid grid-cols-[1fr_auto] gap-3"><div><p className="text-[14px] font-medium text-basalt">{item.label}</p><p className="text-[12px] leading-[1.45] text-basalt/55 mt-0.5">{item.note}</p></div><p className="text-[13px] font-medium text-fjord">{item.amount}</p></div>)}</div><div className="border border-basalt/15 rounded-[7px] p-4"><p className="label">Manual data check</p><label className="block text-[13px] text-basalt/70 mt-3" htmlFor="remaining-data">GB remaining (check in Nomad)</label><div className="flex items-center gap-2 mt-1"><input id="remaining-data" inputMode="decimal" value={remaining} onChange={(event) => updateRemaining(event.target.value)} placeholder="e.g. 8.5" className="w-28 border border-basalt/20 rounded px-2 py-2 bg-white text-basalt" /><span className="text-[12px] text-basalt/55">of 10 GB</span></div><p className="text-[11px] leading-[1.45] text-basalt/50 mt-3">This stays on this device only. Switch off photo backup, automatic app updates and video autoplay on mobile data.</p></div></section>}
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) { return <div><p className="label">{label}</p><p className="text-[13px] font-medium text-basalt mt-1">{value}</p></div>; }
function GuideList({ title, items }: { title: string; items: readonly string[] }) { return <div className="border border-basalt/15 rounded-[7px] p-4"><p className="label">{title}</p><ol className="mt-3 space-y-3">{items.map((item, index) => <li key={item} className="grid grid-cols-[1.5rem_1fr] gap-2 text-[14px] leading-[1.55] text-basalt/70"><span className="text-rust font-medium">{index + 1}.</span><span>{item}</span></li>)}</ol></div>; }
