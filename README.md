# Personal Portfolio (Astro)

A bilingual (English / Chinese) personal portfolio/resume site built with **Astro**, preserving the original layout and interaction style while using a **JSON-driven content source** for easy maintenance.

## Demo

![Demo 1](https://picx.19981204.xyz/rest/2026/11/ozcr8nk.png)
![Demo 2](https://picx.19981204.xyz/rest/2026/11/ka4r8nk.png)
![Demo 3](https://picx.19981204.xyz/rest/2026/11/zior8nk.png)

## Features

- **Bilingual routes**: `/` (English) and `/zh/` (Chinese)
- **JSON-driven content**: resume and site content centralized in `src/data/resume.json`, assembled via `src/site/*` for multiple callers
- **Theme & appearance**: light/dark mode, accent palettes, and layout style options
- **Interactive UI**: settings panel, command palette, language switching, and print/PDF-friendly export
- **Astro + TypeScript**: modular client scripts in `src/scripts/*.ts` with static build output

## Template

Use this repository as a starting template for your own portfolio:

- Edit `src/data/resume.json` to update profile, experience, projects, skills, and localized content
- Replace assets in `public/assets/` (avatar, images, CV, etc.) as needed
- Adjust presentation in `public/css/styles.css` and data assembly in `src/site/index.ts` when extending fields

## Tech Stack

- [Astro](https://astro.build/)
- [TypeScript](https://www.typescriptlang.org/)
- Vanilla CSS + modular client-side TypeScript

## Quick Start

```bash
npm install
npm run dev      # Start local dev server
npm run build    # Type-check and build (output: dist/)
npm run preview  # Preview production build
```

## 许可证

见 [LICENSE](LICENSE)。
