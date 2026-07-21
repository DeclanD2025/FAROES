// =============================================================================
// PlaceholderPage — used for sidebar routes that don't have full pages yet.
// Keeps the site navigable without 404s while content is developed.
// =============================================================================

import Link from "next/link";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <article className="px-4 sm:px-8 pt-8 pb-20 max-w-[48rem]">
      <p className="text-[11px] tracking-[0.14em] uppercase text-rust font-medium">Coming soon</p>
      <h1 className="font-medium text-[clamp(1.5rem,2.5vw,2rem)] leading-[1.08] mt-2 text-basalt tracking-[-0.01em]">
        {title}
      </h1>
      <p className="text-[15px] text-basalt/55 mt-3 max-w-[32rem]">{description}</p>

      <hr className="my-8 border-basalt/10" />

      <div className="space-y-3">
        <p className="text-[13px] text-basalt/60">What's available now:</p>
        <ul className="space-y-1.5">
          <li>
            <Link href="/day/1" className="text-[14px] text-fjord underline underline-offset-2 decoration-fjord/30 hover:text-rust transition-colors">
              Day 1 · The journey north
            </Link>
          </li>
          <li>
            <Link href="/places" className="text-[14px] text-fjord underline underline-offset-2 decoration-fjord/30 hover:text-rust transition-colors">
              Map · Full route and place markers
            </Link>
          </li>
          <li>
            <Link href="/match-day" className="text-[14px] text-fjord underline underline-offset-2 decoration-fjord/30 hover:text-rust transition-colors">
              Match day · HB Tórshavn v Motherwell
            </Link>
          </li>
          <li>
            <Link href="/packing" className="text-[14px] text-fjord underline underline-offset-2 decoration-fjord/30 hover:text-rust transition-colors">
              Documents · Packing list and checklist
            </Link>
          </li>
        </ul>
      </div>
    </article>
  );
}
