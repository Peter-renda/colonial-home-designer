import { adapterFor } from "../lib/adapters.js";

const PAGE_LOAD_TIMEOUT_MS = 30_000;
const ADAPTER_TIMEOUT_MS   = 25_000;

// Some retailers need a follow-up step on the cart page (e.g. setting
// quantity for products that don't expose a qty control on the product
// page). Map host → cart URL + cart-adapter file.
const CART_FLOWS = {
  "homedepot.com": {
    cartUrl: "https://www.homedepot.com/mycart/cart",
    file:    "adapters/home-depot-cart.js",
    invoke:  (payload) => window.__bomCartAdapter(payload),
  },
};

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
  await withTimeout(waitForLoad(tab.id), PAGE_LOAD_TIMEOUT_MS, "page load");

  // Run the product-page adapter. Tolerate "Frame was removed" — Home
  // Depot navigates the tab right after ATC, which can kill the isolated
  // world before the result propagates. The click already landed; we
  // proceed to the cart-update step assuming success.
  let result;
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["adapters/_helpers.js", adapter.file],
    });
    const invoke = chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (payload) => window.__bomAdapter(payload),
      args: [{ quantity: item.quantity, options: item.options }],
    });
    const [{ result: r }] = await withTimeout(invoke, ADAPTER_TIMEOUT_MS, "adapter");
    result = r;
  } catch (err) {
    if (!isFrameRemoved(err)) throw err;
    console.log("[BOM] tolerating frame-removed; assuming ATC succeeded");
    result = { ok: true, needsCartUpdate: item.quantity > 1, productId: extractProductId(item.url), quantity: item.quantity };
  }

  if (!result?.ok) throw new Error(result?.message || "Adapter failed");
  if (!result.needsCartUpdate) return;

  const flow = cartFlowFor(item.url);
  if (!flow) {
    console.warn("[BOM] needsCartUpdate set but no cart flow registered for", item.url);
    return;
  }

  await chrome.tabs.update(tab.id, { url: flow.cartUrl });
  await withTimeout(waitForLoad(tab.id), PAGE_LOAD_TIMEOUT_MS, "cart page load");
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["adapters/_helpers.js", flow.file],
  });
  const cartInvoke = chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: flow.invoke,
    args: [{ productId: result.productId, quantity: result.quantity }],
  });
  const [{ result: cartResult }] = await withTimeout(cartInvoke, ADAPTER_TIMEOUT_MS, "cart adapter");
  if (!cartResult?.ok) throw new Error(`cart update: ${cartResult?.message || "failed"}`);
}

function cartFlowFor(url) {
  const host = new URL(url).hostname;
  for (const [domain, flow] of Object.entries(CART_FLOWS)) {
    if (host === domain || host.endsWith("." + domain)) return flow;
  }
  return null;
}

function extractProductId(url) {
  try {
    const m = new URL(url).pathname.match(/\/(\d{6,})(?:\/|$)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

function isFrameRemoved(err) {
  return /frame.*removed|no tab with id|frame.*not found/i.test(err?.message || "");
}

function waitForLoad(tabId) {
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
