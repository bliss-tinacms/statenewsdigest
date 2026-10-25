# ISLAND-RENDER-COMPLETENESS-001 — Complete Tina Island Refresh Boundaries

## Trigger

Apply to every Astro + TinaCMS route or visible region rendered inside `TinaIsland`, including Posts, Pages, Categories, Users/Authors, Navigation, and Global Config. This complements collection-specific query/editability gates: valid form metadata is necessary but does not prove that an island can re-render its complete visible region after Save.

## Failure mode

`TinaIsland` has two rendering paths:

1. the route's initial child markup; and
2. the registry component returned by the island refresh endpoint.

The registry component—not the original route child—is what replaces the island wrapper during visual editing. If the initial child renders a full archive but the registry component renders only its heading/profile, a successful edit can replace the archive with the heading alone. Likewise, wrapping a header in a Config island while its component also expects Navigation data can make the menu disappear after a Config refresh.

An HTTP `200`, visible initial page, non-empty form, or successful save does not catch this boundary mismatch.

## Required architecture

1. **One wrapper, one complete refresh subtree.** The registry component must render the entire DOM subtree owned by that island wrapper, including every structural sentinel and dependent listing shown inside it.
2. **Fetch dependencies during refresh.** If the island document controls an archive, the registry component must re-fetch and deterministically filter the dependent posts/users/pages needed to rebuild that archive. Do not rely only on route-only props that are absent from the refresh request.
3. **Split collection ownership visibly.** When a region contains data from different collections, use separate visible islands whose wrappers preserve layout—for example Global Config for logo/brand and Navigation for menu items. Do not satisfy coverage with hidden islands.
4. **Keep refresh props collection-complete.** `propsFromData` must match what the registry component actually expects. A Config query cannot be treated as if it also returned Navigation, and vice versa.
5. **Preserve layout through wrappers.** Island wrapper elements must not alter flex/grid geometry. Use a tested wrapper class such as `display: contents` only where browser/accessibility behavior is acceptable, or make the wrapper the intended layout item.
6. **One primary form for the intended record.** Canonical and editable alias routes must expose exactly one primary form for the route-owned document; secondary visible islands remain non-primary unless the design explicitly makes them route-owned.
7. **No metadata-only editability.** Visible values must derive from the same authoritative document attached to the form. `editData` remains metadata, not public content.

## Acceptance test

For every island row:

1. Capture the initial wrapper's stable structural sentinels: heading, card/list container, expected card count, navigation/footer region, and route-specific empty state.
2. Call the real island refresh endpoint with the exact island name and parameters.
3. Assert a substantial query, exact `relativePath`, expected data key, stable non-empty form ID, and correct primary-form cardinality.
4. Parse the refresh HTML and require the same wrapper-owned structural sentinels and expected dependent-item membership as the initial page.
5. Perform the authenticated Save → backend → public reflection → exact restore transaction and repeat the structural checks after both save and restore.

## Required controlled negatives

The destination suite must reject:

- initial full archive + refresh header-only component;
- registry component that receives no dependent posts and renders an empty list;
- Config refresh that removes Navigation;
- Navigation refresh that removes brand/config content;
- hidden collection islands used only to make the editor bar list a collection;
- wrappers that change grid/flex geometry;
- refresh output with missing route sentinels, wrong card membership, stale demo cards, or duplicate primary forms.

## Evidence row

Record `ISLAND-RENDER-COMPLETENESS-001` per configured collection/route with initial sentinels, refresh endpoint, form/query/variables, refreshed sentinels, dependent membership, primary-form count, save/reflection/restore evidence, and controlled-negative results.
