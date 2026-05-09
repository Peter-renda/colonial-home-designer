import { CalculatorFn } from "../types";

const ROUNDUP = (n: number, decimals = 0) => {
  const f = Math.pow(10, decimals);
  return Math.ceil(n * f) / f;
};

const isAluminumGutter = (g: string) =>
  g === "4 in aluminum" || g === "5 in aluminum";

// ─── SHINGLES ─────────────────────────────────────────────────

export const calcShinglesGAF: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.shingleStyle !== "GAF - architectural") return null;
  const qty = ROUNDUP(dims.roofSqFt / 32.8);
  const m = material("shingles-gaf-architectural");
  return {
    trade: "Roof",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: [`shingleStyle=${prefs.shingleStyle}`],
  };
};

// ─── ROOF PAPER ───────────────────────────────────────────────

export const calcRoofPaper: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.sheathing !== "7/16 OSB") return null;
  const qty = ROUNDUP(dims.roofSqFt / 1000);
  const m = material("roof-paper-roll");
  return {
    trade: "Roof",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["sheathing=7/16 OSB"],
  };
};

// ─── GUTTERS (5" brown aluminum) ──────────────────────────────

export const calcGutterApron: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.roofShape !== "Gable" || !isAluminumGutter(prefs.gutters)) return null;
  const qty = ROUNDUP(
    (dims.frontDimension * 2 + dims.sideDimension * 2 * 1.3) / 10,
  );
  const m = material("gutter-apron-10ft");
  return {
    trade: "Roof",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["roofShape=Gable", `gutters=${prefs.gutters}`],
  };
};

export const calcGutterSections: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.roofShape !== "Gable" || !isAluminumGutter(prefs.gutters)) return null;
  const qty = ROUNDUP((dims.frontDimension * 2 + dims.sideDimension) / 10);
  const m = material("gutter-5in-brown-10ft");
  return {
    trade: "Roof",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["roofShape=Gable", `gutters=${prefs.gutters}`],
  };
};

const fixedGutter = (qty: number, materialId: string): CalculatorFn =>
  ({ prefs, material }) => {
    if (prefs.roofShape !== "Gable" || !isAluminumGutter(prefs.gutters)) return null;
    const m = material(materialId);
    return {
      trade: "Roof",
      materialId,
      itemName: m.name,
      unit: m.unit,
      quantity: qty,
      unitPrice: m.pricePerUnit,
      lineTotal: qty * m.pricePerUnit,
      conditionsMet: ["roofShape=Gable", `gutters=${prefs.gutters}`],
    };
  };

export const calcGutterMiterOutside = fixedGutter(5, "gutter-miter-outside");
export const calcGutterMiterInside  = fixedGutter(3, "gutter-miter-inside");
export const calcGutterEndDownspout = fixedGutter(4, "gutter-end-w-downspout");

export const calcDownspouts: CalculatorFn = ({ prefs, material }) => {
  if (prefs.roofShape !== "Gable" || !isAluminumGutter(prefs.gutters)) return null;
  // 4 downspouts × 20ft of run / 10ft sections = 8 sections
  const qty = ROUNDUP((4 * 20) / 10);
  const m = material("downspout-2x3-10ft");
  return {
    trade: "Roof",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["roofShape=Gable", `gutters=${prefs.gutters}`],
  };
};

export const calcGutterConnectors: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.roofShape !== "Gable" || !isAluminumGutter(prefs.gutters)) return null;
  const qty = ROUNDUP(dims.gutterLength / 16) + 4;
  const m = material("gutter-connector");
  return {
    trade: "Roof",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["roofShape=Gable", `gutters=${prefs.gutters}`],
  };
};

export const calcRightEndCap: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.roofShape !== "Gable" || !isAluminumGutter(prefs.gutters)) return null;
  const m = material("gutter-end-cap-right");
  return {
    trade: "Roof",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: dims.gutterRightEnds,
    unitPrice: m.pricePerUnit,
    lineTotal: dims.gutterRightEnds * m.pricePerUnit,
    conditionsMet: ["roofShape=Gable", `gutters=${prefs.gutters}`],
  };
};

export const calcLeftEndCap: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.roofShape !== "Gable" || !isAluminumGutter(prefs.gutters)) return null;
  const m = material("gutter-end-cap-left");
  return {
    trade: "Roof",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: dims.gutterLeftEnds,
    unitPrice: m.pricePerUnit,
    lineTotal: dims.gutterLeftEnds * m.pricePerUnit,
    conditionsMet: ["roofShape=Gable", `gutters=${prefs.gutters}`],
  };
};

export const calcHiddenHangers: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.roofShape !== "Gable" || !isAluminumGutter(prefs.gutters)) return null;
  const qty = ROUNDUP(dims.gutterLength / 2);
  const m = material("gutter-hidden-hanger");
  return {
    trade: "Roof",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["roofShape=Gable", `gutters=${prefs.gutters}`],
  };
};

export const ROOF_CALCULATORS: CalculatorFn[] = [
  calcShinglesGAF,
  calcRoofPaper,
  calcGutterApron,
  calcGutterSections,
  calcGutterMiterOutside,
  calcGutterMiterInside,
  calcGutterEndDownspout,
  calcDownspouts,
  calcGutterConnectors,
  calcRightEndCap,
  calcLeftEndCap,
  calcHiddenHangers,
];
