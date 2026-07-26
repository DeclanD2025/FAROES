import { CRITICAL_TRANSPORT, OFFICIAL_SOURCES } from "@/lib/data/operations";

const outbound = CRITICAL_TRANSPORT.find((leg) => leg.id === "thursday-north")!;
const inbound = CRITICAL_TRANSPORT.find((leg) => leg.id === "thursday-south")!;

function TransportPanel({ leg }: { leg: typeof outbound }) {
  return (
    <section className="border border-basalt/15 rounded-[7px] p-5 bg-wool">
      <div className="flex flex-wrap justify-between gap-3 border-b border-basalt/10 pb-3">
        <div>
          <p className="label text-fjord">{leg.service}</p>
          <h2 className="mt-1 text-[18px] font-medium text-basalt">{leg.title}</h2>
        </div>
        <span className="self-start border border-moss/35 px-2 py-1 text-[10px] uppercase tracking-[.1em] text-moss">{leg.confidence}</span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-5 gap-y-3 text-[13px]">
        <div><dt className="label">Depart</dt><dd className="code tnum text-fjord mt-1">{leg.departure}</dd></div>
        <div><dt className="label">Arrive</dt><dd className="code tnum text-fjord mt-1">{leg.arrival}</dd></div>
        <div><dt className="label">Duration</dt><dd className="mt-1">{leg.duration}</dd></div>
        <div><dt className="label">Leave no later than</dt><dd className="mt-1 font-medium text-rust">{leg.leaveBy}</dd></div>
      </dl>
      <p className="mt-4 border-t border-basalt/10 pt-3 text-[13px] leading-relaxed text-basalt/75"><strong className="text-basalt">Action:</strong> {leg.action}</p>
      <p className="mt-3 text-[13px] leading-relaxed text-rust"><strong>Fallback:</strong> {leg.fallback}</p>
    </section>
  );
}

const timeline = [
  ["08:00", "Wake, check ferry disruption and stadium/weather messages", "Recommended"],
  ["09:30", "Breakfast; pack all-day and overnight essentials", "Recommended"],
  ["10:15", "Pre-booked taxi leaves Øravík for Krambatangi", "Decision point"],
  ["10:30", "Join foot-passenger queue", "Fixed buffer"],
  ["11:30", "Smyril departs for Tórshavn", "Fixed"],
  ["13:35", "Arrive Tórshavn; eat, collect ticket/accreditation and walk to the ground", "Fixed"],
  ["17:15", "Be at Tórsvøllur / media entrance", "Recommended buffer"],
  ["18:00", "HB Tórshavn v Motherwell", "Fixed"],
  ["19:50", "Earliest normal full-time estimate; no extra time allowed for", "Danger point"],
  ["20:00", "Leave stadium immediately after required work", "Decision point"],
  ["20:30", "Target the foot-passenger gate", "Hard operational target"],
  ["21:10", "Foot-passenger gate closes", "Hard deadline"],
  ["21:15", "Smyril departs for Krambatangi", "Fixed"],
  ["23:20", "Arrive Krambatangi; use pre-booked return taxi or confirmed SSL connection", "Requires confirmation"],
] as const;

export default function MatchDayPage() {
  return (
    <article className="px-6 sm:px-8 lg:px-12 pt-10 pb-20 max-w-[70rem]">
      <header className="pb-8 border-b border-basalt/15">
        <p className="label text-rust">Thursday 30 July 2026 · match day</p>
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] gap-4 items-center max-w-[56rem]">
          <p className="text-right text-[clamp(1.5rem,4vw,2.6rem)] font-medium text-basalt">HB Tórshavn</p>
          <div className="text-center"><p className="code tnum text-[clamp(1.5rem,3vw,2.2rem)] text-fjord">18:00</p><p className="caption">local kick-off</p></div>
          <p className="text-[clamp(1.5rem,4vw,2.6rem)] font-medium text-basalt">Motherwell</p>
        </div>
        <p className="mt-5 max-w-[48rem] text-[15px] leading-relaxed text-basalt/80">Tórsvøllur, Tórshavn. The return is conditionally viable: it depends on the verified 21:15 Smyril, an immediate post-match exit and reaching the ferry gate by 20:30.</p>
      </header>

      <aside className="mt-7 max-w-[56rem] border-l-4 border-rust bg-rust/[.04] px-5 py-4">
        <p className="label text-rust">Most important instruction</p>
        <p className="mt-1 text-[15px] font-medium text-basalt">No post-match meal, interview or pub stop. If the final whistle is delayed, leave as soon as your essential work is finished. Missing the 21:15 has no same-night Suðuroy substitute.</p>
      </aside>

      <section className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-5"><TransportPanel leg={outbound} /><TransportPanel leg={inbound} /></section>

      <section className="mt-12 max-w-[54rem]">
        <h2 className="label border-b border-basalt/15 pb-2">Mobile timeline · next action first</h2>
        <ol className="mt-1 divide-y divide-basalt/10">
          {timeline.map(([time, action, kind]) => <li key={time} className="grid grid-cols-[5.75rem_1fr] gap-4 py-3.5"><p className="code tnum text-fjord">{time}</p><div><p className={`text-[14px] ${kind.includes("Hard") || kind === "Danger point" ? "font-medium text-rust" : "text-basalt"}`}>{action}</p><p className="caption mt-0.5">{kind}</p></div></li>)}
        </ol>
      </section>

      <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Plan title="Plan A · normal" text="Use the 11:30 northbound ferry, arrive early at the stadium, exit at the final whistle and be at the ferry gate by 20:30." />
        <Plan title="Plan B · slow exit" text="Stop all optional activity. Send any report while walking or onboard. The 21:10 gate closure—not the 21:15 departure—is the real cutoff." />
        <Plan title="Plan C · missed/cancelled" text="Contact SSL; secure a Tórshavn bed near the harbour; notify the Øravík host; carry medication, charger and a warm layer. Rebuild Friday around the next confirmed sailing." />
      </section>

      <p className="mt-10 max-w-[54rem] caption">Source: <a href={OFFICIAL_SOURCES.sslRoute7.url} target="_blank" rel="noreferrer" className="text-fjord underline underline-offset-4">{OFFICIAL_SOURCES.sslRoute7.label}</a>, checked {OFFICIAL_SOURCES.sslRoute7.checked}. SSL states a 2h 05m crossing, one-hour Krambatangi queuing and a foot-passenger gate closure five minutes before sailing.</p>
    </article>
  );
}

function Plan({ title, text }: { title: string; text: string }) {
  return <section className="border border-basalt/15 rounded-[7px] p-4"><h2 className="font-medium text-[15px] text-basalt">{title}</h2><p className="caption mt-2 leading-relaxed">{text}</p></section>;
}
