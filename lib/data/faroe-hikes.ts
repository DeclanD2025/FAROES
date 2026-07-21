// =============================================================================
// Faroe Islands · Hiking Routes
// Route data from official sources where available. Unverified fields left null.
// =============================================================================

export type HikeDifficulty = "easy" | "moderate" | "hard" | "very-hard" | "unrated";
export type RouteType = "out-and-back" | "loop" | "point-to-point" | "short-walk" | "unknown";

export interface HikeRoute {
  id: string;
  slug: string;
  name: string;
  locationIds: string[];
  summary: string;
  routeType: RouteType;
  difficulty: HikeDifficulty;
  distanceKm: number | null;
  durationMinutes: { minimum?: number; typical?: number; maximum?: number } | null;
  elevationGainM: number | null;
  elevationLossM: number | null;
  highestPointM: number | null;
  startCoordinates: [number, number]; // [lng, lat]
  endCoordinates?: [number, number];
  terrain: string[];
  waymarking: string | null;
  exposure: string[];
  hazards: string[];
  access: {
    permissionRequired: boolean;
    accessFee: string | null;
    bookingRequired: boolean;
    openingRestrictions?: string[];
    landownerNotes?: string[];
  };
  transport: {
    publicTransport?: string[];
    parking?: string[];
    pickupNotes?: string[];
    startPointDirections?: string[];
  };
  facilities: {
    toilets: string | null;
    water: string | null;
    shelter: string | null;
    foodNearby: string | null;
  };
  communications: {
    mobileSignal: string | null;
    offlineMapRecommended: boolean;
  };
  weatherRisks: string[];
  seasonalRisks: string[];
  turnaroundPoints: { name: string; distanceKm?: number; notes: string }[];
  routeStages: {
    id: string;
    order: number;
    title: string;
    startDistanceKm?: number;
    endDistanceKm?: number;
    elevationChangeM?: number;
    description: string;
    warnings?: string[];
  }[];
  equipment: string[];
  emergencyNotes: string[];
  sourceIds: string[];
  lastVerified: string | null;
  confidence: "official" | "verified-secondary" | "provisional" | "unverified";
}

