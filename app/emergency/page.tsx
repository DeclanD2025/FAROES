// =============================================================================
// /emergency — Disruption & emergency operations centre.
// Large readable buttons, copyable contacts, clear next-action protocol.
// Designed for use under stress on a small screen with one hand.
// =============================================================================

"use client";

import { useState } from "react";
import { BOOKINGS } from "@/lib/data/itinerary";

// =============================================================================
// Emergency contacts
// =============================================================================

interface EmergencyContact {
  label: string;
  number: string;
  note: string;
  priority: "critical" | "high" | "medium";
}

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { label: "Emergency services", number: "112", note: "Police, ambulance, fire, search & rescue. Works across all islands.", priority: "critical" },
  { label: "Suðuroy hospital", number: "+298 304200", note: "Suðuroyar Sjúkrahús, Tvøroyri. 15 min by taxi from Øravík.", priority: "critical" },
  { label: "Medical helpline", number: "1870", note: "Non-emergency medical advice. Faroese/English. 24/7.", priority: "high" },
  { label: "Tvøroyri pharmacy", number: "+298 371276", note: "Sjúkrahúsvegin, Tvøroyri. Mon–Fri 09:00–17:30, Sat 09:00–13:00.", priority: "high" },
  { label: "Tórshavn pharmacy", number: "+298 311070", note: "Niels Finsens gøta. Mon–Fri 09:00–17:30, Sat 09:00–14:00.", priority: "medium" },
  { label: "Tórshavn hospital", number: "+298 304500", note: "Landssjúkrahúsið, Tórshavn. Emergency department 24/7.", priority: "critical" },
  { label: "Police (non-emergency)", number: "+298 351448", note: "Tórshavn station. For lost property, non-urgent reports.", priority: "medium" },
];

const TRAVEL_CONTACTS: EmergencyContact[] = [
  { label: "Atlantic Airways", number: "+298 341000", note: "RC 415/RC 416. Call for delays, rebooking, baggage. Office Mon–Fri 08:00–16:00.", priority: "high" },
  { label: "Ryanair UK", number: "+44 1279 358395", note: "RK 330 STN→GLA. Online chat faster than phone. App for rebooking.", priority: "medium" },
  { label: "Vágar Airport", number: "+298 354400", note: "Single terminal. Information desk 08:00–20:00. Lost baggage: Atlantic Airways desk.", priority: "high" },
  { label: "National Express", number: "+44 3717 818181", note: "LGW→STN coach. Flexible ticket recommended. App for live tracking.", priority: "medium" },
  { label: "SSL ferry", number: "+298 343000", note: "Route 7 · M/F Smyril. Cancellations posted at ssl.fo and harbour office.", priority: "critical" },
  { label: "Strandfaraskip Landsins", number: "+298 343000", note: "All buses (300, 700, 701). Same number as ferry — central transport authority.", priority: "high" },
  { label: "Suðuroy taxi", number: "+298 239550", note: "Pre-book. Covers Øravík, Tvøroyri, Krambatangi. ~DKK 150 to ferry terminal.", priority: "high" },
  { label: "Tórshavn taxi", number: "+298 313131", note: "Pre-book or rank at harbour. ~DKK 80 to Gundadalur.", priority: "high" },
  { label: "Vágar taxi", number: "+298 212121", note: "Sørvágur, airport, Gásadalur. Pre-book for Gásadalur (~DKK 200 one way).", priority: "medium" },
];

const ACCOMMODATION_CONTACTS: EmergencyContact[] = [
  { label: "Øravík guesthouse host", number: "Check Airbnb app", note: `Við á 7, Øravík 827. ${BOOKINGS.airbnb.listing}`, priority: "high" },
  { label: "Guesthouse Hugo", number: "+298 232101", note: `2 Bakkavegur, Sørvágur. Conf: ${BOOKINGS.hugo.confirmation}. PIN in booking email.`, priority: "high" },
  { label: "Hotel Hafnia (backup)", number: "+298 313233", note: "Áarvegur 4, Tórshavn. If stranded in Tórshavn overnight.", priority: "medium" },
  { label: "Hotel Føroyar (backup)", number: "+298 317500", note: "Oyggjarvegur 45, Tórshavn. Above the city — taxi from harbour.", priority: "medium" },
];

