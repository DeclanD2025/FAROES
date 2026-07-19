// Home — the expedition briefing.
// Calm heading + topographic trace + small utility countdown + a Departure
// Status table (rows, not cards) + a Harbour Notice pinned with a rust-red
// left border + small status stamp. No full-screen hero. No glassmorphism.

import { BOOKINGS, MATCH_FIXTURE, TRIP } from "@/lib/data/itinerary";
import { Countdown } from "@/components/countdown-block";

type Status = "ok" | "warn" | "info" | "pending";

const STATUS: Record<Status, { label: string; tone: string }> = {
  ok:      { label: "Confirmed",      tone: "text-moss" },
  warn:    { label: "Needs booking",  tone: "text-rust" },
  info:    { label: "Timetable ok",   tone: "text-basalt" },
  pending: { label: "Pending",        tone: "text-yellow" },
};

const DEPARTURE: Array<{ label: string; detail: string; status: Status }> = [
  { label: "Flight · RC 415",     detail: `${BOOKINGS.flights.outbound.dep.replace("EDI ", "EDI ")} → ${BOOKINGS.flights.outbound.arr.replace("FAE ", "FAE ")}`, status: "ok" },
  { label: "Airport transfer",    detail: "Bus 300 · Vágar → Tórshavn · needs booking", status: "warn" },
  { label: "Ferry · Smyril Rt 7", detail: "Tórshavn — Krambatangi · pre-book foot-passenger", status: "info" },
  { label: "Accommodation · Øravík", detail: `${BOOKINGS.airbnb.label} · ${BOOKINGS.airbnb.nights} nights`, status: "ok" },
  { label: "Match ticket · HB v Motherwell", detail: "Motherwell FC allocation · check NFC pass", status: "ok" },
  { label: "Packing · under-seat bag",   detail: "Run the Prepare checklist on this device", status: "pending" },
];

export default function HomePage() {
  return (
    <article className="px-6 sm:px-8 lg:px-12 pt-12 pb-16 max-w-[64rem]">
      <header className="pb-10">
        <p className="label">Faroes · North Atlantic</p>
        <h1 className="font-sans font-medium text-[clamp(2rem,4.4vw,3rem)] leading-[1.04] mt-3 text-basalt tracking-[-0.012em]">
          FAROE ISLANDS
        </h1>
        <p className="caption mt-3 max-w-[36rem]">
          {TRIP.dates} · {MATCH_FIXTURE.home} v {MATCH_FIXTURE.away}
        </p>
        <div className="topo-line mt-6 max-w-[40rem]" aria-hidden />
        <div className="mt-6 flex flex-wrap items-baseline gap-x-8 gap-y-2">
          <Countdown target={TRIP.countdownTarget} label="Until EDI departure" />
          <p className="caption">
            <span className="label">Next event</span>{" · "}
            <span className="tnum">RC 415</span> lifts from Edinburgh <span className="tnum">17:10</span>
          </p>
        </div>
      </header>

      <section aria-labelledby="departure-status" className="mt-12">
        <header className="flex items-baseline justify-between border-b border-basalt/15 pb-2">
          <h2 id="departure-status" className="label">Departure status</h2>
          <p className="caption">Updated 18 Jul · local Faroese time</p>
        </header>
        <ul>
          {DEPARTURE.map((row) => (
            <li key={row.label} className="grid grid-cols-[14rem_1fr_auto] sm:grid-cols-[18rem_1fr_auto] gap-x-6 py-3 border-b border-basalt/10 items-baseline">
              <span className="font-medium text-basalt text-[14.5px]">{row.label}</span>
              <span className="caption">{row.detail}</span>
              <span className={`caption text-[12.5px] ${STATUS[row.status].tone}`}>
                <span className="status-dot align-middle mr-2" aria-hidden />
                {STATUS[row.status].label}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="harbour-notice" className="harbour-notice mt-12 max-w-[40rem]">
        <header className="flex items-baseline justify-between mb-3">
          <h2 id="harbour-notice" className="label text-rust">Harbour notice</h2>
          <p className="caption tnum">To sort before Mon 27 Jul 19:00</p>
        </header>
        <ol className="space-y-2">
          <li className="grid grid-cols-[6rem_1fr] gap-x-3">
            <span className="code text-fjord tnum">19:45</span>
            <span>Airport transfer to Tórshavn must be booked.</span>
          </li>
          <li className="grid grid-cols-[6rem_1fr] gap-x-3">
            <span className="code text-fjord tnum">21:15</span>
            <span>Smyril last sailing · foot-passenger queue opens 20:15.</span>
          </li>
          <li className="grid grid-cols-[6rem_1fr] gap-x-3">
            <span className="code text-fjord tnum">~23:20</span>
            <span>Krambatangi · brief hop to Øravík on arrival.</span>
          </li>
        </ol>
        <p className="caption mt-3 tnum">
          Status pinned to the rail at <span className="code">/prepare</span>.
        </p>
      </section>

      <section aria-labelledby="next-ferry" className="mt-16 max-w-[40rem]">
        <header className="border-b border-basalt/15 pb-2 mb-3">
          <h2 id="next-ferry" className="label">Coastal weather · Vágar</h2>
        </header>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2">
          <Field label="Wind"          value="WSW 18 kt · gusting 24" tone="text-basalt" />
          <Field label="Sea state"     value="2.4 m · moderate" tone="text-basalt" />
          <Field label="Visibility"    value="6–9 nm · fog patches" tone="text-yellow" />
          <Field label="Sunset · Vágar" value="22:14 local" tone="text-basalt" />
        </div>
        <p className="caption mt-3">yr.no · refresh at harbour wifi if it drops</p>
      </section>

      <section className="mt-16 border-t border-basalt/15 pt-6">
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-3 max-w-[48rem]">
          <li><a href="/itinerary" className="font-medium text-basalt hover:underline decoration-basalt/30 underline-offset-4">→ Trip · five days, full route log</a></li>
          <li><a href="/match-day" className="font-medium text-basalt hover:underline decoration-basalt/30 underline-offset-4">→ Match · Hague programme, ferries, timeline</a></li>
          <li><a href="/places" className="font-medium text-basalt hover:underline decoration-basalt/30 underline-offset-4">→ Map · topographic chart + ferry routes</a></li>
          <li><a href="/packing" className="font-medium text-basalt hover:underline decoration-basalt/30 underline-offset-4">→ Prepare · checklist + packing layout</a></li>
        </ul>
      </section>
    </article>
  );
}

function Field({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="flex flex-col">
      <span className="label">{label}</span>
      <span className={`mt-0.5 text-[14px] ${tone}`}>{value}</span>
    </div>
  );
}
