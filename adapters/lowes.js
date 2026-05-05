// Lowe's product page adapter — same shape as home-depot.js, different
// selectors. TODO: verify and tighten by inspecting real product pages.
window.__bomAdapter = async ({ quantity, options }) => {
  const { waitFor, setInputValue, textEquals, sleep } = window.__bomHelpers;

  try {
    for (const [name, value] of Object.entries(options)) {
      const groupLabel = new RegExp(name, "i");
      const groups = [...document.querySelectorAll('[data-selector*="variation"], [class*="VariantSelector"]')];
      const group = groups.find((g) => groupLabel.test(g.textContent || ""));
      const choices = (group ?? document).querySelectorAll('button, a[role="button"], [role="radio"]');
      const choice = [...choices].find((b) => textEquals(b, value) || (b.getAttribute("aria-label") || "").toLowerCase().includes(value.toLowerCase()));
      if (!choice) throw new Error(`Could not find option ${name}=${value}`);
      choice.click();
      await sleep(400);
    }

    const qty = await waitFor('input[aria-label*="Quantity" i], input[name="quantity"]');
    setInputValue(qty, quantity);

    const atc = await waitFor('button[data-selector*="addToCart" i], button[aria-label*="Add to Cart" i]', {
      predicate: (el) => !el.disabled,
    });
    atc.click();

    await waitFor('[data-selector*="atc-confirmation" i], [aria-label*="added to cart" i]', { timeoutMs: 8000 });
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message };
  }
};
