# DEMO-MULTICAT-OVERRIDE-001 — Permanent Global Cardinality Override

## Automatic trigger

This control activates automatically during `ASTRO-TINA-MIGRATION-CORE` for every Astro + TinaCMS migration, clone, rebuild, repair or resumption whenever the Tina schema contains a list-valued category field. Aaisha never needs to name or repeat the keyword.

## Precedence

`DEMO-MULTICAT-OVERRIDE-001` resolves the only permitted cardinality conflict inside `ASTRO-DEMO-LOCK`:

- `ASTRO-DEMO-LOCK` remains authoritative for the repeated category badge's DOM, classes, styling, dimensions, spacing, geometry, interaction and responsive behavior.
- `MULTICAT-LOCK` and the saved Tina category array are authoritative for badge count, order, labels, slugs and links.
- A demo showing one category is one data instance, never a singular-cardinality requirement.
- Rendering the locked badge once for every saved category is required dynamic binding and is not a DOM-, source- or visual-parity violation.

`categories[0]`, `primaryCategory`, first-item `.find(...)`, `.slice(0, 1)`, hidden remainder categories or equivalent category loss is forbidden.

## Non-bypassable next-migration gate

Before implementation begins, CORE GATE 0 must:

1. Load this exact control as one of the mandatory global component rules.
2. Compute and retain its SHA-256 digest in the migration assurance artifact map.
3. Record `categoryContract.demoMulticatOverrideKeyword="DEMO-MULTICAT-OVERRIDE-001"`.
4. When the category field is list-valued, record `DEMO-MULTICAT-OVERRIDE-001=ACTIVE`, `demoCategoryCountDoesNotLimitFrontend=true`, `astroDemoLockMulticatException=true`, and `frontendCardinalitySource="backend-category-array"`.
5. Require a committed fixture with at least two ordered category references.
6. Run the positive category-contract validator and a controlled negative that removes or changes this keyword and must fail for the keyword invariant.

If this file is missing, not loaded, absent from the assurance digest map, renamed in the manifest, or contradicted by implementation, the migration remains `BLOCKED`. Build success, visual similarity, HTTP `200`, commit, push, deployment or prose assurance cannot override this gate.

## Required implementation proof

For one post containing at least two saved categories, compare the backend array with dedicated public category badge/link nodes and require exact equality of:

- count;
- saved order;
- normalized label;
- normalized slug;
- prefix-free archive href where the source route contract is prefix-free.

The same proof must run locally and on production. The reversible Publisher/Admin transaction must change the complete category set, save, prove backend and public reflection, restore the exact original array, and prove backend/admin/public restoration.

## Controlled failure

The reusable completion validator must reject a manifest whose keyword is missing or differs from `DEMO-MULTICAT-OVERRIDE-001`. The controlled-negative suite must prove that rejection on every migration-policy release.
