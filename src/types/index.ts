/**
 * Core types for the takeoff engine.
 * The shape mirrors the spreadsheet's Preferences/Calculations split,
 * but everything is typed so it's hard to mis-spell an option.
 */

// ─────────────────────────────────────────────────────────────
// PREFERENCES — every dropdown/radio the user can select
// ─────────────────────────────────────────────────────────────

export type FoundationType = "Slab on grade" | "Stemwall" | "Basement";
export type SlabDepth = "4 in" | "6 in";
export type StoneBase = "3in" | "6in";
export type YesNo = "Yes" | "No";
export type FoundationBottomInsulation = "Yes (R5)" | "No";
export type CeilingHeight = "8' Ceiling" | "9' Ceiling" | "10' Ceiling";
export type Sheathing = "7/16 OSB" | "7/16 Zip System";
export type ExteriorWall = "2x4" | "2x6";
export type FloorSystem = "Engineered trusses" | "I-joists" | "Dimensional lumber";
export type RoofShape = "Gable" | "Hip";
export type DormerStyle = "Gable" | "Shed" | "Hip" | "None";
export type Gutters = "4 in aluminum" | "5 in aluminum" | "6 in copper" | "None";
export type ShingleStyle =
  | "GAF - architectural"
  | "Brava - composite slate"
  | "Brava - cedar shake";
export type Snowguards = "Snowbird - black" | "Snowbird - copper" | "None";
export type Facade = "Brick" | "Hardiplank - beaded" | "Hardiplank - flat" | "Cedar lap";
export type Cornice = "Cornice with Dentil" | "Plain cornice" | "None";
export type WindowStyle = "Single hung with grid" | "Single hung no grid" | "Casement";
export type WindowLevel = "Vinyl" | "Wood-clad" | "Aluminum-clad";
export type Shutters = "Yes - Louvered" | "Yes - Raised panel" | "No";
export type WindowSill = "Brick - straight" | "Brick - rowlock" | "None";

export type FrontPorch =
  | "8' x 6' concrete"
  | "35' x 8' concrete"
  | "5' x 4' concrete"
  | "8' x 6' brick herringbone"
  | "None";

export type Portico =
  | "Gable Portico (with 8' x 6' front porch)"
  | "Hip Portico"
  | "N/A";

export type RearPorch =
  | "10' x 20' concrete"
  | "10' x 20' stamped concrete"
  | "10' x 20' concrete covered"
  | "10' x 20' brick"
  | "10' x 20' brick covered"
  | "None";

export type Awning = "Juliet awning" | "Shed roof" | "None" | "N/A";
export type CorbelStyle = "Knee brace" | "None";
export type GarageType =
  | "2 car side load"
  | "2 car front load"
  | "3 car side load"
  | "3 car front load"
  | "None";
export type GarageDoorLevel = "wood" | "steel" | "aluminum-glass";
export type AdditionalBath = "Full" | "1/2 bath" | "No";

/**
 * The complete preference set. Every field corresponds to a labeled selection
 * on the Preferences page in the spreadsheet.
 */
export interface Preferences {
  // Foundation
  foundationType: FoundationType;
  slabDepth: SlabDepth;
  stoneBase: StoneBase;
  foundationSideInsulation: YesNo;
  foundationBottomInsulation: FoundationBottomInsulation;
  crawlspace: YesNo;

  // Framing
  firstFloorCeilingHeight: CeilingHeight;
  secondFloorCeilingHeight: CeilingHeight;
  sheathing: Sheathing;
  exteriorWall: ExteriorWall;
  floorSystem: FloorSystem;

  // Roof
  roofShape: RoofShape;
  dormers: DormerStyle;
  gutters: Gutters;
  shingleStyle: ShingleStyle;
  snowguards: Snowguards;
  rafterTails: YesNo;

  // Facade
  facade: Facade;
  exteriorPaint: YesNo;
  cornice: Cornice;

  // Windows
  windowStyle: WindowStyle;
  windowLevel: WindowLevel;
  shutters: Shutters;
  windowSillsFirstFloor: WindowSill;
  windowSillsSecondFloor: WindowSill;

