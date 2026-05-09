import { CalculatorFn, CeilingHeight, ExteriorWall } from "../types";

const ROUNDUP = (n: number, decimals = 0) => {
  const f = Math.pow(10, decimals);
  return Math.ceil(n * f) / f;
};

/**
 * Studs follow a 4-way pattern:
 *   - 2x6 wall: interior walls only (perimeter studs are 2x6, counted separately)
 *   - 2x4 wall: interior + perimeter (everything is 2x4)
 *   - Plus 4 studs per door opening (and per window opening for 2x4 walls)
 *
 * Helper that does that math for one floor.
 */
function calc24Studs(args: {
  ceilingHeight: CeilingHeight;
  exteriorWall: ExteriorWall;
  interiorWallLength: number;
  perimeter: number;
  windowOpenings: number;
  doorOpenings: number;
  targetHeight: CeilingHeight;
}): number {
  if (args.ceilingHeight !== args.targetHeight) return 0;

  if (args.exteriorWall === "2x6") {
    // Interior walls only
    return ROUNDUP(
      (args.interiorWallLength * 12) / 16 + args.doorOpenings * 4,
    );
  }
  // 2x4: interior + perimeter, plus window adders
  return ROUNDUP(
    ((args.interiorWallLength + args.perimeter) * 12) / 16 +
      args.doorOpenings * 4 +
      args.windowOpenings * 4,
  );
}

/**
 * 2x6 perimeter studs (only when wall is 2x6) — perimeter / 16" OC,
 * plus 4 studs per opening, plus 1 stud per separate wall.
 */
function calc26PerimeterStuds(args: {
  ceilingHeight: CeilingHeight;
  exteriorWall: ExteriorWall;
  perimeter: number;
  windowOpenings: number;
  doorOpenings: number;
  wallCount: number;
  targetHeight: CeilingHeight;
}): number {
  if (
    args.exteriorWall !== "2x6" ||
    args.ceilingHeight !== args.targetHeight
  ) {
    return 0;
  }
  return ROUNDUP(
    (args.perimeter * 12) / 16 +
      (args.windowOpenings + args.doorOpenings) * 4 +
      args.wallCount,
  );
}

// ─── 1ST FLOOR STUDS ──────────────────────────────────────────────

const make24StudCalc = (
  height: CeilingHeight,
  wall: ExteriorWall,
  materialId: string,
  floor: 1 | 2,
): CalculatorFn => ({ prefs, dims, material }) => {
  if (prefs.exteriorWall !== wall) return null;
  const ceiling =
    floor === 1
      ? prefs.firstFloorCeilingHeight
      : prefs.secondFloorCeilingHeight;
  if (ceiling !== height) return null;

  const qty = calc24Studs({
    ceilingHeight: ceiling,
    exteriorWall: wall,
    interiorWallLength:
      floor === 1
        ? dims.firstFloorInteriorWallLength
        : dims.secondFloorInteriorWallLength,
    perimeter: dims.perimeter,
    windowOpenings:
      floor === 1
        ? dims.firstFloorWindowOpenings
        : dims.secondFloorWindowOpenings,
    doorOpenings:
      floor === 1
        ? dims.firstFloorExteriorDoorOpenings + dims.firstFloorInteriorDoorOpenings
        : dims.secondFloorInteriorDoorOpenings,
    targetHeight: height,
  });
  if (qty === 0) return null;

  const m = material(materialId);
  return {
    trade: "Framing",
    materialId,
    itemName: `${m.name} (${floor === 1 ? "1st" : "2nd"} floor studs)`,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: [
      `exteriorWall=${wall}`,
      `${floor === 1 ? "first" : "second"}FloorCeilingHeight=${height}`,
    ],
  };
};

