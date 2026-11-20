import { icon } from './icons';
import { SITE, UI } from './state';
import { esc, extAttr, formatDate, socialLinks, buttonsCta } from './utils';

/* RENDER: navbar */
export function renderNav(): string {
  const links = (SITE.sections || [])
    .filter(function (s: any) { return s.show; })
    .map(function (s: any) {
      return '<li><a class="navbar__link" href="#' + s.id + '">' + esc(s.nav) + "</a></li>";
    })
    .join("");

  const showToggle = !SITE.nav || SITE.nav.showThemeToggle !== false;
  const showCmdk = !SITE.nav || SITE.nav.commandPalette !== false;

  return (
    '<div class="navbar__inner">' +
      '<a class="navbar__brand" href="#top">' + esc((SITE.nav && SITE.nav.brand) || "") + "</a>" +
      '<nav aria-label="' + esc(UI.sectionsAria) + '"><ul class="navbar__links" id="nav-links">' + links + "</ul></nav>" +
      '<div class="navbar__actions">' +
        (showCmdk
          ? '<button class="cmdk-open" id="cmdk-open" type="button" aria-label="' + esc(UI.searchQuickActions) + '" aria-haspopup="dialog" title="' + esc(UI.searchTitle) + '">' +
              icon("search") + '<span class="cmdk-open__hint" aria-hidden="true"><kbd>⌘</kbd><kbd>K</kbd></span>' +
            "</button>"
          : "") +
        '<button class="icon-btn nav-toggle" id="nav-toggle" type="button" aria-label="' + esc(UI.openMenu) + '" aria-expanded="false" aria-controls="nav-links">' + icon("menu") + "</button>" +
        (showToggle
          ? '<button class="icon-btn theme-toggle" id="theme-toggle" type="button" aria-label="' + esc(UI.toggleDark) + '"></button>'
          : "") +
      "</div>" +
    "</div>"
  );
}

/* RENDER: hero */
export function renderHero(): string {
  const h = (SITE.hero || {}) as any;

  let nameHtml = esc(h.name);
  if (h.nameHighlight) {
    const hl = esc(h.nameHighlight);
    nameHtml = nameHtml.replace(hl, '<span class="hl">' + hl + "</span>");
  }

  const glance = (h.glance || [])
    .map(function (g: any) {
      return ('<a class="glance__row" href="' + esc(g.href) + '">' +
        '<span class="glance__icon">' + icon(g.icon) + "</span>" +
        '<span class="glance__text"><span class="glance__label">' + esc(g.label) + "</span>" +
        '<span class="glance__value">' + esc(g.value) + "</span></span>" +
        '<span class="glance__chev">' + icon("chevron-right") + "</span></a>");
    })
    .join("");

  const cv = h.cv && h.cv.show
    ? '<a class="btn btn--ghost" href="' + esc(h.cv.file) + '" download>' + icon("download") + esc(h.cv.label) + "</a>"
    : "";

  return (
    '<section class="hero" id="top">' +
      '<div class="container hero__grid">' +
        '<div class="hero__intro reveal">' +
          '<span class="pill"><span class="pill__dot ' + (h.statusOpen ? "pill__dot--open" : "") + '"></span>' + esc(h.statusText) + "</span>" +
          '<p class="hero__eyebrow">' + esc(h.eyebrow) + "</p>" +
          '<h1 class="hero__name">' + nameHtml + "</h1>" +
          '<p class="hero__tagline">' + esc(h.tagline) + "</p>" +
          '<div class="hero__cta">' +
            buttonsCta(h.primaryCta, "btn--primary") +
            buttonsCta(h.secondaryCta, "btn--ghost") +
            cv +
          "</div>" +
          '<div class="hero__social">' + socialLinks() + "</div>" +
        "</div>" +
        '<div class="hero__aside reveal">' +
          '<div class="glance">' +
            '<p class="glance__title">' + esc(h.glanceTitle) + "</p>" +
            glance +
          "</div>" +
        "</div>" +
      "</div>" +
      '<div class="container"><div class="scroll-hint">' + esc(UI.scroll) + '' + icon("arrow-down") + "</div></div>" +
    "</section>"
  );
}

