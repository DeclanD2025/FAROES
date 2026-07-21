// /info — narrow reference column. Booking codes, phone numbers, ferry
// links, weather, embassies — anything Declan might need at a glance.
// Thin rules separate sections. Stamper-style date on the right column.

import { BOOKINGS, TRIP } from "@/lib/data/itinerary";

export default function InfoPage() {
  return (
    <article className="px-6 sm:px-8 lg:px-12 pt-10 pb-20 max-w-[52rem]">
      <header className="pb-8">
        <p className="label">Reference · small print</p>
        <h1 className="font-sans font-medium text-[clamp(2rem,4.4vw,3rem)] leading-[1.04] mt-3 text-basalt tracking-[-0.012em]">
          Pocket codes & numbers.
        </h1>
        <p className="caption mt-3 max-w-[36rem]">
          Pocket reference. Bookmark in the browser before the trip.
          Offline-friendly.
        </p>
      </header>

      <dl>
        <Row label="Booking · airbnb">
          {BOOKINGS.airbnb.label} · {BOOKINGS.airbnb.address}
          <br />
          £{BOOKINGS.airbnb.pricePerTwo} · {BOOKINGS.airbnb.nights} nights
          <br />
          <a className="code" href={BOOKINGS.airbnb.listing}>{BOOKINGS.airbnb.listing}</a>
        </Row>
        <Row label="Booking · Hugo">
          {BOOKINGS.hugo.label} · {BOOKINGS.hugo.address}
          <br />
          Confirm <span className="code">{BOOKINGS.hugo.confirmation}</span> · Door <span className="code">{BOOKINGS.hugo.pin}</span>
          <br />
          Phone <span className="code tnum">{BOOKINGS.hugo.phone}</span>
        </Row>
        <Row label="Outbound · RC 415">
          {BOOKINGS.flights.outbound.carrier}
          <br />
          <span className="code tnum">{BOOKINGS.flights.outbound.dep}</span> → <span className="code tnum">{BOOKINGS.flights.outbound.arr}</span>
          <br />
          <span className="tnum">{BOOKINGS.flights.outbound.date}</span>
        </Row>
        <Row label="Return · RC 416">
          {BOOKINGS.flights.return.carrier}
          <br />
          <span className="code tnum">{BOOKINGS.flights.return.dep}</span> → <span className="code tnum">{BOOKINGS.flights.return.arr}</span>
          <br />
          <span className="tnum">{BOOKINGS.flights.return.date}</span>
        </Row>
        <Row label="Connection · RK 330">
          {BOOKINGS.flights.onward.carrier}
          <br />
          <span className="code tnum">{BOOKINGS.flights.onward.dep}</span> → <span className="code tnum">{BOOKINGS.flights.onward.arr}</span>
          <br />
          <span className="tnum">{BOOKINGS.flights.onward.date}</span>
        </Row>
        <Row label="Ferry · Smyril">
          Strandfaraskip Landsins · Route 7 (Tórshavn — Krambatangi)
          <br />
          <a className="code" href="https://ssl.fo">ssl.fo</a> · office <span className="code tnum">+298 313333</span>
        </Row>
        <Row label="Coach · Nat Express">
          National Express · Gatwick → Stansted
          <br />
          <a className="code" href="https://nationalexpress.com">nationalexpress.com</a> · typical <span className="tnum">2h 15m</span>
        </Row>
        <Row label="Atlas · base">
          Øravík, Suðuroy
          <br />
          <span className="tnum">{TRIP.iso.start}</span> → <span className="tnum">{TRIP.iso.end}</span>
        </Row>
      </dl>

      <p className="caption mt-10 max-w-[36rem]">
        If a number stops working in the rain and the eSim drops, walk to the
        museum and ask. Strandfaraskip Landsins&apos;s office is handier than any
        booking confirmation.
      </p>
    </article>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[10rem_1fr] gap-x-8 py-4 border-b border-basalt/10 items-baseline">
      <dt className="label">{label}</dt>
      <dd className="text-[14.5px] leading-[1.55] text-basalt">{children}</dd>
    </div>
  );
}
