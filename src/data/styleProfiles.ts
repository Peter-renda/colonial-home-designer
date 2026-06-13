import { ArchitecturalStyle } from "../types/quiz";

/**
 * Rich, single-source-of-truth descriptions of the three colonial styles.
 * Used by the picture-based style quiz, the style-result screen, the summary
 * badge, and the style-aware highlighting of preference questions.
 */

export interface StyleProfile {
  style: ArchitecturalStyle;
  /** Rough period of popularity in America. */
  era: string;
  /** One-line essence. */
  tagline: string;
  /** A short paragraph describing the style. */
  summary: string;
  /** How a guest is meant to feel approaching this home. */
  approach: string;
  /** Signature features, each with a short note. */
  keyFeatures: { title: string; note: string }[];
}

export const STYLE_PROFILES: Record<ArchitecturalStyle, StyleProfile> = {
  Federal: {
    style: "Federal",
    era: "c. 1780–1830",
    tagline: "Refined, elegant, and quietly sophisticated.",
    summary:
      "Federal (or Adam) homes are the most delicate of the colonial styles. Born just after American independence, they trade heavy ornament for slender proportions, smooth facades, and a few exquisite focal points — above all the elliptical fanlight over the front door. The result reads as understated good taste rather than show.",
    approach:
      "Guests should feel quietly impressed — welcomed by grace and refinement rather than grandeur. The eye is drawn to the delicate fanlight and slender sidelights, and the overall impression is of effortless, cultivated elegance.",
    keyFeatures: [
      { title: "Elliptical fanlight", note: "A semi-elliptical window of radiating muntins over the front door — the defining Federal detail." },
      { title: "Slender sidelights", note: "Narrow glass flanking the door pours light into the foyer and frames a graceful entrance." },
      { title: "Delicate Adam-style moldings", note: "Fine, low-relief plaster and millwork — swags, urns, and slender reeding rather than bold profiles." },
      { title: "Flat, smooth facade", note: "Brick or clapboard kept calm and planar so the entry ornament stands out." },
      { title: "Low-pitched or hipped roof", note: "Often with a roof balustrade; chimneys are paired and restrained." },
      { title: "Pale, refined palette", note: "Soft whites and warm creams with subtle contrast." },
    ],
  },
  Georgian: {
    style: "Georgian",
    era: "c. 1700–1780",
    tagline: "Formal, symmetrical, and timelessly traditional.",
    summary:
      "Georgian homes are the textbook American colonial: a strictly symmetrical brick box, five windows across, with the front door dead-center beneath a decorative crown. Everything is balanced and orderly. Paired chimneys and a hipped or front-gabled roof give the house a dignified, settled formality that has never gone out of style.",
    approach:
      "Guests should feel the reassurance of order and tradition — a proper, balanced facade that signals stability and good standing. The centered door beneath its pediment makes the path to the entry unmistakable and formal.",
    keyFeatures: [
      { title: "Strict symmetry", note: "A balanced five-bay facade with the door centered and windows aligned floor to floor." },
      { title: "Crowned, paneled front door", note: "A paneled door flanked by pilasters and topped with a pediment or crown — often a keystone above." },
      { title: "Brick facade with quoins", note: "Warm brick with crisp white trim; corner quoins and belt courses add formal weight." },
      { title: "Paired end chimneys", note: "Symmetrical chimneys anchor each end of the roof." },
      { title: "Front gable or hipped roof", note: "A pedimented front gable adds Georgian formality over the entry bay." },
      { title: "Raised-panel shutters", note: "More formal than louvers, sized to half the window width." },
    ],
  },
  "Greek Revival": {
    style: "Greek Revival",
    era: "c. 1825–1860",
    tagline: "Grand, columned, and classically imposing.",
    summary:
      "Greek Revival homes turn the house into a temple. Bold full-height columns carry a wide pediment across the front, the trim is heavy and white, and the proportions are monumental. This was the national style of America's confident early republic — dramatic, dignified, and unmistakably grand.",
    approach:
      "Guests should feel a sense of arrival and occasion — drawn forward between tall columns toward a monumental entry. The scale is meant to impress and to convey permanence and presence.",
    keyFeatures: [
      { title: "Full-height columned portico", note: "Two-story columns across the front carry the roof like a Greek temple." },
      { title: "Wide pediment / front gable", note: "A bold triangular gable faces the street, emphasizing the temple form." },
      { title: "Heavy entablature & frieze", note: "A deep, plain band of trim under the eaves with a wide cornice." },
      { title: "Tall, bold entry", note: "A massive door under a broad rectangular transom and sidelights, framed by pilasters." },
      { title: "Bold white trim", note: "Strong shadow lines and crisp white millwork emphasize the monumental form." },
      { title: "Monumental proportions", note: "Tall windows and grand scale throughout." },
    ],
  },
};

export const ALL_STYLES: ArchitecturalStyle[] = ["Federal", "Georgian", "Greek Revival"];
