// /match-day — programme-style page. Scoreboard-style fixture strip +
// ferry schedule (northbound + southbound rows, not cards) + a vertical
// timeline with mono times + supporter notes strip + an operational
// caveat. Print-programme visual language, no editorial flourishes.

import { FERRY, MATCH_FIXTURE, PUBS_NEAR_GROUND } from "@/lib/data/itinerary";

function StatusPill({ tone, label }: { tone: "warn" | "info"; label: string }) {
  const cls = tone === "warn" ? "border-rust text-rust" : "border-basalt/30 text-basalt/80";
  return (
    <span className={`inline-block border ${cls} px-1.5 py-0.5 text-[10.5px] tracking-[0.14em] uppercase`}>
      {label}
    </span>
  );
}

export default function MatchDayPage() {
  return (
    <article className="px-6 sm:px-8 lg:px-12 pt-10 pb-16 max-w-[64rem]">
      <header className="pb-10 border-b border-basalt/15">
        <p className="label">Match · Thu 30 Jul 2026</p>

        {/* Scoreboard-style header strip */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-x-6 gap-y-2 max-w-[60rem]">
          <div className="text-right md:text-right">
            <p className="font-medium text-basalt text-[clamp(1.6rem,4vw,2.4rem)] leading-tight">{MATCH_FIXTURE.home}</p>
            <p className="caption mt-1">Tórshavn</p>
          </div>
          <div className="text-basalt">
            <p className="font-mono text-[clamp(1.4rem,2.6vw,2rem)] tnum leading-tight">18:00</p>
            <p className="caption mt-1">kick-off · local</p>
          </div>
          <div className="text-left md:text-left">
            <p className="font-medium text-basalt text-[clamp(1.6rem,4vw,2.4rem)] leading-tight">{MATCH_FIXTURE.away}</p>
            <p className="caption mt-1">Motherwell · away support</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1">
          <Field label="Competition"   value={MATCH_FIXTURE.competition} />
          <Field label="Venue"         value={MATCH_FIXTURE.venue} />
          <Field label="Capacity"      value={`${MATCH_FIXTURE.capacity}`} />
          <Field label="Kick-off"      value={MATCH_FIXTURE.kickoffLocal} />
        </div>
      </header>

      {/* Ferry schedule — northbound + southbound. */}
      <section className="mt-12">
        <header className="border-b border-basalt/15 pb-2 mb-4">
          <h2 className="label">Ferry schedule · match day</h2>
          <p className="caption mt-1 max-w-[36rem]">
            Strandfaraskip Landsins · Route 7 · foot-passenger pre-booked.
          </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
          <FerryColumn
            title="NORTHBOUND · THU"
            rows={FERRY.matchNorthbound.map((r: { dep: string; arr: string; note?: string; highlight?: boolean }) => ({
              dep: r.dep,
              arr: r.arr.replace(/^Krambatangi\s/, "→ Tórshavn "),
              note: r.note ?? "",
              highlight: r.highlight ?? false,
            }))}
          />
          <FerryColumn
            title="SOUTHBOUND · THU"
            rows={FERRY.matchSouthbound.map((r: { dep: string; arr: string; note?: string; highlight?: boolean }) => ({
              dep: r.dep,
              arr: r.arr.replace(/^Krambatangi\s/, "→ Suðuroy "),
              note: r.note ?? "",
              highlight: r.highlight ?? false,
            }))}
          />
        </div>
      </section>

      {/* Vertical timeline. */}
      <section className="mt-14 max-w-[40rem]">
        <header className="border-b border-basalt/15 pb-2 mb-5">
          <h2 className="label">Travel timeline · Øravík → Tórsvøllur</h2>
          <p className="caption mt-1">Read top to bottom · ferry and foot</p>
        </header>
        <ol className="relative border-l border-basalt/20 pl-6">
          <TimelineNode time="11:30" title="Ferry north · Krambatangi → Tórshavn" />
          <TimelineNode time="13:35" title="Tinganes & the harbour" sub="OY Brewing, 5 min from the ground." />
          <TimelineNode time="18:00" title="Kick-off · Tórsvøllur" sub="UEFA Conference League qualifying · match" />
          <TimelineNode time="~19:50" title="Full time · walk for the pier" />
          <TimelineNode time="20:15" title="Foot-passenger queue" sub="An hour is plenty" />
          <TimelineNode time="21:15" title="Last ferry south · Smyril" sub="Miss it and we sleep in Tórshavn" critical />
          <TimelineNode time="~23:20" title="Krambatangi · hop to Øravík" />
        </ol>
      </section>

      {/* Supporter notes strip. */}
      <section className="mt-14 max-w-[40rem]">
        <header className="border-b border-basalt/15 pb-2 mb-4">
          <h2 className="label">Supporter notes · three pubs near the ground</h2>
        </header>
        <ul>
          {PUBS_NEAR_GROUND.map((p) => (
            <li key={p.name} className="grid grid-cols-[8rem_1fr] gap-x-4 py-2 border-b border-basalt/10 items-baseline">
              <span className="font-medium text-basalt text-[14.5px]">{p.name}</span>
              <span className="caption">{p.walk} · {p.note}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="caption mt-10 max-w-[40rem] tnum">
        Stadium to ferry terminal is roughly one kilometre, fifteen to twenty
        minutes on foot. The 21:15 is the last sailing of the day.
      </p>
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="label">{label}</p>
      <p className="text-[14.5px] mt-0.5">{value}</p>
    </div>
  );
}

type FerryRow = { dep: string; arr: string; note: string; highlight: boolean };

function FerryColumn({ title, rows }: { title: string; rows: FerryRow[] }) {
  return (
    <div>
      <p className="label mb-3">{title}</p>
      <ul>
        {rows.map((r) => (
          <li key={r.dep} className="grid grid-cols-[5.5rem_1fr_auto] gap-x-3 py-2 border-b border-basalt/10 items-baseline">
            <span className="code text-fjord tnum">{r.dep}</span>
            <span className="text-[14px] text-basalt">{r.arr}</span>
            {r.highlight ? <StatusPill tone="warn" label="Critical" /> : r.note ? <span className="caption">{r.note}</span> : <span className="caption tnum">—</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TimelineNode({ time, title, sub, critical }: { time: string; title: string; sub?: string; critical?: boolean }) {
  return (
    <li className="relative pb-6">
      <span
        aria-hidden
        className="absolute -left-[1.65rem] top-[0.55rem] block w-2 h-2"
        style={{ background: critical ? "var(--rust)" : "var(--basalt)", opacity: critical ? 1 : 0.55 }}
      />
      <p className="code text-fjord tnum">{time}</p>
      <p className={`font-medium text-[14.5px] ${critical ? "text-rust" : "text-basalt"}`}>{title}</p>
      {sub ? <p className="caption mt-1">{sub}</p> : null}
    </li>
  );
}
