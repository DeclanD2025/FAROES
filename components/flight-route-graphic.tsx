// Focused route graphic for a single air leg. It deliberately avoids a broad
// geographic map: Day 1 needs the flight at a glance, not the entire itinerary.

export function FlightRouteGraphic() {
  return (
    <section className="overflow-hidden border border-basalt/15 rounded-[7px] bg-[#dfe5e5]" aria-label="Flight route: Edinburgh Airport to Vágar Airport">
      <div className="flex items-center justify-between border-b border-basalt/10 px-4 py-3">
        <div>
          <p className="label text-fjord">Flight leg</p>
          <p className="mt-0.5 text-[14px] font-medium text-basalt">Edinburgh → Vágar</p>
        </div>
        <p className="code tnum text-[12px] text-fjord">RC 415 · 1h 25m</p>
      </div>

      <svg viewBox="0 0 440 370" className="block w-full h-auto" role="img" aria-label="Curved flight line from Edinburgh Airport in Scotland to Vágar Airport in the Faroe Islands">
        <defs>
          <pattern id="sea-lines" width="34" height="34" patternUnits="userSpaceOnUse">
            <path d="M-8 17 C2 9 14 9 25 17 S47 25 58 17" fill="none" stroke="#8ba0a2" strokeWidth="1" opacity=".35" />
          </pattern>
          <filter id="plane-shadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity=".2" /></filter>
        </defs>
        <rect width="440" height="370" fill="url(#sea-lines)" />
        <path d="M58 310 C100 244 94 180 140 122 C163 94 189 76 217 54" fill="none" stroke="#e8b34b" strokeWidth="3" strokeDasharray="7 7" />
        <path d="M291 79 C324 55 354 55 385 82 L370 108 L336 103 L312 121 L284 109 Z" fill="#ecf0ec" opacity=".9" />
        <path d="M274 123 C289 116 307 120 319 132 L307 148 L285 144 Z" fill="#ecf0ec" opacity=".9" />
        <path d="M41 313 C77 288 119 296 145 324 L132 350 L56 350 Z" fill="#ecf0ec" opacity=".9" />
        <circle cx="64" cy="306" r="10" fill="#c44338" stroke="#f7f1e8" strokeWidth="4" />
        <circle cx="319" cy="102" r="10" fill="#2b8a62" stroke="#f7f1e8" strokeWidth="4" />
        <g transform="translate(175 104) rotate(-37)" filter="url(#plane-shadow)">
          <path d="M0 14 L31 0 L27 10 L50 14 L50 20 L27 22 L31 33 L0 19 L-14 24 L-18 20 L-8 16 L-18 11 L-14 7 Z" fill="#283035" />
        </g>
        <text x="64" y="337" fill="#283035" fontSize="13" fontWeight="700" textAnchor="middle" letterSpacing="1.1">EDINBURGH</text>
        <text x="64" y="355" fill="#59686a" fontSize="10" textAnchor="middle" letterSpacing="1">EDI · SCOTLAND</text>
        <text x="319" y="70" fill="#283035" fontSize="13" fontWeight="700" textAnchor="middle" letterSpacing="1.1">VÁGAR</text>
        <text x="319" y="53" fill="#59686a" fontSize="10" textAnchor="middle" letterSpacing="1">FAE · FØROYAR</text>
        <text x="220" y="262" fill="#59686a" fontSize="10" textAnchor="middle" letterSpacing="1.4">NORTH ATLANTIC</text>
      </svg>

      <div className="grid grid-cols-2 border-t border-basalt/10 text-[12px]">
        <div className="px-4 py-3 border-r border-basalt/10"><p className="label">Depart</p><p className="code tnum mt-1 text-fjord">17:10 · EDI</p></div>
        <div className="px-4 py-3"><p className="label">Land</p><p className="code tnum mt-1 text-fjord">18:35 · FAE</p></div>
      </div>
    </section>
  );
}
