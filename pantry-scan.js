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
      !Number.isFinite(fraction) ||
      fraction <= 0 ||
      fraction > 1
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
    s.pantry.push({
      id: i.id,
      qty: total,
      always: false,
      ...(old?.qty > 0 && old.useSoon ? { useSoon: old.useSoon } : {}),
    });
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
  // Absolute stock correction is idempotent and never repeats recipe deductions.
  function setRemaining(s, ingredients, id, expected, remaining) {
    const old = s.pantry.find((x) => x.id === id);
    if (!ingredients[id] || !old || old.always)
      throw Error("Choose a measured item already in your pantry.");
    if (old.qty !== expected)
      throw Error("Stock changed. Scan again before updating it.");
    if (!Number.isFinite(remaining) || remaining < 0 || remaining > old.qty)
      throw Error("Check the amount left.");
    const removed = old.qty - remaining;
    if (remaining === 0) s.pantry = s.pantry.filter((x) => x.id !== id);
    else old.qty = remaining;
    return removed;
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
    return async function lookup(
      value,
      matches = {},
      signal,
      waitForRateLimit = false,
    ) {
      const waitUntil = async (time) => {
        const ms = time - now();
        if (!waitForRateLimit || ms <= 0) return;
        await new Promise((resolve, reject) => {
          const cancel = () => {
            clearTimeout(timer);
            reject(Error("Cancelled"));
          };
          const timer = setTimeout(() => {
            signal?.removeEventListener("abort", cancel);
            resolve();
          }, ms);
          if (signal?.aborted) cancel();
          else signal?.addEventListener("abort", cancel, { once: true });
        });
      };
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
      await waitUntil(next.off);
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
      if (relay) await waitUntil(next.upc);
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
      "Scan your pantry",
      `<div id="scan-root"><div class="scan-modes" role="group" aria-label="Scan action"><button type="button" id="scan-add-mode" aria-pressed="true">Add stock</button><button type="button" id="scan-use-mode" aria-pressed="false">Update amount left</button></div><p id="scan-mode-help" class="helper">Scan, check, add. Keep going until your cupboard is done.</p><button type="button" class="text-btn" id="scan-plan" hidden>Open meal plan</button><p id="scan-session" role="status"></p><div id="scan-capture"><div class="scan-viewfinder"><video id="scan-video" playsinline muted hidden aria-label="Barcode camera preview"></video><div class="scan-target" aria-hidden="true"><span>▥</span></div><p>Line up the barcode</p></div><div class="scan-tools"><button type="button" class="button" id="scan-camera">Start camera</button><button type="button" class="button secondary" id="scan-photo-open">Use photo</button><input id="scan-photo" type="file" accept="image/*" capture="environment" hidden aria-label="Barcode photo"><button type="button" class="text-btn" id="scan-stop" hidden>Pause camera</button></div><details><summary>Enter barcode number instead</summary><form id="barcode-number-form"><label for="barcode-number">Barcode number</label><input id="barcode-number" inputmode="numeric" autocomplete="off" maxlength="24" required><button class="button" type="submit">Look up barcode</button></form></details></div><p id="scan-status" role="status" aria-live="polite"></p><div id="scan-result"></div><div class="scan-footer"><button type="button" class="button secondary" id="scan-done">Done</button><details><summary>About scanning</summary><p class="helper">Photos stay on this device. New barcodes are looked up with Open Food Facts and the UPC backup. Saved matches work offline.</p><button type="button" id="scan-forget" class="text-btn">Forget remembered barcode matches</button></details></div></div>`,
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
      selected = null,
      mode = "add",
      savedCount = 0,
      cameraSession = false,
      photoMode = false,
      reviewing = false,
      previousCode = "",
      needsClear = false;
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
      dialog.classList.remove("scanner-sheet");
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
    dialog.classList.add("scanner-sheet");
    async function found(code, fromCamera = false) {
      reviewing = true;
      if (!fromCamera) stop();
      controller?.abort();
      controller = new AbortController();
      const token = epoch,
        signal = controller.signal;
      q("#scan-result").innerHTML = "";
      current = null;
      status("Looking up product…");
      try {
        const p = await lookup(code, getState().barcodeMatches, signal, true);
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
      cameraSession = true;
      photoMode = false;
      reviewing = false;
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
          if (!alive || token !== epoch) return;
          if (!r) {
            needsClear = false;
            return;
          }
          if (reviewing) return;
          try {
            const code = barcode(r.getText());
            if (needsClear && code === previousCode) return;
            previousCode = code;
            needsClear = true;
            found(code, true);
          } catch {
            /* Keep scanning non-product/invalid codes. */
          }
        });
        if (!alive || token !== epoch) c.stop();
        else controls = c;
      } catch (e) {
        if (alive && token === epoch) {
          const restoreFocus = [q("#scan-stop"), q("#scan-camera")].includes(document.activeElement);
          stop();
          if (restoreFocus) q("#scan-camera").focus();
          status(
            e.name === "NotAllowedError"
              ? "Camera permission was denied. Use a barcode photo or allow camera access in Safari/browser settings."
              : "Camera could not start. Try a barcode photo or enter its number.",
          );
        }
      }
    };
    q("#scan-stop").onclick = () => {
      cameraSession = false;
      stop();
      status("Camera paused.");
      q("#scan-camera").focus();
    };
    q("#scan-photo-open").onclick = () => {
      cameraSession = false;
      photoMode = true;
      q("#scan-photo").click();
    };
    q("#scan-photo").onchange = async (ev) => {
      cameraSession = false;
      photoMode = true;
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
      cameraSession = false;
      photoMode = false;
      found(q("#barcode-number").value);
    };
    q("#scan-forget").onclick = () => {
      const button = q("#scan-forget");
      if (q("#scan-forget-confirm")) return;
      const box = document.createElement("div");
      box.id = "scan-forget-confirm";
      box.innerHTML =
        '<p>Forget remembered barcode matches? Pantry amounts stay unchanged.</p><button type="button" class="button secondary" id="scan-forget-yes">Forget matches</button> <button type="button" class="text-btn" id="scan-forget-no">Cancel</button>';
      button.after(box);
      q("#scan-forget-no").onclick = () => {
        box.remove();
        button.focus();
      };
      q("#scan-forget-yes").onclick = () => {
        if (
          commit((s) => {
            s.barcodeMatches = {};
          }, "Barcode matches forgotten.")
        ) {
          box.remove();
          status("Barcode matches forgotten. Pantry stock is unchanged.");
        }
      };
    };
    function nextScan(saved = false) {
      current = null;
      selected = null;
      reviewing = false;
      needsClear = true;
      q("#scan-result").innerHTML = "";
      q("#scan-capture").hidden = false;
      q("#barcode-number").value = "";
      status(saved ? "Saved. Ready for the next item." : "Skipped. Nothing was saved. Ready for the next item.");
      dialog.scrollTop = 0;
      if (cameraSession && stream) {
        status(`${saved ? "Saved." : "Skipped. Nothing was saved."} Move the item away, then scan the next barcode.`);
        q("#scan-stop").focus();
      } else if (cameraSession) {
        q("#scan-camera").click();
        q(q("#scan-stop").hidden ? "#scan-camera" : "#scan-stop").focus();
      } else if (photoMode) q("#scan-photo-open").focus();
      else {
        q("#barcode-number").closest("details").open = true;
        q("#barcode-number").focus();
      }
    }
    q("#scan-done").onclick = () => {
      dispose();
      close();
    };
    q("#scan-plan").onclick = () => {
      dispose();
      close();
      root.location.hash = "plan";
    };
    function setMode(value) {
      mode = value;
      q("#scan-plan").hidden = mode !== "use";
      q("#scan-add-mode").setAttribute("aria-pressed", mode === "add");
      q("#scan-use-mode").setAttribute("aria-pressed", mode === "use");
      q("#scan-mode-help").textContent =
        mode === "add"
          ? "Scan, check, add. Keep going until your cupboard is done."
          : "Set the total left in your pantry. Cooked a planned meal? Mark it cooked in Plan instead: that deducts its ingredients once.";
      if (current) review(current);
    }
    q("#scan-add-mode").onclick = () => setMode("add");
    q("#scan-use-mode").onclick = () => setMode("use");
    function review(p) {
      current = p;
      selected = null;
      q("#scan-capture").hidden = true;
      status(
        p.name
          ? "Found — confirm below to save."
          : p.issue || "Product not found. Give it a name to add it.",
      );
      const all = ingredients(),
        list =
          mode === "use"
            ? getState()
                .pantry.filter((x) => !x.always)
                .map((x) => all[x.id])
                .filter(Boolean)
            : candidates(p, all);
      let expected = 0,
        submitted = false;
      q("#scan-result").innerHTML =
        `<form id="scan-confirm-form" class="scan-card"><div class="scan-product"><span class="scan-product-icon" aria-hidden="true">▥</span><div><h3 id="scan-product-title" tabindex="-1">${esc(p.name || "Unknown product")}</h3><p>${esc(p.brand || "")} ${esc(p.size || "")}</p></div></div><p id="scan-selection" class="helper"></p><div id="scan-amount"><label for="scan-fraction">${mode === "use" ? "Total stock left" : "How much is left in each pack?"} <output id="scan-percent">100%</output></label><input id="scan-fraction" type="range" min="${mode === "use" ? 0 : 0.05}" max="1" step="0.05" value="1"><div class="scan-presets">${(mode ===
        "use"
          ? [
              [0, "Empty"],
              [0.25, "¼"],
              [0.5, "½"],
              [1, "All left"],
            ]
          : [
              [0.25, "¼"],
              [0.5, "½"],
              [0.75, "¾"],
              [1, "Full"],
            ]
        )
          .map(
            ([value, label]) =>
              `<button type="button" data-fraction="${value}">${label}</button>`,
          )
          .join(
            "",
          )}</div><div id="scan-pack-row"><label for="scan-packs">Packs</label><div class="quantity-stepper"><button type="button" id="scan-minus" aria-label="Fewer packs">−</button><input id="scan-packs" type="number" inputmode="numeric" min="1" max="100" step="1" value="1" required><button type="button" id="scan-plus" aria-label="More packs">+</button></div></div><p id="scan-preview" class="scan-preview" aria-live="polite"></p><button type="submit" id="scan-save" class="button wide">${mode === "use" ? "Save & scan next" : "Add & scan next"}</button></div><p id="scan-error" role="alert"></p><details id="scan-edit"><summary>${mode === "use" ? "Choose pantry item / enter amount" : "Edit product / link to recipes"}</summary><label for="scan-product-name">Product name</label><input id="scan-product-name" maxlength="80" value="${esc(p.name)}" required><div class="scan-matches">${list
          .slice(0, 8)
          .map(
            (i) =>
              `<button type="button" class="button secondary" data-match="${esc(i.id)}">${esc(C.ingredientLabel(i))}</button>`,
          )
          .join(
            "",
          )}</div><label for="scan-ingredient">${mode === "use" ? "Pantry item" : "Recipe ingredient (optional)"}</label><input id="scan-ingredient" list="scan-options" placeholder="Search ingredients"><datalist id="scan-options">${Object.values(
          all,
        )
          .filter(
            (i) =>
              mode === "add" ||
              getState().pantry.some((x) => x.id === i.id && !x.always),
          )
          .map(
            (i) =>
              `<option value="${esc(C.ingredientLabel(i))}">${esc(i.unit)}</option>`,
          )
          .join(
            "",
          )}</datalist>${mode === "add" ? '<button type="button" id="scan-custom" class="text-btn">Keep as a separate product</button>' : ""}<label for="scan-qty">${mode === "use" ? "Total amount left (all packs)" : "Usable amount in one full pack"}</label><input id="scan-qty" type="number" inputmode="decimal" min="${mode === "use" ? 0 : 0.001}" max="1000000" step="any" required><label for="scan-unit">Unit</label><select id="scan-unit"><option value="g">g</option><option value="ml">ml</option><option value="each">items</option><option value="tsp">tsp</option></select><p class="helper">For drained ingredients, enter usable drained weight. Link only equivalent ingredients, not a sauce or ready meal to one ingredient.</p><label class="check-label"><input type="checkbox" id="scan-remember" checked>Remember this product for next time</label><p id="scan-existing" class="helper"></p></details><button type="button" id="scan-skip" class="text-btn">Skip this item</button><p class="scan-source">${p.provider ? `Found via ${esc(p.provider)}` : "Barcode " + esc(p.code)}${p.provider === "Open Food Facts" ? ` · <a href="https://world.openfoodfacts.org/product/${p.code}" target="_blank" rel="noopener noreferrer">Open Food Facts · ODbL</a>` : ""}</p></form>`;
      const update = () => {
        const fraction = +q("#scan-fraction").value;
        q("#scan-percent").textContent = Math.round(fraction * 100) + "%";
        q("#scan-fraction").setAttribute(
          "aria-valuetext",
          Math.round(fraction * 100) + " percent left",
        );
        const amount =
          mode === "use"
            ? +q("#scan-qty").value
            : +q("#scan-qty").value * +q("#scan-packs").value * fraction;
        q("#scan-preview").textContent = selected
          ? `${mode === "use" ? "Leave" : "Add"} ${Math.round(amount * 1000) / 1000} ${q("#scan-unit").value} ${mode === "use" ? "in" : "to"} pantry`
          : "Choose the pantry item below.";
        q("#scan-save").disabled = !selected;
      };
      const choose = (id) => {
        selected = id;
        const i = all[id],
          old = getState().pantry.find((x) => x.id === id);
        if (mode === "use" && (!old || old.always)) selected = null;
        expected = old?.qty || 0;
        // Separate new products use base units; an existing pantry match must
        // retain its own unit, including kg, litres and tablespoons.
        q("#scan-unit").innerHTML = [...new Set(["g", "ml", "each", ...(i ? [i.unit] : [])])]
          .map((unit) => `<option value="${esc(unit)}">${unit === "each" ? "items" : esc(unit)}</option>`)
          .join("");
        q("#scan-unit").disabled = !!i;
        q("#scan-unit").value = i?.unit || p.amount?.unit || "each";
        q("#scan-ingredient").value = i ? C.ingredientLabel(i) : "";
        if (!p.name && i) q("#scan-product-name").value = i.name;
        q("#scan-qty").value =
          mode === "use"
            ? expected
            : p.amount?.unit === q("#scan-unit").value
              ? p.amount.qty
              : id === "new" && !p.amount
                ? 1
                : "";
        if (
          mode === "add" &&
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
        q("#scan-fraction").value = 1;
        q("#scan-pack-row").hidden = mode === "use";
        q("#scan-packs").required = mode === "add";
        q("#scan-product-name").required = mode === "add";
        q("#scan-selection").textContent =
          mode === "use"
            ? selected
              ? `${i.name}: ${expected} ${i.unit} currently in pantry, across all packs.`
              : "No saved pantry match. Choose an existing item below."
            : i
              ? `Adds to ${i.name}.`
              : "Will be added as a separate product. Link to recipes in Edit if needed.";
        q("#scan-existing").textContent = old?.always
          ? "Always-stocked item: edit it in Pantry before measuring amounts."
          : mode === "use"
            ? "This replaces the total left; it does not subtract the recipe again."
            : `Full pack: ${p.size || "size unavailable — using one item"}. Confirm the amount before adding.`;
        q("#scan-edit").open =
          !selected || !q("#scan-qty").value || (!p.name && mode === "add");
        update();
      };
      q("#scan-result")
        .querySelectorAll("[data-match]")
        .forEach((b) => (b.onclick = () => choose(b.dataset.match)));
      q("#scan-custom")?.addEventListener("click", () => choose("new"));
      q("#scan-ingredient").oninput = () => {
        selected = null;
        update();
      };
      q("#scan-ingredient").onchange = (ev) => {
        const i = C.resolveIngredient(ev.target.value, Object.values(all));
        if (i) choose(i.id);
      };
      q("#scan-fraction").oninput = () => {
        if (mode === "use")
          q("#scan-qty").value =
            Math.round(expected * +q("#scan-fraction").value * 1000) / 1000;
        update();
      };
      q("#scan-result")
        .querySelectorAll("[data-fraction]")
        .forEach(
          (b) =>
            (b.onclick = () => {
              q("#scan-fraction").value = b.dataset.fraction;
              q("#scan-fraction").oninput();
            }),
        );
      q("#scan-minus").onclick = () => {
        q("#scan-packs").value = Math.max(1, +q("#scan-packs").value - 1);
        update();
      };
      q("#scan-plus").onclick = () => {
        q("#scan-packs").value = Math.min(100, +q("#scan-packs").value + 1);
        update();
      };
      q("#scan-packs").oninput = update;
      q("#scan-qty").oninput = () => {
        if (mode === "use")
          q("#scan-fraction").value = expected
            ? +q("#scan-qty").value / expected
            : 0;
        update();
      };
      q("#scan-unit").onchange = () => {
        q("#scan-qty").value = "";
        q("#scan-edit").open = true;
        update();
      };
      q("#scan-skip").onclick = () => nextScan(false);
      q("#scan-confirm-form").addEventListener(
        "invalid",
        () => {
          q("#scan-edit").open = true;
          q("#scan-error").textContent =
            "Check the product name and amount below.";
        },
        true,
      );
      q("#scan-confirm-form").onsubmit = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        if (!alive || submitted || !selected || current !== p) return;
        const name = q("#scan-product-name").value.trim();
        if (mode === "add" && !name) {
          q("#scan-edit").open = true;
          q("#scan-error").textContent = "Enter a product name.";
          return;
        }
        const choice = {
          ingredientId: selected,
          qty: +q("#scan-qty").value,
          unit: q("#scan-unit").value,
          packs: +q("#scan-packs").value,
          fraction: +q("#scan-fraction").value,
          remember: q("#scan-remember").checked,
        };
        submitted = true;
        const ok = commit(
          (s) =>
            mode === "use"
              ? setRemaining(s, ingredients(), selected, expected, choice.qty)
              : add(s, ingredients(), { ...p, name }, choice),
          mode === "use" ? "Pantry amount updated." : "Item saved to pantry.",
        );
        if (ok) {
          savedCount++;
          q("#scan-session").textContent =
            `✓ ${savedCount} saved · ${name || p.name || "Item"}`;
          nextScan(true);
        } else {
          submitted = false;
          q("#scan-error").textContent =
            "Not saved. Check the amount and pantry match. If browser storage is unavailable, free space or export a backup in Settings.";
          q("#scan-edit").open = true;
        }
      };
      choose(
        p.saved && all[p.saved.ingredientId]
          ? p.saved.ingredientId
          : all["custom-barcode-" + p.code]
            ? "custom-barcode-" + p.code
            : mode === "add"
              ? "new"
              : "",
      );
      dialog.scrollTop = 0;
      q("#scan-product-title").focus({ preventScroll: true });
    }
    q("#scan-camera").click();
    return dispose;
  }
  const api = {
    barcode,
    quantity,
    product,
    candidates,
    restoreMatches,
    add,
    setRemaining,
    lookupClient,
    openUI,
  };
  api.lookup = lookupClient({
    relay: root.PLATES_BARCODE_CONFIG?.upcRelay || "",
  });
  root.PlatesBarcode = api;
  if (typeof module !== "undefined") module.exports = api;
})(globalThis);
