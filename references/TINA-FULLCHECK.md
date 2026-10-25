# TINA-FULLCHECK — Permanent Global Core Rule

## Global scope

This rule applies to every Astro + TinaCMS project whenever full CMS verification is requested or required. It is not domain-specific. Repository scripts may implement it, but this global skill rule defines the minimum acceptance contract.

## Collection-complete coverage

Derive the exact configured collection set from the active Tina schema and require equality with the explicit test map. Representative samples are forbidden. Every configured collection and every affected field class must have a real destination fixture, backend document and public route or an explicit non-public classification.

For each collection, execute and record:

1. Authenticated live-admin login and correct form/sidebar selection.
2. Safe temporary marker edit using the actual Tina Save control.
3. Authenticated backend read proving the exact saved value.
4. Cache-busted public reflection at a pre-mapped unique DOM, metadata or structured-data location where the field is public.
5. Exact admin restoration of the original value.
6. Authenticated backend restoration proof.
7. Cache-busted public restoration and marker-absence proof.

Keep the test dirty until all restoration proofs pass. Restoration outranks additional coverage. Any incomplete cleanup is `BLOCKED`.

## Mandatory SEO reflection matrix

For every SEO-bearing collection and canonical/alias route, `TINA-FULLCHECK` must prove the complete `SEO-REFLECTION-CHAIN-001` transaction. The test map is generated from the active schema and backend documents; hard-coded representative examples are not collection-complete evidence.

Each row must retain all of the following separately:

1. Collection, document, canonical route, every editor alias, and exact public metadata/JSON-LD observation point.
2. Exact pre-mutation admin and authenticated-backend baseline.
3. The schema field, generated or hand-written query field, application loader/data authority, shared resolver input, route/layout prop, and rendered DOM target.
4. A unique marker saved through the real live-admin Save control.
5. Authenticated backend persistence of that exact marker.
6. Cache-busted browser-decoded public reflection on the expected unique route—not merely another list, card, homepage, or route.
7. Exact restoration through the live admin.
8. Authenticated backend equality with the captured baseline.
9. Cache-busted browser-decoded public equality with the baseline and marker absence.
10. The Tina mutation/restoration commits and the final restoration-tip SHA used for the immutable release.

At minimum, decoded assertions must cover title, description, canonical, robots, Open Graph title/description/image, Twitter title/description/image, and relevant structured data when supported. Expected values must be calculated through the destination's documented shared precedence: explicit document SEO → document fields → Global Config → deterministic site fallback. Blank explicit social fields must be tested against their documented fallback rather than compared to an empty rendered tag.

The selected mutation must control the asserted public location. For example, when Category `seo.metaDescription` overrides Category `description`, changing only `description` cannot certify metadata reflection. A backend save without unique public reflection is `FAIL`, even when a different page displays the marker.

### Required executable gates

Before any fullcheck can pass, the destination must execute and retain:

- a positive SEO contract test covering schema/query completeness, shared resolver precedence, freshness authority, route wiring, and metadata rendering;
- a controlled-negative SEO canary that deliberately breaks, in temporary copies, a full-document fetch, a query field, shared-resolver wiring, freshness precedence, and rendered metadata output, and proves each break is rejected;
- a backend-enumerated all-route SEO audit whose configured document count exactly equals its checked route count;
- the authenticated per-collection mutation/restoration matrix above;
- a zero-marker sweep across the remote branch, backend documents, generated artifact, and every enumerated public route;
- exact SHA equality across restoration tip, local `HEAD`, remote branch, immutable archive marker, active deployment pointer, and serving runtime.

The positive and controlled-negative tests must be package-wired into the normal validation/build command. Optional/manual-only execution cannot unlock a release. A fullcheck runner must isolate collection failures, always restore in `finally`, continue later collection rows, and fail the aggregate result if any row failed—even when cleanup later succeeds.

If singleton/detail and connection/list responses disagree after a save, retain both responses and the public route result. Do not relabel the failure as eventual consistency. The application must select a complete demonstrably fresh authority, the controlled-negative suite must protect that rule, and the live mutation must be rerun after repair.

## Required field and system classes

The full check must cover all applicable classes, including:

