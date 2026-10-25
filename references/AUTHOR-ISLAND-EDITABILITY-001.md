# AUTHOR-ISLAND-EDITABILITY-001 — Global Author/Profile Editability Gate

## Scope and trigger

This is a permanent global Astro + TinaCMS migration rule, not a domain-specific fix. Load and enforce it for every new domain, clone, migration, rebuild or repair that has an author, user, profile, contributor or equivalent identity collection or public archive/profile route. `ASTRO-TINA-MIGRATION-CORE` activates it automatically.

If no such collection or route exists, record `NOT_APPLICABLE` with schema and route-inventory evidence. Do not silently omit the gate.

## Required contract

A rendered author page, HTTP `200`, `data-tina-island`, or `data-tina-form` alone does not prove editability. Every canonical and editor alias expected to be editable must:

1. resolve the authoritative author/user document from Tina before creating form metadata;
2. use the exact generated collection query and meaningful variables, including `relativePath: <slug>.json`;
3. return the expected author/user data key, a non-empty stable form ID, substantial non-empty query metadata and exactly one primary form;
4. keep public rendering data separate from `editData`, while binding visible author fields to the same resolved record;
5. fail closed rather than return an HTTP-200 hollow form with `query: ""`, `variables: {}`, missing authoritative data or no usable primary form;
6. apply the same island contract to every canonical/editor route alias that renders the author/profile document.

For boolean `data-tina-primary`, test attribute-key presence rather than requiring a non-null value.

## Executable enforcement

Use the stable ID `AUTHOR-ISLAND-EDITABILITY-001` unchanged in all applicable layers:

- canonical and repository migration policy;
- source validator and controlled-negative tests;
- executable `TINA-FULLCHECK` output/assertions;
- `PUBLISHER-ADMIN-GATE` case and evidence;
- final migration report.

The executable gate must prove:

- the canonical route and every editable alias reference the intended author island;
- preview `POST` returns exactly one intended form;
- the form ID is stable and non-empty;
- query length is substantial and contains the author/user collection query;
- `variables.relativePath` exactly matches the selected document;
- response data contains the expected author/user record;
- exactly one form is primary and it belongs to that record;
- public name, avatar, biography, URL/byline and equivalent identity fields derive from one resolved record, with per-document author references taking precedence over global fallback.

## Mandatory negative guards

The validator/negative suite must reject:

- an unresolved generated-client request passed directly into a metadata helper;
- a hollow payload with empty query or variables;
- an editable canonical route or alias without its island wrapper;
- zero or multiple primary forms;
- a fullcheck, migration policy or Publisher/Admin gate that omits `AUTHOR-ISLAND-EDITABILITY-001`;
- a public author rendering that mixes identity fields from different records or reverses per-document/global precedence.

## Live Publisher/Admin acceptance

Using the supplied live Publisher/Admin account, personally:

1. authenticate through the real `/admin/` flow;
2. open the exact author/user document and wait for a concrete author field;
3. capture the original complete document and visible/public baseline;
4. save a unique temporary marker through the Tina sidebar;
5. prove the marker in authenticated Tina, the island metadata and one unique cache-busted public selector;
6. restore through the sidebar in `finally`;
7. prove exact authenticated document restoration, exact public restoration and marker absence.

The transaction must preserve unrelated fields byte-for-byte or by an equivalent complete-document equality proof. Field loading, save, reflection or restoration that is missing, failed, unavailable or unrun makes this gate `BLOCKED` or `FAIL`, never `PASS` or `done`.

## Refresh-boundary completeness

Load `ISLAND-RENDER-COMPLETENESS-001.md` with this gate. The author route's initial child and the registry refresh component must own the same complete visible subtree. If the initial island contains an author profile plus filtered post grid, the refresh component must re-fetch that author's posts and render both profile and grid; a registry component that returns only the profile/header is a failure because a successful visual edit would erase the archive from the wrapper. Compare route and refresh structural sentinels, exact author-post membership, empty state, pager, and primary-form cardinality before and after the reversible live transaction.

## Proxy/header pitfall: empty visual-editing sidebar

If island/metadata endpoints pass but the real admin preview iframe has no `data-tina-form` payloads and no `/admin/bridge.js`, inspect the iframe navigation as received through the hosting proxy. cPanel/LiteSpeed or another reverse proxy can strip `Sec-Fetch-Dest`, causing `@tinacms/astro` edit-mode detection to return false even when the browser sent a same-site `/admin/` referrer.

A safe repair is to normalize the preview request in project middleware before Tina's middleware runs: require a GET from the same normalized public hostname (`www.` and apex may be equivalent), require an exact `/admin`, `/admin/`, or `/admin/index.html` referrer path, redirect to the same public URL with `tina-edit=1`, and configure Tina middleware with `middlewareOrder: 'post'`. Do not accept arbitrary external referrers, and construct the redirect from trusted forwarded/public host information rather than an internal Passenger origin. Verify in the real authenticated iframe that the redirect is 302, bridge.js is 200, metadata forms are non-empty, and exactly one form is primary.

## Completion evidence

Report one explicit row named `AUTHOR-ISLAND-EDITABILITY-001` with canonical route, aliases, collection/document, query/variables/data/primary-form assertions, authenticated edit, backend/public reflection, exact restoration and controlled-negative results. A build, HTTP `200`, visible preview or policy marker is not sufficient evidence.

See `author-island-identity-and-gate-id.md` for implementation patterns, hollow-form diagnosis and parser pitfalls.
