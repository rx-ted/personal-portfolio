import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://about.19981204.xyz',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
