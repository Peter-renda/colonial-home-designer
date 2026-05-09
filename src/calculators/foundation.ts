import { CalculatorFn } from "../types";

/**
 * Foundation trade calculators.
 *
 * Each function maps to one row of the Calculations sheet (Foundation section,
 * spreadsheet rows 3–11). They return a BomLine when the conditions are met,
 * or null when they aren't (so we don't pollute the BOM with zero-qty rows).
 *
 * Naming convention: `calc<Item>` — exported so the registry can pick them up.
 */

const ROUNDUP = (n: number, decimals = 0) => {
  const f = Math.pow(10, decimals);
  return Math.ceil(n * f) / f;
};

// Concrete (sq ft)/70 + perimeter/70*3 + (piers*16*3/70) for 4"
//          (sq ft)/50 + perimeter/70*3 + (piers*16*3/70) for 6"
export const calcConcrete: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.foundationType !== "Slab on grade") return null;

  const piers = dims.housePiers;
  const sqFtFactor = prefs.slabDepth === "4 in" ? 70 : 50;

  const qty = ROUNDUP(
    dims.firstFloorSqFt / sqFtFactor +
      (dims.perimeter / 70) * 3 +
      (piers * 16 * 3) / 70,
  );

  const m = material("concrete-yard");
  return {
    trade: "Foundation",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: [
      `foundationType=${prefs.foundationType}`,
      `slabDepth=${prefs.slabDepth}`,
    ],
  };
};

// Rebar — perimeter * 2 (linear ft) when slab
export const calcRebar: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.foundationType !== "Slab on grade") return null;
  const qty = dims.perimeter * 2;
  const m = material("rebar-linear-ft");
  return {
    trade: "Foundation",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: [`foundationType=${prefs.foundationType}`],
  };
};

// Rebar chairs — 1 pack when slab
export const calcRebarChairs: CalculatorFn = ({ prefs, material }) => {
  if (prefs.foundationType !== "Slab on grade") return null;
  const m = material("rebar-chairs-pack");
  return {
    trade: "Foundation",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: 1,
    unitPrice: m.pricePerUnit,
    lineTotal: m.pricePerUnit,
    conditionsMet: [`foundationType=${prefs.foundationType}`],
  };
};

// Stone — 3in base: sqft/108; 6in base: sqft/54
export const calcStone: CalculatorFn = ({ prefs, dims, material }) => {
  const divisor = prefs.stoneBase === "3in" ? 108 : 54;
  const qty = ROUNDUP(dims.firstFloorSqFt / divisor);
  const m = material("stone-abc-ton");
  return {
    trade: "Foundation",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: [`stoneBase=${prefs.stoneBase}`],
  };
};

// Vapor barrier — slab: roundup(sqft/2000)
export const calcVaporBarrier: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.foundationType !== "Slab on grade") return null;
  const qty = ROUNDUP(dims.firstFloorSqFt / 2000);
  const m = material("vapor-barrier-roll");
  return {
    trade: "Foundation",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: [`foundationType=${prefs.foundationType}`],
  };
};

// Rigid insulation — Yes (R5): sqft / 48
export const calcRigidInsulation: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.foundationBottomInsulation !== "Yes (R5)") return null;
  const qty = ROUNDUP(dims.firstFloorSqFt / 48);
  const m = material("rigid-insulation-r5");
  return {
    trade: "Foundation",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: [`foundationBottomInsulation=${prefs.foundationBottomInsulation}`],
  };
};

// Sidewall insulation — slab + side insulation=Yes: perimeter / 16
export const calcSidewallInsulation: CalculatorFn = ({ prefs, dims, material }) => {
  if (
    prefs.foundationType !== "Slab on grade" ||
    prefs.foundationSideInsulation !== "Yes"
  ) {
    return null;
  }
  const qty = ROUNDUP(dims.perimeter / 16);
  const m = material("rigid-insulation-r5"); // shared SKU in the catalog
  return {
    trade: "Foundation",
    materialId: m.id,
    itemName: "Sidewall rigid insulation",
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: [
      `foundationType=${prefs.foundationType}`,
      `foundationSideInsulation=${prefs.foundationSideInsulation}`,
    ],
  };
};

// Labor — prep & pour (sq ft * rate)
export const calcLaborPrepPour: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.foundationType !== "Slab on grade") return null;
  const m = material("labor-prep-pour");
  const qty = dims.firstFloorSqFt;
  return {
    trade: "Foundation",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: [`foundationType=${prefs.foundationType}`],
  };
};

// Labor — footers (perimeter * rate)
export const calcLaborFooters: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.foundationType !== "Slab on grade") return null;
  const m = material("labor-footers");
  const qty = dims.perimeter;
  return {
    trade: "Foundation",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: [`foundationType=${prefs.foundationType}`],
  };
};

export const FOUNDATION_CALCULATORS: CalculatorFn[] = [
  calcConcrete,
  calcRebar,
  calcRebarChairs,
  calcStone,
  calcVaporBarrier,
  calcRigidInsulation,
  calcSidewallInsulation,
  calcLaborPrepPour,
  calcLaborFooters,
];