const make26StudCalc = (
  height: CeilingHeight,
  materialId: string,
  floor: 1 | 2,
): CalculatorFn => ({ prefs, dims, material }) => {
  if (prefs.exteriorWall !== "2x6") return null;
  const ceiling =
    floor === 1
      ? prefs.firstFloorCeilingHeight
      : prefs.secondFloorCeilingHeight;
  if (ceiling !== height) return null;

  const qty = calc26PerimeterStuds({
    ceilingHeight: ceiling,
    exteriorWall: "2x6",
    perimeter: dims.perimeter,
    windowOpenings:
      floor === 1
        ? dims.firstFloorWindowOpenings
        : dims.secondFloorWindowOpenings,
    doorOpenings:
      floor === 1
        ? dims.firstFloorExteriorDoorOpenings + dims.firstFloorInteriorDoorOpenings
        : dims.secondFloorInteriorDoorOpenings,
    wallCount:
      floor === 1
        ? dims.firstFloorInteriorWallCount
        : dims.secondFloorInteriorWallCount,
    targetHeight: height,
  });
  if (qty === 0) return null;

  const m = material(materialId);
  return {
    trade: "Framing",
    materialId,
    itemName: `${m.name} (${floor === 1 ? "1st" : "2nd"} floor perimeter)`,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: [
      `exteriorWall=2x6`,
      `${floor === 1 ? "first" : "second"}FloorCeilingHeight=${height}`,
    ],
  };
};

// ─── SOLE PLATES ──────────────────────────────────────────────────

export const calcSolePlate24Pt: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.foundationType !== "Slab on grade" || prefs.exteriorWall !== "2x4") {
    return null;
  }
  const qty = ROUNDUP(
    (dims.firstFloorInteriorWallLength + dims.perimeter) / 16,
  );
  const m = material("plate-2x4x16-pt");
  return {
    trade: "Framing",
    materialId: m.id,
    itemName: `${m.name} (sole plates — slab)`,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["foundationType=Slab on grade", "exteriorWall=2x4"],
  };
};

export const calcSolePlate26Pt: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.foundationType !== "Slab on grade" || prefs.exteriorWall !== "2x6") {
    return null;
  }
  const qty = ROUNDUP(dims.firstFloorInteriorWallLength / 16);
  const m = material("plate-2x6x16-pt");
  return {
    trade: "Framing",
    materialId: m.id,
    itemName: `${m.name} (sole plates — slab)`,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["foundationType=Slab on grade", "exteriorWall=2x6"],
  };
};

// ─── TOP PLATES ───────────────────────────────────────────────────

export const calcTopPlate24Npt: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.exteriorWall !== "2x4") return null;
  const qty = ROUNDUP(
    ((dims.firstFloorInteriorWallLength + dims.perimeter) / 16) * 2,
  );
  const m = material("plate-2x4x16-npt");
  return {
    trade: "Framing",
    materialId: m.id,
    itemName: `${m.name} (top plates — 2 courses)`,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["exteriorWall=2x4"],
  };
};

export const calcTopPlate26Interior: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.exteriorWall !== "2x6") return null;
  const qty = ROUNDUP((dims.firstFloorInteriorWallLength / 16) * 2);
  const m = material("plate-2x4x16-npt");
  return {
    trade: "Framing",
    materialId: m.id,
    itemName: `${m.name} (interior top plates)`,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["exteriorWall=2x6"],
  };
};

export const calcTopPlate26Perimeter: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.exteriorWall !== "2x6") return null;
  const qty = ROUNDUP((dims.perimeter / 16) * 2);
  const m = material("plate-2x6x16-npt");
  return {
    trade: "Framing",
    materialId: m.id,
    itemName: `${m.name} (perimeter top plates)`,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["exteriorWall=2x6"],
  };
};

// ─── HEADERS ──────────────────────────────────────────────────────

export const calcHeaders: CalculatorFn = ({ dims, material }) => {
  const qty =
    dims.firstFloorExteriorDoorOpenings +
    dims.secondFloorWindowOpenings +
    dims.secondFloorInteriorDoorOpenings;
  if (qty === 0) return null;
  const m = material("stud-2x6x8");
  return {
    trade: "Framing",
    materialId: m.id,
    itemName: `${m.name} (headers)`,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["sum of 1F doors + 2F windows + 2F doors"],
  };
};

// ─── FASCIA ───────────────────────────────────────────────────────

export const calcFasciaGable: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.roofShape !== "Gable") return null;
  const qty = ROUNDUP((dims.frontDimension * 2) / 12);
  const m = material("fascia-2x4x12");
  return {
    trade: "Framing",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["roofShape=Gable"],
  };
};

export const calcFasciaHip: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.roofShape !== "Hip") return null;
  const qty = ROUNDUP(dims.perimeter / 12);
  const m = material("fascia-2x4x12");
  return {
    trade: "Framing",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["roofShape=Hip"],
  };
};

