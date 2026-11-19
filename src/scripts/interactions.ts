import { icon } from './icons';
import { SITE, UI, root, reduceMotion } from './state';
import { esc, copyText, showToast } from './utils';

export function setupInteractions() {
  // ---- Light / dark toggle -----------------------------------------
  const themeToggle = document.getElementById("theme-toggle") as HTMLButtonElement | null;
  function paintToggle() {
    if (!themeToggle) return;
    const dark = root.getAttribute("data-theme") === "dark";
    themeToggle.innerHTML = dark ? icon("sun") : icon("moon");
    themeToggle.setAttribute("aria-label", dark ? UI.switchToLight : UI.switchToDark);
    const tc = document.querySelector('meta[name="theme-color"]');
    if (tc) tc.setAttribute("content", dark ? "#0b1120" : "#ffffff");
  }
  paintToggle();
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      paintToggle();
    });
  }

  // ---- Mobile menu --------------------------------------------------
  const navToggle = document.getElementById("nav-toggle") as HTMLButtonElement | null;
  const navLinks = document.getElementById("nav-links") as HTMLElement | null;
  function closeMenu() {
    if (!navLinks) return;
    navLinks.classList.remove("is-open");
    if (navToggle) { navToggle.setAttribute("aria-expanded", "false"); navToggle.setAttribute("aria-label", UI.openMenu); navToggle.innerHTML = icon("menu"); }
  }
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      const open = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? UI.closeMenu : UI.openMenu);
      navToggle.innerHTML = open ? icon("close") : icon("menu");
    });
  }

  // ---- Smooth scroll for in-page links + focus the target ----------
  document.addEventListener("click", function (e) {
    const t: any = e.target && (e.target as any).nodeType === 1 ? e.target : (e.target as any) && (e.target as any).parentElement;
    if (!t || !t.closest) return;
    const a = t.closest('a[href^="#"]') as HTMLAnchorElement | null;
    if (!a) return;
    const id = a.getAttribute("href")!.slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    closeMenu();
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    if (history.replaceState) history.replaceState(null, "", "#" + id);
    // Move keyboard focus to the section we jumped to (accessibility).
    target.setAttribute("tabindex", "-1");
    (target as HTMLElement).focus({ preventScroll: true });
  });

  // ---- Reading progress + back-to-top + sticky navbar shadow -------
  const backTop = document.getElementById("back-to-top") as HTMLButtonElement | null;
  const navbarEl = document.getElementById("navbar");
  const progressEl = document.getElementById("scroll-progress") as HTMLElement | null;
  if (backTop) {
    backTop.hidden = false;
    backTop.innerHTML = icon("arrow-up");
    backTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }
  let ticking = false;
  function updateScroll() {
    const y = window.scrollY || (window as any).pageYOffset;
    if (navbarEl) navbarEl.classList.toggle("is-stuck", y > 8);
    if (backTop) backTop.classList.toggle("is-visible", y > 600);
    if (progressEl) {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      progressEl.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateScroll);
  }, { passive: true });
  updateScroll();   // set the initial state

  // ---- Scroll-reveal animation -------------------------------------
  const reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  // ---- Active section highlighting (navbar + optional dot-rail) -----
  const sectionEls = Array.prototype.slice.call(document.querySelectorAll("main .section")) as HTMLElement[];

  // Build the optional dot-rail
  const dotRail = document.getElementById("dot-rail") as HTMLElement | null;
  if (dotRail && SITE.nav && SITE.nav.showDotRail) {
    dotRail.hidden = false;
    dotRail.innerHTML = (SITE.sections || []).filter(function (s: any) { return s.show; }).map(function (s: any) {
      return '<a href="#' + s.id + '" aria-label="' + esc(s.nav) + '">' +
        '<span class="dot-rail__label">' + esc(s.nav) + "</span></a>";
    }).join("");
  }

  function setActive(id: string) {
    document.querySelectorAll(".navbar__link").forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
    });
    if (dotRail) dotRail.querySelectorAll("a").forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
    });
  }
  if ("IntersectionObserver" in window && sectionEls.length) {
    const spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) setActive((entry.target as HTMLElement).id); });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sectionEls.forEach(function (s) { spy.observe(s); });
  }

  // ---- Gallery lightbox -------------------------------------------
  setupGalleryLightbox();

  // ---- Stats count-up ---------------------------------------------
  setupStatsCountUp();

  // ---- Optional typewriter on the hero name ------------------------
  setupTypewriter();
}

