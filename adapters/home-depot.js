// Home Depot product page adapter.
//
// Strategy: pick option swatches by visible label, set quantity, click ATC.
// Selectors below are best-guess starting points — open a few real product
// pages, inspect the DOM, and tighten them. Home Depot ships a React SPA
// with frequently-changing class names, so prefer data-testid attributes
// where they exist.
window.__bomAdapter = async ({ quantity, options }) => {
  const { waitFor, setInputValue, textEquals, sleep } = window.__bomHelpers;

  try {
    // 1. Pick options (color, finish, size, …). Home Depot renders options
    //    as buttons inside a "Product Overview" panel.
    for (const [name, value] of Object.entries(options)) {
      const groupLabel = new RegExp(name, "i");
      const groups = [...document.querySelectorAll('[data-testid*="product-option"], [class*="ProductOption"]')];
      const group = groups.find((g) => groupLabel.test(g.textContent || ""));
      const buttons = (group ?? document).querySelectorAll('button, [role="radio"]');
      const choice = [...buttons].find((b) => textEquals(b, value) || (b.getAttribute("aria-label") || "").toLowerCase().includes(value.toLowerCase()));
      if (!choice) throw new Error(`Could not find option ${name}=${value}`);
      choice.click();
      await sleep(400);
    }

    // 2. Quantity input.
    const qty = await waitFor('input[data-testid="quantity-adjuster-input"], input[aria-label*="Quantity" i], input[name="quantity"]');
    setInputValue(qty, quantity);

    // 3. Add to cart.
    const atc = await waitFor('button[data-testid="add-to-cart-button"], button[aria-label*="Add to Cart" i]', {
      predicate: (el) => !el.disabled,
    });
    atc.click();

    // 4. Wait for confirmation toast / mini-cart.
    await waitFor('[data-testid="mini-cart"], [class*="cart-confirm" i], [aria-label*="Added to cart" i]', { timeoutMs: 8000 });

    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message };
  }
};
