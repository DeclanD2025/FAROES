// =============================================================================
// RailNav — fixed desktop sidebar (236px) with structured navigation groups.
// Mobile uses a compact bottom strip via MobileNav component.
// =============================================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; subtitle?: string };

interface NavSection {
  group: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    group: "ITINERARY",
    items: [
      { href: "/day/1", label: "Day 1", subtitle: "The journey north" },
      { href: "/day/2", label: "Day 2", subtitle: "The cliffs of Suðuroy" },
      { href: "/day/3", label: "Day 3", subtitle: "A free day on Suðuroy" },
      { href: "/day/4", label: "Day 4", subtitle: "Matchday" },
      { href: "/day/5", label: "Day 5", subtitle: "Repositioning north" },
      { href: "/day/6", label: "Day 6", subtitle: "Homeward" },
    ],
  },
  {
    group: "PLAN",
    items: [
      { href: "/itinerary", label: "Full itinerary" },
      { href: "/transport", label: "Transport" },
      { href: "/bookings", label: "Bookings" },
      { href: "/packing", label: "Documents" },
    ],
  },
  {
    group: "DISCOVER",
    items: [
      { href: "/places", label: "Map" },
      { href: "/explore", label: "Places" },
      { href: "/food-drink", label: "Food & drink" },
      { href: "/shops", label: "Shops & local" },
      { href: "/hikes", label: "Hiking routes" },
    ],
  },
  {
    group: "MATCH",
    items: [
      { href: "/match-day", label: "Match guide" },
      { href: "/stadium", label: "Stadium" },
      { href: "/tickets", label: "Tickets" },
      { href: "/supporters", label: "Supporter info" },
    ],
  },
];

export function RailNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" || pathname === "" : pathname?.startsWith(href);

  return (
    <>
      {/* Desktop sidebar · 236px · pinned left */}
      <aside
        aria-label="Faroe expedition navigation"
        className="hidden lg:flex fixed top-0 left-0 bottom-0 z-40 flex-col bg-navy text-wool overflow-y-auto"
        style={{ width: "236px", paddingTop: "env(safe-area-inset-top)" }}
      >
        {/* Header */}
        <Link href="/" className="block px-6 pt-6 pb-5">
          <p
            className="text-[28px] leading-[1.02] tracking-[-0.01em] text-wool"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            FAROE
            <br />
            ISLANDS
          </p>
          <p className="text-[11px] text-wool/60 mt-2 tracking-[0.06em]">
            27 JUL – 1 AUG 2026
          </p>
        </Link>

        {/* Navigation sections */}
        <nav className="flex-1 px-0 pt-2">
          {NAV_SECTIONS.map((section) => (
            <div key={section.group} className="mb-4">
              <p className="text-[9.5px] uppercase tracking-[0.18em] text-wool/45 px-6 mb-1.5">
                {section.group}
              </p>
              <ul>
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`block px-6 py-2 text-[13px] leading-[1.3] border-l-[3px] transition-colors min-h-[44px] flex flex-col justify-center ${
                          active
                            ? "text-wool border-rust bg-white/[0.06]"
                            : "text-wool/65 border-transparent hover:text-wool/85 hover:bg-white/[0.03]"
                        }`}
                      >
                        <span className="font-medium">{item.label}</span>
                        {item.subtitle && (
                          <span className="text-[11px] text-wool/45 mt-0.5 leading-tight">
                            {item.subtitle}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-white/[0.08]">
          <p className="text-[10px] text-wool/35 leading-[1.4]">
            Always check local conditions and live travel updates.
          </p>
        </div>
      </aside>


    </>
  );
}
