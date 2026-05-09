import { HouseDimensions } from "../types";

/**
 * Colonial Model 1 — the dimensions the spreadsheet ships with.
 * In production these come from the model selector or a project record.
 *
 * Where the spreadsheet uses a formula (e.g. perimeter = 2*front + 2*side + 4),
 * we recompute those at the bottom of this file so they stay consistent
 * if you change a base dimension.
 */
const front = 36;
const side = 40;
const firstFloorSqFt = front * side + 20; // matches Colonial Model 1!B5

const twoCarW = 22;
const twoCarD = 25;
const threeCarW = 34;
const threeCarD = 25;

export const COLONIAL_MODEL_1: HouseDimensions = {
  frontDimension: front,
  sideDimension: side,
  perimeter: 2 * front + 2 * side + 4,
  firstFloorSqFt,
  secondFloorSqFt: front * side + 20,
  thirdFloorSqFt: 624, // depends on roof shape — see calculator
  totalSqFt: 0, // computed below

  firstFloorInteriorWallLength: 110,
  firstFloorInteriorWallCount: 24,
  firstFloorWindowOpenings: 14,
  firstFloorExteriorDoorOpenings: 3,
  firstFloorInteriorDoorOpenings: 10,

  secondFloorInteriorWallLength: 174,
  secondFloorInteriorWallCount: 17,
  secondFloorWindowOpenings: 19,
  secondFloorInteriorDoorOpenings: 12,

  thirdFloorInteriorWallLength: 50,
  thirdFloorInteriorWallCount: 6,

  roofHeightFromSecondCeiling: 10,
  roofPitch: "10/12",
  eavesExtension: 1,
  roofSqFt: 2900, // computed in spreadsheet via roof multiplier
  gutterLength: 2 * front + 2 * side + 4 - 20, // perimeter minus roof height*2
  gutterLeftEnds: 2,
  gutterRightEnds: 2,

  twoCarGarageWidth: twoCarW,
  twoCarGarageDepth: twoCarD,
  twoCarGaragePerimeter: 2 * twoCarW + 2 * twoCarD,
  twoCarGaragePiers: 3,
  twoCarGarageSqFt: twoCarW * twoCarD,

  threeCarGarageWidth: threeCarW,
  threeCarGarageDepth: threeCarD,
  threeCarGaragePerimeter: 2 * threeCarW + 2 * threeCarD,
  threeCarGaragePiers: 4,
  threeCarGarageSqFt: threeCarW * threeCarD,

  housePiers: 3,
};

COLONIAL_MODEL_1.totalSqFt =
  COLONIAL_MODEL_1.firstFloorSqFt +
  COLONIAL_MODEL_1.secondFloorSqFt +
  COLONIAL_MODEL_1.thirdFloorSqFt;
