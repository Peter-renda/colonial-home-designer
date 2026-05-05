// Shared helpers used by adapter scripts. Adapters can copy/paste these
// inline if you'd rather not inject a second file, but factoring them out
// keeps the per-site code focused on selectors.
window.__bomHelpers = {
  // Polls for the first element matching `selector` (or the first one for
  // which `predicate(el)` is true). Resolves with the element, rejects
  // after `timeoutMs`.
  waitFor(selector, { timeoutMs = 10000, root = document, predicate } = {}) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const tick = () => {
        const matches = root.querySelectorAll(selector);
        for (const el of matches) {
          if (!predicate || predicate(el)) return resolve(el);
        }
        if (Date.now() - start > timeoutMs) {
          return reject(new Error(`Timed out waiting for: ${selector}`));
        }
        setTimeout(tick, 150);
      };
      tick();
    });
  },

  // Native-event setter that React/Vue input bindings actually notice.
  setInputValue(input, value) {
    const proto = Object.getPrototypeOf(input);
    const desc = Object.getOwnPropertyDescriptor(proto, "value");
    desc?.set?.call(input, String(value));
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  },

  // Case-insensitive text match for picking a swatch/option button.
  textEquals(el, value) {
    return (el.textContent || "").trim().toLowerCase() === value.trim().toLowerCase();
  },

  sleep(ms) { return new Promise((r) => setTimeout(r, ms)); },
};