function setupGalleryLightbox() {
  const galleryItems = Array.prototype.slice.call(document.querySelectorAll(".gallery__item")) as HTMLElement[];
  if (galleryItems.length) {
    const photos = galleryItems.map(function (btn) {
      const img = btn.querySelector("img");
      return {
        src: btn.getAttribute("data-full") || "",
        caption: btn.getAttribute("data-caption") || "",
        alt: img ? (img as HTMLImageElement).alt : "",
      };
    });
    const multiple = photos.length > 1;

    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.hidden = true;
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", UI.imageViewer);
    lb.innerHTML =
      '<button class="lightbox__close" type="button" aria-label="' + esc(UI.closeImageViewer) + '">' + icon("close") + "</button>" +
      (multiple
        ? '<button class="lightbox__nav lightbox__nav--prev" type="button" aria-label="' + esc(UI.prevPhoto) + '">' + icon("chevron-left") + "</button>" +
          '<button class="lightbox__nav lightbox__nav--next" type="button" aria-label="' + esc(UI.nextPhoto) + '">' + icon("chevron-right") + "</button>"
        : "") +
      '<figure class="lightbox__figure"><img class="lightbox__img" alt=""><figcaption class="lightbox__caption"></figcaption></figure>';
    document.body.appendChild(lb);
    const lbImg = lb.querySelector(".lightbox__img") as HTMLImageElement;
    const lbCap = lb.querySelector(".lightbox__caption") as HTMLElement;
    const lbClose = lb.querySelector(".lightbox__close") as HTMLButtonElement;
    let lastFocused: Element | null = null;
    let current = 0;

    function showPhoto(i: number) {
      current = (i + photos.length) % photos.length;   // wrap around both ends
      const p = photos[current];
      lbImg.src = p.src; lbImg.alt = p.alt || p.caption || "";
      lbCap.textContent = p.caption;
      lbCap.style.display = p.caption ? "" : "none";
    }
    function openLightbox(i: number) {
      showPhoto(i);
      lb.hidden = false;
      document.body.style.overflow = "hidden";
      lastFocused = document.activeElement;
      lbClose.focus();
    }
    function closeLightbox() {
      lb.hidden = true;
      document.body.style.overflow = "";
      if (lastFocused && (lastFocused as HTMLElement).focus) (lastFocused as HTMLElement).focus();
    }
    galleryItems.forEach(function (btn, i) {
      btn.addEventListener("click", function () { openLightbox(i); });
    });
    lbClose.addEventListener("click", closeLightbox);
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
    if (multiple) {
      const prev = lb.querySelector(".lightbox__nav--prev") as HTMLButtonElement;
      const next = lb.querySelector(".lightbox__nav--next") as HTMLButtonElement;
      prev.addEventListener("click", function () { showPhoto(current - 1); });
      next.addEventListener("click", function () { showPhoto(current + 1); });
    }
    document.addEventListener("keydown", function (e) {
      if (lb.hidden) return;
      if (e.key === "Escape") closeLightbox();
      else if (multiple && e.key === "ArrowLeft") { e.preventDefault(); showPhoto(current - 1); }
      else if (multiple && e.key === "ArrowRight") { e.preventDefault(); showPhoto(current + 1); }
    });
  }
}

function setupStatsCountUp() {
  const statValues = document.querySelectorAll(".stat__value");
  if (statValues.length && !reduceMotion && "IntersectionObserver" in window) {
    const parseStat = function (txt: string | null) {
      const m = String(txt).match(/^(\D*)(\d[\d,]*)(.*)$/);
      return m ? { prefix: m[1], num: parseInt(m[2].replace(/,/g, ""), 10), suffix: m[3] } : null;
    };
    const run = function (el: Element) {
      const p = parseStat(el.getAttribute("data-value"));
      if (!p) return;
      const dur = 1100, start = performance.now();
      (function step(now) {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = p.prefix + Math.round(p.num * eased).toLocaleString() + p.suffix;
        if (t < 1) requestAnimationFrame(step);
      })(start);
    };
    const sObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { run(e.target); sObs.unobserve(e.target); } });
    }, { threshold: 0.4 });
    statValues.forEach(function (el) {
      const p = parseStat(el.getAttribute("data-value"));
      if (p) el.textContent = p.prefix + "0" + p.suffix;   // start from zero, no flash of the final number
      sObs.observe(el);
    });
  }
}

