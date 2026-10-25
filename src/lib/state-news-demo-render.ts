import { load, type CheerioAPI } from 'cheerio';

const slugFromReference = (value: any) => {
  const reference = value?.category || value;
  if (!reference) return '';
  if (typeof reference === 'string') return reference.split('/').pop()?.replace(/\.(json|mdx?)$/i, '') || '';
  return reference?._sys?.filename || String(reference?.title || reference?.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
};
const labelFromReference = (value: any) => {
  const reference = value?.category || value;
  if (!reference) return '';
  if (typeof reference === 'string') return slugFromReference(reference).replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  return String(reference?.title || reference?.name || slugFromReference(reference));
};
const postUrl = (post: any) => {
  const slug = String(post?.permalink || post?._sys?.filename || '').replace(/^\/+|\/+$/g, '').replace(/^blog\//, '');
  return slug ? `/${slug}/` : '/blog/';
};
const dateLabel = (value: any) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.valueOf()) ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : '';
};
const textOf = (node: any): string => typeof node?.text === 'string' ? node.text : Array.isArray(node?.children) ? node.children.map(textOf).join('') : '';
const esc = (value: any) => String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const slugify = (value: string) => value.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
const categoryRefs = (post: any) => Array.isArray(post?.categories)
  ? post.categories.map((item: any) => item?.category || item).filter(Boolean)
  : post?.categories && typeof post.categories === 'object'
    ? Object.entries(post.categories).sort(([left], [right]) => left.localeCompare(right)).map(([, item]: [string, any]) => item?.category || item).filter(Boolean)
    : Object.entries(post || {}).filter(([key, value]) => /^category\d{2}$/.test(key) && value).sort(([left], [right]) => left.localeCompare(right)).map(([, item]: [string, any]) => item?.category || item).filter(Boolean).concat(post?.category ? [post.category] : []);
const postAuthor = (post: any) => post?.author && typeof post.author === 'object' ? post.author : null;