  // Porches & awnings
  frontPorch: FrontPorch;
  porticoSlabBasement: Portico;
  rearPorch: RearPorch;
  rearDoorAwning: Awning;
  rearDoorAwningCorbel: CorbelStyle;

  // Garage
  garage: GarageType;
  garageDoorLevel: GarageDoorLevel;
  sideEntrance: YesNo;
  raftersOverGarageDoors: YesNo;

  // Additional space
  finishedThirdFloor: YesNo;
  roomOverCoveredPorch: YesNo;
  bonusRoomOverGarage: YesNo;
  finishedBasement: YesNo;
  sunRoom: YesNo;
  additionalBathThirdFloor: AdditionalBath;
  additionalBathOverGarage: YesNo;
  breezeway: YesNo;
}

// ─────────────────────────────────────────────────────────────
// DIMENSIONS — house geometry. Eventually this comes from the
// model selector or a drawing tool; for v1 it's just numbers.
// ─────────────────────────────────────────────────────────────

export interface HouseDimensions {
  // Outer envelope
  frontDimension: number;          // ft
  sideDimension: number;           // ft
  perimeter: number;               // ft (computed: 2*front + 2*side + 4 framing)
  firstFloorSqFt: number;
  secondFloorSqFt: number;
  thirdFloorSqFt: number;
  totalSqFt: number;

  // Interior walls
  firstFloorInteriorWallLength: number;   // linear ft
  firstFloorInteriorWallCount: number;    // # of separate walls (for stud adders)
  firstFloorWindowOpenings: number;
  firstFloorExteriorDoorOpenings: number;
  firstFloorInteriorDoorOpenings: number;

  secondFloorInteriorWallLength: number;
  secondFloorInteriorWallCount: number;
  secondFloorWindowOpenings: number;
  secondFloorInteriorDoorOpenings: number;

  thirdFloorInteriorWallLength: number;
  thirdFloorInteriorWallCount: number;

  // Roof
  roofHeightFromSecondCeiling: number;
  roofPitch: string;        // e.g. "10/12"
  eavesExtension: number;   // ft
  roofSqFt: number;
  gutterLength: number;
  gutterLeftEnds: number;
  gutterRightEnds: number;

  // Garage additions
  twoCarGarageWidth: number;
  twoCarGarageDepth: number;
  twoCarGaragePerimeter: number;
  twoCarGaragePiers: number;
  twoCarGarageSqFt: number;

  threeCarGarageWidth: number;
  threeCarGarageDepth: number;
  threeCarGaragePerimeter: number;
  threeCarGaragePiers: number;
  threeCarGarageSqFt: number;

  // House piers (slab interior support)
  housePiers: number;
}

// ─────────────────────────────────────────────────────────────
// MATERIALS catalog & BOM
// ─────────────────────────────────────────────────────────────

export interface Material {
  /** Stable id (slug). e.g. "concrete-yard" */
  id: string;
  /** Display name */
  name: string;
  /** Unit of measure */
  unit: string;
  /** Per-unit price in USD */
  pricePerUnit: number;
  /** Optional sourcing info */
  supplier?: string;
  sku?: string;
  sourceUrl?: string;
  lastUpdated?: string; // ISO date
}

export type Trade =
  | "Foundation"
  | "Framing"
  | "Roof"
  | "Facade"
  | "Windows & Doors"
  | "Garage"
  | "Porches"
  | "Hardscaping";

export interface BomLine {
  trade: Trade;
  materialId: string;
  itemName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  /** Why this line exists — for debugging & "show your work" UX */
  conditionsMet: string[];
}

export interface TakeoffResult {
  lines: BomLine[];
  totalsByTrade: Record<Trade, number>;
  grandTotal: number;
}

// ─────────────────────────────────────────────────────────────
// CALCULATOR INTERFACE — every formula implements this contract
// ─────────────────────────────────────────────────────────────

export interface CalculatorContext {
  prefs: Preferences;
  dims: HouseDimensions;
  /** Lookup material by id; throws if missing so we fail loud */
  material: (id: string) => Material;
}

export type CalculatorFn = (ctx: CalculatorContext) => BomLine | null;
