import { ArchitecturalStyle } from "../types/quiz";

/**
 * Style- and budget-aware recommendations for the preference questions.
 *
 * As a buyer moves through the detail questions, the option that best matches
 * their chosen architectural style (and, where it applies, their budget) is
 * highlighted. e.g. a Federal buyer sees the "Federal Revival" molding marked
 * as the match for their style.
 */

/** questionId → the option value that matches each style. */
const STYLE_OPTION_MATCH: Record<string, Partial<Record<ArchitecturalStyle, string>>> = {
  // ── exterior ──
  fasciaMoulding: {
    Federal: "Federal Revival style",
    Georgian: "Georgian style",
    "Greek Revival": "Greek Revival style",
  },
  roofShape: {
    Georgian: "Gable with front gable (Georgian style)",
    "Greek Revival": "Gable",
    Federal: "Hip",
  },
  shutters: {
    Federal: "Louvered",
    Georgian: "Raised panel",
    "Greek Revival": "Louvered",
  },
  transom: {
    Federal: "Fanlight",
    Georgian: "2' x 5' (with sidelights)",
    "Greek Revival": "2' x 5' (with sidelights)",
  },
  sidelights: {
    Federal: "Yes",
    Georgian: "Yes",
    "Greek Revival": "Yes",
  },
  windowHeadersFirstFloor: {
    Federal: "Pediment - sunburst",
    Georgian: "Crosshead",
    "Greek Revival": "Pediment - peaked cap",
  },
  windowHeadersSecondFloor: {
    Federal: "Brick - flare",
    Georgian: "Brick - straight",
    "Greek Revival": "Brick - straight",
  },
  portico: {
    Federal: "Rounded Portico (with 8' x 6' front porch)",
    Georgian: "Gable Portico (with 8' x 6' front porch)",
    "Greek Revival": "Gable Portico (with 8' x 6' front porch)",
  },

  // ── staircase ──
  balusters: {
    Federal: "Square with chamfered edge (Federal)",
    Georgian: "Vase & column (Georgian)",
    "Greek Revival": "2 Balustrades per step (Greek Revival)",
  },
  newels: {
    Federal: "Federal style",
    Georgian: "Georgian style",
    "Greek Revival": "Greek Revival style",
  },

  // ── interior trim (the moldings example from the brief) ──
  baseboard: {
    Federal: "Federal Revival",
    Georgian: "Georgian",
    "Greek Revival": "Greek Revival",
  },
  crownMolding: {
    Federal: "Federal Revival",
    Georgian: "Georgian",
    "Greek Revival": "Greek Revival",
  },
  windowCasingsFirstFloor: {
    Federal: "Federal Revival",
    Georgian: "Georgian",
    "Greek Revival": "Greek Revival",
  },
  doorCasings: {
    Federal: "Federal Revival",
    Georgian: "Georgian",
    "Greek Revival": "Greek Revival",
  },
};

/**
 * questionId → option that matches a budget tier. Used as a secondary
 * highlight where the architectural style has no opinion but the budget does.
 */
const BUDGET_OPTION_MATCH: Record<string, Partial<Record<string, string>>> = {
  windowLevel: {
    "under-400k": "Vinyl",
    "400k-600k": "Vinyl",
    "600k-800k": "Aluminum (Brown)",
    "800k-1m": "Aluminum (Brown)",
    "over-1m": "Aluminum (Brown)",
  },
  facade: {
    "under-400k": "Hardiplank - flat",
    "400k-600k": "Hardiplank - Beaded",
    "600k-800k": "Brick",
    "800k-1m": "Brick",
    "over-1m": "Brick",
  },
  shingleStyle: {
    "under-400k": "GAF - architectural",
    "400k-600k": "GAF - architectural",
    "600k-800k": "Brava - cedar shake",
    "800k-1m": "Brava - composite slate",
    "over-1m": "Brava - composite slate",
  },
  gutters: {
    "under-400k": "4 in aluminum",
    "400k-600k": "5 in aluminum",
    "600k-800k": "5 in aluminum",
    "800k-1m": "6 in copper",
    "over-1m": "6 in copper",
  },
  frontDoorLevel: {
    "under-400k": "Level 1 - fiberglass",
    "400k-600k": "Level 1 - fiberglass",
    "600k-800k": "Level 2 - wood",
    "800k-1m": "Level 3 - custom",
    "over-1m": "Level 3 - custom",
  },
  doorQuality: {
    "under-400k": "6 panel - hollow",
    "400k-600k": "6 panel - solidcore",
    "600k-800k": "6 panel - solidcore",
    "800k-1m": "6 panel - solidcore",
    "over-1m": "6 panel - solidcore",
  },
  hotWaterTank: {
    "under-400k": "50 electric",
    "400k-600k": "50 electric",
    "600k-800k": "Tankless",
    "800k-1m": "Tankless",
    "over-1m": "Tankless",
  },
};

export interface OptionRecommendation {
  /** The option value to highlight. */
  value: string;
  /** Short reason shown to the buyer. */
  reason: string;
  /** "style" matches take visual priority over "budget" matches. */
  kind: "style" | "budget";
}

/**
 * Returns the recommended option for a question given the buyer's style and
 * budget, or null if neither has an opinion. Style wins over budget.
 */
export function recommendationFor(
  questionId: string,
  style: ArchitecturalStyle,
  budget: string
): OptionRecommendation | null {
  const styleMatch = STYLE_OPTION_MATCH[questionId]?.[style];
  if (styleMatch) {
    return { value: styleMatch, reason: `Matches your ${style} style`, kind: "style" };
  }
  const budgetMatch = budget ? BUDGET_OPTION_MATCH[questionId]?.[budget] : undefined;
  if (budgetMatch) {
    return { value: budgetMatch, reason: "Fits your budget", kind: "budget" };
  }
  return null;
}
