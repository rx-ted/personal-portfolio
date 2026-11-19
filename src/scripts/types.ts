export interface SiteUI {
  locale: string;
  [key: string]: any;
}

export interface SiteConfig {
  theme?: { palette?: string; style?: string; defaultMode?: string; font?: string };
  guide?: { show?: boolean };
  community?: { show?: boolean; label?: string; url?: string };
  site?: { url?: string; title?: string; description?: string; ogImage?: string; locale?: string };
  nav?: { brand?: string; showThemeToggle?: boolean; showDotRail?: boolean; commandPalette?: boolean };
  hero?: any;
  sections?: Array<{ id: string; nav: string; show?: boolean }>;
  about?: any;
  now?: any;
  stats?: any;
  experience?: any;
  education?: any;
  skills?: any;
  projects?: any;
  gallery?: any;
  writing?: any;
  testimonials?: any;
  contact?: any;
  footer?: any;
  social?: Array<{ icon: string; label?: string; url: string }>;
  lang?: { current?: string; options?: Array<{ locale: string; label: string; href: string }>; alternate?: { locale?: string; label?: string; href?: string } };
  settingsPanel?: { show?: boolean };
  ui?: SiteUI;
  [key: string]: any;
}

declare global {
  interface Window {
    SITE: SiteConfig;
  }
}
