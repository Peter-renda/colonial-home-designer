import { QuizAnswers } from "../types/quiz";
import { COLONIAL_MODEL_1 } from "../data/colonialModel1";

/**
 * HouseParams is the single parametric source of truth derived from the
 * quiz answers. Every downstream artifact — the live 3D model, the 2D
 * construction-document sheets, the pyRevit build script, and the Blender
 * render script — is a projection of this object.
 *
 * All dimensions are in feet (Revit's internal unit, conveniently).
 */

export type RoofShape = "gable" | "gableFrontGable" | "hip";
export type DormerStyle = "none" | "gable" | "shed" | "hip";
export type PorticoStyle = "none" | "gable" | "hip" | "flat" | "rounded";
export type GarageConfig = "none" | "front2" | "side2" | "side3" | "detached2";
export type TransomStyle = "none" | "fanlight" | "rectangular";
export type FacadeKind = "brick" | "hardiplank" | "cedar";
export type FoundationKind = "slab" | "crawlspace" | "basement";

/** Which construction stage the 3D viewer renders. */
export type BuildStage = "site" | "foundation" | "framing" | "complete";

export type SlopeGrade = "flat" | "gentle" | "moderate" | "steep";
export type SlopeDirection = "front" | "rear" | "left" | "right";
export type TreeCoverage = "open" | "scattered" | "partial" | "wooded";

export interface SiteParams {
  slope: SlopeGrade;
  slopeDir: SlopeDirection;
  trees: TreeCoverage;
  /** Approximate lot square side, ft (derived from acreage). */
  lotSideFt: number;
  /** Compass bearing the front door faces: N=0, E=90, S=180, W=270. */
  streetFacingDeg: number;
  /** Uploaded topo map (data URL) draped over the terrain, if provided. */
  topoMapUrl: string | null;
}

export interface FoundationDetail {
  slabDepthIn: number;
  stoneBaseIn: number;
  sideInsulation: boolean;
  bottomInsulation: boolean;
  /** Crawlspace clearance, ft (2 or 3). */
  crawlHeightFt: number;
}

export interface FramingDetail {
  /** Stud depth, ft — 2x4 → 0.292, 2x6 → 0.458 */
  studDepthFt: number;
  studLabel: "2x4" | "2x6";
  sheathing: "osb" | "zip";
  floorSystem: "truss" | "ijoist";
}

/**
 * Which foundation elements to reveal in the live 3D model. Unlike the raw
 * params (which default to "slab"), this tracks whether the user has actually
 * made a selection so the model can build up one choice at a time.
 */
export interface FoundationView {
  /** A foundation type has been chosen — before this, only the site shows. */
  typeChosen: boolean;
  /** Perimeter rigid-foam insulation selected. */
  sideInsulation: boolean;
  /** Under-slab rigid-foam insulation selected. */
  bottomInsulation: boolean;
}

/** Which framing elements to reveal in the live 3D model. */
export interface FramingView {
  /** Exterior sheathing has been chosen — adds OSB / Zip panels to the model. */
  sheathingChosen: boolean;
}

export interface HouseParams {
  /** Front wall length (x axis), ft */
  widthFt: number;
  /** Side wall length / building depth (z axis), ft */
  depthFt: number;
  firstFloorFt: number;
  secondFloorFt: number;
  /** Exposed foundation above grade, ft */
  foundationExposedFt: number;
  foundationType: FoundationKind;

  roofShape: RoofShape;
  /** rise per 12 of run */
  roofPitch: number;
  dormers: DormerStyle;
  dormerCount: number;

  facade: FacadeKind;
  facadeColor: string;
  trimColor: string;
  roofColor: string;
  foundationColor: string;

  /** Number of window bays across the front (classic 5-bay colonial) */
  bays: number;
  shutters: boolean;
  shutterColor: string;
  windowW: number;
  windowH: number;

  doorColor: string;
  sidelights: boolean;
  transom: TransomStyle;
  portico: PorticoStyle;
  frontPorch: boolean;
  fullWidthPorch: boolean;
  rearPorch: boolean;
  patioDoor: boolean;

  garage: GarageConfig;
  garageWFt: number;
  garageDFt: number;
  garageDoorColor: string;

  chimney: boolean;
  sunroom: "none" | "left" | "right";
  finishedThirdFloor: boolean;
  finishedBasement: boolean;

  site: SiteParams;
  foundationDetail: FoundationDetail;
  framingDetail: FramingDetail;
}

function ans(answers: QuizAnswers, id: string): string {
  const v = answers[id];
  if (Array.isArray(v)) return v.join(",");
  return (v as string) ?? "";
}

function ceilingFt(v: string, fallback: number): number {
  if (v.includes("10")) return 10;
  if (v.includes("9")) return 9;
  if (v.includes("8")) return 8;
  return fallback;
}

/** Derive an area-equivalent square side (ft) from a "W x D" dimensions string. */
function lotSideFromDimensions(v: string): number {
  const m = (v ?? "").match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
  if (m) {
    const w = parseFloat(m[1]);
    const d = parseFloat(m[2]);
    if (w > 0 && d > 0) return Math.min(Math.max(Math.sqrt(w * d), 50), 300);
  }
  return 120; // sensible default lot square
}

