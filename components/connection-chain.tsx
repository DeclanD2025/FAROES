// =============================================================================
// ConnectionChain — visual connection diagram for multi-leg journeys.
// Shows: scheduled arrival → scheduled departure → transfer buffer →
// minimum comfortable buffer → risk state → backup.
// =============================================================================

import type { ConnectionChain as Chain, ConnectionLink, RiskLevel } from "@/lib/data/transport-matrices";

const RISK_COLORS: Record<RiskLevel, string> = {
  low: "border-moss/40 text-moss",
  medium: "border-yellow/40 text-yellow",
  high: "border-rust/50 text-rust",
  critical: "border-rust text-rust bg-rust/[0.04]",
};

const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
  critical: "CRITICAL",
};

export function ConnectionChain({ chain }: { chain: Chain }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60">
          {chain.title}
        </p>
      </div>
      <div className="space-y-0">
        {chain.links.map((link, i) => (
          <div key={i}>
            <ConnectionRow link={link} />
            {i < chain.links.length - 1 && (
              <div className="flex items-center gap-2 pl-6 py-1">
                <div className="w-px h-2 border-l border-dashed border-basalt/25" />
                <span className="text-[10px] text-basalt/40">Buffer: {link.scheduledBuffer}</span>
                <span className={`text-[10px] font-medium ${RISK_COLORS[link.risk]}`}>
                  {RISK_LABELS[link.risk]}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ConnectionRow({ link }: { link: ConnectionLink }) {
  return (
    <div className={`border rounded-[7px] p-3 ${RISK_COLORS[link.risk]}`}>
      <div className="flex items-center gap-3 flex-wrap">
        {/* Departing journey */}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-[0.08em] text-basalt/45">
            {link.mode}
          </p>
          <p className="text-[14px] font-medium text-basalt">
            {link.from}
            <span className="text-basalt/30 mx-1.5">→</span>
            {link.to}
          </p>
        </div>

        {/* Times */}
        <div className="flex items-center gap-2 text-[13px]">
          <span className="code text-fjord">{link.arrivalTime}</span>
          <span className="text-basalt/30">→</span>
          <span className="code text-fjord">{link.departureTime}</span>
        </div>
      </div>

      {/* Consequence and backup */}
      {(link.consequence || link.backup) && (
        <div className="mt-2 pt-2 border-t border-basalt/8 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
          {link.consequence && (
            <div>
              <span className="text-rust/70">If missed: </span>
              <span className="text-basalt/60">{link.consequence}</span>
            </div>
          )}
          {link.backup && (
            <div>
              <span className="text-moss/70">Backup: </span>
              <span className="text-basalt/60">{link.backup}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
