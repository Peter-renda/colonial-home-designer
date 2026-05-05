import { adapterFor } from "../lib/adapters.js";

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "bom-run") return;
  port.onMessage.addListener(async (msg) => {
    if (msg.type !== "run") return;
    await runBom(msg.bom, port);
  });
});

async function runBom(bom, port) {
  let succeeded = 0;
  for (const item of bom) {
    const label = `${shortUrl(item.url)} ×${item.quantity}`;
    try {
      await addItem(item);
      succeeded++;
      port.postMessage({ type: "progress", line: `✓ ${label}`, ok: true });
    } catch (err) {
      port.postMessage({ type: "progress", line: `✗ ${label} — ${err.message}`, ok: false });
    }
  }
  port.postMessage({ type: "done", succeeded, total: bom.length });
}

async function addItem(item) {
  const adapter = adapterFor(item.url);
  if (!adapter) throw new Error("No adapter for this site");

  const tab = await chrome.tabs.create({ url: item.url, active: false });
  try {
    await waitForLoad(tab.id);
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["adapters/_helpers.js", adapter.file],
    });
    // Adapter file registers `window.__bomAdapter` on load; invoke it.
    const [{ result: invokeResult }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (payload) => window.__bomAdapter(payload),
      args: [{ quantity: item.quantity, options: item.options }],
    });
    if (!invokeResult?.ok) throw new Error(invokeResult?.message || "Adapter failed");
  } finally {
    // Leave the tab open so the user can confirm; comment out to auto-close.
    // await chrome.tabs.remove(tab.id);
  }
}

function waitForLoad(tabId) {
  return new Promise((resolve) => {
    const listener = (id, info) => {
      if (id === tabId && info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
        // Give SPAs a beat to hydrate before the adapter runs.
        setTimeout(resolve, 1500);
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
  });
}

function shortUrl(u) {
  try { const x = new URL(u); return x.hostname + x.pathname.slice(0, 32); }
  catch { return u.slice(0, 48); }
}
