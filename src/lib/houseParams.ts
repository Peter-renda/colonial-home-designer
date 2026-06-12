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
      const v = ans(answers, "rearPorchSlabBasement");
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