/** Convert a compass slope bearing into a direction relative to the front. */
function relativeSlopeDirection(facing: string, slopeCompass: string): SlopeDirection {
  const order = ["North", "East", "South", "West"];
  const fi = order.indexOf(facing);
  const si = order.indexOf(slopeCompass);
  if (fi < 0 || si < 0) return "rear";
  const rel = (si - fi + 4) % 4;
  if (rel === 0) return "front";
  if (rel === 2) return "rear";
  if (rel === 1) return "right";
  return "left";
}

export function paramsFromAnswers(answers: QuizAnswers): HouseParams {
  const facadeRaw = ans(answers, "facade");
  const paint = ans(answers, "exteriorPaint");
  const facade: FacadeKind = facadeRaw.startsWith("Hardiplank")
    ? "hardiplank"
    : facadeRaw === "Cedar lap"
      ? "cedar"
      : "brick";

  let facadeColor = "#9e4e38"; // brick red
  if (facade === "hardiplank") facadeColor = "#ddd6c6";
  if (facade === "cedar") facadeColor = "#b08c5e";
  if (paint === "White") facadeColor = "#f0ece2";
  if (paint === "Cream") facadeColor = "#e8dcc2";
  if (paint === "Limewash") facadeColor = "#d9cfba";

  const shingle = ans(answers, "shingleStyle");
  let roofColor = "#4d4844";
  if (shingle === "Brava - composite slate") roofColor = "#37373c";
  if (shingle === "Brava - cedar shake") roofColor = "#76573a";

  const roofShapeRaw = ans(answers, "roofShape");
  const roofShape: RoofShape =
    roofShapeRaw === "Hip"
      ? "hip"
      : roofShapeRaw.startsWith("Gable with front gable")
        ? "gableFrontGable"
        : "gable";

  const dormersRaw = ans(answers, "dormers");
  const dormers: DormerStyle =
    dormersRaw === "Gable" ? "gable" : dormersRaw === "Shed" ? "shed" : dormersRaw === "Hip" ? "hip" : "none";

  const shuttersRaw = ans(answers, "shutters");
  const shutters = shuttersRaw === "Louvered" || shuttersRaw === "Raised panel";

  const transomRaw = ans(answers, "transom");
  const transom: TransomStyle =
    transomRaw === "Fanlight" ? "fanlight" : transomRaw && transomRaw !== "None" ? "rectangular" : "none";

  const porticoRaw = ans(answers, "portico");
  let portico: PorticoStyle = "none";
  if (porticoRaw.startsWith("Gable")) portico = "gable";
  else if (porticoRaw.startsWith("Hip")) portico = "hip";
  else if (porticoRaw.startsWith("Flat")) portico = "flat";
  else if (porticoRaw.startsWith("Rounded")) portico = "rounded";

  const garageRaw = ans(answers, "garage");
  let garage: GarageConfig = "none";
  if (garageRaw === "2 car front load") garage = "front2";
  else if (garageRaw.startsWith("2 car side")) garage = "side2";
  else if (garageRaw.startsWith("3 car")) garage = "side3";
  else if (garageRaw === "Detached") garage = "detached2";

  const garage3 = garage === "side3";
  const frontPorchRaw = ans(answers, "frontPorch");
  const foundationRaw = ans(answers, "foundationType");
  const foundationType: FoundationKind =
    foundationRaw === "Basement" ? "basement" : foundationRaw === "Crawlspace" ? "crawlspace" : "slab";

  const sunroomRaw = ans(answers, "sunroom");
  const garageDoor = ans(answers, "garageDoorLevel");
  const frontDoor = ans(answers, "frontDoorLevel");

  // ── site ──
  const slopeRaw = ans(answers, "lotSlope");
  const slope: SlopeGrade = slopeRaw.startsWith("Steep")
    ? "steep"
    : slopeRaw.startsWith("Moderate")
      ? "moderate"
      : slopeRaw.startsWith("Gentle")
        ? "gentle"
        : "flat";
  // Slope direction is captured as a compass bearing (N/E/S/W). Convert it to
  // a direction relative to the house front (which faces `streetFacing`).
  const facingRaw = ans(answers, "streetFacing");
  const slopeDirRaw = ans(answers, "slopeDirection");
  const slopeDir: SlopeDirection = relativeSlopeDirection(facingRaw, slopeDirRaw);
  const treesRaw = ans(answers, "treeCoverage");
  const trees: TreeCoverage = treesRaw.startsWith("Heavily")
    ? "wooded"
    : treesRaw.startsWith("Partially")
      ? "partial"
      : treesRaw.startsWith("Scattered")
        ? "scattered"
        : "open";
  const lotSideFt = lotSideFromDimensions(ans(answers, "lotDimensions"));
  const topo = ans(answers, "topoMap");

  // ── foundation detail ──
  const crawlRaw = ans(answers, "crawlspaceHeight");

  // ── framing detail ──
  const wallRaw = ans(answers, "exteriorWall");

  return {
    widthFt: COLONIAL_MODEL_1.frontDimension,
    depthFt: COLONIAL_MODEL_1.sideDimension,
    firstFloorFt: ceilingFt(ans(answers, "firstFloorCeilingHeight"), 9),
    secondFloorFt: ceilingFt(ans(answers, "secondFloorCeilingHeight"), 9),
    foundationExposedFt: foundationType === "slab" ? 0.7 : 1.5,
    foundationType,

    roofShape,
    roofPitch: 10,
    dormers,
    dormerCount: 3,

    facade,
    facadeColor,
    trimColor: "#f4f1e8",
    roofColor,
    foundationColor: "#b5ab97",

    bays: 5,
    shutters,
    shutterColor: shuttersRaw === "Raised panel" ? "#2e3a30" : "#27332b",
    windowW: 3,
    windowH: 5.5,

    doorColor: frontDoor === "Level 3 - custom" ? "#27332b" : "#3d2b1f",
    sidelights: ans(answers, "sidelights") === "Yes",
    transom,
    portico,
    frontPorch: frontPorchRaw !== "" && frontPorchRaw !== "None",
    fullWidthPorch: frontPorchRaw.startsWith("38'"),
    rearPorch: (() => {
      const v =
        foundationType === "crawlspace"
          ? ans(answers, "rearPorchStemwall")
          : ans(answers, "rearPorchSlabBasement");
      return v !== "" && v !== "None";
    })(),
    patioDoor: (() => {
      const v = ans(answers, "patioDoor");
      return v !== "" && v !== "None";
    })(),

    garage,
    garageWFt: garage3 ? COLONIAL_MODEL_1.threeCarGarageWidth : COLONIAL_MODEL_1.twoCarGarageWidth,
    garageDFt: garage3 ? COLONIAL_MODEL_1.threeCarGarageDepth : COLONIAL_MODEL_1.twoCarGarageDepth,
    garageDoorColor: garageDoor === "aluminum" ? "#d8d4cc" : "#6b4f33",

    chimney: ans(answers, "chimneyFireplace") === "Yes",
    sunroom:
      sunroomRaw === "Yes - left side" ? "left" : sunroomRaw === "Yes - right side" ? "right" : "none",
    finishedThirdFloor: (() => {
      const v = ans(answers, "finishedThirdFloor");
      return v !== "" && v !== "None";
    })(),
    finishedBasement: ans(answers, "finishedBasement") === "Yes",

    site: {
      slope,
      slopeDir,
      trees,
      lotSideFt,
      streetFacingDeg: (() => {
        const f = ans(answers, "streetFacing");
        if (f === "North") return 0;
        if (f === "East") return 90;
        if (f === "West") return 270;
        return 180;
      })(),
      topoMapUrl: topo.startsWith("data:") ? topo : null,
    },
    foundationDetail: {
      slabDepthIn: ans(answers, "slabDepth") === "6 in" ? 6 : 4,
      stoneBaseIn: ans(answers, "stoneBase") === "3in" ? 3 : 6,
      sideInsulation: ans(answers, "foundationSideInsulation") !== "No",
      bottomInsulation: ans(answers, "foundationBottomInsulation") !== "No",
      crawlHeightFt: crawlRaw === "3'" ? 3 : 2,
    },
    framingDetail: {
      studDepthFt: wallRaw === "2x4" ? 3.5 / 12 : 5.5 / 12,
      studLabel: wallRaw === "2x4" ? "2x4" : "2x6",
      sheathing: ans(answers, "sheathing") === "7/16 OSB" ? "osb" : "zip",
      floorSystem: ans(answers, "floorSystem") === "I-joists" ? "ijoist" : "truss",
    },
  };
}

