// =============================================================================
// DecisionTreeView — renders decision trees as visual branching diagrams.
// Each node shows a question and clickable options that highlight the
// selected plan. Used in day pages for weather/transport decisions.
// =============================================================================

"use client";

import { useState } from "react";
import type { DecisionTree, DecisionNode, DecisionOption } from "@/lib/data/decision-trees";

interface DecisionTreeViewProps {
  tree: DecisionTree;
  onSelectPlan?: (planId: string) => void;
  activePlanId?: string;
}

function DecisionNodeView({
  node,
  onSelectPlan,
  activePlanId,
}: {
  node: DecisionNode;
  onSelectPlan?: (planId: string) => void;
  activePlanId?: string;
}) {
  return (
    <div className="border-l-2 border-fjord/20 pl-4 py-2">
      <p className="text-[14px] font-medium text-basalt mb-2">{node.question}</p>
      <div className="space-y-1.5">
        {node.options.map((opt) => {
          const isActive = activePlanId === opt.planId;
          const likelihoodColors: Record<string, string> = {
            preferred: "border-moss/40 bg-moss/[0.03]",
            likely: "border-fjord/30 bg-fjord/[0.03]",
            fallback: "border-yellow/30 bg-yellow/[0.03]",
            "last-resort": "border-rust/30 bg-rust/[0.03]",
          };
          return (
            <button
              key={opt.planId}
              type="button"
              onClick={() => onSelectPlan?.(opt.planId)}
              className={`w-full text-left border rounded-[6px] p-2.5 transition-colors text-[13px] ${
                isActive
                  ? "border-basalt/40 bg-basalt/[0.04] font-medium"
                  : `${likelihoodColors[opt.likelihood || "likely"]} hover:border-basalt/25`
              }`}
            >
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-basalt">{opt.label}</span>
                {opt.likelihood && (
                  <span className="text-[10px] uppercase tracking-[0.08em] text-basalt/45">
                    {opt.likelihood === "preferred" ? "preferred" :
                     opt.likelihood === "fallback" ? "backup" :
                     opt.likelihood === "last-resort" ? "last resort" : ""}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-basalt/55 mt-0.5">{opt.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DecisionTreeView({ tree, onSelectPlan, activePlanId }: DecisionTreeViewProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-basalt/15 rounded-[8px] overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-basalt/[0.02] transition-colors"
        aria-expanded={expanded}
      >
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-fjord/60 mb-0.5">
            Decision plan
          </p>
          <p className="text-[14px] font-medium text-basalt">{tree.title}</p>
          <p className="text-[11px] text-basalt/50 mt-0.5">
            Decide by: <span className="code">{tree.decisionBy}</span>
          </p>
        </div>
        <span className="text-[14px] text-basalt/40 shrink-0 ml-3">
          {expanded ? "^" : "v"}
        </span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-1">
          {tree.nodes.map((node) => (
            <DecisionNodeView
              key={node.id}
              node={node}
              onSelectPlan={onSelectPlan}
              activePlanId={activePlanId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
