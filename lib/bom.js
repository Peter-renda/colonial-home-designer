import { parseCsv } from "./csv.js";

const RESERVED = new Set(["url", "quantity", "qty", "note", "notes"]);

// Parses a BOM CSV into [{ url, quantity, options: {color, size, ...} }].
// Header row is required. `quantity` defaults to 1 when blank.
export function parseBom(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) throw new Error("CSV needs a header row and at least one item.");

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const urlIdx = header.indexOf("url");
  if (urlIdx === -1) throw new Error("Missing required column: url");
  const qtyIdx = header.findIndex((h) => h === "quantity" || h === "qty");

  const items = [];
  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    const url = (cells[urlIdx] ?? "").trim();
    if (!url) continue;

    const qtyRaw = qtyIdx === -1 ? "" : (cells[qtyIdx] ?? "").trim();
    const quantity = qtyRaw === "" ? 1 : Number(qtyRaw);
    if (!Number.isFinite(quantity) || quantity < 1) {
      throw new Error(`Row ${r + 1}: invalid quantity "${qtyRaw}"`);
    }

    const options = {};
    for (let c = 0; c < header.length; c++) {
      const name = header[c];
      if (RESERVED.has(name)) continue;
      const value = (cells[c] ?? "").trim();
      if (value) options[name] = value;
    }

    items.push({ url, quantity, options });
  }
  return items;
}
