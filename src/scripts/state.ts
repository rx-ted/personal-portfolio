import type { SiteConfig, SiteUI } from './types';

export const root = document.documentElement;
export const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
export const PALETTES = ['slate', 'forest', 'sunset', 'violet', 'rose', 'ocean', 'mono'] as const;
export const STYLES = ['soft', 'flat'] as const;

export let SITE: SiteConfig = (window as any).SITE || {};
export let UI: SiteUI = {} as SiteUI;

export function initState() {
  SITE = (window as any).SITE || {};
  const U = (SITE.ui || {}) as any;
  UI = {
    locale: U.locale || (SITE.site && SITE.site.locale) || 'en',
    loadError: U.loadError || 'Could not load <strong>config.js</strong>. Make sure it sits next to index.html and has no typos (a missing comma or quote will do it).',
    skipToContent: U.skipToContent || 'Skip to content',
    navAria: U.navAria || 'Primary',
    sectionsAria: U.sectionsAria || 'Sections',
    sectionNavAria: U.sectionNavAria || 'Section navigation',
    openMenu: U.openMenu || 'Open menu',
    closeMenu: U.closeMenu || 'Close menu',
    toggleDark: U.toggleDark || 'Toggle dark mode',
    switchToLight: U.switchToLight || 'Switch to light mode',
    switchToDark: U.switchToDark || 'Switch to dark mode',
    searchQuickActions: U.searchQuickActions || 'Search and quick actions',
    searchTitle: U.searchTitle || 'Search  (Ctrl / ⌘ + K)',
    scroll: U.scroll || 'Scroll',
    readMore: U.readMore || 'Read more',
    copyEmail: U.copyEmail || 'Copy email',
    copyEmailAria: U.copyEmailAria || 'Copy email address to clipboard',
    copied: U.copied || 'Copied!',
    emailCopied: U.emailCopied || 'Email address copied',
    sendMessage: U.sendMessage || 'Send message',
    sending: U.sending || 'Sending…',
    all: U.all || 'All',
    filterProjectsAria: U.filterProjectsAria || 'Filter projects by tag',
    formName: U.formName || 'Name',
    formEmail: U.formEmail || 'Email',
    formMessage: U.formMessage || 'Message',
    formHoneypot: U.formHoneypot || 'Leave this field empty',
    formThanksTitle: U.formThanksTitle || 'Thank you!',
    formThanksText: U.formThanksText || "Your message is on its way — I'll get back to you soon.",
    formError: U.formError || 'Something went wrong — please try again, or email me directly.',
    formNetworkError: U.formNetworkError || 'Network error — please check your connection, or email me directly.',
    openPhoto: U.openPhoto || 'Open photo',
    galleryPhoto: U.galleryPhoto || 'Gallery photo',
    imageViewer: U.imageViewer || 'Image viewer',
    closeImageViewer: U.closeImageViewer || 'Close image viewer',
    prevPhoto: U.prevPhoto || 'Previous photo',
    nextPhoto: U.nextPhoto || 'Next photo',
    backToTop: U.backToTop || 'Back to top',
    cmdkPlaceholder: U.cmdkPlaceholder || 'Search sections, theme, links…',
    cmdkEsc: U.cmdkEsc || 'Esc',
    cmdkFootNav: U.cmdkFootNav || 'navigate',
    cmdkFootSelect: U.cmdkFootSelect || 'select',
    cmdkFootClose: U.cmdkFootClose || 'close',
    cmdkNoMatches: U.cmdkNoMatches || 'No matches — try “about”, “dark”, or “email”.',
    cmdkGroupGoTo: U.cmdkGroupGoTo || 'Go to',
    cmdkGroupTheme: U.cmdkGroupTheme || 'Theme',
    cmdkGroupActions: U.cmdkGroupActions || 'Actions',
    cmdkGroupLinks: U.cmdkGroupLinks || 'Links',
    cmdkTop: U.cmdkTop || 'Top of page',
    cmdkToggleTheme: U.cmdkToggleTheme || 'Toggle light / dark mode',
    cmdkAccent: U.cmdkAccent || 'Accent colour',
    cmdkStyle: U.cmdkStyle || 'Layout style',
    cmdkStyleSoft: U.cmdkStyleSoft || 'Soft (rounded)',
    cmdkStyleFlat: U.cmdkStyleFlat || 'Flat (editorial)',
    cmdkCopyEmail: U.cmdkCopyEmail || 'Copy email address',
    cmdkSendEmail: U.cmdkSendEmail || 'Send an email',
    cmdkOpen: U.cmdkOpen || 'Open',
    toastAccent: U.toastAccent || 'Accent colour:',
    toastStyle: U.toastStyle || 'Layout style:',
    switchLanguage: U.switchLanguage || 'Switch language',
    settings: U.settings || 'Settings',
    settingsPanelAria: U.settingsPanelAria || 'Settings panel',
    close: U.close || 'Close',
    colourTheme: U.colourTheme || 'Colour theme',
    layoutStyle: U.layoutStyle || 'Layout style',
    exportPdfPreview: U.exportPdfPreview || 'Export PDF preview',
    downloadPdf: U.downloadPdf || 'Download PDF',
    ...U,
  } as SiteUI;
}

export function getSite() { return SITE; }
export function getUI() { return UI; }
