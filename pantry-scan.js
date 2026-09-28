/* Barcode lookup and confirmed pantry additions. No camera frames leave the device. */
(function (root) {
  "use strict";
  const C = root.PlatesCore;
  const clean = (s, n = 180) =>
    typeof s === "string" ? s.trim().slice(0, n) : "";
  function barcode(value) {
    const s = String(value || "").replace(/[\s-]/g, "");
    if (!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(s))
      throw Error("Use an 8, 12, 13 or 14 digit product barcode.");
    let sum = 0;
    for (let i = s.length - 2, weight = 3; i >= 0; i--, weight = 4 - weight)
      sum += +s[i] * weight;
    if ((10 - (sum % 10)) % 10 !== +s.at(-1))
      throw Error("That barcode's check digit does not match. Try again.");
    // UPC-A and its zero-prefixed EAN-13 represent the same product.
    return s.length === 12 ? "0" + s : s;
  }
  function quantity(text) {
    const s = clean(text).toLowerCase().replace(/,/g, ".");
    // Avoid treating one unit of a multipack as the whole package.
    if (/\d\s*(?:x|×)|pack of|multipack|\d\s*[- ]?pack/.test(s)) return null;
    const m = s.match(/(?:^|\s)(\d+(?:\.\d+)?)\s*(kg|g|ml|cl|l|oz|lb)(?:\b|$)/);
    if (!m) return null;
    const factor = {
      kg: 1000,
      g: 1,
      ml: 1,
      cl: 10,
      l: 1000,
      oz: 28.3495,
      lb: 453.592,
    }[m[2]];
    const qty = Math.round(+m[1] * factor * 1000) / 1000;
    return qty > 0 && qty <= 1e6
      ? { qty, unit: ["ml", "cl", "l"].includes(m[2]) ? "ml" : "g" }
      : null;
  }
  function product(data, provider, code) {
    const p = provider === "Open Food Facts" ? data?.product : data?.items?.[0];
    if (!p) return null;
    const returned = p.code || p.ean || p.upc;
    if (returned) {
      try {
        if (barcode(returned) !== code) return null;
      } catch {
        return null;
      }
    }
    const name = clean(p.product_name || p.product_name_en || p.title);
    if (!name) return null;
    const size = clean(p.quantity || p.size || p.weight);
    return {
      code,
      name,
      brand: clean(p.brands || p.brand),
      size,
      amount: quantity(size),
      provider,
    };
  }
  function candidates(p, ingredients) {
    const words = C.text(p.name)
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 2);
    const aliases = {
      pasta: /\b(penne|fusilli|spaghetti|rigatoni|macaroni)\b/i,
      "tomato-tin": /\b(chopped|tinned|canned) tomatoes\b/i,
    };
    return Object.values(ingredients)
      .map((i) => ({
        i,
        score:
          (aliases[i.id]?.test(p.name) ? 8 : 0) +
          words.filter((w) =>
            C.text(i.name)
              .split(/[^a-z0-9]+/)
              .includes(w),
          ).length *
            2 +
          (C.text(i.name) === C.text(p.name) ? 20 : 0),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.i.name.localeCompare(b.i.name))
      .slice(0, 8)
      .map((x) => x.i);
  }
  function restoreMatches(raw, ingredients) {
    const out = {};
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
    for (const [key, p] of Object.entries(raw).slice(-500)) {
      try {
        const code = barcode(key),
          i = ingredients[p?.ingredientId];
        if (
          !i ||
          p.unit !== i.unit ||
          !Number.isFinite(p.qty) ||
          p.qty <= 0 ||
          p.qty > 1e6
        )
          continue;
        out[code] = {
          ingredientId: i.id,
          unit: i.unit,
          qty: p.qty,
          name: clean(p.name),
          confirmedAt: clean(p.confirmedAt, 40),
        };
      } catch {
        /* Discard optional invalid matches, never pantry stock. */
      }
    }
    return out;
  }
  function add(s, ingredients, p, choice) {
    const code = barcode(p.code),
      qty = Number(choice.qty),
      packs = Number(choice.packs),
      fraction = Number(choice.fraction);
    if (
      !Number.isFinite(qty) ||
      qty <= 0 ||
      qty > 1e6 ||
      !Number.isInteger(packs) ||
      packs < 1 ||
      packs > 100 ||
      ![1, 0.5, 0.25].includes(fraction)
    )
      throw Error("Check the amount and number of packs.");
    let i = ingredients[choice.ingredientId];
    if (!i) {
      if (
        choice.ingredientId !== "new" ||
        !["g", "ml", "each"].includes(choice.unit)
      )
        throw Error("Choose a pantry ingredient and its unit.");
      i = {
        id: "custom-barcode-" + code,
        name: clean(p.name, 80) || "Product " + code,
        unit: choice.unit,
        group: "Other",
      };
      const existing = ingredients[i.id];
      if (existing && existing.unit !== i.unit)
        throw Error(
          "This product already has a different unit. Select its existing pantry entry.",
        );
    }
    if (i.unit !== choice.unit)
      throw Error("The amount must use the selected ingredient's unit.");
    const delta = Math.round(qty * packs * fraction * 1000) / 1000,
      old = s.pantry.find((x) => x.id === i.id);
    if (old?.always)
      throw Error(
        "This ingredient is marked always stocked. Edit it in Pantry before adding a measured amount.",
      );
    const total = (old?.qty || 0) + delta;
    if (total > 1e7) throw Error("The pantry amount is too large.");
    if (!ingredients[i.id]) s.custom[i.id] = i;
    s.pantry = s.pantry.filter((x) => x.id !== i.id);
    s.pantry.push({ id: i.id, qty: total, always: false });
    s.barcodeMatches = restoreMatches(s.barcodeMatches, {
      ...ingredients,
      [i.id]: i,
    });
    if (choice.remember) {
      delete s.barcodeMatches[code];
      s.barcodeMatches[code] = {
        ingredientId: i.id,
        unit: i.unit,
        qty,
        name: clean(p.name),
        confirmedAt: new Date().toISOString(),
      };
      const keys = Object.keys(s.barcodeMatches);
      if (keys.length > 500) delete s.barcodeMatches[keys[0]];
    } else delete s.barcodeMatches[code];
    return delta;
  }
  function lookupClient({
    fetcher = root.fetch?.bind(root),
    relay = "",
    now = Date.now,
  } = {}) {
    const next = { off: 0, upc: 0 };
    async function request(url, signal) {
      const controller = new AbortController(),
        cancel = () => controller.abort();
      signal?.addEventListener("abort", cancel, { once: true });
      const timer = setTimeout(cancel, 8000);
      try {
        if (signal?.aborted) throw Error("Cancelled");
        const r = await fetcher(url, {
          signal: controller.signal,
          credentials: "omit",
          referrerPolicy: "no-referrer",
        });
        if (!r.ok)
          throw Error(
            r.status === 429
              ? "Lookup limit reached. Try again later."
              : "Product service unavailable.",
          );
        return await r.json();
      } finally {
        clearTimeout(timer);
        signal?.removeEventListener("abort", cancel);
      }
    }
    return async function lookup(value, matches = {}, signal) {
      const code = barcode(value),
        saved = matches[code];
      if (saved)
        return {
          code,
          name: saved.name || "Product " + code,
          provider: "Your confirmed match",
          size: "",
          amount: { qty: saved.qty, unit: saved.unit },
          saved,
        };
      let issue = "";
      if (now() >= next.off) {
        next.off = now() + 4100;
        try {
          const d = await request(
            "https://world.openfoodfacts.org/api/v2/product/" +
              code +
              ".json?fields=code,product_name,product_name_en,brands,quantity&app_name=ThreePlates",
            signal,
          );
          const p = product(d, "Open Food Facts", code);
          if (p) return p;
        } catch (err) {
          issue = err.message;
        }
      } else issue = "Please wait a few seconds between new product lookups.";
      if (signal?.aborted) throw Error("Cancelled");
      if (relay && now() >= next.upc) {
        next.upc = now() + 10100;
        try {
          const u = new URL(relay);
          if (u.protocol !== "https:")
            throw Error("UPC backup needs an HTTPS relay.");
          u.searchParams.set("barcode", code);
          const d = await request(u.href, signal);
          const p = product(d, "UPCitemdb", code);
          if (p) return p;
        } catch (err) {
          issue = err.message;
        }
      }
      if (signal?.aborted) throw Error("Cancelled");
      return {
        code,
        name: "",
        provider: "",
        size: "",
        amount: null,
        issue: issue || "No product found.",
        backupAvailable: !!relay,
      };
    };
  }
  if (C) {
    const defaults = C.defaults,
      migrate = C.migrate;
    C.defaults = () => ({ ...defaults(), barcodeMatches: {} });
    C.migrate = (raw, recipes, ingredients) => {
      const s = migrate(raw, recipes, ingredients);
      s.barcodeMatches = restoreMatches(raw.barcodeMatches, {
        ...ingredients,
        ...s.custom,
      });
      return s;
    };
  }
  let library;
  function loadLibrary() {
    if (root.ZXingBrowser) return Promise.resolve(root.ZXingBrowser);
    if (!library)
      library = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "./vendor/zxing-browser-0.2.1.min.js";
        script.onload = () => resolve(root.ZXingBrowser);
        script.onerror = () => {
          script.remove();
          library = null;
          reject(
            Error(
              "Scanner could not load. Reload or enter the barcode number.",
            ),
          );
        };
        document.head.append(script);
      });
    return library;
  }
  function openUI({ modal, close, commit, getState, ingredients }) {
    const esc = (x) =>
      String(x ?? "").replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[c],
      );
    modal(
      "Scan into pantry",
      `<div id="scan-root"><p>Scan a food barcode, then check the ingredient and amount before adding it.</p><div class="action-wrap"><button type="button" class="button" id="scan-camera">Start camera</button><button type="button" class="button secondary" id="scan-photo-open">Take / choose barcode photo</button><input id="scan-photo" type="file" accept="image/*" capture="environment" hidden aria-label="Barcode photo"></div><video id="scan-video" playsinline muted hidden aria-label="Barcode camera preview"></video><button type="button" class="button secondary" id="scan-stop" hidden>Stop camera</button><p class="helper">Keep the whole barcode in focus with good light. Photos are read on this device, not uploaded. This reads barcodes, not food photos.</p><details><summary>Enter barcode number instead</summary><form id="barcode-number-form"><label for="barcode-number">Barcode number</label><input id="barcode-number" inputmode="numeric" autocomplete="off" maxlength="24" required><button class="button" type="submit">Look up barcode</button></form></details><p id="scan-status" role="status" aria-live="polite"></p><div id="scan-result"></div><p class="helper">New barcodes are sent to Open Food Facts${root.PLATES_BARCODE_CONFIG?.upcRelay ? ", then UPCitemdb if needed" : ". UPC backup is awaiting setup"}. Confirmed matches stay in your browser and are included in backups.</p><button type="button" id="scan-forget" class="text-btn">Forget remembered barcode matches</button></div>`,
    );
    const el = document.getElementById("scan-root"),
      q = (s) => el.querySelector(s),
      dialog = el.closest("dialog"),
      lookup = api.lookup;
    let alive = true,
      epoch = 0,
      controls = null,
      stream = null,
      controller = null,
      reader = null,
      current = null,
      selected = null;
    const status = (t) => {
      if (alive) q("#scan-status").textContent = t;
    };
    function stop() {
      epoch++;
      controls?.stop();
      controls = null;
      stream?.getTracks().forEach((t) => t.stop());
      stream = null;
      const v = q("video");
      v.srcObject = null;
      v.hidden = true;
      q("#scan-stop").hidden = true;
      q("#scan-camera").disabled = false;
    }
    function dispose() {
      alive = false;
      controller?.abort();
      stop();
      document.removeEventListener("visibilitychange", visibility);
      root.removeEventListener("pagehide", dispose);
      dialog.removeEventListener("close", dispose);
      dialog.removeEventListener("cancel", dispose);
    }
    function visibility() {
      if (document.hidden) {
        stop();
        controller?.abort();
        status("Camera stopped while the app is in the background.");
      }
    }
    dialog.addEventListener("close", dispose);
    dialog.addEventListener("cancel", dispose);
    document.addEventListener("visibilitychange", visibility);
    root.addEventListener("pagehide", dispose);
    async function found(code) {
      stop();
      controller?.abort();
      controller = new AbortController();
      const token = epoch,
        signal = controller.signal;
      q("#scan-result").innerHTML = "";
      status("Looking up product…");
      try {
        const p = await lookup(code, getState().barcodeMatches, signal);
        if (!alive || epoch !== token || signal.aborted) return;
        review(p);
      } catch (e) {
        if (alive && !signal.aborted) status(e.message);
      }
    }
    async function makeReader() {
      const z = await loadLibrary();
      return new z.BrowserMultiFormatReader(new Map([[2, [6, 7, 8, 14]]]), {
        delayBetweenScanAttempts: 200,
        delayBetweenScanSuccess: 500,
      });
    }
    q("#scan-camera").onclick = async () => {
      stop();
      controller?.abort();
      const token = epoch;
      q("#scan-camera").disabled = true;
      q("#scan-stop").hidden = false;
      status("Allow camera access to scan a barcode.");
      try {
        if (!navigator.mediaDevices?.getUserMedia)
          throw Error(
            "Camera access is unavailable. Try a barcode photo instead.",
          );
        reader = await makeReader();
        if (!alive || token !== epoch) return;
        const acquired = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (!alive || token !== epoch) {
          acquired.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = acquired;
        q("video").hidden = false;
        status("Point the rear camera at the barcode.");
        const c = await reader.decodeFromStream(stream, q("video"), (r) => {
          if (!r || !alive || token !== epoch) return;
          try {
            const code = barcode(r.getText());
            found(code);
          } catch {
            /* Keep scanning non-product/invalid codes. */
          }
        });
        if (!alive || token !== epoch) c.stop();
        else controls = c;
      } catch (e) {
        if (alive && token === epoch) {
          stop();
          status(
            e.name === "NotAllowedError"
              ? "Camera permission was denied. Use a barcode photo or allow camera access in Safari/browser settings."
              : "Camera could not start. Try a barcode photo or enter its number.",
          );
        }
      }
    };
    q("#scan-stop").onclick = () => {
      stop();
      status("Camera stopped.");
    };
    q("#scan-photo-open").onclick = () => q("#scan-photo").click();
    q("#scan-photo").onchange = async (ev) => {
      stop();
      controller?.abort();
      const token = epoch,
        file = ev.target.files?.[0];
      ev.target.value = "";
      if (!file) return;
      if (file.size > 20 * 1024 * 1024) {
        status("Choose a photo smaller than 20 MB.");
        return;
      }
      let url;
      try {
        status("Reading barcode from photo…");
        const r = await makeReader();
        if (!alive || token !== epoch) return;
        url = URL.createObjectURL(file);
        const result = await r.decodeFromImageUrl(url);
        if (alive && token === epoch) await found(barcode(result.getText()));
      } catch {
        status(
          "No readable barcode found. Try a closer, sharp photo of the whole barcode, or enter its number.",
        );
      } finally {
        if (url) URL.revokeObjectURL(url);
      }
    };
    q("#barcode-number-form").onsubmit = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      found(q("#barcode-number").value);
    };
    q("#scan-forget").onclick = () => {
      if (
        confirm(
          "Forget all remembered barcode matches? Pantry amounts will stay unchanged.",
        )
      )
        commit((s) => {
          s.barcodeMatches = {};
        }, "Barcode matches forgotten.");
    };
    function review(p) {
      current = p;
      selected = null;
      status(
        p.name ? "Product found. Check its pantry match and amount." : p.issue,
      );
      const list = candidates(p, ingredients());
      q("#scan-result").innerHTML =
        `<form id="scan-confirm-form"><h3>${esc(p.name || "Unrecognised product")}</h3><p>${esc(p.brand || "")} ${esc(p.size || "")}</p>${p.provider ? `<p class="helper">Found via ${esc(p.provider)}${p.provider === "Open Food Facts" ? ` · <a href="https://world.openfoodfacts.org/product/${p.code}" target="_blank" rel="noopener noreferrer">Open Food Facts · ODbL</a>` : ""}</p>` : ""}<p class="helper">Barcode ${p.code}. Choose what this counts as in recipes. Do not match a ready meal or sauce to one of its individual ingredients.</p><div class="scan-matches">${list.map((i) => `<button type="button" class="button secondary" data-match="${esc(i.id)}">${esc(i.name)} (${esc(i.unit)})</button>`).join("")}</div><label for="scan-ingredient">Pantry ingredient</label><input id="scan-ingredient" list="scan-options" placeholder="Choose or search ingredients"><datalist id="scan-options">${Object.values(
          ingredients(),
        )
          .map(
            (i) =>
              `<option value="${esc(i.name)} [${esc(i.id)}]">${esc(i.unit)}</option>`,
          )
          .join(
            "",
          )}</datalist><button type="button" id="scan-custom" class="text-btn">Keep as a separate product (not matched to recipes)</button><div id="scan-amount" hidden><label for="scan-product-name">Product name</label><input id="scan-product-name" maxlength="80" value="${esc(p.name)}" required><label for="scan-qty">Usable amount in one full pack</label><input id="scan-qty" type="number" inputmode="decimal" min="0.001" max="1000000" step="any" required><label for="scan-unit">Unit</label><select id="scan-unit"><option value="g">g</option><option value="ml">ml</option><option value="each">items</option><option value="tsp">tsp</option></select><p class="helper">Check the pack label. For tinned beans or fish use drained weight when the recipe ingredient expects it. Never treat grams as a number of pieces.</p><label for="scan-packs">Number of packs</label><div class="quantity-stepper"><button type="button" id="scan-minus" aria-label="Fewer packs">−</button><input id="scan-packs" type="number" inputmode="numeric" min="1" max="100" step="1" value="1" required><button type="button" id="scan-plus" aria-label="More packs">+</button></div><label for="scan-fraction">Amount left in each pack</label><select id="scan-fraction"><option value="1">Full pack</option><option value="0.5">Half pack</option><option value="0.25">Quarter pack</option></select><label class="check-label"><input type="checkbox" id="scan-remember" checked>Remember this barcode, ingredient and full pack amount</label><p class="helper" id="scan-existing"></p><button type="submit" class="button wide">Confirm and add to pantry</button></div></form>`;
      const choose = (id) => {
        selected = id;
        const i = ingredients()[id];
        q("#scan-amount").hidden = false;
        if (!p.name && i) q("#scan-product-name").value = i.name;
        q("#scan-unit").disabled = !!i;
        q("#scan-unit").value = i?.unit || p.amount?.unit || "g";
        q("#scan-ingredient").value = i
          ? `${i.name} [${i.id}]`
          : "Separate product";
        q("#scan-qty").value =
          p.amount?.unit === q("#scan-unit").value ? p.amount.qty : "";
        if (
          !p.saved &&
          ([
            "chickpeas",
            "kidney-beans",
            "black-beans",
            "cannellini",
            "butter-beans",
            "sweetcorn",
            "tuna",
            "cooked-lentils",
          ].includes(id) ||
            /drained/i.test(i?.name || ""))
        )
          q("#scan-qty").value = "";
        const old = getState().pantry.find((x) => x.id === id);
        q("#scan-existing").textContent = old?.always
          ? "Already marked always stocked. Edit that pantry entry first."
          : `Adds to existing stock${old ? `: ${old.qty} ${i.unit}` : ""}; it does not replace it.`;
      };
      q("#scan-result")
        .querySelectorAll("[data-match]")
        .forEach((b) => (b.onclick = () => choose(b.dataset.match)));
      q("#scan-custom").onclick = () => choose("new");
      q("#scan-ingredient").oninput = () => {
        selected = null;
        q("#scan-amount").hidden = true;
      };
      q("#scan-ingredient").onchange = (ev) => {
        const i = Object.values(ingredients()).find(
          (i) => `${i.name} [${i.id}]` === ev.target.value,
        );
        if (i) choose(i.id);
      };
      q("#scan-minus").onclick = () =>
        (q("#scan-packs").value = Math.max(1, +q("#scan-packs").value - 1));
      q("#scan-plus").onclick = () =>
        (q("#scan-packs").value = Math.min(100, +q("#scan-packs").value + 1));
      q("#scan-unit").onchange = () => {
        q("#scan-qty").value = "";
      };
      q("#scan-confirm-form").onsubmit = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        if (!alive || !selected) return;
        const choice = {
          ingredientId: selected,
          qty: +q("#scan-qty").value,
          unit: q("#scan-unit").value,
          packs: +q("#scan-packs").value,
          fraction: +q("#scan-fraction").value,
          remember: q("#scan-remember").checked,
        };
        const p = { ...current, name: q("#scan-product-name").value };
        const ok = commit(
          (s) => add(s, ingredients(), p, choice),
          "Scanned item added to pantry.",
        );
        if (ok) {
          dispose();
          close();
        }
      };
      if (p.saved && ingredients()[p.saved.ingredientId])
        choose(p.saved.ingredientId);
    }
    return dispose;
  }
  const api = {
    barcode,
    quantity,
    product,
    candidates,
    restoreMatches,
    add,
    lookupClient,
    openUI,
  };
  api.lookup = lookupClient({
    relay: root.PLATES_BARCODE_CONFIG?.upcRelay || "",
  });
  root.PlatesBarcode = api;
  if (typeof module !== "undefined") module.exports = api;
})(globalThis);
