# ASTRO-TINA-MIGRATION-STATE-MACHINE — Global Non-Bypassable Process

## Authority and trigger

This process is activated automatically by `ASTRO-TINA-MIGRATION-CORE` for every Astro/Tina migration, clone, repair, resumption, release, deployment, or completion/status claim. It is global and never depends on the user naming it. Load `ASTRO-TINA-MIGRATION-COMPLETION-POLICY.json` and retain one machine-readable evidence manifest for the entire run.

## State transitions

Only these forward transitions are valid:

1. `INIT` → `CORE_GATE_0_PASS`
2. `CORE_GATE_0_PASS` → `PREFLIGHT_PASS`
3. `PREFLIGHT_PASS` → `IMPLEMENTED`
4. `IMPLEMENTED` → `LOCAL_VALIDATION_PASS`
5. `LOCAL_VALIDATION_PASS` → `CANDIDATE_RELEASE_DEPLOYED`
6. `CANDIDATE_RELEASE_DEPLOYED` → `TINA_FULLCHECK_PASS`
7. `TINA_FULLCHECK_PASS` → `PUBLISHER_ADMIN_GATE_PASS`
8. `PUBLISHER_ADMIN_GATE_PASS` → `EXACT_RESTORATION_PASS`
9. `EXACT_RESTORATION_PASS` → `FINAL_IMMUTABLE_RELEASE_DEPLOYED`
10. `FINAL_IMMUTABLE_RELEASE_DEPLOYED` → `READ_ONLY_PRODUCTION_VERIFY_PASS`
11. `READ_ONLY_PRODUCTION_VERIFY_PASS` → `COMPLETE`

A transition may occur only when its evidence is retained in the manifest and the reusable completion validator accepts it. Missing, stale, representative, contradictory, or unretained evidence fails closed. No state may be inferred from prose, prior intent, a task list, script name, exit code, success string, build, HTTP response, commit, push, or deployment.

## Mandatory checkpoints

### 1. Core gate

Load the umbrella and every component rule, preserve user-supplied resource truth, establish exact destination identity, and load `MIGRATION-ASSURANCE-EXECUTABLE-001`. Record the persistent skill name/version/absolute path and SHA-256 digest for every required assurance artifact, then run positive plus controlled-negative preflights. `assurancePersistence` must be `PASS` with retained evidence. Before this passes, only read-only inspection and gate repair are allowed.

### 2. Preflight

Inventory schema collections, editable route aliases, system classes, services, demo authority, release/rollback paths, protected runtime inputs, fixtures, and public assertions. Instantiate `githubAuthorization` for the exact resource owner and selected repository; require the exact permission map from `GITHUB-AUTHORIZATION-CONTRACT-001`, approved/unexpired token evidence, and planned workflow-push/Actions-run proof. Derive `categoryContract` applicability from the category collection and post/article schema. When applicable, freeze prefix-free source/boilerplate route shape, every link/canonical/sitemap/admin surface, and a two-category fixture; record that the demo category count never limits frontend cardinality and that the backend category array is the cardinality authority; package-wire the destination positive validator and all required controlled negatives before implementation. The collection set, route map and category contract become immutable acceptance scope for this run. Any later schema/route change invalidates the map and returns the process to `PREFLIGHT_PASS` only after regeneration.

### 3. Implementation and local validation

Implementation can be committed or pushed as an implementation milestone, but it is never completion. Validate source, schema, generated artifacts, normal Cloud checks, routes, demo fidelity, secrets, rollback, and controlled negatives before a candidate deployment.

### 4. Candidate release

Deploy a candidate release so authenticated live-admin mutation tests can run. Record its exact SHA. Do not call the candidate final. Retain command-specific staging/cutover markers and `deploymentRuntime` evidence; the candidate transition is blocked until target release, active pointer and actual serving worker/deployment instance agree and no stale owned runtime remains.

### 5. `TINA-FULLCHECK`

The checker must first prove that its own contract covers every configured collection, every editable canonical/alias route, every required field/system class, exact restoration, cleanup, and lineage. Then generate the collection-by-collection authenticated sidebar/island matrix. A partial checker must identify itself as partial and cannot emit a passing fullcheck result.

### 6. `PUBLISHER-ADMIN-GATE`

Personally run the real live-admin Save → authenticated backend → cache-busted public reflection → exact admin/backend/public restoration transaction for every configured collection and affected save path. Each transaction is dirty from immediately before Save until all restoration proofs pass. Restoration outranks additional coverage.

### 7. Exact restoration and cleanup

Require zero dirty records, zero temporary media, marker absence, exact complete-document restoration, and authenticated plus public restoration. A click on Save or a successful mutation response is not cleanup proof. Any incomplete cleanup blocks all later transitions.

### 8. Final immutable release

Fetch all Tina/editor restoration commits, inspect the final tree, rebuild, scan, package, and deploy that exact full SHA. Require local HEAD, remote branch, archive marker, deployed marker, active release pointer and actual serving runtime equality. Do not infer runtime equality from a restart marker or HTTP `200`; discover and retire stale owned instances, then recheck after a fresh request. Remove every owned temporary scheduler row and transport artifact by exact identity and prove both inventories empty. Do not rerun mutating acceptance after this transition.

### 9. Read-only production verification

Repeat route, admin shell, authenticated sidebar discovery, island metadata, services, demo fidelity, release identity, process health, rollback, and cleanup checks without mutation. Only this state can unlock completion.

## Completion-claim lock

`COMPLETE` is computed, never declared manually. The reusable validator must return success for the same evidence manifest and confirm:

- `assurancePersistence` is `PASS`, the installed reusable skill identity/path is retained, every policy-required persistent artifact has a full SHA-256 digest, and the controlled-negative suite passed;
- every mandatory gate is `PASS`, or `NOT_APPLICABLE` only where the policy permits it and rationale/evidence are retained;
- `incidentControls` exactly covers every policy-required failure-derived control once with `PASS` evidence or an evidence-backed `NOT_APPLICABLE` rationale;
- configured collections exactly equal collection evidence keys;
- every collection contains real authenticated admin/save/reflection/restoration evidence;
- every editable route contains non-empty form ID/query/variables/data, bridge proof, and exactly one intended primary form;
- every required system class is explicit;
- `categoryRouteContract` and `multiCategoryCardinality` are `PASS` whenever the source inventory contains category capability; the destination positive/negative commands are real and wired, all required category surfaces pass, every named controlled negative fails for its intended reason, and the backend/public tuples match exactly with at least two categories;
- cleanup is exact and empty;
- `deploymentRuntime` proves exact target/pointer/serving release parity, verified activation and rollback, zero stale runtime instances, zero owned temporary jobs and zero owned transport artifacts;
- final lineage is equal at every checkpoint;
- zero failures and zero unrun items remain;
- read-only production verification passed after the final deployment.

Until then, allowed language is limited to the actual state, for example: `IMPLEMENTED`, `CANDIDATE DEPLOYED`, `FULLCHECK BLOCKED`, or `RESTORATION REQUIRED`. `done`, `complete`, `PASS`, `stable`, and equivalent completion language are prohibited.

## Required repository wiring

Every destination repository must contain or equivalently implement:

- the policy and an evidence-manifest template;
- a positive completion validator;
- controlled negatives that remove one collection, one route, one route metadata field, one restoration proof, one system class, one cleanup proof, one lineage equality, one category surface check, one category-contract negative result, one tuple entry, and one destination package command;
- package commands whose exact targets are validated;
- a `tina:fullcheck` command that cannot pass unless the completion validator accepts the current run manifest.

A repository summary or policy copy without executable wiring is `BLOCKED`.
