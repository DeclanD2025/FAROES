// =============================================================================
// SourceRegister — compact source and confidence display for day pages.
// Shows: official source, information verified, checked date, confidence, warning.
// =============================================================================

import type { VerifiedData, Confidence } from "@/lib/data/sources";
import { confidenceLabel, confidenceColor } from "@/lib/data/sources";

interface SourceRegisterProps {
  items: {
    claim: string;
    verification: VerifiedData;
  }[];
}

export function SourceRegister({ items }: SourceRegisterProps) {
  return (
    <div className="border-t border-basalt/15 pt-6 mt-8">
      <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-4">
        Sources &amp; confidence
      </p>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 text-[12px]">
            <span className={`shrink-0 mt-0.5 ${confidenceColor(item.verification.confidence)}`}>
              {item.verification.confidence === "confirmed" ? "●" :
               item.verification.confidence === "provisional" ? "◉" :
               item.verification.confidence === "unverified" ? "○" :
               "◇"}
            </span>
            <div className="min-w-0">
              <p className="text-basalt">
                <span className="font-medium">{item.claim}</span>
                {" · "}
                <span className={`${confidenceColor(item.verification.confidence)}`}>
                  {confidenceLabel(item.verification.confidence)}
                </span>
              </p>
              {item.verification.actionRequired && (
                <p className="text-rust/80 mt-0.5">{item.verification.actionRequired}</p>
              )}
              {item.verification.sources.length > 0 && (
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                  {item.verification.sources.map((s, j) => (
                    <a
                      key={j}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-fjord/60 underline underline-offset-2 decoration-fjord/25 hover:text-rust transition-colors"
                    >
                      {s.title} ↗
                    </a>
                  ))}
                  <span className="text-basalt/35">
                    checked {item.verification.sources[0]?.lastChecked || "—"}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
