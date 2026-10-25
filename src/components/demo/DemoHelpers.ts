export type RefObject = { title?: string | null; name?: string | null; _sys?: { filename?: string | null } | null };

export function labelFromReference(reference: unknown, fallback = 'News'): string {
  if (!reference) return fallback;
  if (Array.isArray(reference)) {
    const labels: string[] = reference.map((item: unknown) => labelFromReference(item, '')).filter(Boolean);
    return labels.length ? labels.join(', ') : fallback;
  }
  if (typeof reference === 'string') {
    return reference.split('/').pop()?.replace(/\.(json|mdx?)$/i, '').replace(/[-_]+/g, ' ') || fallback;
  }
  if (typeof reference === 'object') {
    const item = reference as RefObject;
    return item.title || item.name || item._sys?.filename || fallback;
  }
  return fallback;
}

export function getAuthorName(reference: unknown, fallback = 'Starter Site Staff') {
  return labelFromReference(reference, fallback);
}

export function getPostCategories(post: any) {
  const categories = post?.categories;
  if (Array.isArray(categories) && categories.length) return categories.map((item: any) => item?.category || item).filter(Boolean);
  if (categories && typeof categories === 'object') return Object.entries(categories).sort(([left], [right]) => left.localeCompare(right)).map(([, item]: [string, any]) => item?.category || item).filter(Boolean);
  const slots = Object.entries(post || {}).filter(([key, value]) => /^category\d{2}$/.test(key) && value).sort(([left], [right]) => left.localeCompare(right)).map(([, item]: [string, any]) => item);
  if (slots.length) return slots;
  return post?.category ? [post.category] : [];
}

export function firstImage(post: any) {
  return post?.heroImage || '';
}

export function normalizeText(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}
