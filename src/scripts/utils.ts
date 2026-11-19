import { icon } from './icons';
import { SITE, UI, root, PALETTES, STYLES, reduceMotion } from './state';

export function esc(s: any): string {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' } as Record<string, string>)[c] || c;
  });
}

export function extAttr(url: string): string {
  return /^https?:\/\//i.test(url) ? ' target="_blank" rel="noopener noreferrer"' : '';
}

export function formatDate(d: any): string {
  const date = new Date(d);
  if (isNaN(date.getTime())) return esc(d);
  let loc = UI.locale === 'zh' || UI.locale === 'zh-CN' ? 'zh-CN' : (UI.locale || 'en-US');
  if (loc === 'en') loc = 'en-US';
  return date.toLocaleDateString(loc, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function setMeta(selector: string, attr: string, value: any) {
  if (!value) return;
  const el = document.querySelector(selector);
  if (el) el.setAttribute(attr, String(value));
}

export function absUrl(path: any, base: any): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  if (base && /^https?:\/\//i.test(base)) return String(base).replace(/\/$/, '') + '/' + String(path).replace(/^\//, '');
  return String(path);
}

export function initThemeAndMeta() {
  // Palette
  let savedPalette: string | null = null;
  try { savedPalette = localStorage.getItem('palette'); } catch (e) {}
  const startPalette = savedPalette && (PALETTES as readonly string[]).indexOf(savedPalette) > -1
    ? savedPalette
    : ((SITE.theme && SITE.theme.palette) || 'slate');
  root.setAttribute('data-palette', startPalette);

  // Style
  let savedStyle: string | null = null;
  try { savedStyle = localStorage.getItem('style'); } catch (e) {}
  const themeStyle = SITE.theme && SITE.theme.style;
  const startStyle = savedStyle && (STYLES as readonly string[]).indexOf(savedStyle) > -1
    ? savedStyle
    : (themeStyle && (STYLES as readonly string[]).indexOf(themeStyle) > -1 ? themeStyle : 'soft');
  root.setAttribute('data-style', startStyle);

  // Default light/dark mode from config (only if visitor hasn't chosen)
  let savedTheme: string | null = null;
  try { savedTheme = localStorage.getItem('theme'); } catch (e) {}
  if (!savedTheme) {
    const def = SITE.theme && SITE.theme.defaultMode;
    if (def === 'light' || def === 'dark') root.setAttribute('data-theme', def);
  }

  // Optional Google Font
  if (SITE.theme && SITE.theme.font && SITE.theme.font !== 'system') {
    const fam = String(SITE.theme.font).trim().replace(/\s+/g, '+');
    ([['https://fonts.googleapis.com', false], ['https://fonts.gstatic.com', true]] as [string, boolean][]).forEach(function (pair) {
      const pre = document.createElement('link');
      pre.rel = 'preconnect';
      pre.href = pair[0];
      if (pair[1]) pre.crossOrigin = 'anonymous';
      document.head.appendChild(pre);
    });
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=' + fam + ':wght@400;500;600;700;800&display=swap';
    document.head.appendChild(link);
    root.style.setProperty('--font', "'" + SITE.theme.font + "', ui-sans-serif, system-ui, sans-serif");
  }

  // Sync meta
  const s = SITE.site || {};
  if (s.title) document.title = s.title;
  setMeta('meta[name="description"]', 'content', s.description);
  setMeta('meta[property="og:title"]', 'content', s.title);
  setMeta('meta[property="og:description"]', 'content', s.description);
  setMeta('meta[property="og:url"]', 'content', s.url);
  setMeta('meta[property="og:image"]', 'content', absUrl(s.ogImage, s.url));
  setMeta('meta[name="twitter:title"]', 'content', s.title);
  setMeta('meta[name="twitter:description"]', 'content', s.description);
  setMeta('meta[name="twitter:image"]', 'content', absUrl(s.ogImage, s.url));
  setMeta('link[rel="canonical"]', 'href', s.url);
  if (s.locale) root.setAttribute('lang', s.locale);
}

export function socialLinks(extraClass?: string): string {
  return (SITE.social || [])
    .filter(function (s: any) { return s && s.url; })
    .map(function (s: any) {
      return (
        '<a class="social-link ' + (extraClass || '') + '" href="' + esc(s.url) +
        '" aria-label="' + esc(s.label) + '"' + extAttr(s.url) + '>' + icon(s.icon) + '</a>'
      );
    })
    .join('');
}

export function buttonsCta(cta: any, cls: string): string {
  return (
    '<a class="btn ' + cls + '" href="' + esc(cta.href) + '">' + esc(cta.label) +
    (cls.indexOf('primary') > -1 ? icon('arrow-right') : '') +
    '</a>'
  );
}

let toastEl: HTMLDivElement | null = null;
let toastTimer: any = null;
export function showToast(msg: string) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  void toastEl.offsetWidth;
  toastEl.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { toastEl && toastEl.classList.remove('is-visible'); }, 2200);
}

export function smoothScrollTo(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  if (history.replaceState) history.replaceState(null, '', '#' + id);
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}

export function applyPalette(p: string) {
  if ((PALETTES as readonly string[]).indexOf(p) < 0) return;
  root.setAttribute('data-palette', p);
  try { localStorage.setItem('palette', p); } catch (e) {}
}

export function applyStyle(s: string) {
  if ((STYLES as readonly string[]).indexOf(s) < 0) return;
  root.setAttribute('data-style', s);
  try { localStorage.setItem('style', s); } catch (e) {}
}

export function copyText(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise(function (resolve, reject) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      resolve();
    } catch (e) { reject(e); }
  });
}