// =============================================================================
// Disruption protocols
// =============================================================================

interface DisruptionProtocol {
  id: string;
  title: string;
  icon: string;
  immediateAction: string;
  whoToContact: string;
  whatToHaveReady: string;
  backupPlan: string;
  whatNotToDo: string;
}

const DISRUPTIONS: DisruptionProtocol[] = [
  {
    id: "missed-ferry-last",
    title: "Missed the last ferry (21:15 Tórshavn → Suðuroy)",
    icon: "⛴",
    immediateAction: "Accept it. Do not run. The ferry will not wait. Walk calmly to Hotel Hafnia (5 min from terminal, +298 313233) or Hotel Føroyar (taxi, +298 317500).",
    whoToContact: "Hotel Hafnia +298 313233 or Hotel Føroyar +298 317500. Message Øravík host via Airbnb — they need to know you won't return tonight.",
    whatToHaveReady: "Passport. Credit card. Phone charger. Enough battery to message host.",
    backupPlan: "Book the first ferry south tomorrow (08:45 → arrives Krambatangi 10:50). If you have activities on Suðuroy the next day, they're still viable — you just lose the morning.",
    whatNotToDo: "Don't try to charter a private boat. Don't accept a lift from a stranger to 'another pier'. Don't panic — Tórshavn is safe and hotels are available.",
  },
  {
    id: "ferry-cancelled-swell",
    title: "Ferry cancelled (swell / weather)",
    icon: "🌊",
    immediateAction: "Check ssl.fo for official cancellation notice and next scheduled sailing. Harbour office at the terminal can confirm in person. If cancelled for the day: accept it and implement Plan B.",
    whoToContact: "SSL +298 343000. Accommodation (host/hotel if you need to extend). Taxi if you need to reposition.",
    whatToHaveReady: "SSL booking reference. Flexibility on which island you sleep on.",
    backupPlan: "If stuck on Suðuroy: you have Við á 7. If stuck in Tórshavn: Hotel Hafnia. If this is matchday and the ferry is cancelled: you miss the match. Inform your guest. Pubs in Tórshavn will still be open.",
    whatNotToDo: "Don't assume the next sailing will run. Don't plan a tight connection after a weather-disrupted ferry. Don't stand on an exposed pier in high wind.",
  },
  {
    id: "flight-delayed-outbound",
    title: "RC 415 delayed (EDI → FAE)",
    icon: "✈",
    immediateAction: "Check Atlantic Airways app/website for updated departure time. If delay exceeds 1h: you will miss the 21:15 ferry. Accept this. Book Hotel Hafnia or Hotel Føroyar for Monday night. Message Øravík host: arrival now Tuesday morning.",
    whoToContact: "Atlantic Airways +298 341000. Hotel Hafnia +298 313233. Øravík host via Airbnb.",
    whatToHaveReady: "Booking reference. Power bank (FAE has limited charging). Offline map of Tórshavn.",
    backupPlan: "Stay in Tórshavn Monday night. First ferry Tuesday is 08:45 → arrives Krambatangi 10:50. Bus 700 to Øravík. You lose Monday evening on Suðuroy but gain a Tórshavn morning.",
    whatNotToDo: "Don't try to rush from FAE to the ferry terminal — it's 45 min by bus and the 21:15 departure is tight even on time. Don't skip eating — Vágar Airport café closes by 19:00.",
  },
  {
    id: "flight-delayed-return",
    title: "RC 416 delayed (FAE → LGW)",
    icon: "✈",
    immediateAction: "Check delay length. 0–1h: no action needed, buffer holds. 1–2h: book a later National Express coach. 2–3h: check train alternative (Thameslink → St Pancras → Stansted Express). 3h+: contact Ryanair about RK 330 rebooking options.",
    whoToContact: "Atlantic Airways +298 341000. National Express +44 3717 818181. Ryanair — app/chat is faster than phone. Travel insurer — call before spending on alternative transport.",
    whatToHaveReady: "Both flight booking references. Insurance policy number + emergency claims number. Charged phone for rebooking apps.",
    backupPlan: "Train: Thameslink LGW → St Pancras (30 min), walk to King's Cross, Stansted Express → STN (50 min). Total ~2h. Or taxi LGW→STN (~£150, 2h). Or rebook RK 330 to next day if delay is extreme.",
    whatNotToDo: "Don't wait to see if the delay 'gets better'. Don't book a non-refundable alternative without insurer approval. Don't leave the terminal without knowing your rebooking options.",
  },
  {
    id: "missed-bus-last",
    title: "Missed the last bus (Bus 700 Suðuroy / Bus 300 inter-island)",
    icon: "🚌",
    immediateAction: "Taxi. On Suðuroy: +298 239550. In Tórshavn/Vágar: +298 313131 or +298 212121. Taxis in the Faroes are reliable and not ruinously expensive for short hops.",
    whoToContact: "Suðuroy taxi +298 239550. Tórshavn taxi +298 313131. Vágar taxi +298 212121.",
    whatToHaveReady: "Destination address. Cash or card (all Faroese taxis take cards). Enough Danish króna for the fare if card fails.",
    backupPlan: "If no taxi available and the distance is walkable: Øravík to Krambatangi is ~2 km (20 min walk). Sørvágur to airport is ~3 km (35 min walk). Walking on Suðuroy roads at night: use phone torch, face traffic, wear something visible.",
    whatNotToDo: "Don't hitchhike as Plan A. Don't walk on unlit rural roads without a torch. Don't assume a bus listed on a timetable actually runs on Sundays or Ólavsøka.",
  },
  {
    id: "lost-passport",
    title: "Lost or stolen passport",
    icon: "🛂",
    immediateAction: "Report to Faroese police: +298 351448 (Tórshavn). Get a police report — you will need it for the embassy and insurance. Then contact the British Embassy in Copenhagen: +45 35 44 52 00.",
    whoToContact: "Faroese police +298 351448. British Embassy Copenhagen +45 35 44 52 00. Atlantic Airways — you cannot board without ID. Travel insurer — emergency claims line.",
    whatToHaveReady: "Police report number. Digital copy of passport (save a photo to your phone before travel). Insurance policy number. Alternative ID if you have it (driving licence).",
    backupPlan: "The British Embassy in Copenhagen can issue an emergency travel document (ETD). This takes 1–2 working days. You may need to travel to Copenhagen. Contact the embassy immediately — do not wait until the day of your flight.",
    whatNotToDo: "Don't board a flight without ID hoping for leniency — you will be denied. Don't leave the country without a valid travel document. Don't delay reporting to police — the report is essential for the ETD.",
  },
  {
    id: "lost-phone",
    title: "Lost or broken phone",
    icon: "📱",
    immediateAction: "If you have a laptop/tablet: use it for all digital needs (Airbnb messages, SSL ferry tickets, boarding passes). If all devices are lost: use a public computer at Tórshavn library or ask your accommodation host.",
    whoToContact: "Accommodation host — they can help with local calls. Faroese police +298 351448 if stolen. Your mobile carrier — suspend service and report loss.",
    whatToHaveReady: "Printed copies of all bookings, tickets, and contacts. This site's printed trip pack. A backup credit card stored separately from the phone. A written list of critical phone numbers.",
    backupPlan: "Buy a cheap phone in Tórshavn (Elgiganten, SMS shopping centre). Use wifi at cafés and the ferry (M/F Smyril has free wifi). Contact home via email or Airbnb messaging.",
    whatNotToDo: "Don't assume Find My iPhone will work on Faroese mobile networks. Don't keep all your travel documents only on your phone. Don't rely on public computers being available on Suðuroy.",
  },
  {
    id: "illness-injury",
    title: "Illness or injury during the trip",
    icon: "🏥",
    immediateAction: "Life-threatening: 112. Non-emergency: 1870 (medical helpline). Minor: Tvøroyri pharmacy +298 371276. For cuts, sprains, or illness that doesn't need hospital: the pharmacy can advise and dispense.",
    whoToContact: "Emergency: 112. Medical advice: 1870. Suðuroy hospital +298 304200. Tórshavn hospital +298 304500. Travel insurer — notify before incurring significant medical costs.",
    whatToHaveReady: "Insurance policy number and emergency claims number. EHIC/GHIC is NOT valid in the Faroes — you need travel insurance. List of any medications and allergies.",
    backupPlan: "Suðuroy hospital in Tvøroyri can handle most acute cases. For serious cases, patients are airlifted to Tórshavn or Copenhagen. Pharmacies stock basic medications. Bónus and ESLA carry basic first-aid supplies.",
    whatNotToDo: "Don't hike alone if you feel unwell. Don't ignore symptoms hoping they'll pass before a ferry departure. Don't assume a pharmacy will be open — check hours first.",
  },
  {
    id: "stranded-torshavn",
    title: "Stranded in Tórshavn (missed last ferry south)",
    icon: "🏨",
    immediateAction: "Book a room. Hotel Hafnia (+298 313233, Áarvegur 4) is 5 min walk from the ferry terminal. Hotel Føroyar (+298 317500, Oyggjarvegur 45) is on the hill — taxi required. Both have 24h reception.",
    whoToContact: "Hotel Hafnia +298 313233 or Hotel Føroyar +298 317500. Message Øravík host — tell them you're staying in Tórshavn and will arrive tomorrow. SSL +298 343000 — confirm tomorrow's first sailing.",
    whatToHaveReady: "Credit card. Passport. Overnight essentials (toothbrush, charger — pharmacy at SMS shopping centre if needed).",
    backupPlan: "First ferry south: 08:45 → arrives Krambatangi 10:50. Bus 700 to Øravík. You lose the evening on Suðuroy but the next day is still intact.",
    whatNotToDo: "Don't sleep at the ferry terminal — it closes. Don't try to get to Suðuroy by any other means — there is no road, no bridge, no alternative boat. Don't panic — Tórshavn is one of the safest capitals in the world.",
  },
  {
    id: "lost-hiking",
    title: "Lost or disoriented while hiking",
    icon: "🗺",
    immediateAction: "Stop. Do not walk further. Retrace your steps if you can identify the last known marker. If you're on a marked trail (orange posts), look for the next post. If visibility is poor: stay put. Call 112.",
    whoToContact: "112 — search & rescue operates across all islands. They're experienced with hiker recovery. Give them your last known position, the trail name, and what you can see.",
    whatToHaveReady: "Charged phone with offline maps. GPS coordinates if possible (Google Maps / Maps.me shows your location even offline). Whistle. Head torch. Waterproof layer. Enough battery to make a call.",
    backupPlan: "If you're on Hvannhagi: the orange posts lead back to the road above Øravík. If you're on Beinisvørð: follow the fence line back to the lighthouse road. Both trails are well-marked in clear weather. In fog: stay put.",
    whatNotToDo: "Don't keep walking downhill hoping to find a road — Faroese cliffs are sheer. Don't separate from your hiking partner. Don't rely on Google Maps walking directions on unmarked fell trails.",
  },
  {
    id: "severe-weather",
    title: "Severe weather (high wind, heavy rain, fog)",
    icon: "🌧",
    immediateAction: "Wind over 15 m/s: abandon exposed hikes (Beinisvørð, Hvannhagi, Ásmundarstakkur). Fog: abandon any trail that relies on markers for navigation. Heavy rain: switch to indoor/vehicle-based plans.",
    whoToContact: "No specific contact. Check yr.no for updated forecast. SSL +298 343000 for ferry status (high wind can cancel sailings).",
    whatToHaveReady: "Indoor backup plan for each day. Waterproof shell and overtrousers regardless of forecast. This site's weather adaptation notes for each day.",
    backupPlan: "Day 2 (Suðuroy): Hotel Tvøroyri pub, Tvøroyri museum, bus tour of Suðuroy villages. Day 3 (Ólavsøka): indoor events at Nordic House, Tórshavn cafés. Day 4 (matchday): match still on unless extreme — stadium partially covered. Day 5 (Vágar): Sørvágur village, airport café, plan B for Gásadalur.",
    whatNotToDo: "Don't attempt Beinisvørð in wind over 15 m/s — the cliff edge is unprotected. Don't hike in fog without a GPS track. Don't assume ferries will run in high wind — check ssl.fo.",
  },
];

