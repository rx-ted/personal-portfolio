import { initState } from './state';
import { initThemeAndMeta } from './utils';
import { renderPage } from './render';
import { setupInteractions, setupCopyEmail, setupProjectFilters, setupContactForm } from './interactions';
import { setupSettingsPanel } from './settings';
import { setupCommandPalette } from './command-palette';

if (!(window as any).SITE) {
  document.body.innerHTML = '<p style="padding:2rem;font-family:sans-serif">Could not load <strong>config.js</strong>. Make sure it sits next to index.html and has no typos (a missing comma or quote will do it).</p>';
} else {
  initState();
  initThemeAndMeta();
  renderPage();
  setupInteractions();
  setupSettingsPanel();
  setupCopyEmail();
  setupProjectFilters();
  setupContactForm();
  setupCommandPalette();
}