function timeline(data: any): string {
  return '<ul class="timeline reveal">' + (data.items || []).map(function (it: any) {
    return (
      '<li class="timeline__item">' +
        '<div class="timeline__head">' +
          (it.logo ? '<img class="timeline__logo" src="' + esc(it.logo) + '" alt="">' : "") +
          '<span class="timeline__title">' + esc(it.title) + "</span>" +
          '<span class="timeline__org">' + esc(it.org) + "</span>" +
          '<span class="timeline__dates">' + esc(it.dates) + "</span>" +
        "</div>" +
        (it.bullets && it.bullets.length
          ? '<ul class="timeline__bullets">' + it.bullets.map(function (b: any) { return "<li>" + esc(b) + "</li>"; }).join("") + "</ul>"
          : "") +
      "</li>"
    );
  }).join("") + "</ul>";
}

const RENDERERS: Record<string, (d: any) => string> = {
  about: function (d) {
    return (
      '<div class="about__grid reveal">' +
        '<img class="about__photo" src="' + esc(d.photo) + '" alt="' + esc(d.photoAlt) + '" loading="lazy" width="600" height="600">' +
        '<div class="about__bio">' +
          (d.paragraphs || []).map(function (p: any) { return "<p>" + esc(p) + "</p>"; }).join("") +
          (d.interests && d.interests.length
            ? '<div class="about__interests">' + d.interests.map(function (i: any) { return '<span class="chip">' + esc(i) + "</span>"; }).join("") + "</div>"
            : "") +
          (d.quickFacts && d.quickFacts.length
            ? '<ul class="about__facts">' + d.quickFacts.map(function (f: any) {
                return '<li><span class="fact-label">' + esc(f.label) + '</span><span class="fact-value">' + esc(f.value) + "</span></li>";
              }).join("") + "</ul>"
            : "") +
        "</div>" +
      "</div>"
    );
  },

  now: function (d) {
    return '<ul class="now__list reveal">' + (d.items || []).map(function (it: any) {
      return '<li class="now__item"><span class="now__icon">' + icon(it.icon) + "</span><span>" + esc(it.text) + "</span></li>";
    }).join("") + "</ul>";
  },

  stats: function (d) {
    return '<div class="stats__grid reveal">' + (d.items || []).map(function (it: any) {
      return '<div class="stat"><div class="stat__value" data-value="' + esc(it.value) + '">' + esc(it.value) + "</div>" +
        '<div class="stat__label">' + esc(it.label) + "</div></div>";
    }).join("") + "</div>";
  },

  gallery: function (d) {
    return '<div class="gallery__grid reveal">' + (d.items || []).map(function (it: any, idx: number) {
      const cap = it.caption || "";
      return '<button class="gallery__item" type="button" data-full="' + esc(it.image) + '" data-caption="' + esc(cap) +
        '" aria-label="' + esc(cap || (UI.openPhoto + " " + (idx + 1))) + '">' +
        '<img src="' + esc(it.image) + '" alt="' + esc(cap || (UI.galleryPhoto + " " + (idx + 1))) + '" loading="lazy">' +
        (cap ? '<span class="gallery__caption">' + esc(cap) + "</span>" : "") +
        "</button>";
    }).join("") + "</div>";
  },

  experience: timeline,
  education: timeline,

  skills: function (d) {
    return '<div class="skills__grid reveal">' + (d.groups || []).map(function (g: any) {
      return ('<div class="skills__group"><h3>' + esc(g.name) + '</h3><div class="skills__tags">' +
        (g.items || []).map(function (i: any) {
          var c = Math.floor(Math.random() * 8) + 1;
          return '<span class="chip chip--c' + c + '">' + esc(i) + "</span>";
        }).join("") +
        "</div></div>");
    }).join("") + "</div>";
  },

  projects: function (d) {
    const items = d.items || [];
    const tagLabel = function (t: any): string {
      return (t && typeof t === "object") ? String(t.label || t.name || "") : String(t || "");
    };
    const tagKey = function (t: any): string {
      return tagLabel(t).toLowerCase();
    };

    let filterBar = "";
    if (d.filters !== false) {
      const seen: Record<string, boolean> = {};
      const uniqueTags: any[] = [];
      items.forEach(function (p: any) {
        (p.tags || []).forEach(function (t: any) {
          const key = tagKey(t);
          if (key && !seen[key]) { seen[key] = true; uniqueTags.push(t); }
        });
      });
      if (uniqueTags.length > 1) {
        filterBar = '<div class="projects__filters reveal" role="group" aria-label="' + esc(UI.filterProjectsAria) + '">' +
          '<button class="filter-btn is-active" type="button" data-filter="*" aria-pressed="true">' + esc(UI.all) + '</button>' +
          uniqueTags.map(function (t) {
            const label = tagLabel(t);
            return '<button class="filter-btn" type="button" data-filter="' + esc(tagKey(t)) +
              '" aria-pressed="false">' + esc(label) + "</button>";
          }).join("") +
        "</div>";
      }
    }

    const grid = '<div class="projects__grid reveal">' + items.map(function (p: any) {
      const linksHtml = (p.links || [])
        .filter(function (l: any) { return l.url; })
        .map(function (l: any) {
          return ('<a class="btn btn--ghost btn--small" href="' + esc(l.url) + '"' + extAttr(l.url) + ">" +
            esc(l.label) + (l.type === "source" ? icon("github") : icon("external-link")) + "</a>");
        }).join("");
      const tagKeys = (p.tags || []).map(function (t: any) { return tagKey(t); }).join("|");
      return (
        '<article class="project ' + (p.featured ? "project--featured" : "") + '" data-tags="' + esc(tagKeys) + '">' +
          '<div class="project__media"><img src="' + esc(p.image || "assets/img/placeholder.svg") + '" alt="' + esc(p.title) + ' preview" loading="lazy"></div>' +
          '<div class="project__body">' +
            '<h3 class="project__title">' + esc(p.title) + "</h3>" +
            '<p class="project__desc">' + esc(p.description) + "</p>" +
            (p.tags && p.tags.length ? '<div class="project__tags">' + p.tags.map(function (t: any) {
              var label = tagLabel(t);
              var url = (t && typeof t === "object" && t.url) ? String(t.url) : ("https://www.google.com/search?q=" + encodeURIComponent(label));
              var iconSvg = (t && typeof t === "object" && t.icon) ? String(t.icon) : "";
              return '<a class="tag tag--link" href="' + esc(url) + '"' + extAttr(url) + '>' +
                (iconSvg ? '<span class="tag__icon" aria-hidden="true">' + iconSvg + '</span>' : '') +
                '<span class="tag__label">' + esc(label) + '</span>' +
                '<span class="tag__external" aria-hidden="true">' + icon("external-link") + '</span>' +
              "</a>";
            }).join("") + "</div>" : "") +
            (linksHtml ? '<div class="project__links">' + linksHtml + "</div>" : "") +
          "</div>" +
        "</article>"
      );
    }).join("") + "</div>";

    return filterBar + grid;
  },

  writing: function (d) {
    return '<div class="writing__grid reveal">' + (d.items || []).map(function (post: any) {
      return (
        '<a class="post" href="' + esc(post.url) + '"' + extAttr(post.url) + ">" +
          '<span class="post__date">' + formatDate(post.date) + "</span>" +
          '<span class="post__title">' + esc(post.title) + "</span>" +
          '<span class="post__blurb">' + esc(post.blurb) + "</span>" +
          '<span class="post__more">' + esc(UI.readMore) + icon("arrow-right") + "</span>" +
        "</a>"
      );
    }).join("") + "</div>";
  },

  testimonials: function (d) {
    return '<div class="quotes__grid reveal">' + (d.items || []).map(function (q: any) {
      return (
        '<figure class="quote">' +
          '<span class="quote__mark">' + icon("quote") + "</span>" +
          '<blockquote class="quote__text">' + esc(q.quote) + "</blockquote>" +
          '<figcaption class="quote__who"><span class="quote__name">' + esc(q.name) + '</span><span class="quote__role">' + esc(q.role) + "</span></figcaption>" +
        "</figure>"
      );
    }).join("") + "</div>";
  },

  contact: function (d) {
    const form = d.form
      ? ('<form class="contact-form reveal" action="' + esc(d.formAction) + '" method="POST">' +
          '<div><label for="cf-name">' + esc(UI.formName) + '</label><input id="cf-name" name="name" type="text" autocomplete="name" required></div>' +
          '<div><label for="cf-email">' + esc(UI.formEmail) + '</label><input id="cf-email" name="email" type="email" autocomplete="email" required></div>' +
          '<div><label for="cf-msg">' + esc(UI.formMessage) + '</label><textarea id="cf-msg" name="message" required></textarea></div>' +
          '<div class="hp" aria-hidden="true"><label>' + esc(UI.formHoneypot) + '<input type="text" name="_gotcha" tabindex="-1" autocomplete="off"></label></div>' +
          '<button class="btn btn--primary contact-form__submit" type="submit">' + icon("send") + "<span>" + esc(UI.sendMessage) + "</span></button>" +
          '<p class="contact-form__status" role="status" aria-live="polite" hidden></p>' +
        "</form>")
      : "";
    const copyBtn = d.email
      ? '<button class="btn btn--ghost" type="button" data-copy-email="' + esc(d.email) + '" aria-label="' + esc(UI.copyEmailAria) + '">' + icon("copy") + "<span>" + esc(UI.copyEmail) + "</span></button>"
      : "";
    return (
      '<div class="contact__card reveal">' +
        '<h3 class="contact__heading">' + esc(d.heading) + "</h3>" +
        '<p class="contact__text">' + esc(d.text) + "</p>" +
        '<div class="contact__actions"><a class="btn btn--primary" href="mailto:' + esc(d.email) + '">' + icon("mail") + esc(d.emailButtonLabel) + "</a>" + copyBtn + "</div>" +
        '<div class="contact__social">' + socialLinks() + "</div>" +
        form +
      "</div>"
    );
  }
};

