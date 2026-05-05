// Maps a hostname to the content-script file that knows how to drive that
// retailer's product page. The background worker uses this to inject the
// right adapter via chrome.scripting.executeScript.
export const ADAPTERS = [
  { match: /(^|\.)homedepot\.com$/i,         file: "adapters/home-depot.js" },
  { match: /(^|\.)lowes\.com$/i,             file: "adapters/lowes.js" },
  { match: /(^|\.)menards\.com$/i,           file: "adapters/menards.js" },
  { match: /(^|\.)architecturaldepot\.com$/i, file: "adapters/architectural-depot.js" },
];

export function adapterFor(url) {
  const host = new URL(url).hostname;
  return ADAPTERS.find((a) => a.match.test(host)) ?? null;
}