function setupTypewriter() {
  if (SITE.hero && SITE.hero.typewriter && !reduceMotion) {
    const nameEl = document.querySelector(".hero__name") as HTMLElement | null;
    const full = SITE.hero.name || "";
    if (nameEl && full) {
      nameEl.textContent = "";
      let i = 0;
      (function type() {
        nameEl.textContent = full.slice(0, i++);
        if (i <= full.length) setTimeout(type, 65);
      })();
    }
  }
}

export function setupCopyEmail() {
  document.addEventListener("click", function (e) {
    const t: any = e.target && (e.target as any).nodeType === 1 ? e.target : (e.target as any) && (e.target as any).parentElement;
    if (!t || !t.closest) return;
    const btn = t.closest("[data-copy-email]") as HTMLElement | null;
    if (!btn) return;
    const email = btn.getAttribute("data-copy-email") || "";
    copyText(email).then(function () {
      showToast(UI.emailCopied);
      const label = btn.querySelector("span");
      if (label && !(btn as any).dataset.busy) {
        (btn as any).dataset.busy = "1";
        const original = label.textContent;
        label.textContent = UI.copied;
        setTimeout(function () { label.textContent = original; delete (btn as any).dataset.busy; }, 1400);
      }
    }).catch(function () { showToast(email); });
  });
}

export function setupProjectFilters() {
  const bar = document.querySelector(".projects__filters");
  if (!bar) return;
  const cards = Array.prototype.slice.call(document.querySelectorAll(".project")) as HTMLElement[];
  const buttons = Array.prototype.slice.call(bar.querySelectorAll(".filter-btn")) as HTMLButtonElement[];
  bar.addEventListener("click", function (e) {
    const t: any = e.target && (e.target as any).nodeType === 1 ? e.target : (e.target as any) && (e.target as any).parentElement;
    if (!t || !t.closest) return;
    const btn = t.closest(".filter-btn") as HTMLButtonElement | null;
    if (!btn) return;
    const filter = btn.getAttribute("data-filter");
    buttons.forEach(function (b) {
      const on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    });
    cards.forEach(function (card) {
      const tags = card.getAttribute("data-tags") || "";
      const show = filter === "*" || ("|" + tags + "|").indexOf("|" + filter + "|") > -1;
      (card as any).hidden = !show;
      if (show && !reduceMotion) {
        card.classList.remove("filter-in");
        void (card as any).offsetWidth;
        card.classList.add("filter-in");
      }
    });
  });
}

export function setupContactForm() {
  const formEl = document.querySelector(".contact-form") as HTMLFormElement | null;
  if (!formEl) return;
  const form = formEl;
  const action = form.getAttribute("action") || "";
  // Only take over once the form points at a real endpoint. While the
  // placeholder is still there, leave the browser's default behaviour alone.
  if (!/^https?:\/\//i.test(action) || /your-id/.test(action)) return;

  const status = form.querySelector(".contact-form__status") as HTMLElement | null;
  const submit = form.querySelector(".contact-form__submit") as HTMLButtonElement | null;
  const submitLabel = submit ? submit.querySelector("span") : null;
  const honeypot = form.querySelector('[name="_gotcha"]') as HTMLInputElement | null;

  function setStatus(msg: string, kind?: string) {
    if (!status) return;
    status.textContent = msg;
    status.hidden = !msg;
    status.className = "contact-form__status" + (kind ? " is-" + kind : "");
  }
  function showSuccess() {
    form.innerHTML =
      '<div class="contact-form__done" role="status">' +
        '<span class="contact-form__done-icon">' + icon("check") + "</span>" +
        "<p><strong>" + esc(UI.formThanksTitle) + "</strong> " + esc(UI.formThanksText) + "</p>" +
      "</div>";
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (honeypot && honeypot.value) { showSuccess(); return; }   // silently drop bots
    if ((form as any).checkValidity && !(form as any).checkValidity()) { (form as any).reportValidity(); return; }

    const original = submitLabel ? submitLabel.textContent : "";
    if (submit) submit.disabled = true;
    if (submitLabel) submitLabel.textContent = UI.sending;
    setStatus("", "");

    fetch(action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
      .then(function (res) {
        if (res.ok) { showSuccess(); return; }
        return res.json().then(function (data: any) {
          const msg = data && data.errors && data.errors.length
            ? data.errors.map(function (x: any) { return x.message; }).join(", ")
            : UI.formError;
          setStatus(msg, "error");
        });
      })
      .catch(function () {
        setStatus(UI.formNetworkError, "error");
      })
      .then(function () {
        if (submit) submit.disabled = false;
        if (submitLabel) submitLabel.textContent = original || "";
      });
  });
}