export function renderSection(reg: any): string {
  const data = (SITE as any)[reg.id];
  if (!data) return "";
  const renderer = RENDERERS[reg.id];
  let body = "";
  if (renderer) body = renderer(data);
  else if (typeof data.html === "string") body = '<div class="embed reveal">' + data.html + "</div>";
  if (!body) return "";
  return (
    '<section class="section" id="' + reg.id + '" aria-labelledby="' + reg.id + '-title">' +
      '<div class="container">' +
        '<header class="section__head reveal">' +
          '<div class="section__divider"><span class="em-dash">—</span>' +
            '<h2 class="section__title" id="' + reg.id + '-title">' + esc(reg.nav) + "</h2></div>" +
          (data.intro ? '<p class="section__intro">' + esc(data.intro) + "</p>" : "") +
        "</header>" +
        body +
      "</div>" +
    "</section>"
  );
}

export function renderFooter(): string {
  const f = (SITE.footer || {}) as any;
  const email = ((SITE.contact as any) && (SITE.contact as any).email) || "";
  const repo = f.repo && f.repo.url
    ? '<a class="footer__repo" href="' + esc(f.repo.url) + '" target="_blank" rel="noopener">' +
      icon("github") + esc(f.repo.label || "GitHub") + "</a>"
    : "";
  const credit = f.showCredit !== false
    ? '<p class="footer__credit">Built with the <a href="https://github.com/rx-ted/personal-portfolio" ' +
      'target="_blank" rel="noopener">Starter</a> portfolio template.</p>'
    : "";
  return (
    '<div class="container footer__inner">' +
      (f.tagline ? '<p class="footer__tagline">' + esc(f.tagline) + "</p>" : "") +
      (email ? '<a class="btn btn--ghost btn--small" href="mailto:' + esc(email) + '">' + icon("mail") + esc(email) + "</a>" : "") +
      '<div class="footer__social">' + socialLinks() + "</div>" +
      repo +
      credit +
    "</div>"
  );
}

export function renderPage() {
  const navbar = document.getElementById("navbar");
  const content = document.getElementById("content");
  const footer = document.getElementById("site-footer");
  if (navbar) navbar.innerHTML = renderNav();
  if (content) content.innerHTML = renderHero() + (SITE.sections || []).filter(function (s: any) { return s.show; }).map(renderSection).join("");
  if (footer) footer.innerHTML = renderFooter();
}
