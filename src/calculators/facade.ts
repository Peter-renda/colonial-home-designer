import { CalculatorFn, CeilingHeight } from "../types";

const ROUNDUP = (n: number, decimals = 0) => {
  const f = Math.pow(10, decimals);
  return Math.ceil(n * f) / f;
};

const wallSqFt = (
  firstHeight: CeilingHeight,
  perimeter: number,
): number => {
  const h =
    firstHeight === "10' Ceiling" ? 10 : firstHeight === "9' Ceiling" ? 9 : 8;
  return perimeter * h * 2; // two stories
};

const ceilingFeet = (h: CeilingHeight) =>
  h === "10' Ceiling" ? 10 : h === "9' Ceiling" ? 9 : 8;

// ─── BRICK ────────────────────────────────────────────────────────

export const calcBrickRainscreen: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.facade !== "Brick") return null;
  const sqFt = wallSqFt(prefs.firstFloorCeilingHeight, dims.perimeter);
  const m = material("rainscreen-6mm-sqft");
  return {
    trade: "Facade",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: sqFt,
    unitPrice: m.pricePerUnit,
    lineTotal: sqFt * m.pricePerUnit,
    conditionsMet: ["facade=Brick"],
  };
};

export const calcBrick: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.facade !== "Brick") return null;
  const sqFt = wallSqFt(prefs.firstFloorCeilingHeight, dims.perimeter);
  const qty = ROUNDUP(sqFt / 6.5);
  const m = material("brick");
  return {
    trade: "Facade",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["facade=Brick"],
  };
};

export const calcBrickLintels4: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.facade !== "Brick") return null;
  const qty =
    dims.firstFloorWindowOpenings + dims.secondFloorWindowOpenings;
  const m = material("lintel-4ft");
  return {
    trade: "Facade",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["facade=Brick"],
  };
};

export const calcBrickLintels6: CalculatorFn = ({ prefs, material }) => {
  if (prefs.facade !== "Brick") return null;
  const m = material("lintel-6ft");
  return {
    trade: "Facade",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: 2,
    unitPrice: m.pricePerUnit,
    lineTotal: 2 * m.pricePerUnit,
    conditionsMet: ["facade=Brick"],
  };
};

export const calcBrickLintels8: CalculatorFn = ({ prefs, material }) => {
  if (prefs.facade !== "Brick") return null;
  const m = material("lintel-8ft");
  return {
    trade: "Facade",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: 2,
    unitPrice: m.pricePerUnit,
    lineTotal: 2 * m.pricePerUnit,
    conditionsMet: ["facade=Brick"],
  };
};

export const calcWallTies: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.facade !== "Brick") return null;
  const sqFt = wallSqFt(prefs.firstFloorCeilingHeight, dims.perimeter);
  const qty = ROUNDUP(sqFt * 0.45);
  const m = material("wall-tie");
  return {
    trade: "Facade",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["facade=Brick"],
  };
};

export const calcMortar: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.facade !== "Brick") return null;
  const sqFt = wallSqFt(prefs.firstFloorCeilingHeight, dims.perimeter);
  const qty = ROUNDUP((sqFt * 0.045) / 0.75);
  const m = material("mortar-80lb");
  return {
    trade: "Facade",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["facade=Brick"],
  };
};

export const calcFlexSealant: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.facade !== "Brick") return null;
  const totalOpenings =
    dims.firstFloorWindowOpenings +
    dims.firstFloorExteriorDoorOpenings +
    dims.secondFloorWindowOpenings +
    dims.secondFloorInteriorDoorOpenings;
  const qty = ROUNDUP(totalOpenings / 0.75);
  const m = material("flex-sealant");
  return {
    trade: "Facade",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["facade=Brick"],
  };
};

// ─── EXTERIOR PAINT (any facade + paint=Yes) ─────────────────────

const makePaintCalc = (
  facadeName: "Brick" | "Hardiplank - beaded" | "Hardiplank - flat" | "Cedar lap",
  divisor: number,
): CalculatorFn => ({ prefs, dims, material }) => {
  if (prefs.facade !== facadeName || prefs.exteriorPaint !== "Yes") return null;
  const sqFt = wallSqFt(prefs.firstFloorCeilingHeight, dims.perimeter);
  const qty = ROUNDUP(sqFt / divisor);
  const m = material("exterior-paint");
  return {
    trade: "Facade",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: [`facade=${facadeName}`, "exteriorPaint=Yes"],
  };
};

// ─── SOFFIT (any facade) — perimeter / 12 ────────────────────────

const makeSoffitCalc = (
  facadeName: "Brick" | "Hardiplank - beaded" | "Hardiplank - flat" | "Cedar lap",
): CalculatorFn => ({ prefs, dims, material }) => {
  if (prefs.facade !== facadeName) return null;
  const qty = ROUNDUP(dims.perimeter / 12);
  const m = material("soffit-hardie");
  return {
    trade: "Facade",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: [`facade=${facadeName}`],
  };
};

