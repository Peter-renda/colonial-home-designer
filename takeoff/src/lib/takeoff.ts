import { Preferences, HouseDimensions, BomLine, TakeoffResult, Trade } from "../types";
import { getMaterial } from "../data/materials";
import { FOUNDATION_CALCULATORS } from "../calculators/foundation";
import { FRAMING_CALCULATORS } from "../calculators/framing";
import { ROOF_CALCULATORS } from "../calculators/roof";
import { FACADE_CALCULATORS } from "../calculators/facade";
import { WINDOWS_AND_DOORS_CALCULATORS } from "../calculators/windowsAndDoors";

const ALL_CALCULATORS = [
  ...FOUNDATION_CALCULATORS,
  ...FRAMING_CALCULATORS,
  ...ROOF_CALCULATORS,
  ...FACADE_CALCULATORS,
  ...WINDOWS_AND_DOORS_CALCULATORS,
];

const TRADES: Trade[] = [
  "Foundation",
  "Framing",
  "Roof",
  "Facade",
  "Windows & Doors",
  "Garage",
  "Porches",
  "Hardscaping",
];

/**
 * The takeoff engine. Runs every calculator against the preferences +
 * dimensions and aggregates the BOM.
 *
 * Pure function — same input always produces the same output, no side effects,
 * trivial to test and run server-side or in the browser.
 */
export function runTakeoff(
  prefs: Preferences,
  dims: HouseDimensions,
): TakeoffResult {
  const ctx = { prefs, dims, material: getMaterial };

  const lines: BomLine[] = [];
  for (const calc of ALL_CALCULATORS) {
    const line = calc(ctx);
    if (line && line.quantity > 0) {
      lines.push(line);
    }
  }

  const totalsByTrade = TRADES.reduce(
    (acc, t) => ({ ...acc, [t]: 0 }),
    {} as Record<Trade, number>,
  );
  let grandTotal = 0;
  for (const line of lines) {
    totalsByTrade[line.trade] += line.lineTotal;
    grandTotal += line.lineTotal;
  }

  return { lines, totalsByTrade, grandTotal };
}

/**
 * Convenience helper for the UI: bucket lines by trade in a stable order.
 */
export function groupByTrade(lines: BomLine[]): Map<Trade, BomLine[]> {
  const groups = new Map<Trade, BomLine[]>();
  for (const t of TRADES) groups.set(t, []);
  for (const line of lines) {
    groups.get(line.trade)!.push(line);
  }
  return groups;
}

export function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}
