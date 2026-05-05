// Menards product page adapter. Menards is mostly server-rendered, so
// the selectors tend to be stable plain HTML. TODO: confirm on real pages.
window.__bomAdapter = async ({ quantity, options }) => {
  const { waitFor, setInputValue, textEquals, sleep } = window.__bomHelpers;

  try {
    for (const [name, value] of Object.entries(options)) {
      // Menards renders variants as <select> dropdowns inside a form group
      // labelled with the option name, e.g. "Color:".
      const labels = [...document.querySelectorAll('label')];
      const label = labels.find((l) => new RegExp(`^\\s*${name}\\s*:?`, "i").test(l.textContent || ""));
      const select = label?.control || label?.parentElement?.querySelector('select');

      if (select) {
        const opt = [...select.options].find((o) => textEquals(o, value));
        if (!opt) throw new Error(`Option ${name}=${value} not available`);
        select.value = opt.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        // Fall back to swatch buttons.
        const choice = [...document.querySelectorAll('button, a')].find((b) => textEquals(b, value));
        if (!choice) throw new Error(`Could not find option ${name}=${value}`);
        choice.click();
      }
      await sleep(300);
    }

    const qty = await waitFor('input[name="qty"], input[name="quantity"], input[aria-label*="Quantity" i]');
    setInputValue(qty, quantity);

    const atc = await waitFor('button[name="addToCart"], button#addToCart, input[type="submit"][value*="Cart" i]', {
      predicate: (el) => !el.disabled,
    });
    atc.click();

    await waitFor('.cart-confirmation, [class*="addedToCart" i]', { timeoutMs: 8000 });
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message };
  }
};