// ─── HARDIPLANK BEADED ───────────────────────────────────────────

export const calcHardiplankBeaded: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.facade !== "Hardiplank - beaded") return null;
  const sqFt = wallSqFt(prefs.firstFloorCeilingHeight, dims.perimeter);
  const qty = ROUNDUP(sqFt / 7);
  const m = material("hardiplank-beaded");
  return {
    trade: "Facade",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["facade=Hardiplank - beaded"],
  };
};

const trimBoardQty = (
  firstHeight: CeilingHeight,
  secondHeight: CeilingHeight,
): number => {
  // 4 corners * (1F height + 2F height) / 12 ft per board
  return ROUNDUP((4 * (ceilingFeet(firstHeight) + ceilingFeet(secondHeight))) / 12);
};

export const calcHardieTrimBeaded: CalculatorFn = ({ prefs, material }) => {
  if (prefs.facade !== "Hardiplank - beaded") return null;
  const qty = trimBoardQty(
    prefs.firstFloorCeilingHeight,
    prefs.secondFloorCeilingHeight,
  );
  const m = material("hardie-trim-board");
  return {
    trade: "Facade",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["facade=Hardiplank - beaded"],
  };
};

export const calcHardieCaulkingBeaded: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.facade !== "Hardiplank - beaded") return null;
  const sqFt = wallSqFt(prefs.firstFloorCeilingHeight, dims.perimeter);
  const qty = ROUNDUP(sqFt / 100);
  const m = material("caulking-tube");
  return {
    trade: "Facade",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["facade=Hardiplank - beaded"],
  };
};

// ─── HARDIPLANK FLAT ─────────────────────────────────────────────

export const calcHardiplankFlat: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.facade !== "Hardiplank - flat") return null;
  const sqFt = wallSqFt(prefs.firstFloorCeilingHeight, dims.perimeter);
  const qty = ROUNDUP(sqFt / 7);
  const m = material("hardiplank-flat");
  return {
    trade: "Facade",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["facade=Hardiplank - flat"],
  };
};

export const calcHardieTrimFlat: CalculatorFn = ({ prefs, material }) => {
  if (prefs.facade !== "Hardiplank - flat") return null;
  const qty = trimBoardQty(
    prefs.firstFloorCeilingHeight,
    prefs.secondFloorCeilingHeight,
  );
  const m = material("hardie-trim-board");
  return {
    trade: "Facade",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["facade=Hardiplank - flat"],
  };
};

export const calcHardieCaulkingFlat: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.facade !== "Hardiplank - flat") return null;
  const sqFt = wallSqFt(prefs.firstFloorCeilingHeight, dims.perimeter);
  const qty = ROUNDUP(sqFt / 100);
  const m = material("caulking-tube");
  return {
    trade: "Facade",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["facade=Hardiplank - flat"],
  };
};

// ─── CEDAR LAP ───────────────────────────────────────────────────

export const calcCedarBoards: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.facade !== "Cedar lap") return null;
  const sqFt = wallSqFt(prefs.firstFloorCeilingHeight, dims.perimeter);
  const qty = ROUNDUP(sqFt / 6.7);
  const m = material("cedar-board");
  return {
    trade: "Facade",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["facade=Cedar lap"],
  };
};

export const calcCedarTrim: CalculatorFn = ({ prefs, material }) => {
  if (prefs.facade !== "Cedar lap") return null;
  const qty = trimBoardQty(
    prefs.firstFloorCeilingHeight,
    prefs.secondFloorCeilingHeight,
  );
  const m = material("cedar-trim-board");
  return {
    trade: "Facade",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["facade=Cedar lap"],
  };
};

export const FACADE_CALCULATORS: CalculatorFn[] = [
  // Brick
  calcBrickRainscreen,
  calcBrick,
  calcBrickLintels4,
  calcBrickLintels6,
  calcBrickLintels8,
  calcWallTies,
  calcMortar,
  calcFlexSealant,
  makePaintCalc("Brick", 400),
  makeSoffitCalc("Brick"),
  // Hardiplank beaded
  calcHardiplankBeaded,
  calcHardieTrimBeaded,
  calcHardieCaulkingBeaded,
  makePaintCalc("Hardiplank - beaded", 400),
  makeSoffitCalc("Hardiplank - beaded"),
  // Hardiplank flat
  calcHardiplankFlat,
  calcHardieTrimFlat,
  calcHardieCaulkingFlat,
  makePaintCalc("Hardiplank - flat", 400),
  makeSoffitCalc("Hardiplank - flat"),
  // Cedar
  calcCedarBoards,
  calcCedarTrim,
  makePaintCalc("Cedar lap", 500),
  makeSoffitCalc("Cedar lap"),
];
