/* Cooking dialog: checklist persistence uses the app's atomic save path. */
(function (root) {
  "use strict";
  const C = root.PlatesCore;
  const esc = (s) =>
    String(s ?? "").replace(
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
  root.PlatesCooking = {
    openUI({
      kind,
      id,
      recipes,
      ingredients,
      amount,
      modal,
      getState,
      commit,
      numberInput,
      unmeasuredNotice,
      confirmRestart,
      reopen,
    }) {
      const view = () => C.cookingView(getState(), kind, id, recipes);
      const first = view();
      modal(
        "Cooking · " + esc(first.recipe.name),
        '<div id="cooking-panel"></div>',
      );
      const panel = document.getElementById("cooking-panel"),
        sheet = panel.closest("dialog");
      let disposed = false,
        lock = null,
        requested = false,
        acquiring = false,
        wakeMessage = "";
      const state = () => view().saved || { checked: [], timers: [] };
      const button = (label, action, value = "") =>
        `<button type="button" class="button secondary" data-cook="${action}" data-value="${esc(value)}">${esc(label)}</button>`;
      const check = (key, label, checked, cls = "") =>
        `<label class="cook-check ${cls}"><input type="checkbox" data-cook-check="${esc(key)}" ${checked.includes(key) ? "checked" : ""}><span>${label}</span></label>`;
      function draw() {
        if (disposed) return;
        const v = view(),
          p = state(),
          focus = document.activeElement?.dataset?.cookCheck;
        if (v.stale) {
          panel.innerHTML = `<p class="notice">This meal's portions, side or recipe changed. Start an updated checklist to use the current quantities. This clears its old checks and timers.</p>${button("Start updated checklist", "restart")}`;
          return;
        }
        panel.innerHTML = `<p class="helper">${v.record.servings} portions · Progress saves on this device. Checking an item does not use pantry stock.</p>${v.stored ? '<p class="notice">The main meal is already cooked. Use its storage and reheating guidance in Recipe. Only the fresh side is listed below.</p>' : ""}<p id="cooking-progress" class="cook-progress"></p><div class="action-wrap cook-jumps">${v.groups.length ? button("Ingredients", "jump", "cook-ingredients-0") + button("Method", "jump", "cook-method-0") : ""}${button("Timers", "jump", "cook-timers-heading")}</div><div class="cook-tools">${button(requested ? "Allow screen to sleep" : "Keep screen awake", "wake")}<span id="wake-status" class="helper" role="status"></span></div>${v.groups.map((g, index) => `<section class="cook-group"><h3>${esc(g.name)}</h3><h4 id="cook-ingredients-${index}" tabindex="-1">Get ingredients ready</h4>${g.ingredients.map((i) => check(i.key, `${esc(ingredients()[i.id]?.name || i.id)} <strong>${esc(amount(i.id, i.qty))}</strong>`, p.checked)).join("")}${g.unmeasured?.length ? unmeasuredNotice(g.unmeasured) : ""}<h4 id="cook-method-${index}" tabindex="-1">Method</h4>${g.source ? `<a class="button wide" href="${esc(g.source.url)}" target="_blank" rel="noopener noreferrer">Open method at ${esc(g.source.publisher)} ↗</a><p class="helper">The full method opens on the publisher's website. Return here for your saved checklist and timers.</p>${check(g.methodKey, "Finished following this method", p.checked)}` : g.steps.length ? `${g.steps.map((s, n) => check(s.key, `<small>Step ${n + 1}</small>${esc(s.text)}`, p.checked, "cook-step")).join("")}` : '<p class="helper">Follow your usual preparation instructions for this side.</p>'}</section>`).join("")}${!v.groups.length ? "<p>No fresh ingredients are needed for this stored meal.</p>" : ""}<section class="cook-group"><h3 id="cook-timers-heading" tabindex="-1">Timers</h3><p class="helper">Timers keep their finish time when you leave. Alerts are shown here; use a phone alarm if you leave the app or lock your screen.</p><div id="cooking-timers"></div><div id="cooking-alert" role="status" aria-live="polite"></div><form id="cooking-timer-form"><label for="cooking-timer-label">Timer name (optional)</label><input id="cooking-timer-label" maxlength="60" placeholder="e.g. Pasta"><label for="cooking-timer-minutes">Minutes</label>${numberInput("cooking-timer-minutes", 10, 1, 720, "timer minutes")}<button class="button section-space" type="submit">Start timer</button></form></section><p class="helper">When the food is ready, record it below. Ingredients or stored portions are deducted once through the normal meal workflow.</p><button type="button" class="button wide" data-act="${kind === "batch" ? "batch-finish" : "plan-finish"}" data-id="${esc(id)}">${kind === "batch" ? "Cooked — store portions" : v.stored ? "Record meal eaten" : "Record meal cooked"}</button>`;
        drawTimers();
        updateProgress();
        showWake();
        if (focus)
          [...panel.querySelectorAll("[data-cook-check]")]
            .find((x) => x.dataset.cookCheck === focus)
            ?.focus();
      }
      function updateProgress() {
        const checks = [...panel.querySelectorAll("[data-cook-check]")],
          node = panel.querySelector("#cooking-progress");
        if (node)
          node.textContent = `${checks.filter((x) => x.checked).length} of ${checks.length} checks complete`;
      }
      function drawTimers() {
        const node = panel.querySelector("#cooking-timers");
        if (!node) return;
        node.innerHTML = state()
          .timers.map(
            (t) =>
              `<div class="cook-timer"><strong>${esc(t.label)}</strong><output role="timer" aria-live="off" data-timer-clock="${esc(t.id)}" aria-label="${esc(t.label)} remaining"></output><div class="action-wrap">${button(t.endAt === null ? "Resume" : "Pause", t.endAt === null ? "resume" : "pause", t.id)}${button("Remove " + t.label, "remove", t.id)}</div></div>`,
          )
          .join("");
        tick();
      }
      function tick() {
        if (disposed || !panel.isConnected) return;
        const expired = [];
        for (const t of state().timers) {
          const node = [...panel.querySelectorAll("[data-timer-clock]")].find(
            (x) => x.dataset.timerClock === t.id,
          );
          if (!node) continue;
          const seconds = Math.ceil(C.timerRemaining(t) / 1000);
          node.textContent = seconds
            ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}${t.endAt === null ? " · Paused" : ""}`
            : "Time's up";
          const pause = node.parentNode.querySelector(
            '[data-cook="pause"], [data-cook="resume"]',
          );
          if (pause) pause.disabled = seconds === 0;
          if (!seconds) expired.push(t.label);
        }
        const alert = panel.querySelector("#cooking-alert");
        const message = expired.length
          ? expired.join(", ") + ": time's up. Check your food."
          : "";
        if (alert && alert.textContent !== message) alert.textContent = message;
      }

      function showWake() {
        const node = panel.querySelector("#wake-status");
        if (node)
          node.textContent =
            wakeMessage ||
            (lock && !lock.released
              ? "Screen stays awake while this cooking view is visible."
              : "If unavailable, adjust your phone's screen timeout or tap the screen occasionally.");
        const control = panel.querySelector('[data-cook="wake"]');
        if (control) {
          control.textContent = requested
            ? "Allow screen to sleep"
            : "Keep screen awake";
          control.setAttribute("aria-pressed", String(requested));
        }
      }
      async function acquire() {
        if (
          disposed ||
          !requested ||
          acquiring ||
          (lock && !lock.released) ||
          document.visibilityState === "hidden"
        )
          return;
        if (!navigator.wakeLock?.request) {
          requested = false;
          wakeMessage =
            "Screen-awake is unavailable. Adjust your phone's screen timeout or tap the screen occasionally.";
          showWake();
          return;
        }
        acquiring = true;
        try {
          const acquired = await navigator.wakeLock.request("screen");
          if (disposed || !requested) {
            await acquired.release();
            return;
          }
          lock = acquired;
          wakeMessage = "";
          acquired.addEventListener("release", () => {
            if (lock === acquired) {
              lock = null;
              wakeMessage =
                "Screen-awake was released. Tap Keep screen awake to retry.";
              if (document.visibilityState !== "hidden") requested = false;
              showWake();
            }
          });
        } catch {
          requested = false;
          wakeMessage =
            "Screen-awake could not start. Adjust your phone's screen timeout or tap the screen occasionally.";
        } finally {
          acquiring = false;
          if (!disposed) showWake();
        }
      }
      function visibility() {
        tick();
        if (document.visibilityState === "visible" && requested) acquire();
      }
      function save(fn) {
        return commit(() => fn(view()));
      }
      panel.addEventListener("change", (ev) => {
        const key = ev.target.dataset.cookCheck;
        if (!key) return;
        ev.stopPropagation();
        if (!save((v) => C.checkCooking(getState(), v, key, ev.target.checked)))
          ev.target.checked = !ev.target.checked;
        updateProgress();
      });
      panel.addEventListener("click", (ev) => {
        const b = ev.target.closest("[data-cook]");
        if (!b) return;
        ev.stopPropagation();
        const action = b.dataset.cook;
        if (action === "jump") {
          const target = document.getElementById(b.dataset.value);
          target?.scrollIntoView({ block: "start" });
          target?.focus({ preventScroll: true });
        } else if (action === "wake") {
          requested = !requested;
          wakeMessage = "";
          if (requested) acquire();
          else {
            const old = lock;
            lock = null;
            old?.release().catch(() => {});
          }
          showWake();
        } else if (action === "restart")
          confirmRestart(() => {
            if (commit(() => C.restartCooking(getState(), view()))) reopen();
          });
        else if (
          save((v) =>
            C.changeCookingTimer(getState(), v, b.dataset.value, action),
          )
        )
          drawTimers();
      });
      panel.addEventListener("submit", (ev) => {
        if (ev.target.id !== "cooking-timer-form") return;
        ev.preventDefault();
        ev.stopPropagation();
        const label = panel.querySelector("#cooking-timer-label"),
          minutes = panel.querySelector("#cooking-timer-minutes");
        if (
          save((v) =>
            C.addCookingTimer(getState(), v, label.value, +minutes.value),
          )
        ) {
          label.value = "";
          drawTimers();
        }
      });
      draw();
      const interval = setInterval(tick, 1000);
      document.addEventListener("visibilitychange", visibility);
      function cleanup() {
        if (disposed) return;
        disposed = true;
        requested = false;
        clearInterval(interval);
        document.removeEventListener("visibilitychange", visibility);
        sheet.removeEventListener("close", onClose);
        sheet.removeEventListener("cancel", cleanup);
        const old = lock;
        lock = null;
        old?.release().catch(() => {});
      }
      // A close event can arrive after another dialog has already reopened.
      function onClose() {
        if (!sheet.open) cleanup();
      }
      sheet.addEventListener("close", onClose);
      sheet.addEventListener("cancel", cleanup);
      return cleanup;
    },
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
