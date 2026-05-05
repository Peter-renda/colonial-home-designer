// Home Depot cart-page adapter.
//
// Called after the product-page adapter has fired ATC. Locates the line
// item for `productId`, sets its quantity input to `quantity`. Tries
// multiple selector shapes since HD has revised the cart layout repeatedly.
window.__bomCartAdapter = async ({ productId, quantity }) => {
  const { waitFor, setInputValue, sleep } = window.__bomHelpers;

  try {
    if (!productId) throw new Error("Missing productId for cart update");

    // Find a cart line whose anchor link contains the product ID. This is
    // more stable than relying on per-line data attributes.
    const line = await waitFor('[class*="cart" i] a, [class*="CartItem" i] a, li a', {
      timeoutMs: 15_000,
      predicate: (a) => (a.href || "").includes(productId),
    });
    const row = line.closest('[class*="CartItem" i], [class*="cartItem" i], li, article, tr') || line.parentElement;
    if (!row) throw new Error("Could not isolate cart line");

    // Quantity input within the line.
    const input = row.querySelector(
      'input[type="number"], input[name*="quantity" i], input[aria-label*="quantity" i], input[data-testid*="quantity" i]'
    );
    if (input) {
      setInputValue(input, quantity);
      // HD's React handler usually saves on blur.
      input.dispatchEvent(new Event("blur", { bubbles: true }));
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      await sleep(800);
      return { ok: true };
    }

    // Stepper fallback.
    const plus = row.querySelector(
      'button[aria-label*="increase" i], button[aria-label*="plus" i], button[data-testid*="increment" i]'
    );
    if (plus) {
      // Assume current qty is 1 (we just added it).
      for (let i = 1; i < quantity; i++) {
        plus.click();
        await sleep(120);
      }
      return { ok: true };
    }

    throw new Error("No quantity control on cart line");
  } catch (err) {
    return { ok: false, message: err.message };
  }
};
