import { CRITICAL_TRANSPORT, OFFICIAL_SOURCES, type ConfidenceLabel, type TransportLeg } from "@/lib/data/operations";

const tone: Record<ConfidenceLabel, string> = {
  "Confirmed from booking": "border-moss/40 text-moss",
  "Verified from official source": "border-moss/40 text-moss",
  "Likely, but reconfirm before departure": "border-yellow/50 text-yellow",
  "Requires same-day verification": "border-rust/40 text-rust",
  "Contingency only": "border-basalt/30 text-basalt/65",
};

function LegCard({ leg }: { leg: TransportLeg }) {
  return <article className="border border-basalt/15 rounded-[7px] p-5 bg-wool">
    <div className="flex flex-wrap gap-3 justify-between"><div><p className="label text-fjord">{leg.date} · {leg.service}</p><h2 className="mt-1 text-[18px] font-medium text-basalt">{leg.title}</h2><p className="caption mt-1">{leg.operator}</p></div><span className={`self-start border px-2 py-1 text-[10px] tracking-[.09em] uppercase ${tone[leg.confidence]}`}>{leg.confidence}</span></div>
    <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3 border-y border-basalt/10 py-4 text-[13px]"><div><dt className="label">Depart</dt><dd className="mt-1 code text-fjord tnum">{leg.departure}</dd></div><div><dt className="label">Arrive</dt><dd className="mt-1 code text-fjord tnum">{leg.arrival}</dd></div><div><dt className="label">Duration</dt><dd className="mt-1">{leg.duration}</dd></div><div><dt className="label">Leave no later than</dt><dd className="mt-1 font-medium text-rust">{leg.leaveBy}</dd></div></dl>
    <p className="mt-4 text-[13px] leading-relaxed"><strong>Action:</strong> {leg.action}</p><p className="mt-3 text-[13px] leading-relaxed text-rust"><strong>Missed / disrupted:</strong> {leg.fallback}</p>
  </article>;
}

export default function TransportPage() {
  return <article className="px-6 sm:px-8 lg:px-12 pt-10 pb-20 max-w-[72rem]">
    <header className="pb-8 border-b border-basalt/15"><p className="label">Transport · operational register</p><h1 className="mt-3 text-[clamp(2rem,4.4vw,3rem)] leading-[1.04] tracking-[-.012em] text-basalt" style={{ fontFamily: "var(--font-cinzel)" }}>Only use a connection once it is evidenced.</h1><p className="caption mt-3 max-w-[50rem]">Each time-critical leg shows its confidence, the practical action and the fallback. Times shown here are local Faroese time where applicable.</p></header>
    <aside className="mt-7 max-w-[60rem] border-l-4 border-rust bg-rust/[.04] px-5 py-4"><p className="label text-rust">Audit outcome</p><p className="mt-1 text-[14px] text-basalt">Wednesday offers two Tórshavn Ólavsøka options: 07:00 for the full national day or 14:30 for a compact evening, both returning south at 21:15. Friday’s former 11:30 northbound ferry remains removed: SSL publishes 07:00 and 16:00 Friday departures. Monday airport-to-ferry and Friday Tórshavn-to-Sørvágur connections require human confirmation.</p></aside>
    <section className="mt-10 grid grid-cols-1 xl:grid-cols-2 gap-5">{CRITICAL_TRANSPORT.map((leg) => <LegCard key={leg.id} leg={leg} />)}</section>
    <section className="mt-10 max-w-[60rem] border border-basalt/15 rounded-[7px] p-5"><h2 className="label">Before leaving home</h2><ul className="mt-3 space-y-2 text-[13px] text-basalt/80"><li>• Save the Route 7 and Route 700 pages offline, then check them again on the morning of travel.</li><li>• Pre-book taxis for both Øravík ↔ Krambatangi movements; Route 700 includes request-only services.</li><li>• A Tourist Travel Card does not pay for a pre-booked ferry ticket or reserve a seat.</li><li>• Carry food, water, a warm layer, charger and overnight essentials on the Thursday match journey.</li></ul></section>
    <p className="mt-8 caption">Sources checked {OFFICIAL_SOURCES.sslRoute7.checked}: <a className="text-fjord underline underline-offset-4" href={OFFICIAL_SOURCES.sslRoute7.url} target="_blank" rel="noreferrer">Route 7</a>, <a className="text-fjord underline underline-offset-4" href={OFFICIAL_SOURCES.sslRoute700.url} target="_blank" rel="noreferrer">Route 700</a>, and <a className="text-fjord underline underline-offset-4" href={OFFICIAL_SOURCES.sslTravelCard.url} target="_blank" rel="noreferrer">Travel Card conditions</a>.</p>
  </article>;
}
