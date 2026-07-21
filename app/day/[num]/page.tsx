// =============================================================================
// Day detail — one page per trip chapter.
// Server component: handles generateStaticParams, delegates UI to client.
// =============================================================================

import { DAYS } from "@/lib/data/itinerary";
import { DayDetail } from "@/components/day-detail";

// =============================================================================
// generateStaticParams — prerender all 6 days (strip leading zero)
// =============================================================================
export function generateStaticParams() {
  return DAYS.map((day) => ({ num: String(parseInt(day.num, 10)) }));
}

// =============================================================================
// Page
// =============================================================================
export default async function DayPage({
  params,
}: {
  params: Promise<{ num: string }>;
}) {
  const { num } = await params;
  return <DayDetail num={num} />;
}
