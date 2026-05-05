// Home Depot product page adapter.
//
// Strategy: select any options, click Add-to-Cart once, return.
// Quantity adjustment for qty>1 is handled by the orchestrator visiting
// the cart page and calling adapters/home-depot-cart.js. This avoids the
// repeat-ATC anti-bot footprint and survives HD's post-ATC navigations.
window.__bomAdapter = async ({ quantity, options }) => {
  const { waitFor, textEquals, sleep } = window.__bomHelpers;

  try {
    await dismissOverlays();

    for (const [name, value] of Object.entries(options)) {
      await pickOption(name, value);
      await sleep(400);
    }

    const atc = await findAddToCartButton();
    atc.click();

    // Best-effort wait so the click registers before the page navigates.
    // Don't await confirmation — HD often navigates the tab to a "you
    // added this" interstitial which kills our isolated world.
    await sleep(500);

    const productId = extractProductId(location.pathname);
    return { ok: true, productId, needsCartUpdate: quantity > 1, quantity };
  } catch (err) {
    return { ok: false, message: err.message };
  }

  function extractProductId(pathname) {
    // /p/SLUG/202094293 or /pep/SLUG-SKU/204711640 — last numeric segment.
    const m = pathname.match(/\/(\d{6,})(?:\/|$)/);
    return m ? m[1] : null;
  }

  async function dismissOverlays() {
    const closers = document.querySelectorAll(
      'button[aria-label*="close" i], button[data-testid*="close" i], button[class*="close" i]'
    );
    for (const c of closers) {
      try { c.click(); } catch {}
    }
  }

  async function pickOption(name, value) {
    const lcValue = value.toLowerCase();
    const groups = [...document.querySelectorAll(
      '[data-testid*="option" i], [data-component*="option" i], [class*="ProductOption" i], [class*="variant" i]'
    )];
    const groupRegex = new RegExp(name, "i");
    const group = groups.find((g) => groupRegex.test(g.textContent || ""));
    const candidates = (group ?? document).querySelectorAll('button, [role="radio"], a[role="button"]');
    const choice = [...candidates].find((b) =>
      textEquals(b, value) ||
      (b.getAttribute("aria-label") || "").toLowerCase().includes(lcValue) ||
      (b.title || "").toLowerCase().includes(lcValue)
    );
    if (!choice) throw new Error(`Could not find option ${name}=${value}`);
    choice.click();
  }

  async function findAddToCartButton() {
    const direct = document.querySelector('button[data-testid*="add-to-cart" i]');
    if (direct && !direct.disabled) return direct;

    const aria = [...document.querySelectorAll('button')].find(
      (b) => /add.*to.*cart/i.test(b.getAttribute("aria-label") || "") && !b.disabled
    );
    if (aria) return aria;

    const text = [...document.querySelectorAll('button')].find(
      (b) => /add to cart/i.test(b.textContent || "") && !b.disabled
    );
    if (text) return text;

    return await waitFor('button', {
      timeoutMs: 8000,
      predicate: (b) => /add to cart/i.test(b.textContent || "") && !b.disabled,
    });
  }
};
