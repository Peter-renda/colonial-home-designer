// Architectural Depot product page adapter. The site uses a Volusion-style
// storefront with classic <select> option dropdowns and a numeric qty input.
// TODO: confirm selectors on a real product page.
window.__bomAdapter = async ({ quantity, options }) => {
  const { waitFor, setInputValue, textEquals, sleep } = window.__bomHelpers;

  try {
    for (const [name, value] of Object.entries(options)) {
      // Option groups appear as <select> elements with a name like
      // "options[Color]" or labelled "Color:" above them.
      const select = [...document.querySelectorAll('select')].find((s) => {
        const lbl = (s.closest('tr,div,li,form')?.textContent || "").toLowerCase();
        return lbl.includes(name.toLowerCase()) || (s.name || "").toLowerCase().includes(name.toLowerCase());
      });
      if (!select) throw new Error(`Could not find option group "${name}"`);
      const opt = [...select.options].find((o) => textEquals(o, value) || o.value.toLowerCase() === value.toLowerCase());
      if (!opt) throw new Error(`Option ${name}=${value} not available`);
      select.value = opt.value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      await sleep(300);
    }

    const qty = await waitFor('input[name="QTY"], input[name="quantity"], input[id*="qty" i]');
    setInputValue(qty, quantity);

    const atc = await waitFor('input[type="image"][alt*="Add to Cart" i], button[name*="addToCart" i], input[name="addtocart"], a[href*="addtocart" i]', {
      predicate: (el) => !el.disabled,
    });
    atc.click();

    // Architectural Depot navigates to the cart page after ATC; wait for that.
    await waitFor('h1, .cart-title, [class*="cart" i]', { timeoutMs: 10000, predicate: (el) => /cart/i.test(el.textContent || "") });
    return { ok: true };
  } catch (err) {
    return { ok: false, message: err.message };
  }
};
