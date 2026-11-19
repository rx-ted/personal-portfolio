import { icon } from './icons';
import { SITE, UI, root, PALETTES, STYLES } from './state';
import { esc, applyPalette, applyStyle } from './utils';

export function setupSettingsPanel() {
  if (SITE.settingsPanel && SITE.settingsPanel.show === false) return;

  const currentPalette = function () { return root.getAttribute("data-palette") || "slate"; };
  const currentStyle = function () { return root.getAttribute("data-style") || "soft"; };
  const langOpts = (SITE.lang && SITE.lang.options) ? SITE.lang.options : [];
  const currentLang = SITE.lang && SITE.lang.current;

  const paletteNames: Record<string, string> = {
    slate: "Slate", forest: "Forest", sunset: "Sunset", violet: "Violet", rose: "Rose", ocean: "Ocean", mono: "Mono"
  };

  const wrap = document.createElement("div");
  wrap.className = "settings-wrap";
  wrap.innerHTML =
    '<button class="settings-fab" type="button" aria-label="' + esc(UI.settings) + '" aria-expanded="false" aria-controls="settings-panel">' + icon("settings") + '</button>' +
    '<div class="settings-panel" id="settings-panel" role="dialog" aria-label="' + esc(UI.settingsPanelAria) + '" aria-modal="false" hidden>' +
      '<div class="settings-panel__head">' +
        '<strong>' + esc(UI.settings) + '</strong>' +
        '<button class="settings-panel__close icon-btn" type="button" aria-label="' + esc(UI.close) + '">' + icon("close") + '</button>' +
      '</div>' +
      '<div class="settings-panel__body">' +
        '<div class="settings-item"><div class="settings-item__label">' + icon("palette") + '<span>' + esc(UI.colourTheme) + '</span></div>' +
          '<div class="settings-swatches" data-kind="palette">' +
            (PALETTES as readonly string[]).map(function (p) {
              return '<button type="button" class="settings-swatch" data-palette="' + esc(p) + '" title="' + esc(paletteNames[p] || p) + '" aria-label="' + esc(paletteNames[p] || p) + '"><span class="settings-swatch__dot settings-swatch__dot--' + esc(p) + '"></span></button>';
            }).join("") +
          '</div>' +
        '</div>' +
        '<div class="settings-item"><div class="settings-item__label">' + icon("palette") + '<span>' + esc(UI.layoutStyle) + '</span></div>' +
          '<div class="settings-segments" data-kind="style">' +
            (STYLES as readonly string[]).map(function (s) {
              var label = s === "flat" ? (UI.cmdkStyleFlat || "Flat") : (UI.cmdkStyleSoft || "Soft");
              return '<button type="button" class="settings-segment" data-style="' + esc(s) + '">' + esc(label) + '</button>';
            }).join("") +
          '</div>' +
        '</div>' +
        '<div class="settings-item"><div class="settings-item__label">' + icon("globe") + '<span>' + esc(UI.switchLanguage) + '</span></div>' +
          '<div class="settings-segments" data-kind="language">' +
            (langOpts.length ? langOpts.map(function (opt: any) {
              return '<button type="button" class="settings-segment" data-lang="' + esc(opt.locale) + '" data-href="' + esc(opt.href || "") + '">' + esc(opt.label || opt.locale) + '</button>';
            }).join("") : '<span class="settings-muted">—</span>') +
          '</div>' +
        '</div>' +
        '<div class="settings-item settings-item--action">' +
          '<button type="button" class="settings-action" data-action="print">' + icon("printer") + '<span>' + esc(UI.exportPdfPreview) + '</span></button>' +
        '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(wrap);

  const fab = wrap.querySelector(".settings-fab") as HTMLButtonElement;
  const panel = wrap.querySelector(".settings-panel") as HTMLElement;
  const closeBtn = wrap.querySelector(".settings-panel__close") as HTMLButtonElement;

  function syncActive() {
    const p = currentPalette();
    wrap.querySelectorAll("[data-palette]").forEach(function (b) {
      var on = b.getAttribute("data-palette") === p;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    });
    const s = currentStyle();
    wrap.querySelectorAll("[data-style]").forEach(function (b) {
      var on = b.getAttribute("data-style") === s;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    });
    wrap.querySelectorAll("[data-lang]").forEach(function (b) {
      var on = b.getAttribute("data-lang") === currentLang;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    });
  }
  syncActive();

  function openPanel() {
    panel.hidden = false;
    fab.setAttribute("aria-expanded", "true");
    syncActive();
    closeBtn.focus();
  }
  function closePanel() {
    panel.hidden = true;
    fab.setAttribute("aria-expanded", "false");
    fab.focus();
  }
  function togglePanel() {
    if (panel.hidden) openPanel(); else closePanel();
  }

  fab.addEventListener("click", togglePanel);
  closeBtn.addEventListener("click", closePanel);

  panel.addEventListener("click", function (e) {
    var rawTarget: any = e.target;
    var target: any = rawTarget && rawTarget.nodeType === 1 ? rawTarget : rawTarget && rawTarget.parentElement;
    if (!target || !target.closest) return;
    const pal = target.closest(".settings-swatch[data-palette]");
    if (pal) {
      const value = pal.getAttribute("data-palette");
      if (value) applyPalette(value);
      syncActive();
      return;
    }
    const st = target.closest(".settings-segment[data-style]");
    if (st) {
      const value = st.getAttribute("data-style");
      if (value) applyStyle(value);
      syncActive();
      return;
    }
    const langBtn = target.closest(".settings-segment[data-lang]");
    if (langBtn) {
      var href = langBtn.getAttribute("data-href");
      var loc = langBtn.getAttribute("data-lang");
      if (href && loc && loc !== currentLang) window.location.href = href;
      return;
    }
    const actionBtn = target.closest(".settings-action[data-action]") as HTMLButtonElement | null;
    if (!actionBtn || actionBtn.disabled) return;
    const action = actionBtn.getAttribute("data-action");
    if (action === "print") {
      closePanel();
      // Let the panel close paint before opening print dialog.
      setTimeout(function () { window.print(); }, 0);
      return;
    }
  });

  document.addEventListener("click", function (e) {
    if (!panel.hidden && !wrap.contains(e.target as Node)) closePanel();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) {
      e.preventDefault();
      closePanel();
    }
  });
}
