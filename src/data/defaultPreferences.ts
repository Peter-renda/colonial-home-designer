import { Preferences } from "../types";

/**
 * Defaults that match the Preferences sheet's current selections.
 * Useful as a starting point for a new project.
 */
export const DEFAULT_PREFERENCES: Preferences = {
  foundationType: "Slab on grade",
  slabDepth: "4 in",
  stoneBase: "6in",
  foundationSideInsulation: "Yes",
  foundationBottomInsulation: "Yes (R5)",
  crawlspace: "No",

  firstFloorCeilingHeight: "9' Ceiling",
  secondFloorCeilingHeight: "9' Ceiling",
  sheathing: "7/16 Zip System",
  exteriorWall: "2x6",
  floorSystem: "Engineered trusses",

  roofShape: "Gable",
  dormers: "Gable",
  gutters: "5 in aluminum",
  shingleStyle: "Brava - composite slate",
  snowguards: "Snowbird - black",
  rafterTails: "No",

  facade: "Brick",
  exteriorPaint: "No",
  cornice: "Cornice with Dentil",

  windowStyle: "Single hung with grid",
  windowLevel: "Vinyl",
  shutters: "Yes - Louvered",
  windowSillsFirstFloor: "Brick - straight",
  windowSillsSecondFloor: "Brick - straight",

  frontPorch: "8' x 6' concrete",
  porticoSlabBasement: "Gable Portico (with 8' x 6' front porch)",
  rearPorch: "10' x 20' brick",
  rearDoorAwning: "Juliet awning",
  rearDoorAwningCorbel: "Knee brace",

  garage: "2 car side load",
  garageDoorLevel: "wood",
  sideEntrance: "No",
  raftersOverGarageDoors: "Yes",

  finishedThirdFloor: "Yes",
  roomOverCoveredPorch: "No",
  bonusRoomOverGarage: "Yes",
  finishedBasement: "No",
  sunRoom: "No",
  additionalBathThirdFloor: "1/2 bath",
  additionalBathOverGarage: "Yes",
  breezeway: "No",
};