// ─── SHEATHING ────────────────────────────────────────────────────

const wallSqFt = (prefs: { firstFloorCeilingHeight: CeilingHeight }, perimeter: number) => {
  const h =
    prefs.firstFloorCeilingHeight === "10' Ceiling"
      ? 10
      : prefs.firstFloorCeilingHeight === "9' Ceiling"
      ? 9
      : 8;
  // 2-story: rough estimate doubled
  return perimeter * h * 2;
};

export const calcSheathingOSB: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.sheathing !== "7/16 OSB") return null;
  const qty = ROUNDUP(wallSqFt(prefs, dims.perimeter) / 48);
  const m = material("sheathing-osb-4x8");
  return {
    trade: "Framing",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["sheathing=7/16 OSB"],
  };
};

export const calcHouseWrap: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.sheathing !== "7/16 OSB") return null;
  const qty = ROUNDUP(wallSqFt(prefs, dims.perimeter) / 1350);
  const m = material("house-wrap");
  return {
    trade: "Framing",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["sheathing=7/16 OSB"],
  };
};

export const calcSheathingZip: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.sheathing !== "7/16 Zip System") return null;
  const qty = ROUNDUP(wallSqFt(prefs, dims.perimeter) / 48);
  const m = material("sheathing-zip-4x8");
  return {
    trade: "Framing",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["sheathing=7/16 Zip System"],
  };
};

export const calcZipTape: CalculatorFn = ({ prefs, dims, material }) => {
  if (prefs.sheathing !== "7/16 Zip System") return null;
  const panels = ROUNDUP(wallSqFt(prefs, dims.perimeter) / 48);
  const qty = ROUNDUP((panels * 8) / 75);
  const m = material("zip-tape-75ft");
  return {
    trade: "Framing",
    materialId: m.id,
    itemName: m.name,
    unit: m.unit,
    quantity: qty,
    unitPrice: m.pricePerUnit,
    lineTotal: qty * m.pricePerUnit,
    conditionsMet: ["sheathing=7/16 Zip System"],
  };
};

export const FRAMING_CALCULATORS: CalculatorFn[] = [
  // 1st floor 2x4 studs
  make24StudCalc("8' Ceiling", "2x6", "stud-2x4x8", 1),
  make24StudCalc("8' Ceiling", "2x4", "stud-2x4x8", 1),
  make24StudCalc("9' Ceiling", "2x6", "stud-2x4x9", 1),
  make24StudCalc("9' Ceiling", "2x4", "stud-2x4x9", 1),
  make24StudCalc("10' Ceiling", "2x6", "stud-2x4x10", 1),
  make24StudCalc("10' Ceiling", "2x4", "stud-2x4x10", 1),
  // 1st floor 2x6 perimeter studs
  make26StudCalc("8' Ceiling", "stud-2x6x8", 1),
  make26StudCalc("9' Ceiling", "stud-2x6x9", 1),
  make26StudCalc("10' Ceiling", "stud-2x6x10", 1),
  // 2nd floor 2x4 studs
  make24StudCalc("8' Ceiling", "2x6", "stud-2x4x8", 2),
  make24StudCalc("8' Ceiling", "2x4", "stud-2x4x8", 2),
  make24StudCalc("9' Ceiling", "2x6", "stud-2x4x9", 2),
  make24StudCalc("9' Ceiling", "2x4", "stud-2x4x9", 2),
  make24StudCalc("10' Ceiling", "2x6", "stud-2x4x10", 2),
  make24StudCalc("10' Ceiling", "2x4", "stud-2x4x10", 2),
  // 2nd floor 2x6 perimeter studs
  make26StudCalc("8' Ceiling", "stud-2x6x8", 2),
  make26StudCalc("9' Ceiling", "stud-2x6x9", 2),
  make26StudCalc("10' Ceiling", "stud-2x6x10", 2),
  // Plates & headers
  calcSolePlate24Pt,
  calcSolePlate26Pt,
  calcTopPlate24Npt,
  calcTopPlate26Interior,
  calcTopPlate26Perimeter,
  calcHeaders,
  // Fascia
  calcFasciaGable,
  calcFasciaHip,
  // Sheathing
  calcSheathingOSB,
  calcHouseWrap,
  calcSheathingZip,
  calcZipTape,
];
