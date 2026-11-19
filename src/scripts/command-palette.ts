import { icon } from './icons';
import { SITE, UI, root, PALETTES, STYLES, reduceMotion } from './state';
import { esc, smoothScrollTo, applyPalette, applyStyle, copyText, showToast } from './utils';

export function setupCommandPalette() {
  if (SITE.nav && SITE.nav.commandPalette === false) return;

  const actions: Array<{ group: string; label: string; icon: string; keywords?: string; run: () => void }> = [];

  (SITE.sections || []).filter(function (s: any) { return s.show; }).forEach(function (s: any) {
    actions.push({ group: UI.cmdkGroupGoTo, label: s.nav, icon: "arrow-right", keywords: "section jump navigate " + s.id,
      run: function () { smoothScrollTo(s.id); } });
  });
  actions.push({ group: UI.cmdkGroupGoTo, label: UI.cmdkTop, icon: "arrow-up", keywords: "home hero start top",
    run: function () { window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); } });

  actions.push({ group: UI.cmdkGroupTheme, label: UI.cmdkToggleTheme, icon: "moon", keywords: "dark light night day theme mode contrast",
    run: function () {
      const t = document.getElementById("theme-toggle") as HTMLButtonElement | null;
      if (t) { t.click(); return; }
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
    } });
  (PALETTES as readonly string[]).forEach(function (p) {
    const name = p.charAt(0).toUpperCase() + p.slice(1);
    actions.push({ group: UI.cmdkGroupTheme, label: UI.cmdkAccent + " · " + name, icon: "palette", keywords: "colour color accent palette " + p,
      run: function () { applyPalette(p); showToast(UI.toastAccent + " " + name); } });
  });
  const STYLE_LABELS: Record<string, string> = { soft: UI.cmdkStyleSoft, flat: UI.cmdkStyleFlat };
  (STYLES as readonly string[]).forEach(function (s) {
    actions.push({ group: UI.cmdkGroupTheme, label: UI.cmdkStyle + " · " + (STYLE_LABELS[s] || s), icon: "palette",
      keywords: "layout style look view shape flat soft rounded editorial minimal " + s,
      run: function () { applyStyle(s); showToast(UI.toastStyle + " " + (STYLE_LABELS[s] || s)); } });
  });

  if (SITE.hero && SITE.hero.cv && SITE.hero.cv.show && SITE.hero.cv.file) {
    actions.push({ group: UI.cmdkGroupActions, label: SITE.hero.cv.label || "Download CV", icon: "download", keywords: "cv resume download pdf curriculum",
      run: function () { const a = document.createElement("a"); a.href = SITE.hero.cv.file; a.download = ""; document.body.appendChild(a); a.click(); a.remove(); } });
  }
  const email = (SITE.contact && SITE.contact.email) || "";
  if (email) {
    actions.push({ group: UI.cmdkGroupActions, label: UI.cmdkCopyEmail, icon: "copy", keywords: "copy email address contact " + email,
      run: function () { copyText(email).then(function () { showToast(UI.emailCopied); }).catch(function () { showToast(email); }); } });
    actions.push({ group: UI.cmdkGroupActions, label: UI.cmdkSendEmail, icon: "mail", keywords: "email mail write message contact " + email,
      run: function () { window.location.href = "mailto:" + email; } });
  }
  (SITE.social || []).filter(function (s: any) { return s.url && /^https?:\/\//i.test(s.url); }).forEach(function (s: any) {
    actions.push({ group: UI.cmdkGroupLinks, label: UI.cmdkOpen + " " + (s.label || s.icon), icon: s.icon, keywords: "social open link " + (s.label || "") + " " + s.icon,
      run: function () { window.open(s.url, "_blank", "noopener"); } });
  });

  if (SITE.lang) {
    var langOpts = (SITE.lang as any).options || ((SITE.lang as any).alternate ? [(SITE.lang as any).alternate] : []);
    var curLang = (SITE.lang as any).current;
    var altOpt: any = null;
    for (var li = 0; li < langOpts.length; li++) {
      if (langOpts[li] && langOpts[li].locale !== curLang) { altOpt = langOpts[li]; break; }
    }
    if (!altOpt && (SITE.lang as any).alternate) altOpt = (SITE.lang as any).alternate;
    if (altOpt && altOpt.href) {
      actions.push({ group: UI.cmdkGroupActions, label: (UI.switchLanguage || "Switch language") + " · " + (altOpt.label || altOpt.locale), icon: "globe", keywords: "language switch 中文 english locale lang",
        run: function () { window.location.href = altOpt.href; } });
    }
  }

  const overlay = document.createElement("div");
  overlay.className = "cmdk";
  overlay.hidden = true;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", UI.searchQuickActions);
  overlay.innerHTML =
    '<div class="cmdk__panel">' +
      '<div class="cmdk__search">' + icon("search") +
        '<input class="cmdk__input" type="text" role="combobox" aria-expanded="true" aria-controls="cmdk-list" aria-autocomplete="list" placeholder="' + esc(UI.cmdkPlaceholder) + '" autocomplete="off" spellcheck="false">' +
        '<kbd class="cmdk__esc">' + esc(UI.cmdkEsc) + '</kbd>' +
      "</div>" +
      '<ul class="cmdk__list" id="cmdk-list" role="listbox" aria-label="Results"></ul>' +
      '<div class="cmdk__foot"><span><kbd>↑</kbd><kbd>↓</kbd> ' + esc(UI.cmdkFootNav) + '</span><span><kbd>↵</kbd> ' + esc(UI.cmdkFootSelect) + '</span><span><kbd>esc</kbd> ' + esc(UI.cmdkFootClose) + '</span></div>' +
    "</div>";
  document.body.appendChild(overlay);
  const input = overlay.querySelector(".cmdk__input") as HTMLInputElement;
  const list = overlay.querySelector(".cmdk__list") as HTMLUListElement;

  let filtered: typeof actions = [];
  let activeIndex = 0;
  let lastFocused: Element | null = null;

  function render(q?: string) {
    const query = (q || "").trim().toLowerCase();
    filtered = actions.filter(function (a) {
      return !query || (a.label + " " + (a.keywords || "") + " " + a.group).toLowerCase().indexOf(query) > -1;
    });
    activeIndex = 0;
    if (!filtered.length) {
      list.innerHTML = '<li class="cmdk__empty">' + esc(UI.cmdkNoMatches) + '</li>';
      input.removeAttribute("aria-activedescendant");
      return;
    }
    let html = "", lastGroup: string | null = null;
    filtered.forEach(function (a, i) {
      if (a.group !== lastGroup) { html += '<li class="cmdk__group" role="presentation">' + esc(a.group) + "</li>"; lastGroup = a.group; }
      html += '<li class="cmdk__item" role="option" id="cmdk-opt-' + i + '" data-i="' + i + '">' +
        '<span class="cmdk__item-icon">' + icon(a.icon) + "</span>" +
        '<span class="cmdk__item-label">' + esc(a.label) + "</span></li>";
    });
    list.innerHTML = html;
    paintActive(true);
  }

  function paintActive(scroll: boolean) {
    const opts = list.querySelectorAll(".cmdk__item");
    opts.forEach(function (el) {
      const on = Number(el.getAttribute("data-i")) === activeIndex;
      el.classList.toggle("is-active", on);
      if (on) {
        el.setAttribute("aria-selected", "true");
        if (scroll) (el as HTMLElement).scrollIntoView({ block: "nearest" });
      } else {
        el.removeAttribute("aria-selected");
      }
    });
    input.setAttribute("aria-activedescendant", filtered.length ? "cmdk-opt-" + activeIndex : "");
  }

  function move(delta: number) {
    if (!filtered.length) return;
    activeIndex = (activeIndex + delta + filtered.length) % filtered.length;
    paintActive(true);
  }
  function runActive() {
    const a = filtered[activeIndex];
    if (!a) return;
    close();
    a.run();
  }
  function open() {
    if (!overlay.hidden) return;
    lastFocused = document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = "hidden";
    input.value = "";
    render("");
    requestAnimationFrame(function () { input.focus(); });
  }
  function close() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused && (lastFocused as HTMLElement).focus) (lastFocused as HTMLElement).focus();
  }

  input.addEventListener("input", function () { render(input.value); });
  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Enter") { e.preventDefault(); runActive(); }
    else if (e.key === "Home") { e.preventDefault(); activeIndex = 0; paintActive(true); }
    else if (e.key === "End") { e.preventDefault(); activeIndex = Math.max(0, filtered.length - 1); paintActive(true); }
    else if (e.key === "Tab") { e.preventDefault(); }   // keep focus inside the modal (the input is the only control)
  });
  list.addEventListener("click", function (e) {
    const t: any = e.target && (e.target as any).nodeType === 1 ? e.target : (e.target as any) && (e.target as any).parentElement;
    if (!t || !t.closest) return;
    const item = t.closest(".cmdk__item") as HTMLElement | null;
    if (!item) return;
    activeIndex = Number(item.getAttribute("data-i"));
    runActive();
  });
  list.addEventListener("mousemove", function (e) {
    const t: any = e.target && (e.target as any).nodeType === 1 ? e.target : (e.target as any) && (e.target as any).parentElement;
    if (!t || !t.closest) return;
    const item = t.closest(".cmdk__item") as HTMLElement | null;
    if (!item) return;
    const i = Number(item.getAttribute("data-i"));
    if (i !== activeIndex) { activeIndex = i; paintActive(false); }
  });
  overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });

  function isTyping(el: any) {
    if (!el) return false;
    const tag = (el.tagName || "").toLowerCase();
    return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable;
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !overlay.hidden) { e.preventDefault(); close(); return; }
    if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      if (overlay.hidden) open(); else close();
      return;
    }
    if (e.key === "/" && overlay.hidden && !isTyping(e.target)) { e.preventDefault(); open(); }
  });
  const openBtn = document.getElementById("cmdk-open");
  if (openBtn) openBtn.addEventListener("click", open);
}
