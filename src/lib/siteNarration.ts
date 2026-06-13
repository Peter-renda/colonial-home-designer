import { ArchitecturalStyle, QuizAnswers } from "../types/quiz";
import { computeSunPath, REFERENCE_DAYS, formatTime } from "./solar";
import { STYLE_PROFILES } from "../data/styleProfiles";

export interface NarrationSection {
  heading: string;
  body: string;
}

export interface SiteNarration {
  sections: NarrationSection[];
  /** The whole thing as one string, for speech synthesis. */
  full: string;
}

function ans(answers: QuizAnswers, id: string): string {
  const v = answers[id];
  if (Array.isArray(v)) return v.join(", ");
  return (v as string) ?? "";
}

function relativeSlope(facing: string, slopeCompass: string): string {
  // Where the land falls, expressed relative to the house front.
  const order = ["North", "East", "South", "West"];
  const fi = order.indexOf(facing);
  const si = order.indexOf(slopeCompass);
  if (fi < 0 || si < 0) return "";
  const rel = (si - fi + 4) % 4;
  if (rel === 0) return "toward the street (the front of the home)";
  if (rel === 2) return "toward the rear yard";
  if (rel === 1) return "toward the right side of the home";
  return "toward the left side of the home";
}

/**
 * Build a spoken-style walkthrough of the site from the buyer's answers,
 * their chosen architectural style, and the computed sun path.
 */
export function buildSiteNarration(
  answers: QuizAnswers,
  style: ArchitecturalStyle,
  latitude: number
): SiteNarration {
  const facing = ans(answers, "streetFacing");
  const slope = ans(answers, "lotSlope");
  const slopeDir = ans(answers, "slopeDirection");
  const drainage = ans(answers, "drainage");
  const flood = ans(answers, "floodZone");
  const soil = ans(answers, "soilType");
  const trees = ans(answers, "treeCoverage");
  const driveway = ans(answers, "driveway");
  const walkway = ans(answers, "walkwayFromCurb");
  const garage = ans(answers, "garage");
  const utilities = Array.isArray(answers["utilities"]) ? (answers["utilities"] as string[]) : [];

  const summer = computeSunPath(latitude, REFERENCE_DAYS.summerSolstice);
  const winter = computeSunPath(latitude, REFERENCE_DAYS.winterSolstice);

  const profile = STYLE_PROFILES[style];

  const sections: NarrationSection[] = [];

  // 1 ── Orientation & daily light
  {
    let body = `Let's start with how your home sits on the land and how light will move through it. `;
    if (facing === "South") {
      body +=
        "Your front faces south, so the facade soaks up sun all day long and the front rooms stay bright. The rear porch and back of the house fall into comfortable shade in the afternoon.";
    } else if (facing === "North") {
      body +=
        "Your front faces north, which means the back of the home gets the generous southern light. That's ideal — we'll want the kitchen, living room, and rear porch on that sunny south side, while the entry stays softly, evenly lit.";
    } else if (facing === "East") {
      body +=
        "Your front faces east, so the front rooms wake up with gentle morning light, and the back of the home catches warm afternoon and evening sun.";
    } else if (facing === "West") {
      body +=
        "Your front faces west, so the facade catches strong afternoon sun. A deep portico, shutters, and shade trees on that side will keep the front rooms from overheating in summer.";
    } else {
      body +=
        "Once you tell us which way the front faces, we'll plan which rooms catch the morning and afternoon light.";
    }
    sections.push({ heading: "Orientation & daily light", body });
  }

  // 2 ── The sun's path through the seasons
  {
    const body =
      `Here is the sun's path over your home. In summer the sun climbs high — about ${Math.round(
        summer.noonAltitude
      )} degrees above the horizon at midday — and the days are long, with sunrise around ${formatTime(
        summer.sunriseHour
      )} and sunset near ${formatTime(
        summer.sunsetHour
      )}. A roof overhang or portico shades the tall summer sun and keeps interiors cool. ` +
      `In winter the sun stays low — only about ${Math.round(
        winter.noonAltitude
      )} degrees at noon — and slips in under those same overhangs, so south-facing windows pull free warmth into the house exactly when you want it. Watch the animation: the high arc is June, the low arc is December, and the shadow stretches long as the sun drops.`;
    sections.push({ heading: "The sun through the seasons", body });
  }

  // 3 ── Water & drainage
  {
    let body = "Now, water — where it comes from and where it goes. ";
    if (slope.startsWith("Flat")) {
      body +=
        "Your lot is essentially flat, so we'll establish positive grade away from the foundation on all sides and rely on gutters and downspouts carried well out into the yard. ";
    } else if (slope) {
      const rel = relativeSlope(facing, slopeDir);
      body += `The land slopes ${slope.split(" ")[0].toLowerCase()}ly`;
      body += rel ? `, falling ${rel}. ` : ". ";
      if (rel.includes("rear")) {
        body +=
          "Falling toward the rear is a gift — it carries water away from the entry and opens the door to a walkout basement on the downhill side. ";
      } else if (rel.includes("street")) {
        body +=
          "Falling toward the street drains nicely, though we'll keep the driveway grade gentle so it's easy in winter. ";
      } else {
        body += "We'll use that cross-slope to move water around the house and out toward the low corner. ";
      }
    }
    if (drainage.startsWith("Wet") || drainage.startsWith("High water")) {
      body +=
        "You mentioned wet spots, so we'll add perimeter foundation drains, swales to intercept runoff, and think twice about a basement. ";
    }
    if (flood.startsWith("Yes")) {
      body +=
        "Because the parcel touches a FEMA flood zone, the finished floor will be raised above the base flood elevation, and we'll plan flood vents and flood insurance. ";
    }
    if (soil.startsWith("Clay")) {
      body += "Expansive clay soil means engineered footings and gutters that discharge far from the house. ";
    } else if (soil.startsWith("Sandy")) {
      body += "Your sandy, well-draining soil is friendly to the foundation and sheds water easily. ";
    }
    sections.push({ heading: "Water & drainage", body });
  }

  // 4 ── The approach & how it should feel
  {
    let body = `Finally, the experience of arriving. `;
    body += profile.approach + " ";
    if (walkway) {
      body += `A ${walkway.toLowerCase()} walk leads from the curb to the door, setting the rhythm of the approach. `;
    } else {
      body += "A clear walk from the curb to the front door sets the rhythm of the approach. ";
    }
    if (garage && garage !== "None") {
      if (garage.toLowerCase().includes("side")) {
        body +=
          "Your side-load garage keeps the cars off the main view, so the facade reads as a proper home rather than a row of garage doors. ";
      } else if (garage.toLowerCase().includes("detached")) {
        body +=
          "The detached garage keeps the historic lines of the house intact and lets the outbuilding read as its own structure. ";
      } else {
        body += "We'll dress the front-load garage doors to keep the facade balanced and gracious. ";
      }
    }
    if (driveway) {
      body += `The ${driveway.toLowerCase()} driveway handles the daily comings and goings. `;
    }
    if (trees.startsWith("Heavily") || trees.startsWith("Partially")) {
      body +=
        "Mature trees on the property frame the home and, kept on the south and west, will shade it through the hottest afternoons. ";
    }
    if (utilities.includes("Septic required") || utilities.includes("Well required")) {
      body +=
        "Because the site needs a well and septic, we'll lay out the drain field and well early — they often decide exactly where the house can sit. ";
    }
    body += "Together, the orientation, the light, the water, and the approach make this house belong to this particular piece of land.";
    sections.push({ heading: "The approach & how it feels", body });
  }

  const full = sections.map((s) => s.body).join("\n\n");
  return { sections, full };
}
