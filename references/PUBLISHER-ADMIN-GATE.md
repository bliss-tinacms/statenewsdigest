# PUBLISHER-ADMIN-GATE — Permanent Global Core Rule

## Global scope

This rule applies to every Astro + TinaCMS project before completion is claimed for work affecting editing, content, schema, media, SEO, templates, routing or public reflection. It is not domain-specific.

“Publisher” is the supplied account name, not a restricted role. Treat it as an ADMIN account and verify its real permissions instead of assuming limitations from the name.

## Collection-complete scope and evidence ledger

Derive the configured collection set and editable route/save-path map during migration preflight. The gate test map must equal that complete set; “affected,” “representative,” homepage-only, or one document-type sampling cannot reduce the scope for a migration completion claim. If one collection is genuinely non-public, retain its classification/rationale and still run authenticated sidebar, Save, backend reflection and exact restoration.

Write every transaction into the same retained migration evidence manifest used by `TINA-FULLCHECK`. Mark a row dirty immediately before Save. Do not clear it when Save succeeds, when a mutation response arrives, or when the admin reloads. Clear it only after all of these pass: exact complete-document admin restoration, authenticated backend restoration, cache-busted public restoration where public, marker absence, and temporary-media deletion/absence where applicable.

The gate is not complete until `configuredCollections` exactly equals the transaction rows, every editable route/save path is represented, and `cleanup.dirtyRecords` is empty. A failure or interruption triggers restoration before any additional test.

## Required personal live-admin transaction

In the active session, personally log into the real live `/admin/` with the approved Publisher/Admin account. API probes, generated payloads, builds, screenshots, delegated reports and unauthenticated browser checks cannot substitute for this gate.

For every affected collection, document type, field class, sidebar/form, media path and save path:

1. Open the correct live document and prove the intended form is selected.
2. Record the exact original backend and public value.
3. Make one safe unique temporary change using the real admin control.
4. Click the real Save control and observe the actual mutation destination without exposing credentials.
5. Prove the exact new value through an authenticated backend read.
6. Prove cache-busted public reflection at the predetermined unique DOM, metadata or structured-data location.
7. Restore the exact original value through the admin.
8. Prove authenticated backend restoration.
9. Prove cache-busted public restoration and marker absence.
10. Delete temporary media through the configured media path and prove absence when media was tested.

## Named author-island transaction

Whenever an author/user/profile/contributor collection or route exists, the acceptance matrix must include a row named exactly `AUTHOR-ISLAND-EDITABILITY-001`. Prove the canonical and editor aliases resolve the intended author island with a stable non-empty form ID, substantial collection query, exact `variables.relativePath`, expected record data and exactly one primary form. Then perform the real sidebar Save → authenticated backend → cache-busted public reflection → exact complete-document/admin/backend/public restoration transaction on that author record. If no author-equivalent feature exists, record `NOT_APPLICABLE` with schema and route-inventory evidence; never omit the row silently.

## Atomic cleanup

Treat each test as an atomic transaction. Mark it potentially dirty before Save and keep cleanup responsibility active until admin, backend and public restoration all pass. If tools, time or authentication fail, restoration takes priority over further testing.

## Release ordering

Run this mutable gate against a candidate release before final immutable packaging. Tina saves may advance the Git branch even after visible restoration. Fetch the final restoration commit, inspect it, rebuild and deploy that exact SHA, then run read-only final checks without repeating the mutation loop.

## Fail-closed result

If login, form discovery, Save, authenticated read, public reflection, restoration, cleanup or final lineage verification is incomplete, failed, stale, representative-only or unrun, report `BLOCKED` or `FAIL`; never `done`. A successful gate advances the migration state only to `PUBLISHER_ADMIN_GATE_PASS`; it does not itself authorize completion.

After the gate, require `EXACT_RESTORATION_PASS`, deploy the exact restoration-tip SHA, run read-only post-final verification, and then run the reusable global completion validator plus controlled-negative suite. Only an accepted manifest with zero dirty records, temporary media, markers, failures and unrun items can unlock the migration’s final completion claim.
