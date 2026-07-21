// =============================================================================
// BeforeDepartureChecklist — pre-trip checklist with state, deadline, and
// explanation for each item. Uses localStorage for persistence.
// =============================================================================

"use client";

import { useChecklist } from "@/lib/hooks/use-checklist";
import { useState } from "react";

const CHECKLIST_ITEMS = [
  { id: "bd-ferry-tickets", group: "Book", what: "All 4 ferry crossings booked at ssl.fo", why: "Mon out, Thu out + return, Fri north. Foot passenger — no car.", deadline: "Before departure", relatedDay: "1,4,5" },
  { id: "bd-bus-timetable", group: "Download", what: "SSL Bus 300/700/701 timetables saved offline", why: "Route 701 may require request. Signal patchy on Suðuroy.", deadline: "Before departure", relatedDay: "1–6" },
  { id: "bd-request-phone", group: "Save", what: "Route 701 request number saved: +298 239550", why: "Some Suðuroy bus routes marked 'T' — must request in advance.", deadline: "Before departure", relatedDay: "3" },
  { id: "bd-lockbox-code", group: "Save", what: "Øravík lockbox code saved offline (not in this app)", why: "Late arrival ~23:30. No host to meet. No phone signal without eSIM.", deadline: "Day 1", relatedDay: "1" },
  { id: "bd-travel-insurance", group: "Confirm", what: "Travel insurance with hiking + medical cover", why: "GHIC/EHIC NOT valid in Faroe Islands. Hiking cover essential.", deadline: "Before departure", relatedDay: "all" },
  { id: "bd-waterproofs", group: "Pack", what: "Waterproof jacket + overtrousers · taped seams", why: "Non-negotiable at 469 m of cliff. Carless trip — bag does two jobs.", deadline: "Before departure", relatedDay: "2,3" },
  { id: "bd-hiking-boots", group: "Pack", what: "Sturdy hiking boots (wear on travel day)", why: "Saves bag weight. Beinisvørð + Hvannhagi in same boots.", deadline: "Before departure", relatedDay: "2" },
  { id: "bd-portable-charger", group: "Pack", what: "Portable charger + EU Type C/F adapter", why: "Long days out, no car to charge from. Two-pin only in Faroes.", deadline: "Before departure", relatedDay: "all" },
  { id: "bd-offline-maps", group: "Download", what: "Offline Google Maps: Suðuroy + Tórshavn + Vágar", why: "Country-wide coverage. Includes street-level for Tórshavn.", deadline: "Before departure", relatedDay: "all" },
  { id: "bd-flight-checkin", group: "Book", what: "Online check-in: RC 415 (Atlantic Airways) + RK 330 (Ryanair)", why: "Atlantic Airways allows online check-in. Ryanair requires it or pays fee.", deadline: "Day 1 / Day 6", relatedDay: "1,6" },
  { id: "bd-match-ticket", group: "Confirm", what: "Match ticket bought - save offline PDF", why: "Ticket purchased. Save offline PDF and paper copy.", deadline: "Day 4", relatedDay: "4" },
  { id: "bd-accommodation-confirm", group: "Confirm", what: "Both accommodation confirmations saved offline", why: "Øravík Airbnb + Guesthouse Hugo. PIN codes on paper, not phone-only.", deadline: "Before departure", relatedDay: "1,5" },
  { id: "bd-emergency-contacts", group: "Save", what: "Emergency numbers saved: 112, taxi +298 239550, Hugo +298 232101", why: "Save in phone AND on paper. Suðuroy hospital in Tvøroyri.", deadline: "Before departure", relatedDay: "all" },
  { id: "bd-taxi-contacts", group: "Save", what: "Taxi numbers saved: Suðuroy +298 239550, Tórshavn +298 313131", why: "Late-night Krambatangi arrivals. Ferry disruption fallback.", deadline: "Before departure", relatedDay: "1,4" },
  { id: "bd-food-late-arrival", group: "Pack", what: "Food plan for late Monday arrival (~23:30)", why: "No shop in Øravík. Everything closed. Buy at Edinburgh Airport or Smyril café.", deadline: "Day 1", relatedDay: "1" },
  { id: "bd-olavsoka-supply", group: "Confirm", what: "Ólavsøka supply plan — 29 July may affect shops/transport", why: "National holiday. Confirm what's open on Suðuroy. Stock up 28 July.", deadline: "Day 2", relatedDay: "3" },
  { id: "bd-esim", group: "Book", what: "eSIM for Faroe Islands data purchased and activated", why: "No SIM vendor at Vágar Airport. Buy before departure. Test it works.", deadline: "Day 1", relatedDay: "1" },
];

const GROUPS = ["Book", "Download", "Save", "Pack", "Confirm"] as const;

export function BeforeDepartureChecklist() {
  const ids = CHECKLIST_ITEMS.map((i) => i.id);
  const { isChecked, toggle, ready, total, phrase } = useChecklist(ids);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const filtered = activeGroup
    ? CHECKLIST_ITEMS.filter((i) => i.group === activeGroup)
    : CHECKLIST_ITEMS;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60">
          Before departure checklist
        </p>
        {phrase && (
          <span className="text-[11px] font-medium text-moss">{phrase}</span>
        )}
      </div>

      {/* Progress bar */}
      {ready > 0 && (
        <div className="w-full h-1 bg-basalt/10 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-moss/70 rounded-full transition-all duration-300"
            style={{ width: `${(ready / total) * 100}%` }}
          />
        </div>
      )}

      {/* Group filters */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setActiveGroup(activeGroup === g ? null : g)}
            className={`text-[10px] uppercase tracking-[0.1em] px-2 py-1 rounded-[4px] border transition-colors ${
              activeGroup === g
                ? "border-basalt/30 bg-basalt/[0.04] text-basalt"
                : "border-basalt/10 text-basalt/50 hover:border-basalt/20"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Checklist items */}
      <div className="space-y-1">
        {filtered.map((item) => {
          const checked = isChecked(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggle(item.id)}
              className="w-full text-left flex items-start gap-2.5 py-2 px-2 rounded-[4px] hover:bg-basalt/[0.02] transition-colors group"
            >
              <span
                className={`shrink-0 mt-0.5 w-4 h-4 rounded-[3px] border flex items-center justify-center text-[10px] transition-colors ${
                  checked
                    ? "bg-moss border-moss text-white"
                    : "border-basalt/25 text-transparent group-hover:border-basalt/40"
                }`}
              >
                {checked ? "x" : ""}
              </span>
              <div className="min-w-0">
                <p className={`text-[13px] ${checked ? "text-basalt/50 line-through" : "text-basalt"}`}>
                  {item.what}
                </p>
                <p className="text-[11px] text-basalt/45 mt-0.5">
                  {item.why}
                  {" · "}
                  <span className="text-[10px] uppercase tracking-[0.08em] text-fjord/60">
                    {item.deadline}
                  </span>
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