export function renderRichText(node: any): string {
  if (!node) return '';
  if (typeof node === 'string') return `<p>${esc(node)}</p>`;
  if (node.type === 'text') {
    let value = esc(node.text || '');
    if (node.code) value = `<code>${value}</code>`;
    if (node.bold) value = `<strong>${value}</strong>`;
    if (node.italic) value = `<em>${value}</em>`;
    if (node.underline) value = `<u>${value}</u>`;
    if (node.strikethrough) value = `<s>${value}</s>`;
    return value;
  }
  const children = (node.children || []).map(renderRichText).join('');
  const tag: Record<string, string> = { root: '', p: 'p', h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6', ul: 'ul', ol: 'ol', li: 'li', lic: 'span', blockquote: 'blockquote', block_quote: 'blockquote', hr: 'hr', code_block: 'pre' };
  if (node.type === 'root') return children;
  if (node.type === 'a') return `<a href="${esc(node.url || node.href || '#')}">${children}</a>`;
  if (node.type === 'img') return `<img src="${esc(node.url || node.src || '')}" alt="${esc(node.alt || '')}">`;
  const element = tag[node.type] || 'div';
  if (element === 'hr') return '<hr>';
  const id = /^h[1-6]$/.test(element) ? ` id="${esc(slugify(textOf(node)))}"` : '';
  return `<${element}${id}>${children}</${element}>`;
}

function setText($: CheerioAPI, selector: string, value: any) { $(selector).first().text(String(value ?? '')); }
function removeTemplateIds($: CheerioAPI, node: any) { $(node).find('[data-dc-tpl]').addBack('[data-dc-tpl]').removeAttr('data-dc-tpl'); }
function setInlineField($: CheerioAPI, selector: string, field?: string | null) { if (field) $(selector).first().attr('data-tina-field', field); }
function setContributor($: CheerioAPI, config: any, ids: [number, number, number, number]) {
  const cta = config?.contributorCta || {};
  setText($, `[data-dc-tpl="${ids[0]}"]`, cta.eyebrow || 'Write for us');
  setText($, `[data-dc-tpl="${ids[1]}"]`, cta.title || cta.heading || 'Have a story worth telling?');
  setText($, `[data-dc-tpl="${ids[2]}"]`, cta.description || 'State News Digest welcomes contributions from writers, experts, and practitioners with original reporting or informed perspective.');
  const button = $(`[data-dc-tpl="${ids[3]}"]`).first();
  button.attr('href', cta.buttonLink || '/write-for-us/');
  button.contents().filter((_, node) => node.type === 'text').first().replaceWith(cta.buttonText || cta.buttonLabel || 'Write for Us');
}
function fillPostCard($: CheerioAPI, card: any, post: any, selectors: { image: string; title: string; category?: string; date?: string; author?: string; avatar?: string; description?: string }) {
  $(card).attr('href', postUrl(post)).attr('data-post-card', '');
  $(card).find(selectors.image).first().attr({ src: post?.heroImage || '', alt: post?.heroImageAlt || post?.title || '' });
  $(card).find(selectors.title).first().text(post?.title || 'Untitled story');
  if (selectors.category) $(card).find(selectors.category).first().text(labelFromReference(categoryRefs(post)[0]));
  if (selectors.date) $(card).find(selectors.date).first().text(dateLabel(post?.pubDate));
  if (selectors.author) $(card).find(selectors.author).first().text(postAuthor(post)?.name || labelFromReference(post?.author));
  if (selectors.avatar) {
    const avatar = $(card).find(selectors.avatar).first();
    const author = postAuthor(post);
    if (author?.avatar) avatar.attr({ src: author.avatar, alt: author.name || '' });
    else avatar.remove();
  }
  if (selectors.description) $(card).find(selectors.description).first().text(post?.description || '');
}
function populatePagination($: CheerioAPI, selector: string, current: number, pages: number, basePath: string) {
  const nav = $(selector).first();
  const sourceLinks = nav.children('a');
  const activeTemplate = sourceLinks.first().clone();
  const inactiveTemplate = sourceLinks.eq(1).length ? sourceLinks.eq(1).clone() : activeTemplate.clone();
  const nextTemplate = sourceLinks.last().length ? sourceLinks.last().clone() : inactiveTemplate.clone();
  nav.empty();
  if (pages <= 1) { nav.remove(); return; }
  const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
  const pageHref = (page: number) => page === 1 ? normalizedBase : normalizedBase === '/blog/' ? `${normalizedBase}?page=${page}` : `${normalizedBase}page/${page}/`;
  for (let page = 1; page <= pages; page += 1) {
    const link = (page === current ? activeTemplate : inactiveTemplate).clone(); if (page > 1) removeTemplateIds($, link);
    link.attr('href', pageHref(page)).text(String(page));
    if (page === current) link.attr('aria-current', 'page'); else link.removeAttr('aria-current');
    nav.append(link);
  }
  if (current < pages) { const next = nextTemplate.clone(); removeTemplateIds($, next); next.attr('href', pageHref(current + 1)).removeAttr('aria-current').text('Next →'); nav.append(next); }
}

export function renderArticleDemo(raw: string, options: any) {
  const $ = load(raw, null, false);
  const { post, author, categories = [], relatedPosts = [], config = {}, fields = {} } = options;
  const categorySource = $('[data-dc-tpl="39"]').first().clone();
  const categoryGroup = $('<div class="category-badges" data-article-categories></div>');
  $('[data-dc-tpl="39"]').remove();
  categories.forEach((category: any, index: number) => {
    const badge = categorySource.clone(); if (index) removeTemplateIds($, badge);
    badge.attr('data-article-category', '').attr('href', `/${slugFromReference(category)}/`).text(labelFromReference(category));
    if (fields.categories) badge.attr('data-tina-field', fields.categories);
    categoryGroup.append(badge);
  });
  $('[data-dc-tpl="40"]').before(categoryGroup);
  setText($, '[data-dc-tpl="40"]', post?.title); setInlineField($, '[data-dc-tpl="40"]', fields.title);
  $('[data-dc-tpl="51"]').attr({ src: post?.heroImage || '', alt: post?.heroImageAlt || post?.title || 'Article image' }); setInlineField($, '[data-dc-tpl="51"]', fields.heroImage);
  const authorName = author?.name || labelFromReference(post?.author) || post?.authorAlt || 'State News Digest Staff';
  const authorSlug = slugFromReference(author || post?.author || authorName); const authorAvatar = author?.avatar || '';
  const authorLink = $('[data-dc-tpl="42"]').attr('href', author ? `/author/${authorSlug}/` : '/our-team/');
  if (authorAvatar) $('[data-dc-tpl="43"]').attr({ src: authorAvatar, alt: authorName }); else $('[data-dc-tpl="43"]').remove();
  authorLink.contents().filter((_, node) => node.type === 'text').remove(); authorLink.append(authorName);
  setText($, '[data-dc-tpl="45"]', author?.role || ''); setText($, '[data-dc-tpl="47"]', dateLabel(post?.pubDate)); setText($, '[data-dc-tpl="49"]', post?.readTime || '');
  $('[data-dc-tpl="41"]').addClass('article-meta'); $('[data-dc-tpl="46"]').addClass('article-meta-break');
  setInlineField($, '[data-dc-tpl="42"]', fields.author); setInlineField($, '[data-dc-tpl="47"]', fields.pubDate); setInlineField($, '[data-dc-tpl="49"]', fields.readTime);

  const tocItems = (post?.body?.children || []).filter((node: any) => node?.type === 'h2').map((node: any) => ({ title: textOf(node), id: slugify(textOf(node)) }));
  const article = $('[data-dc-tpl="70"]').first();
  if (!tocItems.length) { article.attr('id', 'article-content'); tocItems.push({ title: 'Article overview', id: 'article-content' }); }
  const firstParagraphStyle = $('[data-dc-tpl="71"]').attr('style') || ''; const paragraphStyle = $('[data-dc-tpl="72"]').attr('style') || '';
  const headingStyle = $('[data-dc-tpl="73"]').attr('style') || ''; const blockquoteStyle = $('[data-dc-tpl="79"]').attr('style') || '';
  const authorCardTemplate = $('[data-dc-tpl="85"]').first().clone();
  article.html(renderRichText(post?.body));
  article.find('p').each((index, node) => { $(node).attr('style', index === 0 ? firstParagraphStyle : paragraphStyle); });
  for (const level of [2, 3, 4, 5, 6]) article.find(`h${level}`).attr('style', headingStyle);
  article.find('blockquote').attr('style', blockquoteStyle); article.find('blockquote p').attr('style', 'margin:0;color:inherit;font:inherit;line-height:inherit');
  article.append(authorCardTemplate).attr('data-tina-field', fields.body || null);
  if (authorAvatar) $('[data-dc-tpl="86"]').attr({ src: authorAvatar, alt: authorName }); else $('[data-dc-tpl="86"]').remove();
  $('[data-dc-tpl="89"]').attr('href', author ? `/author/${authorSlug}/` : '/our-team/').text(authorName); $('[data-dc-tpl="90"]').text(author?.bio || 'State News Digest newsroom contributor.');

  const toc = $('[data-dc-tpl="55"]').first().addClass('article-toc'); const list = $('[data-dc-tpl="57"]').first(); const template = list.children('li').first().clone(); list.empty();
  tocItems.forEach((item: any, index: number) => { const li = template.clone(); if (index) removeTemplateIds($, li); li.find('span').first().text(String(index + 1).padStart(2, '0')); const link = li.find('a').first().attr('href', `#${item.id}`); link.contents().filter((_, n) => n.type === 'text').remove(); link.append(item.title); list.append(li); });
  $('[data-dc-tpl="54"]').addClass('article-sidebar');
  const relatedGrid = $('[data-dc-tpl="97"]').first(); const relatedTemplate = relatedGrid.children('a').first().clone(); relatedGrid.empty();
  relatedPosts.slice(0, 3).forEach((item: any, index: number) => { const card = relatedTemplate.clone(); if (index) removeTemplateIds($, card); fillPostCard($, card, item, { image: 'img', category: 'span:nth-of-type(1)', title: 'span:nth-of-type(2)' }); relatedGrid.append(card); });
  if (!relatedPosts.length) $('[data-dc-tpl="91"]').remove();
  setContributor($, config, [113, 114, 116, 117]); return $.html();
}

export function renderCategoryDemo(raw: string, options: any) {
  const $ = load(raw, null, false); const { category, posts = [], page = 1, pageSize = 6, totalPages, basePath, config = {}, fields = {} } = options;
  const title = category?.title || 'Category'; setText($, '[data-dc-tpl="40"]', title); setInlineField($, '[data-dc-tpl="40"]', fields.title);
  const pages = totalPages ?? Math.max(1, Math.ceil(posts.length / pageSize)); const safePage = Math.min(Math.max(1, page), pages); const visiblePosts = totalPages ? posts : posts.slice((safePage - 1) * pageSize, safePage * pageSize);
  const grid = $('[data-dc-tpl="42"]').first(); const template = grid.children('a').first().clone(); grid.empty();
  visiblePosts.forEach((post: any, index: number) => { const card = template.clone(); if (index) removeTemplateIds($, card); fillPostCard($, card, post, { image: 'img', title: 'span' }); grid.append(card); });
  if (!visiblePosts.length) grid.append(`<div class="archive-empty" role="status"><h2>No articles published yet</h2><p>Articles in ${esc(title)} will appear here as soon as they are published.</p></div>`);
  populatePagination($, '[data-dc-tpl="61"]', safePage, pages, basePath || `/${slugFromReference(category)}/`);
  setContributor($, config, [69, 70, 72, 73]); return $.html();
}

export function renderAuthorDemo(raw: string, options: any) {
  const $ = load(raw, null, false); const { author, posts = [], page = 1, pageSize = 6, totalPages, basePath, config = {}, fields = {} } = options;
  $('[data-dc-tpl="39"]').attr({ src: author?.avatar || '', alt: author?.name || 'Author' });
  setText($, '[data-dc-tpl="42"]', author?.role || ''); setText($, '[data-dc-tpl="43"]', author?.name || 'Author'); setText($, '[data-dc-tpl="44"]', author?.bio || '');
  setInlineField($, '[data-dc-tpl="39"]', fields.avatar); setInlineField($, '[data-dc-tpl="43"]', fields.name); setInlineField($, '[data-dc-tpl="44"]', fields.bio);
  const pages = totalPages ?? Math.max(1, Math.ceil(posts.length / pageSize)); const safePage = Math.min(Math.max(1, page), pages); const visiblePosts = totalPages ? posts : posts.slice((safePage - 1) * pageSize, safePage * pageSize);
  const grid = $('[data-dc-tpl="46"]').first(); const template = grid.children('a').first().clone(); grid.empty();
  visiblePosts.forEach((post: any, index: number) => { const card = template.clone(); if (index) removeTemplateIds($, card); fillPostCard($, card, post, { image: 'img', title: 'span' }); grid.append(card); });
  if (!visiblePosts.length) grid.append('<div class="archive-empty" role="status"><h2>No articles published yet</h2><p>This author has no published articles yet.</p></div>');
  populatePagination($, '[data-dc-tpl="65"]', safePage, pages, basePath || `/author/${slugFromReference(author)}/`);
  setContributor($, config, [73, 74, 76, 77]); return $.html();
}

export function renderDefaultPageDemo(raw: string, options: any) {
  const $ = load(raw, null, false); const { page, config = {}, fields = {} } = options;
  setText($, '[data-dc-tpl="39"]', page?.title || 'Page'); setInlineField($, '[data-dc-tpl="39"]', fields.title);
  const date = page?.authorityUpdatedDate ? new Date(page.authorityUpdatedDate) : null;
  setText($, '[data-dc-tpl="41"]', date && !Number.isNaN(date.valueOf()) ? `Last Updated: ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}` : '');
  const sections = Array.isArray(page?.authoritySections) ? page.authoritySections.filter(Boolean) : [];
  const main = $('[data-dc-tpl="40"]').first();
  const introTemplate = $('[data-dc-tpl="42"]').first(); const headingTemplate = $('[data-dc-tpl="43"]').first().clone(); const bodyTemplate = $('[data-dc-tpl="44"]').first().clone();
  main.children().slice(2).remove();
  if (sections.length) { introTemplate.text(sections[0]?.body || ''); setInlineField($, '[data-dc-tpl="42"]', fields.sections?.[0]?.body); } else introTemplate.text('');
  sections.slice(1).forEach((section: any, index: number) => { const heading = headingTemplate.clone(); const body = bodyTemplate.clone(); if (index) { removeTemplateIds($, heading); removeTemplateIds($, body); } heading.text(section?.heading || '').attr('data-tina-field', fields.sections?.[index + 1]?.heading || null); body.text(section?.body || '').attr('data-tina-field', fields.sections?.[index + 1]?.body || null); main.append(heading, body); });
  setContributor($, config, [64, 65, 67, 68]); return $.html();
}

export function renderHomepageCollections(raw: string, options: any = {}) {
  const $ = load(raw, null, false); const { posts = [], categories = [], config = {} } = options;
  [66,74,82,90,98,106,114,122].forEach((id, index) => { const card = $(`[data-dc-tpl="${id}"]`).first(); const sourceSlug = slugify(card.find(`[data-dc-tpl="${id + 4}"]`).text()); const category = categories.find((item: any) => slugFromReference(item) === sourceSlug || slugify(String(item?.title || item?.name || '')) === sourceSlug) || categories[index]; if (!category) return; card.attr('href', `/${slugFromReference(category)}/`); card.find(`[data-dc-tpl="${id + 4}"]`).text(category.title || category.name || labelFromReference(category)); card.find(`[data-dc-tpl="${id + 5}"]`).text(category.description || card.find(`[data-dc-tpl="${id + 5}"]`).text()); });
  const cards = [176,188,196,205,211,217];
  cards.forEach((id, index) => { const post = posts[index]; const card = $(`[data-dc-tpl="${id}"]`).first(); if (!post) { card.remove(); return; } if (id === 176) fillPostCard($, card, post, { image: '[data-dc-tpl="177"]', category: '[data-dc-tpl="180"]', title: '[data-dc-tpl="181"]', description: '[data-dc-tpl="182"]', author: '[data-dc-tpl="184"]', date: '[data-dc-tpl="185"]' }); else fillPostCard($, card, post, { image: 'img', category: 'span span:nth-child(1)', title: 'span span:nth-child(2)', date: 'span span:nth-child(3)' }); });
  const users = posts.map(postAuthor).filter(Boolean); const uniqueUsers = [...new Map(users.map((user: any) => [slugFromReference(user), user])).values()].slice(0, 4) as any[];
  [228,233,238,243].forEach((id, index) => { const user = uniqueUsers[index]; const card = $(`[data-dc-tpl="${id}"]`).first(); if (!user) return; card.attr('data-author-card', '').attr('role', 'link').attr('tabindex', '0').attr('data-href', `/author/${slugFromReference(user)}/`); card.find('img').attr({ src: user.avatar || '', alt: user.name || '' }); card.find(`[data-dc-tpl="${id + 3}"]`).text(user.name || 'Contributor'); card.find(`[data-dc-tpl="${id + 4}"]`).text([user.role, user.location].filter(Boolean).join(' · ')); });
  setContributor($, config, [251, 252, 254, 255]); return $.html();
}

export function render404Demo(raw: string, options: any = {}) {
  const $ = load(raw, null, false); const notFound = options.config?.notFound || {}; const fields = options.fields || {};
  setText($, '[data-dc-tpl="41"]', notFound.title || 'This page could not be found.'); setInlineField($, '[data-dc-tpl="41"]', fields.title);
  setText($, '[data-dc-tpl="42"]', notFound.description || 'The story or page you were looking for may have moved, or the link may be out of date.'); setInlineField($, '[data-dc-tpl="42"]', fields.description);
  $('[data-dc-tpl="44"]').attr('href', notFound.buttonLink || '/').contents().first().replaceWith(notFound.buttonText || 'Back to Homepage'); setInlineField($, '[data-dc-tpl="44"]', fields.buttonText);
  $('[data-dc-tpl="46"]').attr('href', '/blog/'); $('[data-dc-tpl="47"]').attr('href', '/about/'); $('[data-dc-tpl="48"]').attr('href', '/contact/');
  setContributor($, options.config, [52, 53, 55, 56]); return $.html();
}

export function renderSitemapDemo(raw: string, options: any) {
  const $ = load(raw, null, false); const { pages = [], posts = [] } = options;
  const populate = (selector: string, items: any[], type: 'page' | 'post') => {
    const list = $(selector).first(); const template = list.children('li').first().clone(); list.empty();
    items.forEach((item, index) => { const li = template.clone(); if (index) removeTemplateIds($, li); const link = li.find('a').first(); link.attr('href', type === 'post' ? postUrl(item) : item.href); link.find('span').first().text(item.title); list.append(li); });
  };
  populate('[data-dc-tpl="44"]', pages, 'page'); populate('[data-dc-tpl="99"]', posts, 'post');
  $('[data-dc-tpl="44"]').attr('data-sitemap-section', 'webpages'); $('[data-dc-tpl="99"]').attr('data-sitemap-section', 'posts'); return $.html();
}
