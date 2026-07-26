"use client";

import { useState } from "react";

type GuideTab = "plan" | "food" | "context" | "field-notes";

interface DayThreeFieldGuideProps {
  actions: readonly (readonly [string, string])[];
  completedActions: boolean[];
  onToggleAction: (index: number) => void;
}

const TABS: { id: GuideTab; label: string }[] = [
  { id: "plan", label: "The day" },
  { id: "food", label: "Eat & drink" },
  { id: "context", label: "Why it matters" },
  { id: "field-notes", label: "Field notes" },
];

const FOOD_LANES = [
  {
    cue: "Seafood",
    title: "Make it a sea-food meal",
    copy: "For a proper Faroese seafood sitting, Barbara Fish House is the direct choice: its menu centres on locally caught fish and shellfish. ROKS is the more polished, modern Faroese option, with seafood at the centre of its tasting menu.",
    links: [
      { label: "Barbara Fish House ↗", href: "https://visitfaroeislands.com/de/whatson/places/place/barbara-fish-house0?lang=en" },
      { label: "ROKS ↗", href: "https://visitfaroeislands.com/en/whatson/places/place/roks0?lang=en" },
    ],
  },
  {
    cue: "Faroese classics",
    title: "Try the preservation story",
    copy: "Ræst is built around the Faroese fermentation tradition of the same name; Åarstova is the lamb-led counterpart. The useful thing to ask for is context: what is fresh, what is ræst, and how it has been preserved.",
    links: [
      { label: "Ræst ↗", href: "https://visitfaroeislands.com/en/whatson/places/place/rast0" },
      { label: "Faroese food guide ↗", href: "https://visitfaroeislands.com/en/about-vfi/people-society/faroese-food" },
    ],
  },
  {
    cue: "The festival reality",
    title: "Have a flexible food plan",
    copy: "29 July is a public holiday: do not turn any restaurant into a promise until it confirms it is open and has a table. Keep a snack and water in the day bag, then use festival stalls or a confirmed booking once you are in town.",
    links: [
      { label: "Ólavsøka programme ↗", href: "https://www.torshavn.fo/temu/mentan-og-fritid/olavsoeka-2026" },
    ],
  },
];

