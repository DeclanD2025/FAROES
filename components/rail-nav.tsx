// Atlantic-navy rail — the spine of the field-guide navigation.
// Narrow fixed-width rail on the left of the viewport on desktop. On
// mobile, the same five labels collapse to a sticky bottom strip.
//
// Active label is underlined in rust-red (not a glowing pill). Thin fog
// dividers between sections. No oversized padding, no large logo.

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

export function RailNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" || pathname === "" : pathname?.startsWith(href);

  return (
    <>
      {/* Desktop rail · Atlantic navy · pinned to the left edge. */}
      <aside
        aria-label="Faroe expedition navigation"
        className="hidden sm:flex fixed top-0 left-0 bottom-0 w-28 lg:w-36 z-40 flex-col bg-navy text-wool"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <Link
          href="/"
          className="block px-4 lg:px-6 pt-6 pb-8 border-b border-fog/15"
        >
          <p className="label text-wool/70">Faroes</p>
          <p className="font-mono text-[12px] text-wool/85 mt-1">2026 · 27JUL–01AUG</p>
        </Link>
        <nav className="flex-1 px-4 lg:px-6 pt-5">
          <ul className="space-y-0">
            {items.map((item) => (
              <li key={item.href} className="border-b border-fog/10 first:border-t first:border-fog/15">
                <Link href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className="nav-link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="px-4 lg:px-6 pb-6 pt-5 border-t border-fog/15">
          <p className="label text-wool/55">Codename</p>
          <p className="caption text-wool/55 mt-1">FAROE 2026</p>
        </div>
      </aside>

      {/* Mobile bottom strip — same five labels, no fade-in, no rail. */}
      <nav
        aria-label="Faroe expedition navigation (mobile)"
        className="sm:hidden fixed inset-x-0 bottom-0 z-40 bg-navy text-wool border-t border-fog/15"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <ul className="grid grid-cols-5">
          {items.map((item) => (
            <li key={item.href + "-m"}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`block text-center py-3 text-[9.5px] sm:text-[10px] tracking-[0.1em] uppercase whitespace-nowrap border-t-2 transition-colors ${
                  isActive(item.href) ? "text-wool border-rust" : "text-fog/80 border-transparent"
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
