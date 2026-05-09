import { CalculatorFn } from "../types";

const ROUNDUP = (n: number, decimals = 0) => {
  const f = Math.pow(10, decimals);
  return Math.ceil(n * f) / f;
};

// ─── WINDOWS ─────────────────────────────────────────────────────
//
// In the spreadsheet, the window section assumes you've already counted how
// many of each window size are needed. Once we have a per-room window schedule
// (a table of {room, size, count}) we can do a much better job here.
// For now, we use 1F window openings for 3x6 size and 2F window openings for 3x5,
// matching the spreadsheet's current logic.

const isStandardVinyl = (windowLevel: string, windowStyle: string) =>
  windowLevel === "Vinyl" && windowStyle === "Single hung with grid";

export const calcWindow3x6: CalculatorFn = ({ prefs, dims, material }) => {
  if (!isStandardVinyl(prefs.windowLevel, prefs.windowStyle)) return null;
  const qty = dims.firstFloorWindowOpenings;
  if (qty === 0) return null;
  const m = material("window-3x6-vinyl");
  return {
    trade: "Windows & Doors",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: [
      `windowLevel=${prefs.windowLevel}`,
      `windowStyle=${prefs.windowStyle}`,
    ],
  };
};

export const calcWindow3x5: CalculatorFn = ({ prefs, dims, material }) => {
  if (!isStandardVinyl(prefs.windowLevel, prefs.windowStyle)) return null;
  const qty = dims.secondFloorWindowOpenings;
  if (qty === 0) return null;
  const m = material("window-3x5-vinyl");
  return {
    trade: "Windows & Doors",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: [
      `windowLevel=${prefs.windowLevel}`,
      `windowStyle=${prefs.windowStyle}`,
    ],
  };
};

export const calcDripCap: CalculatorFn = ({ prefs, dims, material }) => {
  if (!isStandardVinyl(prefs.windowLevel, prefs.windowStyle)) return null;
  const totalWindows =
    dims.firstFloorWindowOpenings + dims.secondFloorWindowOpenings;
  const qty = ROUNDUP(totalWindows / 3);
  if (qty === 0) return null;
  const m = material("drip-cap-10ft");
  return {
    trade: "Windows & Doors",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["window vinyl + single hung w/ grid"],
  };
};

export const calcTyparFlashing: CalculatorFn = ({ prefs, dims, material }) => {
  if (!isStandardVinyl(prefs.windowLevel, prefs.windowStyle)) return null;
  const totalWindows =
    dims.firstFloorWindowOpenings + dims.secondFloorWindowOpenings;
  const qty = ROUNDUP((totalWindows * 15) / 75);
  if (qty === 0) return null;
  const m = material("typar-flashing-roll");
  return {
    trade: "Windows & Doors",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["window vinyl + single hung w/ grid"],
  };
};

// ─── SHUTTERS ────────────────────────────────────────────────────

const makeShutterCalc = (
  shutterType: "Yes - Louvered" | "Yes - Raised panel",
  size: "3x6" | "3x5" | "2x4",
  materialId: string,
): CalculatorFn => ({ prefs, dims, material }) => {
  if (prefs.shutters !== shutterType) return null;
  let qty = 0;
  if (size === "3x6") qty = dims.firstFloorWindowOpenings;
  else if (size === "3x5") qty = dims.secondFloorWindowOpenings;
  else qty = Math.max(dims.firstFloorWindowOpenings - 2, 0);
  if (qty === 0) return null;
  const m = material(materialId);
  return {
    trade: "Windows & Doors",
    materialId,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: [`shutters=${shutterType}`],
  };
};

export const calcShutterHardware: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.shutters !== "Yes - Louvered" && prefs.shutters !== "Yes - Raised panel") {
    return null;
  }
  // hardware set per shutter pair (so 2 sets per opening)
  const totalPairs =
    dims.firstFloorWindowOpenings + dims.secondFloorWindowOpenings;
  const qty = totalPairs * 2;
  if (qty === 0) return null;
  const m = material("shutter-hardware-set");
  return {
    trade: "Windows & Doors",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: [`shutters=${prefs.shutters}`],
  };
};

export const WINDOWS_AND_DOORS_CALCULATORS: CalculatorFn[] = [
  calcWindow3x6,
  calcWindow3x5,
  calcDripCap,
  calcTyparFlashing,
  makeShutterCalc("Yes - Louvered", "3x6", "shutter-louvered-3x6"),
  makeShutterCalc("Yes - Louvered", "3x5", "shutter-louvered-3x5"),
  makeShutterCalc("Yes - Louvered", "2x4", "shutter-louvered-2x4"),
  makeShutterCalc("Yes - Raised panel", "3x6", "shutter-raised-3x6"),
  makeShutterCalc("Yes - Raised panel", "3x5", "shutter-raised-3x5"),
  makeShutterCalc("Yes - Raised panel", "2x4", "shutter-raised-2x4"),
  calcShutterHardware,
];
