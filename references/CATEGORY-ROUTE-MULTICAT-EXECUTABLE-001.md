# CATEGORY-ROUTE-MULTICAT-EXECUTABLE-001 — Non-bypassable category migration control

## Why this exists

A prose rule did not prevent a destination migration from reintroducing `/category/` and collapsing a saved category list to the first item. Therefore prose, memory, a checklist, and a successful build are not enforcement. This control makes route shape and category cardinality inputs to the global completion decision.

## Automatic scope

Load this control during `CORE GATE 0` for every Astro/Tina migration, repair, resumption, deployment, or completion claim. The user never has to mention categories or repeat the rule.

Applicability is derived from source inventory, not agent preference:

- if a category/taxonomy collection exists, or a post/article schema has a category reference/list field, `categoryContract.applicable` must be `true`;
- it may be `false` only when both are absent and the manifest retains schema/route inventory evidence;
- a blog/news/publication with categories can never mark this control `NOT_APPLICABLE`.

## Frozen source contract

Before implementation, record in the retained manifest:

- the authoritative source/boilerplate category route shape;
- the category collection and article category field definitions;
- every Astro archive route and legacy alias;
- Tina `ui.router` output;
- every permalink helper;
- navigation, pagination and CMS-generated category links;
- article/category badge renderers;
- canonicals, sitemap/RSS and admin shortcuts;
- a committed article fixture with at least two selected categories.

When the source/boilerplate uses prefix-free archives, the required canonical shape is `/<category-slug>/`. `/category/<slug>/` may exist only as a verified `301` legacy alias to the prefix-free canonical. A familiar CMS convention never overrides the supplied source.

## Destination executable requirement

Before implementation proceeds, every applicable destination must contain and package-wire:

- a positive source validator that inspects the destination’s actual files;
- a controlled-negative suite that mutates isolated fixtures;
- starter/preflight validation wiring;
- normal site/build validation wiring;
- a tracked remote-CI workflow copied or equivalently implemented from `templates/category-contract-ci.yml`, running both positive and controlled-negative commands on every push and pull request;
- machine-readable retained output including the successful CI run URL and conclusion.

Removing the validator, replacing it with `true`, `echo`, or an empty command, or removing either command from remote CI is itself a controlled failure.

The positive validator must inspect all frozen surfaces above and reject prefix drift. It must also reject first-item-only reduction patterns including `categories[0]` without complete remainder iteration, `.slice(0, 1)`, `.slice(1, 1)`, singular `primaryCategory` projection, or equivalent `.find(...)`/first-only logic. It must require one dedicated public badge/link per saved category, preserving exact count, source order, normalized label, slug and href. **Archive membership is a separate mandatory contract:** normalize every post's complete category-reference array, filter the complete collection by the active category, then paginate the filtered collection. Paginating first, slicing the unfiltered list, or replacing an empty result with all posts is forbidden. A multi-category post must appear in every assigned archive. When an authority/demo HTML template contains populated placeholder cards, filtering the data is not enough: the renderer must remove every unused card node, remove invalid pager controls, and replace an empty featured/list region with an explicit empty-state node. Otherwise stale demo posts remain publicly visible despite a correct filtered array. **`DEMO-MULTICAT-OVERRIDE-001` must be recorded as active whenever the Tina category field is list-valued. A demo with one visible category has zero authority over cardinality:** it supplies one repeated-item design, while the Tina list supplies the count. The manifest must record `demoCategoryCountDoesNotLimitFrontend=true` and `frontendCardinalitySource="backend-category-array"`; otherwise completion fails.

The controlled-negative suite must independently prove rejection for at least these IDs:

1. `prefix-permalink-helper`
2. `prefix-tina-router`
3. `prefix-archive-route`
4. `prefix-navigation-or-generated-link`
5. `prefix-canonical-or-sitemap`
6. `legacy-alias-not-301`
7. `first-category-only`
8. `secondary-category-dropped`
9. `category-order-or-href-corrupted`
10. `destination-build-wiring-removed`
11. `repository-ci-wiring-removed`
12. `demo-single-category-cardinality-collapse`
13. `category-filter-bypassed-before-pagination`
14. `category-filter-moved-after-pagination`
15. `category-pagination-uses-unfiltered-total`
16. `empty-category-falls-back-to-all-posts`
17. `stale-demo-card-retained`
18. `category-archive-oracle-row-omitted`
19. `category-archive-unrelated-post-injected`
20. `category-archive-page-order-corrupted`

A negative that fails for an unrelated reason does not count.

## Runtime and live acceptance

For an applicable destination, completion evidence must prove:

- prefix-free canonical archive returns `200`;
- every legacy prefixed alias returns `301` to the exact canonical;
- public navigation, pagination, article badges, canonicals, sitemap/RSS and admin links contain the required route shape;
- a two-or-more-category fixture returns the exact backend category tuple and exact dedicated public DOM tuple;
- desktop and mobile show every badge/link with zero category loss and zero horizontal overflow;
- authenticated live admin safely adds/removes a category, saves, proves the complete changed set publicly, restores the exact original array, and proves admin/backend/public restoration;
- each live archive is compared against an assignment oracle built from the destination's actual category collection plus every post's complete backend category array; every rendered article must belong to the active category, every expected first-page article must render, and empty categories must expose the explicit empty state with zero article-card nodes;
- the archive oracle must enumerate actual configured category records rather than a hard-coded guessed category list, and cache-busted requests must be retried with a normal browser user agent before classifying an edge response;
- the restoration-tip SHA is rebuilt and deployed before final read-only verification.

## Global completion lock

The stable regression ID for archive membership and operation order is `CATEGORY-ARCHIVE-MEMBERSHIP-ORDER-001`.

The global completion manifest must contain `categoryContract`. For every applicable migration, `categoryContract.archiveMembership` must contain:

- `operationOrder` exactly equal to `loadAllPosts`, `normalizeAssignments`, `filterByActiveCategory`, `paginateFilteredPosts`, `renderPagePosts` in that order;
- `configuredCategorySlugs`, derived from the destination's actual category records, as a non-empty unique array;
- `assignmentOracleSource="backend-complete-category-arrays"`;
- booleans proving filtered totals, multi-category inclusion in every assigned archive, explicit empty state, zero cards on empty archives, no fallback to all posts, unused template-card removal, and invalid-pager removal;
- one `liveArchiveRows` entry for every configured category, with no duplicates or extras;
- each row's unique `categorySlug`, complete `backendAssignedPostSlugs`, page size, exact `expectedFirstPagePostSlugs`, exact `renderedPostSlugs`, empty `unrelatedRenderedPostSlugs`, `articleCardCount`, `emptyStateCount`, `status="PASS"`, and retained evidence;
- a passing populated-archive control and a passing empty-archive proof, each with retained evidence.

The completion validator must calculate rather than trust these claims: expected first-page slugs must equal the backend-assigned array sliced to `pageSize`; rendered slugs must exactly match expected order; unrelated slugs must be empty; `articleCardCount` must equal rendered count; a zero-assignment row must have `emptyStateCount=1`; a populated row must have `emptyStateCount=0`. The configured category set must exactly equal the archive-row set.

Controlled negatives must independently mutate operation order, remove the active-category filter, use the unfiltered total, inject all posts into an empty category, retain a stale template card, omit an archive row, inject an unrelated slug, and break exact page ordering. Every mutation must fail for its intended invariant.

`categoryRouteContract` and `multiCategoryCardinality` are mandatory gates. They may be `NOT_APPLICABLE` only with the evidence-backed absence described above. Build success, HTTP `200`, Git state, deployment, checker names, and prose can never satisfy these gates.
