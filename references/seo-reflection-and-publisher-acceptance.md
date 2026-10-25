# SEO Reflection and Publisher Acceptance for Astro + TinaCMS

Use this when SEO values save in Tina but the public `<head>` or a collection route remains stale, or when running a six-collection Publisher gate.

## Trace the complete SEO path

For every SEO-bearing collection, verify all six layers separately:

1. Schema field definitions and documented fallback behavior.
2. Stored Git/frontmatter or JSON values.
3. Generated Tina types and hand-written GraphQL selections.
4. The SSR loader selected for the exact public route.
5. Layout/head prop mapping.
6. Fresh public HTML and a fresh browser DOM.

A field visible in Tina, a successful save response, or a correct list/card is not proof that the detail route's metadata uses the same source.

## Homepage list-payload trap

A collection/list query is often intentionally lightweight. If the router recognizes the homepage from that list payload and then renders it directly, nested SEO fields can be absent even though Tina Admin shows them.

Required pattern:

- Use the list result only to identify the document and route.
- Fetch the full document by its stable Tina filename before rendering the page.
- Fall back to the list/local record only when the full-document fetch genuinely fails.
- For blank page `metaTitle`, use the page title before the global site title when the schema promises “falls back to page title.”

## Singleton-versus-connection freshness

Tina/Git saves can make a connection/list query fresh before a separately indexed singleton query, or vice versa. This can produce a split-brain page: homepage cards show the new category copy while the category detail `<head>` still shows the old value.

Diagnostic matrix immediately after a failed public reflection:

- Git branch file at the save commit.
- Authenticated Tina singleton query.
- Tina connection query.
- Same-origin site proxy response.
- Public list/archive surface.
- Public detail-route HTML.

If routing was discovered from a complete connection record, prefer that same complete record for the archive heading, description, and SEO rather than letting an older singleton payload overwrite it. Keep the singleton only as a fallback or for fields omitted by the connection query. Do not call an indexing delay a frontend fix until this source-selection matrix proves which payload is stale.

## Six-collection Publisher gate

Test Page, Blog/Post, Category, User, Navigation, and Global Config through the live admin. For each collection:

1. Capture the exact baseline and abort on an unexpected baseline or existing QA marker.
2. Change one uniquely public field; for Page SEO, test `metaTitle`, `metaDescription`, `ogTitle`, and `ogDescription` together.
3. Require a successful authenticated save response.
4. Verify the marker in cache-busted raw HTML and a brand-new browser context.
5. Restore in `finally`.
6. Verify the baseline publicly and prove the marker is absent.
7. Fetch the branch and account for both mutation and restoration commits.

The runner must isolate each collection. One collection timeout must not skip restoration or prevent later collections from running; record a per-collection FAIL and continue after exact restoration. At the end, fail the overall gate if any collection failed.

Choose a field that actually controls the asserted public target. If `seo.metaDescription` overrides an ordinary `description`, changing only `description` cannot certify `<meta name="description">`; mutate the SEO field and verify the decoded metadata. Likewise, do not accept a marker appearing on a homepage/card when the mapped detail/archive route is the required target.

Repository acceptance must pair the live gate with a package-wired positive SEO contract and a controlled-negative canary. The canary must deliberately break a full-document fetch, an SEO query field, shared-resolver wiring, freshness precedence, and one rendered metadata output in temporary copies; every break must be rejected before a release can build.

## Correct HTML verification

Do not search raw HTML for an unescaped expected title containing `&`, quotes, or other escapable characters. A restored `<title>` may be correct while the source contains `&amp;`.

- Parse `<title>`, canonical, robots, Open Graph, and Twitter elements with an HTML parser or browser DOM.
- Compare decoded attribute/text values exactly.
- Use raw-body substring checks only for ASCII-safe temporary markers.

## Polling and indexing

Publisher save acknowledgement and Git commit creation do not imply every Tina index and SSR path is immediately current. Poll with cache-busting and a bounded timeout, but on timeout:

1. Query the diagnostic matrix above.
2. Restore the original value first if the marker was saved.
3. Independently prove restoration even if the automation's original timeout classification remains FAIL.
4. Do not relabel the gate PASS unless mutation reflection and exact restoration were both observed.

## Final release ordering

Publisher save/restore creates commits. After the gate:

- fetch and fast-forward/rebase to the restoration tip;
- confirm no QA marker remains in tracked content;
- rebuild from that exact final commit;
- deploy one immutable release from that commit;
- verify branch tip, release marker, active worker root, and restored public DOM agree;
- do not repeat the temporary mutations after a parity-only redeploy, which would create an infinite commit/deploy loop.

## Assurance must be executable

When the user asks for assurance that an SEO/editability regression will not recur, do not answer with process prose alone. The completion evidence must include repository-owned, fail-closed controls:

1. A shared resolver/source-selection contract used by every affected route family.
2. Positive contract tests wired into the production validation/build command.
3. Controlled-negative tests that intentionally recreate the known failure classes and prove the gate rejects them.
4. A parameterized all-route audit that compares Tina backend values with decoded public DOM metadata.
5. A repository-owned Publisher gate that mutates and exactly restores every configured collection.
6. Final Git-tip, release-marker, application-root, zero-marker, and public-route parity checks.

A checker is not a `TINA-FULLCHECK` merely because its filename says so. If it does not perform authenticated save → backend proof → public proof → exact restore for every configured collection, classify it as a partial/static check and do not report a full-check PASS.

## Choose a field with a unique public proof location

Before mutating a field, identify where that exact field is rendered publicly. Do not assume a backend field is visible in body text.

- If a category has an explicit `seo.metaDescription`, changing its ordinary `description` may correctly leave the public `<head>` unchanged and the body may not render the description at all. For SEO reflection, mutate `seo.metaDescription` and verify `meta[name="description"]`.
- Page SEO should be verified in title/meta/Open Graph/Twitter DOM values, including documented social fallbacks after restoration.
- Blog title, user role, navigation label, and footer copyright may be verified in visible DOM only when the template actually renders them.

A timeout caused by checking the wrong public surface is a test-design failure, not proof of an application defect. Diagnose backend value, route mapping, and exact DOM destination before changing source precedence.

## Fail-safe Publisher runner behavior

The reusable gate should:

- keep each collection isolated so one failure does not skip later collections;
- restore in `finally`, even after mutation proof times out;
- support a collection filter for diagnosis, while requiring one final unfiltered all-collection PASS;
- treat save-network observations as supporting evidence, with authenticated backend equality plus public DOM equality as the authoritative proof;
- compare empty Open Graph fields using their documented title/description fallbacks after restoration;
- use the collection's real file extension in singleton queries rather than assuming Markdown;
- avoid writing baseline content or credentials into reports when booleans/hashes are sufficient;
- on external timeout or process termination, immediately search the branch and public site for the run's marker, restore through Tina Admin, and independently prove backend/public restoration before resuming.

## Final zero-residue proof

After the last all-collection PASS and before the immutable build:

- fetch the Tina mutation/restoration commits and reconcile to the restoration tip;
- search tracked content for every marker prefix;
- fetch every sitemap URL with cache busting and prove HTTP 200 plus marker absence;
- rebuild and deploy from that exact clean SHA;
- retain the previous verified release for rollback and remove stale processes without deleting the rollback artifact.
