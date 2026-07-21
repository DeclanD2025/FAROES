// =============================================================================
// Faroe Islands trip · Decision Trees
// Each day has structured decision logic: if X then Y, else Z.
// Rendered as visual decision trees in the UI — not prose paragraphs.
// =============================================================================

export interface DecisionNode {
  id: string;
  question: string;
  options: DecisionOption[];
}

export interface DecisionOption {
  label: string;
  description: string;
  planId: string;
  /** How likely this option is to be used */
  likelihood?: "preferred" | "likely" | "fallback" | "last-resort";
}

export interface DecisionTree {
  id: string;
  day: number;
  title: string;
  /** When the decision should be made by */
  decisionBy: string;
  nodes: DecisionNode[];
}

// =============================================================================
// Day 2 — Tuesday: Run + Hike Decision Tree
// =============================================================================

export const DAY2_DECISION: DecisionTree = {
  id: "day2-weather",
  day: 2,
  title: "Hike selection · Tuesday 28 July",
  decisionBy: "08:30 — check yr.no before breakfast",
  nodes: [
    {
      id: "d2-winds",
      question: "Are winds and visibility suitable for exposed hiking?",
      options: [
        {
          label: "Clear and calm",
          description: "Wind < 15 m/s, visibility > 2 km, no rain forecast",
          planId: "d2-plan-a",
          likelihood: "preferred",
        },
        {
          label: "Marginal",
          description: "Wind 15–20 m/s, patchy visibility, light rain",
          planId: "d2-plan-b",
          likelihood: "likely",
        },
        {
          label: "Poor",
          description: "Wind > 20 m/s, fog, persistent rain",
          planId: "d2-plan-c",
          likelihood: "fallback",
        },
      ],
    },
  ],
};

// =============================================================================
// Day 3 — Wednesday: Ólavsøka Decision
// =============================================================================

export const DAY3_DECISION: DecisionTree = {
  id: "day3-olavsoka",
  day: 3,
  title: "Ólavsøka plan · Wednesday 29 July",
  decisionBy: "09:00 — check ferry status + Tórshavn weather",
  nodes: [
    {
      id: "d3-olavsoka",
      question: "Ferry to Tórshavn for the national celebrations, or stay on Suðuroy?",
      options: [
        {
          label: "Ferry to Tórshavn",
          description: "11:30 ferry north → boat races at the harbour, harbour festival, pubs, last ferry back 21:15. ~13 hour day. Same ferry as matchday tomorrow.",
          planId: "d3-torshavn",
          likelihood: "preferred",
        },
        {
          label: "Stay on Suðuroy",
          description: "Ferry cancelled, bad weather in Tórshavn, or want a rest day before matchday. Pick from Fámjin, Froðba, or local Øravík plans.",
          planId: "d3-plan-b",
          likelihood: "fallback",
        },
      ],
    },
  ],
};

// =============================================================================
// Day 4 — Thursday: Matchday Ferry Decision Tree
// =============================================================================

export const DAY4_DECISION: DecisionTree = {
  id: "day4-ferry",
  day: 4,
  title: "Return ferry scenario · Thursday 30 July",
  decisionBy: "19:50 — full time whistle",
  nodes: [
    {
      id: "d4-match-end",
      question: "How does the match end?",
      options: [
        {
          label: "Normal time (90 min)",
          description: "Match finishes ~19:50. Walk to terminal: 15–20 min. Arrive ~20:10. Boarding closes 21:10.",
          planId: "d4-normal",
          likelihood: "preferred",
        },
        {
          label: "Extra time",
          description: "Match finishes ~20:20. Walk to terminal: 15–20 min. Arrive ~20:40. Tight but still possible.",
          planId: "d4-extra-time",
          likelihood: "fallback",
        },
        {
          label: "Penalty shootout",
          description: "Match finishes ~20:35. Walk to terminal: 15–20 min. Arrive ~20:55. Do NOT stay for celebrations — leave immediately.",
          planId: "d4-penalties",
          likelihood: "last-resort",
        },
      ],
    },
    {
      id: "d4-crowd",
      question: "Is there a crowd/policing delay leaving the stadium?",
      options: [
        {
          label: "No — clear exit",
          description: "Normal exit. Walk to terminal as planned.",
          planId: "d4-clear",
          likelihood: "preferred",
        },
        {
          label: "Yes — significant delay",
          description: "Crowd management, policing, or post-match incident slowing exit. Taxi immediately.",
          planId: "d4-delayed",
          likelihood: "last-resort",
        },
      ],
    },
    {
      id: "d4-ferry-status",
      question: "Is the 21:15 ferry running?",
      options: [
        {
          label: "Yes — on schedule",
          description: "Ferry departs 21:15. Board from Farstøðin. Gate closes 21:10.",
          planId: "d4-ferry-ok",
          likelihood: "preferred",
        },
        {
          label: "Delayed",
          description: "Ferry delayed — check SSL announcements. May provide additional buffer.",
          planId: "d4-ferry-delayed",
          likelihood: "fallback",
        },
        {
          label: "Cancelled",
          description: "Ferry cancelled. Emergency accommodation in Tórshavn required. See emergency plan.",
          planId: "d4-ferry-cancelled",
          likelihood: "last-resort",
        },
      ],
    },
  ],
};

// =============================================================================
// Day 5 — Friday: Ferry Comparison Decision
// =============================================================================

export const DAY5_DECISION: DecisionTree = {
  id: "day5-ferry-choice",
  day: 5,
  title: "Which Friday ferry to take?",
  decisionBy: "Thursday evening — book before sleeping",
  nodes: [
    {
      id: "d5-ferry",
      question: "Which sailing gives the best balance of rest and Vágar time?",
      options: [
        {
          label: "Early: depart 11:30",
          description: "Arrive Tórshavn 13:35. Bus 300 at 14:00 → Sørvágur 14:45. ~4h usable daylight in Vágar. Requires early start after matchday.",
          planId: "d5-early",
          likelihood: "preferred",
        },
        {
          label: "Afternoon: depart 16:00",
          description: "Arrive Tórshavn 18:05. Bus 300 at 18:30 → Sørvágur 19:15. Minimal Vágar time. More rest after matchday.",
          planId: "d5-afternoon",
          likelihood: "likely",
        },
        {
          label: "Late: depart 21:15",
          description: "Arrive Tórshavn 23:20. No bus 300 after that. Taxi to Sørvágur (~DKK 400). Arrive ~midnight. Only if earlier sailings unavailable.",
          planId: "d5-late",
          likelihood: "last-resort",
        },
      ],
    },
  ],
};

// =============================================================================
// All decision trees indexed by day
// =============================================================================

export const DECISION_TREES: Record<number, DecisionTree> = {
  2: DAY2_DECISION,
  3: DAY3_DECISION,
  4: DAY4_DECISION,
  5: DAY5_DECISION,
};
