// A quiet operational plate for the single Day 1 air leg. It intentionally
// avoids illustrative maps: the route, timing and airport codes are the useful
// information here.

export function FlightRouteGraphic() {
  return (
    <section className="overflow-hidden border border-basalt/15 rounded-[7px] bg-fog/30" aria-label="Flight route: Edinburgh Airport to Vágar Airport">
      <div className="flex items-start justify-between gap-4 px-5 pt-5">
        <div>
          <p className="label text-fjord">Flight path · Monday 27 July</p>
          <h2 className="mt-1 text-[20px] tracking-[-.01em] text-basalt">Edinburgh <span className="text-basalt/35">—</span> Vágar</h2>
        </div>
        <div className="text-right">
          <p className="code tnum text-[16px] text-fjord">RC 415</p>
          <p className="caption mt-0.5">1h 25m scheduled</p>
        </div>
      </div>

      <svg viewBox="0 0 440 220" className="mt-2 block h-auto w-full" role="img" aria-label="Flight route from Edinburgh to Vágar">
        <defs>
          <pattern id="route-grid" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M22 0H0V22" fill="none" stroke="#1d4053" strokeOpacity=".065" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="440" height="220" fill="url(#route-grid)" />
        <path d="M57 165 C135 77 243 53 382 63" fill="none" stroke="#1d4053" strokeOpacity=".18" strokeWidth="1" />
        <path d="M57 165 C135 77 243 53 382 63" fill="none" stroke="#1d4053" strokeWidth="2" strokeDasharray="2 6" />
        <circle cx="57" cy="165" r="11" fill="#f7f4ed" stroke="#c44338" strokeWidth="2" />
        <circle cx="57" cy="165" r="3.5" fill="#c44338" />
        <circle cx="382" cy="63" r="11" fill="#f7f4ed" stroke="#2b8a62" strokeWidth="2" />
        <circle cx="382" cy="63" r="3.5" fill="#2b8a62" />
        <line x1="57" y1="180" x2="57" y2="205" stroke="#1d4053" strokeOpacity=".2" />
        <line x1="382" y1="78" x2="382" y2="102" stroke="#1d4053" strokeOpacity=".2" />
        <text x="57" y="197" fill="#273239" fontSize="10" textAnchor="middle" letterSpacing="1.4">EDI · 55.95°N</text>
        <text x="382" y="115" fill="#273239" fontSize="10" textAnchor="middle" letterSpacing="1.4">FAE · 62.06°N</text>
        <text x="220" y="100" fill="#1d4053" fontSize="10" textAnchor="middle" letterSpacing="1.8">NORTH ATLANTIC AIRWAY</text>
        <text x="220" y="120" fill="#68787c" fontSize="10" textAnchor="middle" letterSpacing="1.2">SCOTLAND → FØROYAR</text>
      </svg>

      <div className="grid grid-cols-[1fr_auto_1fr] border-t border-basalt/10">
        <div className="px-5 py-4"><p className="label">Depart</p><p className="code tnum mt-1 text-[16px] text-fjord">17:10 BST</p><p className="caption mt-1">Edinburgh · EDI</p></div>
        <div className="my-4 border-l border-basalt/10" />
        <div className="px-5 py-4 text-right"><p className="label">Arrive</p><p className="code tnum mt-1 text-[16px] text-fjord">18:35 WEST</p><p className="caption mt-1">Vágar · FAE</p></div>
      </div>
    </section>
  );
}