- Global configuration and navigation;
- pages, homepage and blog/article content;
- categories, authors/users and all relationships;
- `AUTHOR-ISLAND-EDITABILITY-001` for every applicable author/user/profile/contributor collection and canonical/editor route alias, including exact `relativePath`, expected data key, stable form ID, substantial query, meaningful variables, exactly one intended primary form, controlled negatives and live save/reflection/exact restoration; use evidence-backed `NOT_APPLICABLE` only when schema and route inventory prove no author-equivalent feature exists;
- multi-category cardinality and ordered public links;
- `CATEGORY-ROUTE-MULTICAT-EXECUTABLE-001` and stable regression ID `CATEGORY-ARCHIVE-MEMBERSHIP-ORDER-001`: source-derived applicability, prefix-free route authority, destination source-validator/build wiring, every policy-required named controlled negative, complete route/link/canonical/sitemap/admin surfaces, exact two-or-more-category backend/public tuple parity, desktop/mobile visibility and the restored live-admin category transaction. For archive membership, enumerate category records from the active schema/backend rather than a guessed list; normalize every post's complete category array; build the expected membership oracle; prove the runtime order is exactly `load all → normalize → filter active category → paginate filtered results → render`; prove pagination totals use the filtered count; and compare exact expected/rendered first-page slugs for every configured category with zero unrelated slugs. Require a deterministic multi-category fixture to appear in every assigned archive, a true-empty fixture to show exactly one `No published posts yet.` state and zero cards, and a populated control to omit that state. Also prove unused source/demo card nodes and impossible pager links are absent. Missing an empty production category requires a deterministic Tina-backed fixture; it is `BLOCKED`, never silently skipped.
- SEO title, description, canonical, robots, Open Graph, Twitter and relevant JSON-LD;
- editable island metadata with one intended primary form and non-empty query/variables;
- `ISLAND-RENDER-COMPLETENESS-001`: for every island route, compare the initial wrapper and real registry-refresh HTML; require the complete wrapper-owned subtree, structural sentinels, dependent collection membership, empty-state/pager behavior and layout-preserving wrapper to survive refresh. Reject header-only refresh components for full archives, route-only dependent props, hidden coverage islands, and Config/Navigation refreshes that erase each other's visible region;
- logos, ordinary media and rich-text inline media;
- collection-derived custom fields and `input.onChange`/save persistence;
- public route, redirect, 404, RSS and sitemap behavior;
- Cloudinary Media Manager and reversible upload/delete when affected;
- Formspree live DOM action and authorized submission when applicable;
- browser console/network health, broken assets and responsive overflow;
- `activeRuntimeReleaseParity` and `deploymentControlCleanup`: prove `deploymentRuntime.targetReleaseSha == activePointerSha == servingReleaseSha`, retain actual owned process/deployment-instance identity after activation and a fresh request, prove no stale runtime instances remain, validate rollback identity, and re-list the scheduler and transport locations to prove zero owned temporary jobs/scripts/status files/archives. A release marker, pointer, restart marker, API success, cache-busted HTTP `200` or visually correct page cannot substitute for serving-runtime identity;
- `ASTRO-DEMO-LOCK` source, computed-style, geometry, screenshot and interaction checks when a demo applies.

## Dynamic sidebar/island route matrix

Before executing mutations, derive the complete editable route inventory from the active routes, island registry/loaders, collection schema and admin routing. Expand canonical URLs and every editor alias into explicit rows. For every row, retain authenticated browser evidence of:

- the expected collection and document;
- the selected sidebar breadcrumb/form;
- a stable non-empty form ID;
- collection query length greater than 100;
- meaningful variables, including exact `relativePath` where applicable;
- the expected authoritative data key;
- the real browser-loaded bridge;
- exactly one intended primary form;
- refresh HTML that preserves the initial island wrapper's complete structural sentinels, exact dependent-item membership, empty-state/pager state, and all visible collection-owned regions;
- no hollow/error payload or unexpected competing primary.

Homepage forms cannot certify article, page, category, author, navigation or config routes. One route cannot certify an alias. Endpoint-only probes cannot certify the browser sidebar. The matrix must exactly cover the preflight inventory or the result is `BLOCKED`.

## Required evidence manifest

Write all results into the same run manifest defined by `ASTRO-TINA-MIGRATION-STATE-MACHINE.md` and `templates/migration-evidence-manifest.json`. `configuredCollections` must exactly equal the keys under `collections`; `editableRoutes` must exactly match successful `routeEvidence` rows; and `systemClasses` must explicitly equal the global policy set. A public/non-public classification may alter the public assertion only when it has an evidence-backed rationale; it never waives login, sidebar, Save, backend proof or restoration.

Every collection row must retain distinct evidence for authenticated login, correct sidebar selection, document, route metadata, Save, authenticated backend reflection, mapped public reflection, admin restoration, backend restoration, public restoration and marker absence. Every required system class must be `PASS` or evidence-backed `NOT_APPLICABLE`; omission is not `NOT_APPLICABLE`.

## Checker contract gate

Before trusting a repository command named `tina:fullcheck`, inspect and validate its implementation against this document. The destination must wire the global completion policy, manifest validator and controlled-negative suite, or an equivalent stricter implementation. The controlled negatives must independently remove at least one collection, editable route, query/variables/data assertion, primary-form assertion, restoration proof, system class, cleanup proof and lineage equality; each mutation must fail for its intended invariant.

A partial backend/SSR/SEO or HTTP checker must be named and reported as partial and must never print or return a passing `TINA_FULLCHECK` result. The destination `tina:fullcheck` command may return success only when `validate-migration-completion.mjs` accepts the same retained run manifest.

## Executable and fail-closed

A fullcheck must be executable, machine-readable where possible, and controlled-negative-tested. The omission negative must fail when one configured collection or required field class is removed. An island probe, build, API response, HTTP sweep or one successful mutation is never `TINA-FULLCHECK`.

### Completion-claim lock

A script name, an exit code, or a printed string such as `TINA_FULLCHECK_OK True` is not evidence that the script implements this contract. Before trusting any project-local fullcheck, inspect its implementation and map every global requirement above to an executed assertion and evidence field. If the script only checks schema coverage, backend queries, SSR, routes, SEO, or representative forms, classify it as a partial check regardless of its filename or output.

The final report must contain a collection-by-collection dynamic-sidebar/island matrix generated from the real authenticated admin preview. For every configured collection and every editable canonical/alias route, it must record: selected document, non-empty form ID/query/variables/data, intended primary-form count, authenticated save, backend reflection, public reflection, admin restoration, backend restoration, public restoration, and marker absence. Missing or representative-only evidence makes `TINA-FULLCHECK` `BLOCKED` or `FAIL`.

No assistant may use the words `done`, `complete`, `PASS`, or an equivalent completion claim for an Astro/Tina task until the machine-readable report shows every required collection and field/system class as passed, all cleanup/restoration assertions passed, current Git/production lineage verified, and zero unrun items. A code commit, push, deployment, or repair is an implementation milestone only—not completion.

Report every collection and field class separately as `PASS`, `FAIL` or `BLOCKED`. Never call it complete while any required test is missing, failed, unrun or unrestored.
