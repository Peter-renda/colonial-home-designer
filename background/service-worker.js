import { adapterFor } from "../lib/adapters.js";

const PAGE_LOAD_TIMEOUT_MS = 30_000;
const ADAPTER_TIMEOUT_MS   = 25_000;

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "bom-run") return;
  port.onMessage.addListener(async (msg) => {
    if (msg.type !== "run") return;
    await runBom(msg.bom, port);
  });
});

async function runBom(bom, port) {
  console.log("[BOM] starting run", bom);
  let succeeded = 0;
  for (const item of bom) {
    const label = `${shortUrl(item.url)} ×${item.quantity}`;
    console.log("[BOM] item:", label);
    try {
      await addItem(item);
      succeeded++;
      send(port, { type: "progress", line: `✓ ${label}`, ok: true });
    } catch (err) {
      console.warn("[BOM] item failed:", label, err);
      send(port, { type: "progress", line: `✗ ${label} — ${err.message}`, ok: false });
    }
  }
  console.log(`[BOM] done — ${succeeded}/${bom.length}`);
  send(port, { type: "done", succeeded, total: bom.length });
}

async function addItem(item) {
  const adapter = adapterFor(item.url);
  if (!adapter) throw new Error("No adapter for this site");

  const tab = await chrome.tabs.create({ url: item.url, active: true });
  try {
    await withTimeout(waitForLoad(tab.id), PAGE_LOAD_TIMEOUT_MS, "page load");
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["adapters/_helpers.js", adapter.file],
    });
    const invoke = chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (payload) => window.__bomAdapter(payload),
      args: [{ quantity: item.quantity, options: item.options }],
    });
    const [{ result }] = await withTimeout(invoke, ADAPTER_TIMEOUT_MS, "adapter");
    if (!result?.ok) throw new Error(result?.message || "Adapter failed");
  } finally {
    // Leave the tab open so you can verify what happened.
  }
}

function waitForLoad(tabId) {
  // Wait for `complete`, then a quiet window where no further navigation
  // happens. Home Depot/Lowe's both fire `complete` on an interstitial,
  // then redirect, which previously caused "Frame was removed" errors.
  return new Promise((resolve) => {
    let settleTimer;
    const onUpdated = (id, info) => {
      if (id !== tabId) return;
      if (info.status === "loading") {
        clearTimeout(settleTimer);
      } else if (info.status === "complete") {
        clearTimeout(settleTimer);
        settleTimer = setTimeout(() => {
          chrome.tabs.onUpdated.removeListener(onUpdated);
          resolve();
        }, 2500);
      }
    };
    chrome.tabs.onUpdated.addListener(onUpdated);
  });
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)),
  ]);
}

function send(port, msg) {
  try { port.postMessage(msg); } catch { /* popup closed; orchestration continues */ }
}

function shortUrl(u) {
  try { const x = new URL(u); return x.hostname + x.pathname.slice(0, 32); }
  catch { return u.slice(0, 48); }
}