export const HIKES: HikeRoute[] = [
  {
    id: "beinisvord",
    slug: "beinisvord",
    name: "Beinisvørð",
    locationIds: ["oravik"],
    summary: "Dramatic 470 m sea cliffs on Suðuroy's west coast — among the highest in the Faroe Islands. Panoramic views over the North Atlantic from the clifftop.",
    routeType: "out-and-back",
    difficulty: "moderate",
    distanceKm: null,
    durationMinutes: { typical: 150 },
    elevationGainM: null,
    elevationLossM: null,
    highestPointM: 470,
    startCoordinates: [-6.87, 61.50],
    terrain: ["coastal", "cliff-top", "grassy", "exposed"],
    waymarking: null,
    exposure: ["High cliffs — 470 m near-vertical drop", "No barriers at cliff edge", "Strong wind gusts"],
    hazards: ["Cliff edges with no barriers", "Strong gusts can knock you off balance", "Low visibility in fog — navigation difficult", "Slippery grass after rain"],
    access: {
      permissionRequired: false,
      accessFee: null,
      bookingRequired: false,
    },
    transport: {
      parking: ["Parking area near the lighthouse road"],
      startPointDirections: ["Drive from Øravík ~20 min to the Beinisvørð parking area off Route 14"],
    },
    facilities: {
      toilets: null,
      water: null,
      shelter: null,
      foodNearby: "Nearest: Tvøroyri (~30 min drive)",
    },
    communications: {
      mobileSignal: "variable — weak at clifftop",
      offlineMapRecommended: true,
    },
    weatherRisks: ["Strong winds — the west coast catches the full Atlantic", "Fog and low visibility common", "Rain makes grass slippery"],
    seasonalRisks: ["Bird nesting areas in spring/summer — avoid disturbing colonies"],
    turnaroundPoints: [
      { name: "First viewpoint (~15 min)", notes: "Good views without committing to the full clifftop" },
    ],
    routeStages: [],
    equipment: [
      "Waterproof jacket and trousers",
      "Windproof outer layer",
      "Sturdy hiking boots",
      "Water (at least 1L)",
      "Offline map",
      "Warm layer",
    ],
    emergencyNotes: [
      "Call 112 for emergency services",
      "Beinisvørð is exposed — turn back immediately if weather deteriorates",
      "Closest help: Tvøroyri (~30 min drive)",
      "Tell someone your route and expected return time",
    ],
    sourceIds: [],
    lastVerified: null,
    confidence: "provisional",
  },
  {
    id: "hvannhagi",
    slug: "hvannhagi",
    name: "Hvannhagi Ridge",
    locationIds: ["oravik"],
    summary: "A 2–3 hour ridge walk with orange-post waymarking heading east from the road near Øravík to a lake perched above the fjord, facing the island of Stóra Dímun.",
    routeType: "out-and-back",
    difficulty: "moderate",
    distanceKm: null,
    durationMinutes: { typical: 150, minimum: 120, maximum: 180 },
    elevationGainM: null,
    elevationLossM: null,
    highestPointM: null,
    startCoordinates: [-6.83, 61.55],
    terrain: ["ridge", "grassy", "lake", "fjord-facing"],
    waymarking: "Orange T-marked posts",
    exposure: ["Some ridge sections", "Moderate cliff edges near the lake"],
    hazards: ["Orange posts can be hard to follow in fog", "Boggy in wet conditions", "Slippery grass"],
    access: {
      permissionRequired: false,
      accessFee: null,
      bookingRequired: false,
    },
    transport: {
      startPointDirections: ["Start point accessible from the road near Øravík", "~10 min drive from Øravík Airbnb"],
    },
    facilities: {
      toilets: null,
      water: "Stream water — treat before drinking",
      shelter: null,
      foodNearby: "Nearest: Hotel Tvøroyri (~15 min drive)",
    },
    communications: {
      mobileSignal: "variable",
      offlineMapRecommended: true,
    },
    weatherRisks: ["Fog makes markers hard to follow", "Rain creates boggy conditions", "Wind on exposed ridge sections"],
    seasonalRisks: [],
    turnaroundPoints: [
      { name: "Lake viewpoint", notes: "Good turnaround if conditions worsen — you still see the lake" },
    ],
    routeStages: [
      {
        id: "hvannhagi-start",
        order: 1,
        title: "Trailhead to first viewpoint",
        description: "Follow orange posts from the roadside. Gradual climb through grassy terrain with widening fjord views.",
      },
      {
        id: "hvannhagi-ridge",
        order: 2,
        title: "Ridge walk to the lake",
        description: "Continue along the marked ridge. The lake comes into view below, framed by Stóra Dímun island on the horizon.",
      },
      {
        id: "hvannhagi-lake",
        order: 3,
        title: "Lake and return",
        description: "Reach the lake viewpoint. This is the natural turnaround — retrace your steps along the same orange-post route.",
      },
    ],
    equipment: [
      "Waterproof jacket and trousers",
      "Sturdy walking shoes/boots",
      "Water (at least 1L)",
      "Offline map",
      "Warm layer",
    ],
    emergencyNotes: [
      "Call 112 for emergency services",
      "If fog descends and markers are lost: retrace steps carefully or stay put",
      "Hvannhagi is less exposed than Beinisvørð — a better option in marginal weather",
    ],
    sourceIds: [],
    lastVerified: null,
    confidence: "provisional",
  },
];

export function getDifficultyLabel(d: HikeDifficulty): string {
  const map: Record<HikeDifficulty, string> = {
    "easy": "Easy",
    "moderate": "Moderate",
    "hard": "Hard",
    "very-hard": "Very hard",
    "unrated": "Unrated",
  };
  return map[d];
}

export function getDifficultyColor(d: HikeDifficulty): string {
  const map: Record<HikeDifficulty, string> = {
    "easy": "text-moss",
    "moderate": "text-yellow",
    "hard": "text-rust",
    "very-hard": "text-rust",
    "unrated": "text-basalt/50",
  };
  return map[d];
}

export default HIKES;
