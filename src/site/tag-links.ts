import { createRequire } from 'module';

const require = createRequire(import.meta.url);

type ResolvedTag = {
  label: string;
  url: string;
  icon?: string;
};

// Manual fallbacks for tags without a direct thesvg slug or needing a better canonical URL.
const MANUAL: Record<string, { slug?: string; url: string }> = {
  'd1': { slug: 'cloudflare', url: 'https://developers.cloudflare.com/d1/' },
  'r2': { slug: 'cloudflare', url: 'https://developers.cloudflare.com/r2/' },
  'kv': { slug: 'cloudflare', url: 'https://developers.cloudflare.com/kv/' },
  'pages': { slug: 'cloudflare-pages', url: 'https://pages.cloudflare.com/' },
  'aws s3': { slug: 'aws-amazon-simple-storage-service', url: 'https://aws.amazon.com/s3/' },
  'protobuf': { url: 'https://protobuf.dev/' },
  'protocol buffers': { url: 'https://protobuf.dev/' },
  'protobuff': { url: 'https://protobuf.dev/' },
  'c++': { slug: 'c-plusplus', url: 'https://isocpp.org/' },
  'restful api': { url: 'https://restfulapi.net/' },
  'rest api': { url: 'https://restfulapi.net/' },
  'jwt': { url: 'https://jwt.io/' },
  'swagger': { url: 'https://swagger.io/' },
  'open search': { slug: 'opensearch', url: 'https://opensearch.org/' },
  'opensearch': { slug: 'opensearch', url: 'https://opensearch.org/' },
  'axios': { url: 'https://axios-http.com/' },
  'cheerio': { url: 'https://cheerio.js.org/' },
  'tailwind css': { slug: 'tailwindcss', url: 'https://tailwindcss.com/' },
  'spring security': { slug: 'spring-security', url: 'https://spring.io/projects/spring-security' },
  'mybatis-plus': { url: 'https://baomidou.com/' },
  'mybatis plus': { url: 'https://baomidou.com/' },
};

const cache = new Map<string, ResolvedTag | null>();

function norm(label: string): string {
  return String(label || '').trim().toLowerCase();
}

function slugCandidates(label: string): string[] {
  const n = norm(label);
  const list: string[] = [];
  const direct = n
    .replace(/\+\+/g, 'plusplus')
    .replace(/#/g, 'sharp')
    .replace(/\./g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (direct) list.push(direct);
  const compact = n.replace(/[^a-z0-9]+/g, '');
  if (compact && compact !== direct) list.push(compact);
  // common aliases
  const aliases: Record<string, string[]> = {
    'next.js': ['nextjs', 'next-js'],
    'node.js': ['nodejs', 'node-js'],
    'c++': ['c-plusplus', 'cplusplus'],
    'aws s3': ['aws-amazon-simple-storage-service', 'amazon-s3', 'aws-s3'],
    'spring boot': ['spring-boot', 'springboot'],
    'cloudflare workers': ['cloudflare-workers'],
    'cloudflare pages': ['cloudflare-pages'],
  };
  if (aliases[n]) list.push(...aliases[n]);
  return Array.from(new Set(list));
}

function tryLoadIcon(slug: string): { url?: string; svg?: string } | null {
  try {
    const mod = require(`thesvg/${slug}`);
    const icon = mod && mod.default ? mod.default : mod;
    if (!icon || typeof icon !== 'object') return null;
    return { url: icon.url, svg: icon.svg };
  } catch {
    return null;
  }
}

export function resolveTag(input: any): ResolvedTag {
  const label = typeof input === 'object' && input
    ? String(input.label || input.name || '')
    : String(input || '');
  const n = norm(label);
  if (!label) return { label: '', url: '' };

  if (cache.has(n)) {
    const cached = cache.get(n);
    if (cached) return { ...cached, label };
  }

  // explicit URL on object wins
  if (typeof input === 'object' && input && input.url) {
    const out: ResolvedTag = { label, url: String(input.url), icon: input.icon ? String(input.icon) : undefined };
    if (!out.icon) {
      // try to attach icon from thesvg by slug candidates
      for (const s of slugCandidates(label)) {
        const hit = tryLoadIcon(s);
        if (hit && hit.svg) { out.icon = hit.svg; if (!out.url && hit.url) out.url = hit.url; break; }
      }
    }
    cache.set(n, out);
    return out;
  }

  const manual = MANUAL[n];
  let url = manual?.url || '';
  let iconSvg: string | undefined;

  const trySlugs = [
    ...(manual?.slug ? [manual.slug] : []),
    ...slugCandidates(label),
  ];

  for (const s of trySlugs) {
    const hit = tryLoadIcon(s);
    if (hit) {
      if (!url && hit.url) url = hit.url;
      if (!iconSvg && hit.svg) iconSvg = hit.svg;
      if (url && iconSvg) break;
    }
  }

  if (!url) {
    url = 'https://www.google.com/search?q=' + encodeURIComponent(label);
  }

  const out: ResolvedTag = { label, url, ...(iconSvg ? { icon: iconSvg } : {}) };
  cache.set(n, out);
  return out;
}

export function resolveTags(tags: any[] | undefined | null): ResolvedTag[] {
  return (tags || []).map(resolveTag).filter(t => t.label);
}
