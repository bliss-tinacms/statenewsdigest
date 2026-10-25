#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const getArg = (name, fallback = '') => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const root = path.resolve(getArg('--root', path.join(here, '..')));
const requested = getArg('--contract', 'all');
const negative = getArg('--controlled-negative', '');
const failures = [];
const fail = (id, message) => failures.push(`${id}: ${message}`);

function raw(rel) {
  const absolute = path.join(root, rel);
  if (!fs.existsSync(absolute)) {
    fail('MISSING_FILE', rel);
    return '';
  }
  return fs.readFileSync(absolute, 'utf8');
}

function text(rel) {
  let value = raw(rel);
  if (negative === 'old-brand-residue' && rel === 'src/content/config/config.json') value += '\nState News Central\n';
  if (negative === 'category-prefix-regression' && rel === 'src/pages/[...slug].astro') value += '\nconst badCategoryHref = "/category/business/";\n';
  if (negative === 'first-category-reduction' && rel === 'src/lib/state-news-demo-render.ts') value = value.replace('categories.forEach', 'categories.slice(0, 1).forEach');
  if (negative === 'paginate-before-filter' && rel === 'src/pages/[...slug].astro') value = value.replace('const allCategoryPosts = allPosts.filter', 'const allCategoryPosts = allPosts.slice(0, POSTS_PER_PAGE).filter');
  if (negative === 'author-island-omission' && rel === 'src/lib/islands.ts') value = value.replace(/\tauthor:\s*\{[\s\S]*?\n\t\},\n\tcategory:/, '\tcategory:');
  if (negative === 'author-editability-omission' && rel === 'src/components/islands/AuthorArchiveHeader.astro') value = value.replace(/tinaField/g, 'disabledField');
  if (negative === 'responsive-breakpoint-omission' && rel === 'src/styles/state-news-exact.css') value = value.replace(/@media\(max-width:767px\)/g, '@media(max-width:1px)');
  if (negative === 'media-prefix-leak' && rel === 'src/data/state-news-demo-assets.json') value = value.replace(/statenewsdigest\//g, 'foreign-site/');
  return value;
}

function active(name) { return requested === 'all' || requested === name; }
function order(source, before, after, id) {
  const a = source.indexOf(before);
  const b = source.indexOf(after);
  if (a < 0 || b < 0 || a >= b) fail(id, `${before} must occur before ${after}`);
}

if (active('rebrand')) {
  const roots = ['src', 'tina', 'public'];
  const files = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      const full = path.join(dir, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) walk(full);
      else if (/\.(?:ts|tsx|astro|js|mjs|json|md|mdx|css|xml|txt)$/i.test(name)) files.push(full);
    }
  };
  roots.forEach((dir) => walk(path.join(root, dir)));
  files.push(path.join(root, 'package.json'), path.join(root, 'astro.config.mjs'));
  const forbidden = [/State News Central/i, /statenewscentral(?:\.com)?/i, /First\s*For\s*News/i, /firstfornews\.net/i, /boilerplate\.blissdrive\.net/i];
  for (const file of files) {
    const rel = path.relative(root, file).replaceAll('\\', '/');
    const body = text(rel);
    for (const pattern of forbidden) if (pattern.test(body)) fail('REBRAND_RESIDUE', `${rel} matches ${pattern}`);
  }
  const config = text('src/content/config/config.json');
  if (!config.includes('State News Digest')) fail('DESTINATION_BRAND', 'global config lacks State News Digest');
  const astro = text('astro.config.mjs');
  if (!astro.includes('SITE_URL')) fail('DESTINATION_ORIGIN', 'Astro config is not environment-authoritative');
}