/**
 * Foundation reveal state, derived from the raw answers. Reading the raw
 * answers (not the defaulted params) lets the model show only the site until
 * the user actually picks a foundation type, then add each element as it's
 * chosen.
 */
export function foundationViewFromAnswers(answers: QuizAnswers): FoundationView {
  return {
    typeChosen: ans(answers, "foundationType") !== "",
    sideInsulation: ans(answers, "foundationSideInsulation") === "Yes",
    bottomInsulation: ans(answers, "foundationBottomInsulation").startsWith("Yes"),
  };
}

/** Framing reveal state, derived from the raw answers. */
export function framingViewFromAnswers(answers: QuizAnswers): FramingView {
  return {
    sheathingChosen: ans(answers, "sheathing") !== "",
  };
}

/** Total wall height from top of foundation to eave, ft. */
export function wallHeightFt(p: HouseParams): number {
  // plate/floor structure allowance of 1 ft per story
  return p.firstFloorFt + p.secondFloorFt + 2;
}

/** Roof rise from eave to ridge, ft (ridge runs parallel to the front). */
export function roofRiseFt(p: HouseParams): number {
  return ((p.depthFt / 2) * p.roofPitch) / 12;
}

/** Window bay centerlines across the front, ft from the centerline. */
export function frontBayXs(p: HouseParams): number[] {
  const margin = 4.5;
  const span = p.widthFt - margin * 2;
  return Array.from({ length: p.bays }, (_, i) => -span / 2 + (span * i) / (p.bays - 1));
}