// =============================================================================
// Sub-components
// =============================================================================

function ContactCard({ contact }: { contact: EmergencyContact }) {
  const [copied, setCopied] = useState(false);

  const priorityColors = {
    critical: "border-l-rust bg-rust/[0.03]",
    high: "border-l-rust/60 bg-rust/[0.01]",
    medium: "border-l-fjord/40",
  };

  const copyNumber = () => {
    try {
      navigator.clipboard.writeText(contact.number).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }).catch(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    } catch {
      // Clipboard API not available — silently ignore
    }
  };

  return (
    <div className={`border border-basalt/12 ${priorityColors[contact.priority]} rounded-[6px] p-3.5 pl-4`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-basalt">{contact.label}</p>
          <p className="text-[11px] text-basalt/50 mt-0.5">{contact.note}</p>
        </div>
        <div className="shrink-0 flex items-center gap-1.5">
          <a
            href={`tel:${contact.number.replace(/\s/g, "")}`}
            className="code tnum text-[15px] font-medium text-fjord hover:text-rust transition-colors"
          >
            {contact.number}
          </a>
          <button
            type="button"
            onClick={copyNumber}
            className="text-[11px] px-1.5 py-0.5 rounded-[3px] border border-basalt/15 text-basalt/50 hover:text-basalt hover:border-basalt/30 transition-colors"
            aria-label={`Copy ${contact.number}`}
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DisruptionCard({ protocol, defaultExpanded }: { protocol: DisruptionProtocol; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? false);

  return (
    <div className="border border-basalt/15 rounded-[7px] overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-basalt/[0.02] transition-colors"
        aria-expanded={expanded}
      >
        <span className="text-[22px] shrink-0" aria-hidden>{protocol.icon}</span>
        <span className="flex-1 text-[14px] font-medium text-basalt leading-snug">{protocol.title}</span>
        <span className="text-[14px] text-basalt/30 shrink-0">{expanded ? "▴" : "▾"}</span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-basalt/8 pt-3">
          <ProtocolStep label="Immediate action" content={protocol.immediateAction} tone="critical" />
          <ProtocolStep label="Who to contact" content={protocol.whoToContact} tone="high" />
          <ProtocolStep label="Have ready" content={protocol.whatToHaveReady} tone="medium" />
          <ProtocolStep label="Backup plan" content={protocol.backupPlan} tone="medium" />
          <ProtocolStep label="Do NOT" content={protocol.whatNotToDo} tone="critical" />
        </div>
      )}
    </div>
  );
}