export function DayThreeFieldGuide({ actions, completedActions, onToggleAction }: DayThreeFieldGuideProps) {
  const [activeTab, setActiveTab] = useState<GuideTab>("plan");

  return (
    <section className="mt-10 max-w-[58rem]" aria-labelledby="day-three-guide-title">
      <header className="border-b border-basalt/15 pb-4">
        <p className="label text-rust">Day 3 field guide</p>
        <h2 id="day-three-guide-title" className="mt-2 text-[clamp(1.45rem,3vw,2rem)] leading-tight text-basalt" style={{ fontFamily: "var(--font-cinzel)" }}>
          One day, four useful views.
        </h2>
        <p className="mt-2 max-w-[42rem] text-[14px] leading-relaxed text-basalt/65">Use the tabs when you need them: the running order, a food lane, the story behind the day, and the few things that can break the return journey.</p>
      </header>

      <div className="mt-5 flex gap-1 overflow-x-auto border-b border-basalt/15" role="tablist" aria-label="Ólavsøka field guide sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            id={`olavsoka-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`olavsoka-panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 border-b-2 px-3 py-3 text-[12px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-navy ${activeTab === tab.id ? "border-rust text-rust" : "border-transparent text-basalt/55 hover:text-basalt"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "plan" && (
        <div id="olavsoka-panel-plan" role="tabpanel" aria-labelledby="olavsoka-tab-plan" className="pt-5">
          <div className="grid gap-px overflow-hidden border border-basalt/15 bg-basalt/15 sm:grid-cols-[1fr_auto_1fr]">
            <div className="bg-wool p-4">
              <p className="label text-fjord">Out</p>
              <p className="mt-2 code text-[1.5rem] text-basalt">14:30 → ~16:35</p>
              <p className="mt-1 text-[13px] text-basalt/60">Krambatangi → Tórshavn · arrive at the terminal by 13:30.</p>
            </div>
            <div className="hidden bg-fog/40 px-3 text-[11px] text-basalt/45 sm:flex sm:items-center">ÓLAVSØKA</div>
            <div className="bg-wool p-4">
              <p className="label text-rust">Return</p>
              <p className="mt-2 code text-[1.5rem] text-basalt">21:15 → ~23:20</p>
              <p className="mt-1 text-[13px] text-basalt/60">Tórshavn → Krambatangi · leave the centre at 20:20.</p>
            </div>
          </div>
          <ol className="mt-5 border-l border-basalt/20 pl-5">
            {actions.map(([time, action], index) => (
              <li key={time} className="relative grid grid-cols-[minmax(0,1fr)_auto] gap-4 border-b border-basalt/10 py-4 last:border-0">
                <span className={`absolute -left-[1.56rem] top-5 h-2.5 w-2.5 rounded-full border-2 border-wool ${completedActions[index] ? "bg-moss" : "bg-fog"}`} />
                <div>
                  <p className="code text-[12px] text-fjord">{time}</p>
                  <p className="mt-1 text-[14px] leading-relaxed text-basalt">{action}</p>
                </div>
                <button type="button" onClick={() => onToggleAction(index)} aria-pressed={Boolean(completedActions[index])} className={`h-fit border px-2.5 py-1.5 text-[10px] uppercase tracking-[.08em] focus-visible:outline-2 focus-visible:outline-navy ${completedActions[index] ? "border-moss/35 text-moss" : "border-basalt/20 text-basalt/60 hover:border-moss/35"}`}>{completedActions[index] ? "Done" : "Mark done"}</button>
              </li>
            ))}
          </ol>
        </div>
      )}

      {activeTab === "food" && (
        <div id="olavsoka-panel-food" role="tabpanel" aria-labelledby="olavsoka-tab-food" className="divide-y divide-basalt/15">
          {FOOD_LANES.map((lane) => (
            <article key={lane.cue} className="grid gap-4 py-6 sm:grid-cols-[9rem_1fr]">
              <p className="label text-rust">{lane.cue}</p>
              <div>
                <h3 className="text-[17px] font-medium text-basalt">{lane.title}</h3>
                <p className="mt-2 max-w-[42rem] text-[14px] leading-relaxed text-basalt/70">{lane.copy}</p>
                <p className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[12px]">{lane.links.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="text-fjord underline underline-offset-4">{link.label}</a>)}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      {activeTab === "context" && (
        <div id="olavsoka-panel-context" role="tabpanel" aria-labelledby="olavsoka-tab-context" className="grid gap-0 border border-basalt/15 sm:grid-cols-[1.1fr_.9fr]">
          <div className="p-5 sm:border-r sm:border-basalt/15">
            <p className="label text-rust">A national day, not just a festival</p>
            <p className="mt-3 text-[16px] leading-relaxed text-basalt">Ólavsøka means Saint Olaf’s Wake. It marks Ólavur Halgi / Olaf II, who died in 1030, and the annual opening of the Løgting. That is why the formal procession and cathedral service matter as much as the music and street life.</p>
            <a href="https://www.faroeislands.fo/the-big-picture/national-symbols/national-day/" target="_blank" rel="noreferrer" className="mt-4 inline-block text-[12px] text-fjord underline underline-offset-4">National Day background ↗</a>
          </div>
          <div className="bg-fog/30 p-5">
            <p className="label text-fjord">For this Wednesday</p>
            <ul className="mt-3 space-y-3 text-[13px] leading-relaxed text-basalt/70">
              <li><strong className="font-medium text-basalt">Morning:</strong> the Parliament procession, cathedral service and choral programme are the distinctive 29 July moments.</li>
              <li><strong className="font-medium text-basalt">Not today:</strong> the 2026 Ólavsøka rowing is listed for Tuesday 28 July, so do not plan Wednesday around a race that has already happened.</li>
              <li><strong className="font-medium text-basalt">Tonight:</strong> the midnight song is after your final ferry. Enjoy the city, but keep the 20:20 departure alarm.</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === "field-notes" && (
        <div id="olavsoka-panel-field-notes" role="tabpanel" aria-labelledby="olavsoka-tab-field-notes" className="grid gap-6 pt-5 md:grid-cols-[1.1fr_.9fr]">
          <div className="border-l-2 border-rust pl-4">
            <p className="label text-rust">The only hard rule</p>
            <p className="mt-2 text-[17px] leading-relaxed text-basalt">The day is flexible; the ferry is not. Set the alarm for 20:20 and be walking to Farstøðin before the crowds thicken.</p>
          </div>
          <dl className="divide-y divide-basalt/15 border-y border-basalt/15 text-[13px]">
            <div className="grid grid-cols-[7rem_1fr] gap-3 py-3"><dt className="label">Centre</dt><dd className="text-basalt/70">Road closures are normal during Ólavsøka. From the terminal, walking is the dependable choice.</dd></div>
            <div className="grid grid-cols-[7rem_1fr] gap-3 py-3"><dt className="label">Programme</dt><dd className="text-basalt/70">Use Tímin / the city’s live programme for the actual running order, not old blog timings.</dd></div>
            <div className="grid grid-cols-[7rem_1fr] gap-3 py-3"><dt className="label">Food</dt><dd className="text-basalt/70">Carry a snack, then book or confirm. Holiday opening hours override ordinary listings.</dd></div>
            <div className="grid grid-cols-[7rem_1fr] gap-3 py-3"><dt className="label">After land</dt><dd className="text-basalt/70">Your Krambatangi → Øravík ride needs to be arranged before the 14:30 departure.</dd></div>
          </dl>
        </div>
      )}
    </section>
  );
}
