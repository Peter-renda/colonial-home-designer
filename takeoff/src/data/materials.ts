import { Material } from "../types";

/**
 * Materials catalog. In production this lives in a Supabase `materials` table
 * with the same shape, so prices can be edited without a deploy.
 *
 * Keys are stable slugs — never change them once a calculator references one.
 */
export const MATERIALS: Record<string, Material> = {
  // ─── Foundation ──────────────────────────────────────────────
  "concrete-yard": {
    id: "concrete-yard",
    name: "Concrete (cubic yard)",
    unit: "yd³",
    pricePerUnit: 150.0,
  },
  "rebar-linear-ft": {
    id: "rebar-linear-ft",
    name: "Rebar",
    unit: "lf",
    pricePerUnit: 8.0,
  },
  "rebar-chairs-pack": {
    id: "rebar-chairs-pack",
    name: "Rebar chairs (pack)",
    unit: "pack",
    pricePerUnit: 38.0,
  },
  "stone-abc-ton": {
    id: "stone-abc-ton",
    name: "ABC stone",
    unit: "ton",
    pricePerUnit: 56.0,
  },
  "vapor-barrier-roll": {
    id: "vapor-barrier-roll",
    name: "Vapor barrier (2000 sq ft roll)",
    unit: "roll",
    pricePerUnit: 127.0,
  },
  "rigid-insulation-r5": {
    id: "rigid-insulation-r5",
    name: "Rigid insulation R5 (4x8 sheet)",
    unit: "sheet",
    pricePerUnit: 29.0,
  },
  "labor-prep-pour": {
    id: "labor-prep-pour",
    name: "Labor — prep & pour",
    unit: "sq ft",
    pricePerUnit: 5.5,
  },
  "labor-footers": {
    id: "labor-footers",
    name: "Labor — footers",
    unit: "lf",
    pricePerUnit: 4.0,
  },

  // ─── Framing — lumber ────────────────────────────────────────
  "stud-2x4x8":  { id: "stud-2x4x8",  name: "2x4x8 stud",  unit: "ea", pricePerUnit: 4.0  },
  "stud-2x4x9":  { id: "stud-2x4x9",  name: "2x4x9 stud",  unit: "ea", pricePerUnit: 5.0  },
  "stud-2x4x10": { id: "stud-2x4x10", name: "2x4x10 stud", unit: "ea", pricePerUnit: 6.5  },
  "stud-2x6x8":  { id: "stud-2x6x8",  name: "2x6x8 stud",  unit: "ea", pricePerUnit: 6.0  },
  "stud-2x6x9":  { id: "stud-2x6x9",  name: "2x6x9 stud",  unit: "ea", pricePerUnit: 7.5  },
  "stud-2x6x10": { id: "stud-2x6x10", name: "2x6x10 stud", unit: "ea", pricePerUnit: 9.0  },

  "plate-2x4x16-pt":  { id: "plate-2x4x16-pt",  name: "2x4x16 pressure treated",     unit: "ea", pricePerUnit: 15.5 },
  "plate-2x4x16-npt": { id: "plate-2x4x16-npt", name: "2x4x16 non-pressure treated", unit: "ea", pricePerUnit: 10.5 },
  "plate-2x6x16-pt":  { id: "plate-2x6x16-pt",  name: "2x6x16 pressure treated",     unit: "ea", pricePerUnit: 22.0 },
  "plate-2x6x16-npt": { id: "plate-2x6x16-npt", name: "2x6x16 non-pressure treated", unit: "ea", pricePerUnit: 15.0 },

  "fascia-2x4x12": { id: "fascia-2x4x12", name: "2x4x12 fascia", unit: "ea", pricePerUnit: 8.0 },

  // ─── Sheathing ───────────────────────────────────────────────
  "sheathing-osb-4x8": {
    id: "sheathing-osb-4x8",
    name: "7/16\" OSB (4x8)",
    unit: "sheet",
    pricePerUnit: 10.4,
  },
  "sheathing-zip-4x8": {
    id: "sheathing-zip-4x8",
    name: "7/16\" Zip System (4x8)",
    unit: "sheet",
    pricePerUnit: 34.0,
  },
  "house-wrap": {
    id: "house-wrap",
    name: "House wrap",
    unit: "roll",
    pricePerUnit: 118.0,
  },
  "zip-tape-75ft": {
    id: "zip-tape-75ft",
    name: "Zip system flashing tape (75 ft roll)",
    unit: "roll",
    pricePerUnit: 27.0,
  },

  // ─── Roof ────────────────────────────────────────────────────
  "shingles-gaf-architectural": {
    id: "shingles-gaf-architectural",
    name: "GAF/Owens Corning architectural shingles (32.8 sq ft bundle)",
    unit: "bundle",
    pricePerUnit: 57.0,
    supplier: "Lowe's",
  },
  "roof-paper-roll": {
    id: "roof-paper-roll",
    name: "Roof paper (1000 sq ft roll)",
    unit: "roll",
    pricePerUnit: 65.0,
  },

  // Gutters (5" brown aluminum system)
  "gutter-apron-10ft": {
    id: "gutter-apron-10ft",
    name: "Brown aluminum gutter apron (10 ft)",
    unit: "ea",
    pricePerUnit: 8.98,
    supplier: "Home Depot",
  },
  "gutter-5in-brown-10ft": {
    id: "gutter-5in-brown-10ft",
    name: "5\" brown gutter (10 ft section)",
    unit: "ea",
    pricePerUnit: 12.98,
    supplier: "Home Depot",
  },
  "gutter-miter-outside": { id: "gutter-miter-outside", name: "5\" outside gutter miter", unit: "ea", pricePerUnit: 9.98 },
  "gutter-miter-inside":  { id: "gutter-miter-inside",  name: "5\" inside gutter miter",  unit: "ea", pricePerUnit: 9.98 },
  "gutter-end-w-downspout": {
    id: "gutter-end-w-downspout",
    name: "5\" gutter end with downspout outlet",
    unit: "ea",
    pricePerUnit: 10.98,
  },
  "downspout-2x3-10ft": {
    id: "downspout-2x3-10ft",
    name: "2\"x3\" brown downspout (10 ft)",
    unit: "ea",
    pricePerUnit: 17.98,
  },
  "gutter-connector": { id: "gutter-connector", name: "Gutter slip-joint connector", unit: "ea", pricePerUnit: 5.49 },
  "gutter-end-cap-right": { id: "gutter-end-cap-right", name: "5\" right end cap", unit: "ea", pricePerUnit: 4.98 },
  "gutter-end-cap-left":  { id: "gutter-end-cap-left",  name: "5\" left end cap",  unit: "ea", pricePerUnit: 4.98 },
  "gutter-hidden-hanger": { id: "gutter-hidden-hanger", name: "Hidden gutter hanger w/ screw", unit: "ea", pricePerUnit: 3.98 },

  // ─── Facade — Brick ──────────────────────────────────────────
  "rainscreen-6mm-sqft": { id: "rainscreen-6mm-sqft", name: "Rainscreen 6mm",   unit: "sq ft", pricePerUnit: 1.85 },
  "brick":               { id: "brick",               name: "Brick",            unit: "ea",    pricePerUnit: 0.85 },
  "lintel-4ft":          { id: "lintel-4ft",          name: "4' angle lintel",  unit: "ea",    pricePerUnit: 32.0 },
  "lintel-6ft":          { id: "lintel-6ft",          name: "6' angle lintel",  unit: "ea",    pricePerUnit: 48.0 },
  "lintel-8ft":          { id: "lintel-8ft",          name: "8' angle lintel",  unit: "ea",    pricePerUnit: 64.0 },
  "wall-tie":            { id: "wall-tie",            name: "Brick wall tie",   unit: "ea",    pricePerUnit: 0.18 },
  "mortar-80lb":         { id: "mortar-80lb",         name: "Mortar (80 lb bag)", unit: "bag", pricePerUnit: 12.5 },
  "flex-sealant":        { id: "flex-sealant",        name: "Flex sealant tube", unit: "ea",   pricePerUnit: 9.98 },
  "exterior-paint":      { id: "exterior-paint",      name: "Exterior paint",   unit: "gal",   pricePerUnit: 65.0 },
  "soffit-hardie":       { id: "soffit-hardie",       name: "Hardie soffit panel (12x144)", unit: "ea", pricePerUnit: 18.0 },

  // ─── Facade — Hardiplank ─────────────────────────────────────
  "hardiplank-beaded":   { id: "hardiplank-beaded",   name: "Hardiplank beaded (8.25x144)", unit: "ea", pricePerUnit: 14.68 },
  "hardiplank-flat":     { id: "hardiplank-flat",     name: "Hardiplank flat (8.25x144)",   unit: "ea", pricePerUnit: 14.68 },
  "hardie-trim-board":   { id: "hardie-trim-board",   name: "Hardie trim board (3.5x12ft)", unit: "ea", pricePerUnit: 30.36 },
  "caulking-tube":       { id: "caulking-tube",       name: "OSI Quad Max caulking",        unit: "ea", pricePerUnit: 9.97 },

  // ─── Facade — Cedar ──────────────────────────────────────────
  "cedar-board":         { id: "cedar-board",         name: "Cedar lap board",       unit: "ea", pricePerUnit: 22.0 },
  "cedar-trim-board":    { id: "cedar-trim-board",    name: "Cedar trim board (5/4x6x12)", unit: "ea", pricePerUnit: 15.98 },

  // ─── Windows ─────────────────────────────────────────────────
  "window-3x6-vinyl":    { id: "window-3x6-vinyl",    name: "3x6 single hung — vinyl",  unit: "ea", pricePerUnit: 319.0 },
  "window-3x5-vinyl":    { id: "window-3x5-vinyl",    name: "3x5 single hung — vinyl",  unit: "ea", pricePerUnit: 249.0 },
  "window-2x4-vinyl":    { id: "window-2x4-vinyl",    name: "2x4 single hung — vinyl",  unit: "ea", pricePerUnit: 195.0 },
  "window-2x3-casement": { id: "window-2x3-casement", name: "2x3 casement — vinyl",     unit: "ea", pricePerUnit: 215.0 },
  "window-3x2-casement": { id: "window-3x2-casement", name: "3x2 casement — vinyl",     unit: "ea", pricePerUnit: 215.0 },
  "drip-cap-10ft":       { id: "drip-cap-10ft",       name: "Drip cap white aluminum (10 ft)", unit: "ea", pricePerUnit: 5.97 },
  "typar-flashing-roll": { id: "typar-flashing-roll", name: "Typar window flashing (75 ft)",   unit: "roll", pricePerUnit: 35.0 },

  // ─── Shutters ────────────────────────────────────────────────
  "shutter-louvered-3x6":   { id: "shutter-louvered-3x6",   name: "Louvered shutter pair — 3x6",   unit: "pair", pricePerUnit: 59.99 },
  "shutter-louvered-3x5":   { id: "shutter-louvered-3x5",   name: "Louvered shutter pair — 3x5",   unit: "pair", pricePerUnit: 54.99 },
  "shutter-louvered-2x4":   { id: "shutter-louvered-2x4",   name: "Louvered shutter pair — 2x4",   unit: "pair", pricePerUnit: 44.99 },
  "shutter-raised-3x6":     { id: "shutter-raised-3x6",     name: "Raised panel shutter pair — 3x6", unit: "pair", pricePerUnit: 79.99 },
  "shutter-raised-3x5":     { id: "shutter-raised-3x5",     name: "Raised panel shutter pair — 3x5", unit: "pair", pricePerUnit: 69.99 },
  "shutter-raised-2x4":     { id: "shutter-raised-2x4",     name: "Raised panel shutter pair — 2x4", unit: "pair", pricePerUnit: 59.99 },
  "shutter-hardware-set":   { id: "shutter-hardware-set",   name: "Shutter hardware set",          unit: "set", pricePerUnit: 8.98 },
};

export function getMaterial(id: string) {
  const m = MATERIALS[id];
  if (!m) {
    throw new Error(
      `Material "${id}" not found in catalog. Add it to src/data/materials.ts.`,
    );
  }
  return m;
}