if (active('category')) {
  const schema = text('tina/collections/blog.ts');
  if (!/categoryRelationshipFields\s*=\s*Array\.from\(\{\s*length:\s*16/.test(schema) || !/type:\s*["']reference["'][\s\S]{0,200}collections:\s*\[["']category["']\]/.test(schema)) fail('CATEGORY_SCHEMA_ARRAY', 'Blog categories must use ordered native Tina relationship slots');
  if (!/\.\.\.categoryRelationshipFields/.test(schema)) fail('CATEGORY_COLLECTION_UI', 'Blog category relationships must be editable in the Blog collection');
  const route = text('src/pages/[...slug].astro');
  if (/['"`]\/category\//.test(route)) fail('CATEGORY_PREFIX_FREE', 'Category URLs must be prefix-free');
  if (!/slugsFromReference\(getPostCategories\(post\)\)\.includes/.test(route)) fail('CATEGORY_ARRAY_ORACLE', 'Archive membership must inspect complete category arrays');
  if (/allPosts\.slice\([^\n]+\)\.filter/.test(route)) fail('CATEGORY_FILTER_ORDER', 'Filtering must occur before pagination');
  order(route, 'const allCategoryPosts = allPosts.filter', 'const posts = allCategoryPosts.slice', 'CATEGORY_FILTER_ORDER');
  const render = text('src/lib/state-news-demo-render.ts');
  if (!/categories\.forEach\(/.test(render) || /categories\.slice\(0,\s*1\)\.forEach/.test(render)) fail('DEMO_MULTICAT_OVERRIDE', 'Article badges must render every selected category in order');
  const blogBody = text('src/components/islands/BlogBody.astro');
  if (!/categories\.map\(/.test(blogBody)) fail('ARTICLE_CATEGORY_CARDINALITY', 'Article body does not map all categories');
  const samplePosts = fs.existsSync(path.join(root, 'src/content/blog')) ? fs.readdirSync(path.join(root, 'src/content/blog')).filter((x) => x.endsWith('.mdx')) : [];
  let multi = false;
  for (const name of samplePosts) {
    const body = raw(`src/content/blog/${name}`);
    if ((body.match(/^category\d{2}:\s*.+$/gm) || []).length >= 2) multi = true;
  }
  if (!multi) fail('MULTICAT_FIXTURE', 'At least one post must retain two or more categories');
}

if (active('author')) {
  const islands = text('src/lib/islands.ts');
  if (!/\bauthor:\s*\{/.test(islands) || !/getEditableUser/.test(islands)) fail('AUTHOR_ISLAND', 'Author island is missing from the registry');
  const route = text('src/pages/author/[...slug].astro');
  if (!/TinaIsland[\s\S]*name=["']author["']/.test(route)) fail('AUTHOR_PRIMARY_ISLAND', 'Author archive lacks its primary Tina island');
  const header = text('src/components/islands/AuthorArchiveHeader.astro');
  for (const field of ['avatar', 'name', 'role', 'bio']) if (!new RegExp(`tinaField\\([^\\n]+['\"]${field}['\"]`).test(header)) fail('AUTHOR_EDITABLE_FIELD', `${field} is not directly editable`);
}

if (active('islands')) {
  const registry = text('src/lib/islands.ts');
  const required = ['page', 'blog', 'author', 'category', 'global', 'navigation', 'global-footer', 'footer-navigation', 'footer-legal-navigation'];
  for (const name of required) if (!new RegExp(`(?:^|\\n)\\s*['\"]?${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['\"]?\\s*:`).test(registry)) fail('ISLAND_COMPLETENESS', `${name} island is missing`);
  const config = text('tina/config.ts');
  for (const collection of ['PageCollection', 'BlogCollection', 'CategoryCollection', 'UserCollection', 'NavigationCollection', 'ConfigCollection']) if (!config.includes(collection)) fail('COLLECTION_COMPLETENESS', `${collection} is not configured`);
  const islandRoute = text('src/pages/tina-island/[name].ts');
  if (!islandRoute.includes('islands')) fail('ISLAND_ENDPOINT', 'Dynamic Tina island endpoint is not wired to the registry');
}

if (active('responsive')) {
  const css = text('src/styles/state-news-exact.css');
  if (!/@media\(max-width:1099px\)/.test(css)) fail('DESKTOP_NAV_BREAKPOINT', '1100px responsive contract is missing');
  if (!/@media\(max-width:767px\)/.test(css)) fail('MOBILE_BREAKPOINT', '767px responsive contract is missing');
  if (!/snd-header\.is-open\s+\.snd-mobile-nav/.test(css)) fail('MOBILE_NAV_STATE', 'Mobile navigation open state is missing');
  const script = text('src/components/state-news/HeaderNavigation.astro');
  if (!/aria-expanded/.test(script) || !/is-open/.test(script)) fail('MOBILE_NAV_INTERACTION', 'Mobile navigation interaction/ARIA state is incomplete');
}

if (active('media')) {
  let manifest;
  try { manifest = JSON.parse(text('src/data/state-news-demo-assets.json')); } catch { manifest = null; }
  const assets = manifest?.assets && typeof manifest.assets === 'object' ? Object.values(manifest.assets) : [];
  if (assets.length !== 23) fail('MEDIA_COMPLETE_SET', `Expected 23 deduplicated authoritative images, found ${assets.length}`);
  const urls = assets.map((item) => String(item?.cloudinary_url || ''));
  if (new Set(urls).size !== urls.length) fail('MEDIA_UNIQUE_URLS', 'Cloudinary asset URLs must be unique');
  for (const url of urls) if (!/^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:v\d+\/)?statenewsdigest\/demo-v2\/[0-9a-f]{64}\.(?:jpg|png)$/i.test(url)) fail('MEDIA_PREFIX_ISOLATION', url || '(missing URL)');
}

if (active('seo')) {
  const seoField = text('tina/fields/seo.ts');
  for (const name of ['metaTitle', 'metaDescription', 'canonicalUrl', 'noindex', 'nofollow', 'ogTitle', 'ogDescription']) if (!seoField.includes(name)) fail('SEO_SCHEMA', `${name} missing`);
  const head = text('src/components/BaseHead.astro');
  for (const marker of ['canonical', 'og:title', 'og:description', 'twitter:title', 'robots']) if (!head.includes(marker)) fail('SEO_RENDER_TARGET', `${marker} missing`);
}

if (failures.length) {
  console.error(JSON.stringify({ status: 'FAIL', contract: requested, controlledNegative: negative || null, failures }, null, 2));
  process.exit(2);
}
console.log(JSON.stringify({ status: 'PASS', contract: requested, controlledNegative: negative || null, checks: ['rebrand','category','author','islands','responsive','media','seo'].filter(active) }, null, 2));
