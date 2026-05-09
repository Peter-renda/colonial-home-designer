/**
 * Smoke test — runs the takeoff against the default preferences (matching the
 * spreadsheet's current state) and prints the BOM. Useful for verifying that
 * the TypeScript port produces numbers in the same ballpark as the spreadsheet.
 *
 * Run with: npx tsx src/lib/takeoff.test.ts
 */
import { runTakeoff, formatUSD } from "./takeoff";
import { DEFAULT_PREFERENCES } from "../data/defaultPreferences";
import { COLONIAL_MODEL_1 } from "../data/colonialModel1";

const result = runTakeoff(DEFAULT_PREFERENCES, COLONIAL_MODEL_1);

console.log("─".repeat(72));
console.log("TAKEOFF — Colonial Model 1, default preferences");
console.log("─".repeat(72));

for (const line of result.lines) {
  const item = line.itemName.padEnd(50).slice(0, 50);
  const qty = String(line.quantity).padStart(8);
  const total = formatUSD(line.lineTotal).padStart(12);
  console.log(`${item} ${qty} ${line.unit.padEnd(6)} ${total}`);
}

console.log("─".repeat(72));
for (const [trade, total] of Object.entries(result.totalsByTrade)) {
  if (total > 0) {
    console.log(`${trade.padEnd(20)} ${formatUSD(total).padStart(12)}`);
  }
}
console.log("─".repeat(72));
console.log(`GRAND TOTAL          ${formatUSD(result.grandTotal).padStart(12)}`);
