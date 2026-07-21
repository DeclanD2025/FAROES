// =============================================================================
// OriginStrip — compact line showing the Edinburgh → Vágar flight origin
// above the main Faroe map. Not plotted on the Faroe map itself.
// =============================================================================

import { ORIGIN_FLIGHT } from "@/lib/data/faroes-journey-legs";

export default function OriginStrip() {
  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3 px-4 border border-basalt/10 bg-fog/25 text-[14px]">
      <span className="code text-fjord tnum font-medium">
        {ORIGIN_FLIGHT.from.code}
      </span>
      <span className="text-basalt font-medium">
        {ORIGIN_FLIGHT.from.name}
      </span>
      <span className="caption tnum">{ORIGIN_FLIGHT.from.time}</span>

      <span aria-hidden className="text-basalt/30 mx-1">→</span>
      <span className="code text-fjord font-medium text-[12px]">
        {ORIGIN_FLIGHT.flightNumber}
      </span>
      <span className="caption">{ORIGIN_FLIGHT.duration}</span>
      <span aria-hidden className="text-basalt/30 mx-1">→</span>

      <span className="code text-fjord tnum font-medium">
        {ORIGIN_FLIGHT.to.code}
      </span>
      <span className="text-basalt font-medium">
        {ORIGIN_FLIGHT.to.name}
      </span>
      <span className="caption tnum">{ORIGIN_FLIGHT.to.time}</span>
    </div>
  );
}
