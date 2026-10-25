# MIGRATION-ASSURANCE-EXECUTABLE-001 — Permanent Skill/Core Persistence Control

## User requirement

A promise, conversational acknowledgement, remembered intention, task list, or retrospective report is not assurance. The migration safeguards must exist as durable files in the reusable `astro-tina-cms` skill, be invoked by `ASTRO-TINA-MIGRATION-CORE`, and be enforced by executable validation.

## Automatic scope

This control activates automatically for every Astro/Tina migration, clone, repair, resumption, deployment, or completion/status claim. The user never has to repeat it.

## Required persistent artifacts

The active global skill must retain and load all of these artifacts:

- `SKILL.md`
- `references/ASTRO-TINA-MIGRATION-CORE.md`
- `references/ASTRO-TINA-MIGRATION-STATE-MACHINE.md`
- `references/ASTRO-TINA-MIGRATION-COMPLETION-POLICY.json`
- `references/TINA-FULLCHECK.md`
- `references/PUBLISHER-ADMIN-GATE.md`
- `templates/migration-evidence-manifest.json`
- `scripts/validate-migration-completion.mjs`
- `scripts/test-migration-completion-negative.mjs`
- `references/MIGRATION-ASSURANCE-EXECUTABLE-001.md`
- `references/CATEGORY-ROUTE-MULTICAT-EXECUTABLE-001.md`
- `references/GITHUB-AUTHORIZATION-CONTRACT-001.md`

Every destination migration manifest must retain an `assurance` record naming the installed skill, installed skill version, absolute skill path, automatic-core status, SHA-256 digest for every required persistent artifact, and the result of the controlled-negative suite.

## Fail-closed enforcement

The completion validator must reject the migration when:

- this assurance gate is absent, blocked, failed, or lacks retained evidence;
- the skill name, version, or path is missing;
- automatic core activation is not recorded as true;
- any required persistent artifact is absent from the assurance record;
- an artifact digest is missing or is not a full SHA-256 digest;
- the controlled-negative suite did not pass;
- the policy and manifest versions differ;
- `categoryContract` is absent or its applicability contradicts the source inventory;
- an applicable category contract lacks destination positive/negative command wiring, any required surface check, a two-category backend/public tuple, exact ordered tuple parity, or a named controlled-negative result;
- `/category/` is reintroduced where the frozen authority is prefix-free, or saved category cardinality is reduced on the public article;
- `incidentControls` does not exactly cover every policy-required failure-derived control once with retained `PASS` evidence or an evidence-backed `NOT_APPLICABLE` rationale;
- `deploymentRuntime` is absent, target/active-pointer/serving SHAs differ, activation or rollback is unverified, or stale runtime instances, owned temporary jobs or owned transport artifacts remain.

Controlled negatives must independently prove rejection when the assurance record, one artifact digest, negative-suite proof, incident-control row, serving-runtime parity, stale-runtime inventory, temporary-job cleanup or transport-artifact cleanup is removed or corrupted.

## Completion language

No migration may be described as done, complete, passed, stable, or equivalent unless `assurancePersistence=PASS`, the positive completion validator exits `0`, and the controlled-negative suite passes. This named control is part of CORE GATE 0 and cannot be replaced by prose.
