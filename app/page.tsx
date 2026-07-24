// =============================================================================
// HomePage — Trip command centre dashboard.
// Shows next action, trip state, countdown, all days, critical alerts.
// =============================================================================

"use client";

import { useCountdown } from "@/lib/hooks/use-countdown";
import { TRIP, DAYS, BOOKINGS } from "@/lib/data/itinerary";
import Link from "next/link";

export default function HomePage() {
  const countdown = useCountdown(TRIP.countdownTarget);

  const tripState = countdown.arrived
    ? "Active"
    : countdown.days && countdown.days <= 1
      ? "Departure imminent"
      : "Pre-departure";

  return (
    <article className="px-4 sm:px-8 pt-6 sm:pt-10 pb-20 max-w-[1040px] mx-auto">
      {/* ================================================================
          Header — trip identity
          ================================================================ */}
      <header className="mb-8">
        <p className="text-[11px] tracking-[0.14em] uppercase text-rust font-medium">
          {TRIP.week} · {TRIP.dates}
        </p>
        <h1
          className="text-[clamp(2rem,5vw,3.2rem)] leading-[1.04] mt-2 text-basalt tracking-[-0.01em]"
          style={{ fontFamily: "var(--font-cinzel)" }}
        >
          Expedition command
        </h1>
        <p className="text-[16px] text-basalt/60 mt-3 max-w-[36rem]">
          One train, one flight, one ferry, six days, one football match. Every detail planned.
        </p>
        {!countdown.arrived && countdown.phrase && (
          <p className="code tnum text-[18px] text-rust font-medium mt-3">
            {countdown.phrase}
          </p>
        )}
      </header>

      {/* ================================================================
          State bar — trip status, next action, alerts
          ================================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <StateCard
          label="Trip state"
          value={tripState}
          color={tripState === "Active" ? "text-moss" : tripState === "Departure imminent" ? "text-rust" : "text-fjord"}
        />
        <StateCard
          label="Base"
          value="Øravík, Suðuroy"
          detail="Við á 7"
          color="text-basalt"
        />
        <StateCard
          label="Next hard deadline"
          value="Mon · RC 415 at 17:10"
          detail="Check in online before leaving"
          color="text-rust"
        />
      </div>

      {/* ================================================================
          Critical alerts
          ================================================================ */}
      <section className="mb-8">
        <div className="border border-rust/20 bg-rust/[0.03] rounded-[7px] p-4">
          <p className="text-[10px] uppercase tracking-[0.14em] text-rust font-medium mb-3">
            Critical items · action required
          </p>
          <div className="space-y-2 text-[13px]">
            <AlertItem
              label="Last ferry"
              detail="21:15 from Tórshavn is the only boat back to Suðuroy. Miss it = sleep in Tórshavn. Gate closes 21:10."
              urgency="critical"
            />
            <AlertItem
              label="Ólavsøka · 29 July"
              detail="National holiday. Shops closed. Stock up on 28 July. Cafés may have reduced hours."
              urgency="warning"
            />
            <AlertItem
              label="LGW → STN transfer"
              detail="Self-transfer on purpose. Book National Express coach. Save confirmation offline. Allow 4h+ margin."
              urgency="warning"
            />
            <AlertItem
              label="Run map"
              detail="The Øravík Fell Loop GPX is loaded from public/routes/. Verify it is accessible offline before departure."
              urgency="info"
            />
          </div>
        </div>
      </section>

      {/* ================================================================
          Day cards — quick access to all 6 days
          ================================================================ */}
      <section className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-3">
          Itinerary
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DAYS.map((day) => {
            const dayNum = parseInt(day.num, 10);
            const isMatchday = dayNum === 4;
            const isDeparture = dayNum === 1;
            const isReturn = dayNum === 6;

            return (
              <Link
                key={day.num}
                href={`/day/${dayNum}`}
                className={`block border rounded-[7px] p-4 transition-colors hover:bg-basalt/[0.02] ${
                  isMatchday
                    ? "border-claret/25 bg-claret/[0.01]"
                    : isDeparture
                      ? "border-fjord/20"
                      : isReturn
                        ? "border-moss/20"
                        : "border-basalt/15"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="text-[13px] font-medium text-basalt leading-tight">
                    {day.chapter}
                  </p>
                  <span
                    className={`text-[10px] uppercase tracking-[0.08em] shrink-0 ml-2 px-1.5 py-0.5 rounded-[3px] ${
                      isMatchday
                        ? "text-claret bg-claret/[0.08]"
                        : isDeparture
                          ? "text-fjord bg-fjord/[0.06]"
                          : isReturn
                            ? "text-moss bg-moss/[0.08]"
                            : "text-basalt/50 bg-basalt/[0.04]"
                    }`}
                  >
                    Day {dayNum}
                  </span>
                </div>
                <p className="text-[11px] text-basalt/55 mb-1.5">
                  {day.date} · {day.location}
                </p>
                <p className="text-[12px] text-basalt/60 leading-relaxed line-clamp-2">
                  {day.narrative}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ================================================================
          Quick links — supporting pages
          ================================================================ */}
      <section className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-3">
          Operations centre
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          <QuickLink href="/match-day" label="Match-day" detail="HB v Motherwell" />
          <QuickLink href="/transport" label="Transport" detail="Ferries · buses · taxi" />
          <QuickLink href="/forecast" label="Forecast" detail="Live weather" />
          <QuickLink href="/packing" label="Packing" detail="Checklist" />
          <QuickLink href="/bookings" label="Bookings" detail="Flights · stays" />
          <QuickLink href="/itinerary" label="Itinerary" detail="Full trip" />
          <QuickLink href="/places" label="Places" detail="Map & guide" />
          <QuickLink href="/info" label="Info" detail="Practical tips" />
        </div>
      </section>

      {/* ================================================================
          Booking status
          ================================================================ */}
      <section className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-3">
          Bookings
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <BookingCard
            label="Flights"
            detail={`${BOOKINGS.flights.outbound.code} EDI→FAE · ${BOOKINGS.flights.return.code} FAE→LGW`}
            status="Booked"
          />
          <BookingCard
            label="Accommodation"
            detail={`${BOOKINGS.airbnb.label} · ${BOOKINGS.hugo.label}`}
            status="Booked"
          />
          <BookingCard
            label="Match ticket"
            detail="HB Tórshavn v Motherwell · Thu 30 Jul"
            status="Bought"
          />
          <BookingCard
            label="Ferries"
            detail="Route 7 · 4 crossings pre-booked at ssl.fo"
            status="Pre-booked"
          />
        </div>
      </section>
    </article>
  );
}

// =============================================================================
// Sub-components
// =============================================================================

function StateCard({
  label,
  value,
  detail,
  color,
}: {
  label: string;
  value: string;
  detail?: string;
  color: string;
}) {
  return (
    <div className="border border-basalt/15 rounded-[7px] p-3.5">
      <p className="text-[10px] uppercase tracking-[0.08em] text-basalt/50">{label}</p>
      <p className={`text-[15px] font-medium ${color} mt-1`}>{value}</p>
      {detail && <p className="text-[11px] text-basalt/45 mt-0.5">{detail}</p>}
    </div>
  );
}

function AlertItem({
  label,
  detail,
  urgency,
}: {
  label: string;
  detail: string;
  urgency: "critical" | "warning" | "info";
}) {
  const colors = {
    critical: "border-l-2 border-l-rust pl-3",
    warning: "border-l-2 border-l-amber/60 pl-3",
    info: "border-l-2 border-l-fjord/40 pl-3",
  };

  return (
    <div className={colors[urgency]}>
      <p className="font-medium text-basalt">{label}</p>
      <p className="text-basalt/55 text-[12px] mt-0.5">{detail}</p>
    </div>
  );
}

function QuickLink({
  href,
  label,
  detail,
}: {
  href: string;
  label: string;
  detail: string;
}) {
  return (
    <Link
      href={href}
      className="block border border-basalt/15 rounded-[6px] p-3 hover:border-claret/25 hover:bg-basalt/[0.01] transition-colors"
    >
      <p className="text-[13px] font-medium text-basalt leading-tight">{label}</p>
      <p className="text-[11px] text-basalt/45 mt-0.5">{detail}</p>
    </Link>
  );
}

function BookingCard({
  label,
  detail,
  status,
}: {
  label: string;
  detail: string;
  status: string;
}) {
  return (
    <div className="border border-basalt/15 rounded-[7px] p-3.5">
      <div className="flex items-baseline justify-between mb-1">
        <p className="text-[13px] font-medium text-basalt">{label}</p>
        <span className="text-[10px] uppercase tracking-[0.08em] text-moss bg-moss/[0.08] px-1.5 py-0.5 rounded-[3px]">
          {status}
        </span>
      </div>
      <p className="text-[11px] text-basalt/50">{detail}</p>
    </div>
  );
}
