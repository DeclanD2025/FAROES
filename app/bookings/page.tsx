import { BOOKINGS_AUDIT, OFFICIAL_SOURCES, type ConfidenceLabel } from "@/lib/data/operations";
import { BOOKINGS } from "@/lib/data/itinerary";

const badge: Record<ConfidenceLabel, string> = {
  "Confirmed from booking": "border-moss/35 text-moss",
  "Verified from official source": "border-moss/35 text-moss",
  "Likely, but reconfirm before departure": "border-yellow/45 text-yellow",
  "Requires same-day verification": "border-rust/35 text-rust",
  "Contingency only": "border-basalt/25 text-basalt/60",
};

export default function BookingsPage() {
  return <article className="px-6 sm:px-8 lg:px-12 pt-10 pb-20 max-w-[68rem]">
    <header className="border-b border-basalt/15 pb-8"><p className="label">Bookings · action register</p><h1 className="mt-3 text-[clamp(2rem,4.4vw,3rem)] leading-[1.04] tracking-[-.012em] text-basalt" style={{ fontFamily: "var(--font-cinzel)" }}>What is confirmed, and what still needs a decision.</h1><p className="caption mt-3 max-w-[48rem]">Reference numbers, amounts and access codes stay out of the default view. Keep the original confirmation emails available offline.</p></header>
    <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3"><Metric value="4" label="Confirmed from booking" /><Metric value="2" label="Verified route services" /><Metric value="1" label="Friday chain to resolve" /></section>
    <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">{BOOKINGS_AUDIT.map((booking) => <article key={booking.name} className="border border-basalt/15 rounded-[7px] p-5"><div className="flex justify-between gap-3"><div><p className="label text-fjord">{booking.date}</p><h2 className="mt-1 font-medium text-[17px] text-basalt">{booking.name}</h2></div><span className={`h-fit border px-2 py-1 text-[10px] tracking-[.08em] uppercase ${badge[booking.status]}`}>{booking.status}</span></div><dl className="mt-4 border-y border-basalt/10 py-3 text-[13px] space-y-2"><div className="grid grid-cols-[5.5rem_1fr] gap-3"><dt className="text-basalt/55">Provider</dt><dd>{booking.provider}</dd></div><div className="grid grid-cols-[5.5rem_1fr] gap-3"><dt className="text-basalt/55">Location</dt><dd>{booking.location}</dd></div></dl><p className="mt-4 text-[13px] leading-relaxed text-basalt/75"><strong className="text-basalt">Required action:</strong> {booking.action}</p></article>)}</section>
    <section className="mt-10 max-w-[56rem] border-y border-basalt/15 py-5">
      <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="label text-rust">Arrival landmark · Monday night</p>
          <h2 className="mt-2 text-[clamp(1.4rem,3vw,1.9rem)] leading-tight text-basalt" style={{ fontFamily: "var(--font-cinzel)" }}>{BOOKINGS.airbnb.label}</h2>
          <p className="mt-2 max-w-[40rem] text-[14px] leading-relaxed text-basalt/70">{BOOKINGS.airbnb.address} · host {BOOKINGS.airbnb.host}. {BOOKINGS.airbnb.arrivalMarker} {BOOKINGS.airbnb.checkIn}.</p>
        </div>
        <a href={BOOKINGS.airbnb.listing} target="_blank" rel="noreferrer" className="h-fit border border-basalt/25 px-3 py-2 text-[12px] text-fjord underline underline-offset-4 hover:border-fjord/40">Airbnb listing ↗</a>
      </div>
    </section>
    <section className="mt-10 max-w-[56rem] border border-rust/25 bg-rust/[.035] rounded-[7px] p-5"><h2 className="label text-rust">Before leaving each accommodation</h2><ul className="mt-3 space-y-2 text-[13px] text-basalt/80"><li>• Confirm the next transport service and leave time before checking out.</li><li>• Save the host’s instructions, address and contact number offline.</li><li>• Use the accommodation Wi‑Fi to refresh offline maps and confirm the Nomad data balance; Wi‑Fi is a fallback, not the plan for travel days.</li><li>• Check every charging point, bathroom and storage space; keep IDs, medication and ferry documents on your person.</li><li>• On Friday, do not leave Øravík until the selected ferry, onward transfer and Hugo arrival process are confirmed.</li></ul></section>
    <p className="mt-8 caption">Ferry booking and route source: <a href={OFFICIAL_SOURCES.sslBooking.url} target="_blank" rel="noreferrer" className="text-fjord underline underline-offset-4">SSL booking</a> · checked {OFFICIAL_SOURCES.sslBooking.checked}.</p>
  </article>;
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div className="border border-basalt/15 rounded-[7px] p-4 bg-fog/20"><p className="code tnum text-[24px] text-fjord">{value}</p><p className="caption mt-1">{label}</p></div>;
}
