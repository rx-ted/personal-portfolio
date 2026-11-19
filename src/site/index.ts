import resumeData from '../data/resume.json';

export type Locale = 'en' | 'zh';

type ResumeData = typeof resumeData;

const data = resumeData as ResumeData;

function getLocaleBlock(locale: Locale) {
  return locale === 'zh' ? data.locales.zh : data.locales.en;
}

export function getSiteData(locale: Locale) {
  const l = getLocaleBlock(locale) as any;
  const p = data.profile as any;
  const isZh = locale === 'zh';

  const social = [
    ...(p.social || []),
    { icon: 'mail', label: 'Email', url: `mailto:${p.email}` },
  ];

  const repoLabel = isZh ? (p.repo?.labelZh || p.repo?.label || '') : (p.repo?.label || '');
  const currentHref = isZh ? '/zh/' : '/';
  const otherHref = isZh ? '/' : '/zh/';

  return {
    theme: {
      palette: p.theme?.palette || 'slate',
      style: p.theme?.style || 'soft',
      defaultMode: p.theme?.defaultMode || 'auto',
      font: p.theme?.font || 'system',
    },
    guide: { show: true },
    community: {
      show: !!p.community?.show,
      label: p.community?.label || '',
      url: p.community?.url || '',
    },
    site: {
      url: p.url || '',
      title: l.site?.title || '',
      description: l.site?.description || '',
      ogImage: p.ogImage || '/assets/img/og-image.png',
      locale: isZh ? 'zh-CN' : 'en',
    },
    nav: {
      brand: l.navBrand || p.name || '',
      showThemeToggle: p.nav?.showThemeToggle !== false,
      showDotRail: p.nav?.showDotRail !== false,
      commandPalette: p.nav?.commandPalette !== false,
    },
    hero: {
      ...(l.hero || {}),
      cv: {
        show: l.hero?.cv?.show !== false,
        label: l.hero?.cv?.label || (isZh ? '下载简历' : 'Download CV'),
        file: l.hero?.cv?.file || p.cvFile || '/assets/cv.pdf',
      },
    },
    sections: l.sections || [],
    about: l.about || {},
    now: l.now || { intro: '', items: [] },
    stats: l.stats || { intro: '', items: [] },
    experience: l.experience || { intro: '', items: [] },
    education: l.education || { intro: '', items: [] },
    skills: l.skills || { intro: '', groups: [] },
    projects: l.projects || { filters: true, intro: '', items: [] },
    gallery: l.gallery || { intro: '', items: [] },
    writing: l.writing || { intro: '', items: [] },
    testimonials: l.testimonials || { intro: '', items: [] },
    contact: {
      ...(l.contact || {}),
      email: p.email || '',
      form: !!p.contactForm?.enabled,
      formAction: p.contactForm?.action || '',
    },
    footer: {
      tagline: l.footer?.tagline || '',
      repo: { label: repoLabel, url: p.repo?.url || '' },
      showCredit: l.footer?.showCredit !== false,
    },
    social,
    lang: {
      current: locale,
      options: [
        { locale: 'en', label: 'English', href: isZh ? '/' : currentHref },
        { locale: 'zh', label: '中文', href: isZh ? currentHref : '/zh/' },
      ],
      alternate: { locale: isZh ? 'en' : 'zh', label: isZh ? 'English' : '中文', href: otherHref },
    },
    settingsPanel: { show: true },
    ui: l.ui || {},
  };
}

// Convenience export for callers that need the raw resume/profile data
export const resume = data;
export const profile = data.profile;
