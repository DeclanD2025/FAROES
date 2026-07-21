// =============================================================================
// MobileNav — bottom navigation for narrow viewports.
// Shows day numbers 1-5 prominently, plus a "More" drawer for secondary items
// matching the desktop sidebar structure.
// =============================================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = { href: string; label: string };

const PRIMARY: NavItem[] = [
  { href: "/day/1", label: "Day 1" },
  { href: "/day/2", label: "Day 2" },
  { href: "/day/3", label: "Day 3" },
  { href: "/day/4", label: "Day 4" },
  { href: "/day/5", label: "Day 5" },
  { href: "/day/6", label: "Day 6" },
];

const SECONDARY: NavItem[] = [
  { href: "/places", label: "Map" },
  { href: "/explore", label: "Places" },
  { href: "/food-drink", label: "Food & drink" },
  { href: "/hikes", label: "Hiking routes" },
  { href: "/match-day", label: "Match guide" },
  { href: "/packing", label: "Documents" },
];

export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" || pathname === "" : pathname?.startsWith(href);

  return (
    <>
      {/* Bottom nav bar — days 1-5 + More */}
      <nav
        aria-label="Primary navigation"
        className="lg:hidden fixed inset-x-0 bottom-0 z-40 bg-navy text-wool border-t border-fog/15"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="grid grid-cols-7">
          {PRIMARY.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`block text-center py-3 text-[10px] font-medium whitespace-nowrap border-t-2 transition-colors min-h-[48px] flex items-center justify-center ${
                  isActive(item.href)
                    ? "text-wool border-rust"
                    : "text-fog/75 border-transparent"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
          {/* More — integrated as 6th grid column */}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-label="More navigation"
              className="block w-full text-center py-3 text-[16px] text-fog/60 hover:text-wool transition-colors min-h-[48px] flex items-center justify-center"
            >
              ☰
            </button>
          </li>
        </ul>
      </nav>

      {/* More drawer */}
      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-basalt/20"
            onClick={() => setMoreOpen(false)}
            aria-hidden
          />
          <div
            className="absolute inset-x-0 bottom-0 bg-navy text-wool border-t border-fog/15 rounded-t-lg max-h-[60vh] overflow-y-auto"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            role="dialog"
            aria-label="More navigation"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-fog/10">
              <p className="text-[11px] uppercase tracking-[0.14em] text-wool/50">More</p>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="text-wool/60 text-[20px] leading-none p-1 min-h-[44px] min-w-[44px]"
                aria-label="Close more menu"
              >
                ×
              </button>
            </div>
            <ul className="py-2">
              {SECONDARY.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`block px-4 py-3 text-[13px] font-medium border-l-[3px] transition-colors ${
                      isActive(item.href)
                        ? "text-wool border-rust bg-white/[0.06]"
                        : "text-fog/85 border-transparent hover:bg-white/[0.03]"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