function ProtocolStep({ label, content, tone }: { label: string; content: string; tone: "critical" | "high" | "medium" }) {
  const toneColors = {
    critical: "border-l-rust text-rust",
    high: "border-l-rust/60 text-rust/80",
    medium: "border-l-fjord/40 text-fjord/80",
  };

  return (
    <div className={`border-l-2 pl-3 ${toneColors[tone]}`}>
      <p className="text-[10px] uppercase tracking-[0.1em] font-medium mb-0.5">{label}</p>
      <p className="text-[13px] text-basalt/75">{content}</p>
    </div>
  );
}

// =============================================================================
// Page
// =============================================================================

export default function EmergencyPage() {
  return (
    <article className="px-4 sm:px-8 pt-6 sm:pt-10 pb-20 max-w-[800px] mx-auto">
      {/* Header */}
      <header className="mb-8">
        <p className="text-[11px] tracking-[0.14em] uppercase text-rust font-medium">
          Emergency & disruption
        </p>
        <h1
          className="text-[clamp(2rem,5vw,3rem)] leading-[1.04] mt-2 text-basalt tracking-[-0.01em]"
          style={{ fontFamily: "var(--font-cinzel)" }}
        >
          If something goes wrong
        </h1>
        <p className="text-[15px] text-basalt/60 mt-3 max-w-[36rem]">
          Large text, copyable numbers, clear protocols. Designed to work on a small screen with one hand under stress.
          Every contact can be dialled by tapping. Every number can be copied.
        </p>
      </header>

      {/* Quick-dial emergency strip */}
      <section className="mb-8">
        <div className="border-2 border-rust/50 bg-rust/[0.04] rounded-[8px] p-5">
          <p className="text-[10px] uppercase tracking-[0.14em] text-rust font-medium mb-3">
            Emergency · dial immediately
          </p>
          <a
            href="tel:112"
            className="inline-block text-[clamp(2.5rem,6vw,3.5rem)] font-medium text-rust leading-none hover:opacity-80 transition-opacity code tnum"
          >
            112
          </a>
          <p className="text-[13px] text-basalt/70 mt-2">
            Police, ambulance, fire, search & rescue. Works on all islands.
            Call for: serious injury, lost while hiking, crime in progress, fire.
          </p>
        </div>
      </section>

      {/* Disruption protocols — the most important section */}
      <section className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-3">
          Disruption protocols
        </p>
        <p className="text-[13px] text-basalt/55 mb-4">
          Tap each scenario to expand. The most likely disruptions for this trip are listed first.
        </p>
        <div className="space-y-2">
          {DISRUPTIONS.map((d) => (
            <DisruptionCard key={d.id} protocol={d} defaultExpanded={d.id === "missed-ferry-last"} />
          ))}
        </div>
      </section>

      {/* Emergency contacts */}
      <section className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-3">
          Emergency contacts
        </p>
        <div className="space-y-2">
          {EMERGENCY_CONTACTS.map((c) => (
            <ContactCard key={c.label} contact={c} />
          ))}
        </div>
      </section>

      {/* Travel contacts */}
      <section className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-3">
          Transport contacts
        </p>
        <div className="space-y-2">
          {TRAVEL_CONTACTS.map((c) => (
            <ContactCard key={c.label} contact={c} />
          ))}
        </div>
      </section>

      {/* Accommodation contacts */}
      <section className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-3">
          Accommodation contacts
        </p>
        <div className="space-y-2">
          {ACCOMMODATION_CONTACTS.map((c) => (
            <ContactCard key={c.label} contact={c} />
          ))}
        </div>
      </section>

      {/* Insurance reminder */}
      <section className="border border-rust/20 bg-rust/[0.02] rounded-[7px] p-4">
        <p className="text-[10px] uppercase tracking-[0.14em] text-rust font-medium mb-2">
          Insurance
        </p>
        <p className="text-[13px] text-basalt/70">
          <strong>GHIC/EHIC is NOT valid in the Faroe Islands.</strong> The Faroes are outside the EU/EEA for healthcare purposes.
          You need travel insurance with medical cover, including hiking and missed-connection cover for the self-transfer on Day 6.
          Keep your policy number and emergency claims number saved offline — write them down, don't just screenshot.
        </p>
      </section>
    </article>
  );
}
