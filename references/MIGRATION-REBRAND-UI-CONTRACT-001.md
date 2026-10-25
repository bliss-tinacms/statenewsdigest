# MIGRATION-REBRAND-UI-CONTRACT-001

## Scope and activation

This is a permanent global, release-blocking contract for every Astro/Tina migration, clone, rebrand, demo reconstruction, and reusable boilerplate change. It is never domain-specific. It activates automatically alongside `ASTRO-DEMO-LOCK`, `TINA-FULLCHECK`, `PUBLISHER-ADMIN-GATE`, `CATEGORY-ROUTE-CONTRACT`, and the completion policy.

A build, HTTP `200`, visual glance, representative route, or verbal assurance cannot satisfy this contract. The destination must provide package-wired positive tests, controlled-negative tests, retained source/live evidence, and a passing completion manifest.

## Required controls

### `REBRAND-UI-001` — heading computed-style parity

For every distinct heading class and responsive breakpoint used by the supplied demo, compare source and destination winning computed styles at the same viewport. Retain `font-family`, loaded font binary/face, `font-size`, `font-weight`, `line-height`, `letter-spacing`, `color`, and relevant text-transform. CSS token names, imported fonts, screenshots alone, and approximate colours are insufficient. A controlled negative must alter a heading colour or font and be rejected.

### `REBRAND-UI-002` — editable island bar on every configured collection

Derive the collection set from the exported Tina schema. Page, Blog/Post, Category, User/Author, Navigation, Global Config, and every additional configured collection must each have at least one real destination document/route whose island resolves exactly one primary form with non-empty query, variables, data key, edit state, and visible sidebar/island bar. `configuredCollections`, `islandCollections`, and retained collection evidence keys must match exactly. A homepage-only or representative island pass is forbidden. A controlled negative must remove one collection from island coverage and be rejected.

### `REBRAND-UI-003` — prefix-free category URLs

Canonical category archives must use the supplied boilerplate/source URL shape, normally `/<category-slug>/`. `/category/<slug>/` may exist only as a tested legacy `301` alias and must never appear in Tina routers, permalink helpers, badges, menus, pagination, canonicals, sitemap, RSS, structured data, admin shortcuts, or newly generated frontend links. A controlled negative must reintroduce `/category/` and be rejected.

### `REBRAND-UI-004` — all selected categories rendered

A list-valued category field is a cardinality contract. Render every selected category once, in backend order, with exact label, slug, and prefix-free href. The number shown by a supplied demo never limits the frontend data cardinality. Require a real or reversible two-category fixture and exact backend/public tuple equality. A controlled negative must keep only the first category and be rejected.

### `REBRAND-UI-005` — exact category archive membership

For each configured category, load all published posts, normalize complete category assignments, filter by the active category, paginate the filtered set, and render that page. Never paginate before filtering and never fall back to all posts. Compare each live archive's rendered post slugs and order with a backend assignment oracle; unrelated rendered posts must be empty. A controlled negative must bypass or move filtering and be rejected.

### `REBRAND-UI-006` — explicit true-empty archive state

When a category has zero authoritative published posts, render one accessible shared state such as “No articles published yet.” and zero article cards. Do not use it for loading failures, out-of-range pagination, or populated categories. Preserve the supplied demo's styling when it defines the empty state. Positive and empty fixtures are both mandatory; controlled negatives must inject fallback posts or suppress the empty state and be rejected.

### `REBRAND-UI-007` — Cloudinary upload lifecycle

Cloudinary is not certified by configuration strings or list/fetch success. Through the destination Tina media manager, prove authorized list/browse, signed upload of a uniquely named temporary image, returned secure URL/public ID, public delivery, selection/persistence in a real document when applicable, signed deletion, and post-delete absence. Do not print secrets. Exact restoration and temporary-asset cleanup are mandatory. A controlled negative must convert upload proof to fetch-only proof and be rejected.

### `REBRAND-UI-008` — single-post sidebar non-sticky on mobile

At every source-defined tablet/phone toggle viewport, the single-post sidebar and its ancestors must compute to non-sticky flow (`position` not `sticky`/`fixed`, no sticky top offset, no transformed sticky container) and must not obscure or trap article content. Desktop behavior must still match the demo. Test a long article while scrolling on a real mobile viewport. A controlled negative must restore sticky positioning below the mobile boundary and be rejected.

### `REBRAND-UI-009` — table of contents only for real H2 content

Build the single-post table of contents from rendered article `h2` nodes only. If there are no eligible H2 elements, the TOC container, heading, links, and reserved empty space must be absent. If H2s exist, TOC labels/order/hrefs must exactly match unique heading IDs, and links must target those headings. Never hard-code TOC entries. Require both no-H2 and multiple-H2 fixtures; a controlled negative must render TOC without H2 and be rejected.

### `REBRAND-UI-010` — working tablet/mobile toggle navigation

Tablet and mobile states must use the supplied demo's toggle menu at every viewport at or below its actual boundary. Trace the active shared layout/header; code in an unused legacy header is not evidence. Test desktop, 1px above the boundary, exact boundary, supplied tablet, and phone widths. At tablet/phone widths, prove the desktop navigation is hidden, the toggle is visible, keyboard-operable, has synchronized `aria-expanded`/`aria-controls`, opens the intended panel, exposes CMS-derived links, supports submenu behavior, closes by the demo-defined controls, survives navigation/reload as intended, and introduces no horizontal overflow. A controlled negative must disable the toggle or expose desktop navigation on tablet/mobile and be rejected.

## Executable completion contract

The destination must expose real positive and controlled-negative package commands and wire them into its normal validation/build path. The global completion manifest must contain `migrationRebrandUiContract` with:

- the exact configured collection list and exact island-covered collection list;
- the exact check set `REBRAND-UI-001` through `REBRAND-UI-010`, each `PASS` with retained evidence;
- the exact controlled-negative ID set, each `PASS` with the intended expected failure and retained evidence;
- `categoryUrlShape: "prefix-free"`;
- responsive evidence for desktop, tablet, and mobile;
- real positive, negative, and build commands;
- aggregate `PASS` with retained evidence.

Any omitted collection, check, negative, viewport, upload/delete proof, category assignment, empty-state fixture, no-H2 fixture, or toggle interaction is `FAIL` or `BLOCKED`. It cannot be waived as visual-only, demo-only, indexing delay, framework convention, or a site-specific exception.
