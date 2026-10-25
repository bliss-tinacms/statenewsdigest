#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const policyPath = path.resolve(here, '../references/ASTRO-TINA-MIGRATION-COMPLETION-POLICY.json');
const manifestPath = process.argv[2];
if (!manifestPath) {
  console.error(JSON.stringify({ status: 'BLOCKED', completionEligible: false, failures: ['usage: validate-migration-completion.mjs <manifest.json>'] }, null, 2));
  process.exit(2);
}

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
let policy, manifest;
try {
  policy = readJson(policyPath);
  manifest = readJson(path.resolve(manifestPath));
} catch (error) {
  console.error(JSON.stringify({ status: 'BLOCKED', completionEligible: false, failures: [`unable to load policy/manifest: ${error.message}`] }, null, 2));
  process.exit(2);
}

const failures = [];
const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj ?? {}, key);
const nonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const evidencePresent = (v) => Array.isArray(v) && v.length > 0 && v.every((x) => nonEmptyString(x) || (x && typeof x === 'object'));
const statusOf = (v) => typeof v === 'string' ? v : v?.status;
const passed = (v) => v === true || v === 'PASS' || (v && typeof v === 'object' && v.status === 'PASS' && evidencePresent(v.evidence));
const sorted = (xs) => [...xs].sort();
const sameSet = (a, b) => JSON.stringify(sorted(a)) === JSON.stringify(sorted(b));

if (manifest.policyId !== policy.policyId || manifest.policyVersion !== policy.version) failures.push('policy identity/version mismatch');
if (manifest.state !== 'COMPLETE') failures.push(`state must be COMPLETE, got ${JSON.stringify(manifest.state)}`);
if (!Array.isArray(manifest.transitions) || manifest.transitions.length !== policy.states.length) {
  failures.push('transitions must contain every policy state exactly once in order');
} else {
  const actualStates = manifest.transitions.map((x) => x?.state);
  if (JSON.stringify(actualStates) !== JSON.stringify(policy.states)) failures.push('transition state order must exactly match policy states');
  for (const transition of manifest.transitions) {
    if (!nonEmptyString(transition?.at) || !evidencePresent(transition?.evidence)) failures.push(`transition ${JSON.stringify(transition?.state)} requires timestamp and retained evidence`);
  }
}
for (const key of ['origin', 'repository', 'branch']) if (!nonEmptyString(manifest.site?.[key])) failures.push(`site.${key} is required`);
for (const key of ['id', 'startedAt', 'finishedAt']) if (!nonEmptyString(manifest.run?.[key])) failures.push(`run.${key} is required`);

if (manifest.assurance?.control !== policy.assuranceControl) failures.push('assurance.control must match the global assurance control');
if (manifest.assurance?.skillName !== 'astro-tina-cms') failures.push('assurance.skillName must be astro-tina-cms');
if (!nonEmptyString(manifest.assurance?.skillVersion)) failures.push('assurance.skillVersion is required');
if (!nonEmptyString(manifest.assurance?.skillPath) || !path.isAbsolute(manifest.assurance.skillPath)) failures.push('assurance.skillPath must be an absolute path');
if (manifest.assurance?.coreAutomatic !== true) failures.push('assurance.coreAutomatic must be true');
if (manifest.assurance?.negativeSuitePassed !== true) failures.push('assurance.negativeSuitePassed must be true');
const assuranceArtifacts = manifest.assurance?.artifacts && typeof manifest.assurance.artifacts === 'object' && !Array.isArray(manifest.assurance.artifacts) ? manifest.assurance.artifacts : {};
if (!sameSet(policy.requiredAssuranceArtifacts, Object.keys(assuranceArtifacts))) failures.push('assurance artifacts must exactly equal required persistent artifacts');
for (const artifact of policy.requiredAssuranceArtifacts) {
  if (!/^[0-9a-f]{64}$/i.test(assuranceArtifacts[artifact] ?? '')) failures.push(`assurance artifact ${artifact} must have a full SHA-256 digest`);
}

const incidentControls = Array.isArray(manifest.incidentControls) ? manifest.incidentControls : [];
const incidentIds = incidentControls.map((row) => row?.id);
if (!sameSet(policy.requiredIncidentControls, incidentIds) || new Set(incidentIds).size !== policy.requiredIncidentControls.length) failures.push('incidentControls must exactly cover every policy-required failure-derived control once');
for (const row of incidentControls) {
  if (!policy.requiredIncidentControls.includes(row?.id)) continue;
  if (!['PASS', 'NOT_APPLICABLE'].includes(row?.status)) failures.push(`incident control ${row.id} must be PASS or NOT_APPLICABLE`);
  if (!evidencePresent(row?.evidence)) failures.push(`incident control ${row.id} requires retained evidence`);
  if (row?.status === 'NOT_APPLICABLE' && !nonEmptyString(row?.rationale)) failures.push(`incident control ${row.id}: NOT_APPLICABLE requires rationale`);
}

const notApplicableGates = new Set(['demoLock', 'categoryRouteContract', 'multiCategoryCardinality', 'authorIslandEditability', 'cloudinary']);
for (const gate of policy.mandatoryGates) {
  const record = manifest.gates?.[gate];
  const status = statusOf(record);
  if (status === 'PASS') {
    if (!evidencePresent(record?.evidence)) failures.push(`gate ${gate}: PASS requires retained evidence`);
  } else if (status === 'NOT_APPLICABLE' && notApplicableGates.has(gate)) {
    if (!nonEmptyString(record?.rationale) || !evidencePresent(record?.evidence)) failures.push(`gate ${gate}: NOT_APPLICABLE requires rationale and evidence`);
  } else {
    failures.push(`gate ${gate}: expected PASS${notApplicableGates.has(gate) ? ' or evidenced NOT_APPLICABLE' : ''}, got ${JSON.stringify(status)}`);
  }
}

const githubAuthorization = manifest.githubAuthorization;
if (!githubAuthorization || typeof githubAuthorization !== 'object' || Array.isArray(githubAuthorization)) {
  failures.push('githubAuthorization record is required');
} else {
  if (!nonEmptyString(githubAuthorization.resourceOwner)) failures.push('githubAuthorization.resourceOwner is required');
  if (!nonEmptyString(githubAuthorization.repository)) failures.push('githubAuthorization.repository is required');
  if (githubAuthorization.repositorySelected !== true) failures.push('githubAuthorization.repositorySelected must be true');
  const requiredPermissions = {
    contents: 'read-and-write',
    workflows: 'read-and-write',
    actions: 'read-and-write',
    pullRequests: 'read-and-write',
    metadata: 'read-only',
  };
  const permissions = githubAuthorization.permissions && typeof githubAuthorization.permissions === 'object' && !Array.isArray(githubAuthorization.permissions) ? githubAuthorization.permissions : {};
  if (!sameSet(Object.keys(requiredPermissions), Object.keys(permissions))) failures.push('githubAuthorization permissions must exactly equal the required permission set');
  for (const [name, access] of Object.entries(requiredPermissions)) {
    if (permissions[name] !== access) failures.push(`githubAuthorization permission ${name} must be ${access}`);
  }
  if (githubAuthorization.exactPermissionSet !== true) failures.push('githubAuthorization.exactPermissionSet must be true');
  if (githubAuthorization.tokenApproved !== true) failures.push('githubAuthorization.tokenApproved must be true');
  if (githubAuthorization.tokenUnexpired !== true) failures.push('githubAuthorization.tokenUnexpired must be true');
  if (githubAuthorization.workflowFilePushVerified !== true) failures.push('githubAuthorization.workflowFilePushVerified must be true');
  if (!nonEmptyString(githubAuthorization.actionsRunUrl) || !/^https:\/\/github\.com\/.+\/actions\/runs\/\d+/i.test(githubAuthorization.actionsRunUrl)) failures.push('githubAuthorization.actionsRunUrl must identify the successful Actions run');
  if (githubAuthorization.actionsRunConclusion !== 'success') failures.push('githubAuthorization.actionsRunConclusion must be success');
  if (!evidencePresent(githubAuthorization.evidence)) failures.push('githubAuthorization.evidence is required');
}

const categoryContract = manifest.categoryContract;
if (!categoryContract || typeof categoryContract !== 'object' || Array.isArray(categoryContract)) {
  failures.push('categoryContract record is required');
} else {
  for (const key of ['applicable', 'categoryCollectionPresent', 'postCategoryFieldPresent']) {
    if (typeof categoryContract[key] !== 'boolean') failures.push(`categoryContract.${key} must be boolean`);
  }
  if (!evidencePresent(categoryContract.applicabilityEvidence)) failures.push('categoryContract.applicabilityEvidence is required');
  const sourceRequiresContract = categoryContract.categoryCollectionPresent === true || categoryContract.postCategoryFieldPresent === true;
  if (sourceRequiresContract && categoryContract.applicable !== true) failures.push('categoryContract cannot be NOT_APPLICABLE when a category collection or post category field exists');
  if (categoryContract.applicable === false) {
    if (categoryContract.categoryCollectionPresent !== false || categoryContract.postCategoryFieldPresent !== false) failures.push('categoryContract NOT_APPLICABLE requires both category source indicators to be false');
    for (const gate of ['categoryRouteContract', 'multiCategoryCardinality']) {
      const record = manifest.gates?.[gate];
      if (record?.status !== 'NOT_APPLICABLE' || !nonEmptyString(record?.rationale) || !evidencePresent(record?.evidence)) failures.push(`gate ${gate}: categoryContract NOT_APPLICABLE requires rationale and evidence`);
    }
  }
  if (categoryContract.applicable === true) {
    if (categoryContract.authoritativeRouteShape !== 'prefix-free') failures.push('categoryContract.authoritativeRouteShape must be prefix-free');
    for (const key of ['destinationPositiveCommand', 'destinationNegativeCommand']) {
      const command = categoryContract[key];
      if (!nonEmptyString(command) || /^\s*(true|:|echo\b)/i.test(command)) failures.push(`categoryContract.${key} must name a real executable command`);
    }
    if (!nonEmptyString(categoryContract.ciWorkflowPath) || !/^\.github\/workflows\/.+\.ya?ml$/i.test(categoryContract.ciWorkflowPath)) failures.push('categoryContract.ciWorkflowPath must identify a tracked GitHub Actions workflow');
    if (!nonEmptyString(categoryContract.ciRunUrl) || !/^https:\/\/github\.com\/.+\/actions\/runs\/\d+/i.test(categoryContract.ciRunUrl)) failures.push('categoryContract.ciRunUrl must identify the successful remote CI run');
    if (categoryContract.ciRunConclusion !== 'success') failures.push('categoryContract.ciRunConclusion must be success');
    if (categoryContract.demoMulticatOverrideKeyword !== policy.demoMulticatOverrideKeyword) failures.push(`categoryContract.demoMulticatOverrideKeyword must equal ${policy.demoMulticatOverrideKeyword}`);
    if (categoryContract.demoCategoryCountDoesNotLimitFrontend !== true) failures.push('categoryContract.demoCategoryCountDoesNotLimitFrontend must be true');
    if (categoryContract.astroDemoLockMulticatException !== true) failures.push('categoryContract.astroDemoLockMulticatException must be true');
    if (categoryContract.frontendCardinalitySource !== 'backend-category-array') failures.push('categoryContract.frontendCardinalitySource must be backend-category-array');
    const checks = categoryContract.checks && typeof categoryContract.checks === 'object' && !Array.isArray(categoryContract.checks) ? categoryContract.checks : {};
    if (!sameSet(policy.categoryContractRequiredChecks, Object.keys(checks))) failures.push('categoryContract checks must exactly equal required category checks');
    for (const name of policy.categoryContractRequiredChecks) {
      if (!passed(checks[name])) failures.push(`categoryContract check ${name} requires PASS with retained evidence`);
    }
    const negatives = Array.isArray(categoryContract.controlledNegativesPassed) ? categoryContract.controlledNegativesPassed : [];
    const negativeIds = negatives.map((entry) => entry?.id);
    if (!sameSet(policy.categoryContractRequiredNegatives, negativeIds)) failures.push('categoryContract controlled negatives must exactly equal required negative IDs');
    for (const entry of negatives) {
      if (entry?.status !== 'PASS' || !nonEmptyString(entry?.expectedFailure) || !evidencePresent(entry?.evidence)) failures.push(`categoryContract negative ${JSON.stringify(entry?.id)} requires PASS, expectedFailure and evidence`);
    }
    const backendTuple = categoryContract.backendTuple;
    const publicTuple = categoryContract.publicTuple;
    for (const [name, tuple] of [['backendTuple', backendTuple], ['publicTuple', publicTuple]]) {
      if (!Array.isArray(tuple) || tuple.length < 2) {
        failures.push(`categoryContract.${name} must contain at least two categories`);
        continue;
      }
      for (const entry of tuple) {
        for (const key of ['label', 'slug', 'href']) if (!nonEmptyString(entry?.[key])) failures.push(`categoryContract.${name} entries require label, slug and href`);
        if (typeof entry?.href === 'string' && !/^\/[a-z0-9][a-z0-9/-]*\/$/i.test(entry.href)) failures.push(`categoryContract.${name} href must be a prefix-free absolute path`);
        if (typeof entry?.href === 'string' && entry.href.startsWith('/category/')) failures.push(`categoryContract.${name} href reintroduced /category/`);
      }
    }
    if (categoryContract.exactTupleMatch !== true || JSON.stringify(backendTuple) !== JSON.stringify(publicTuple)) failures.push('categoryContract backend/public tuples must match exactly in count, order, label, slug and href');

    const archive = categoryContract.archiveMembership;
    if (!archive || typeof archive !== 'object' || Array.isArray(archive)) {
      failures.push('categoryContract.archiveMembership is required');
    } else {
      const requiredOrder = ['loadAllPosts', 'normalizeAssignments', 'filterByActiveCategory', 'paginateFilteredPosts', 'renderPagePosts'];
      if (archive.regressionId !== 'CATEGORY-ARCHIVE-MEMBERSHIP-ORDER-001') failures.push('categoryContract.archiveMembership.regressionId must equal CATEGORY-ARCHIVE-MEMBERSHIP-ORDER-001');
      if (JSON.stringify(archive.operationOrder) !== JSON.stringify(requiredOrder)) failures.push('categoryContract.archiveMembership.operationOrder must enforce load-all normalize filter paginate render');
      if (archive.assignmentOracleSource !== 'backend-complete-category-arrays') failures.push('categoryContract.archiveMembership.assignmentOracleSource must be backend-complete-category-arrays');
      for (const key of ['paginationUsesFilteredTotal', 'multiCategoryIncludedInEveryAssignedArchive', 'emptyArchiveExplicitState', 'emptyArchiveZeroCards', 'fallbackToAllPostsForbidden', 'unusedTemplateCardsRemoved', 'invalidPagerControlsRemoved']) {
        if (archive[key] !== true) failures.push(`categoryContract.archiveMembership.${key} must be true`);
      }
      const categorySlugs = Array.isArray(archive.configuredCategorySlugs) ? archive.configuredCategorySlugs : [];
      if (categorySlugs.length === 0 || categorySlugs.some((slug) => !nonEmptyString(slug)) || new Set(categorySlugs).size !== categorySlugs.length) failures.push('categoryContract.archiveMembership.configuredCategorySlugs must be a non-empty unique string array');
      const rows = Array.isArray(archive.liveArchiveRows) ? archive.liveArchiveRows : [];
      const rowSlugs = rows.map((row) => row?.categorySlug);
      if (!sameSet(categorySlugs, rowSlugs) || new Set(rowSlugs).size !== rowSlugs.length) failures.push('categoryContract.archiveMembership liveArchiveRows must exactly cover every configured category once');
      for (const row of rows) {
        const prefix = `categoryContract.archiveMembership row ${JSON.stringify(row?.categorySlug)}`;
        if (!nonEmptyString(row?.categorySlug)) failures.push(`${prefix}: categorySlug is required`);
        const backend = Array.isArray(row?.backendAssignedPostSlugs) ? row.backendAssignedPostSlugs : null;
        const expected = Array.isArray(row?.expectedFirstPagePostSlugs) ? row.expectedFirstPagePostSlugs : null;
        const rendered = Array.isArray(row?.renderedPostSlugs) ? row.renderedPostSlugs : null;
        const unrelated = Array.isArray(row?.unrelatedRenderedPostSlugs) ? row.unrelatedRenderedPostSlugs : null;
        for (const [name, values] of [['backendAssignedPostSlugs', backend], ['expectedFirstPagePostSlugs', expected], ['renderedPostSlugs', rendered], ['unrelatedRenderedPostSlugs', unrelated]]) {
          if (!values || values.some((slug) => !nonEmptyString(slug)) || new Set(values).size !== values.length) failures.push(`${prefix}: ${name} must be a unique string array`);
        }
        if (!Number.isInteger(row?.pageSize) || row.pageSize <= 0) failures.push(`${prefix}: pageSize must be a positive integer`);
        if (backend && expected && Number.isInteger(row?.pageSize) && JSON.stringify(expected) !== JSON.stringify(backend.slice(0, row.pageSize))) failures.push(`${prefix}: expectedFirstPagePostSlugs must equal the filtered backend assignment page`);
        if (expected && rendered && JSON.stringify(rendered) !== JSON.stringify(expected)) failures.push(`${prefix}: renderedPostSlugs must exactly match expected first-page order`);
        if (unrelated && unrelated.length !== 0) failures.push(`${prefix}: unrelatedRenderedPostSlugs must be empty`);
        if (!Number.isInteger(row?.articleCardCount) || !rendered || row.articleCardCount !== rendered.length) failures.push(`${prefix}: articleCardCount must equal renderedPostSlugs length`);
        if (!Number.isInteger(row?.emptyStateCount) || row.emptyStateCount < 0) failures.push(`${prefix}: emptyStateCount must be a non-negative integer`);
        if (backend && backend.length === 0 && row.emptyStateCount !== 1) failures.push(`${prefix}: empty category must render exactly one empty state`);
        if (backend && backend.length > 0 && row.emptyStateCount !== 0) failures.push(`${prefix}: populated category must not render the empty state`);
        if (row?.status !== 'PASS' || !evidencePresent(row?.evidence)) failures.push(`${prefix}: PASS requires retained evidence`);
      }
      if (!passed(archive.populatedArchiveControl)) failures.push('categoryContract.archiveMembership.populatedArchiveControl requires PASS with retained evidence');
      if (!passed(archive.emptyArchiveProof)) failures.push('categoryContract.archiveMembership.emptyArchiveProof requires PASS with retained evidence');
    }
  }
}

const configured = manifest.configuredCollections;
if (!Array.isArray(configured) || configured.length === 0 || configured.some((x) => !nonEmptyString(x)) || new Set(configured).size !== configured.length) failures.push('configuredCollections must be a non-empty unique string array');
const collectionMap = manifest.collections && typeof manifest.collections === 'object' && !Array.isArray(manifest.collections) ? manifest.collections : {};
if (Array.isArray(configured) && !sameSet(configured, Object.keys(collectionMap))) failures.push('configuredCollections must exactly equal collection evidence keys');

const migrationRebrandUi = manifest.migrationRebrandUiContract;
if (!migrationRebrandUi || typeof migrationRebrandUi !== 'object' || Array.isArray(migrationRebrandUi)) {
  failures.push('migrationRebrandUiContract record is required');
} else {
  for (const key of ['positiveCommand', 'negativeCommand', 'buildCommand']) {
    const command = migrationRebrandUi[key];
    if (!nonEmptyString(command) || /^\s*(true|:|echo\b)/i.test(command)) failures.push(`migrationRebrandUiContract.${key} must name a real package-wired executable command`);
  }
  const contractCollections = Array.isArray(migrationRebrandUi.configuredCollections) ? migrationRebrandUi.configuredCollections : [];
  const islandCollections = Array.isArray(migrationRebrandUi.islandCollections) ? migrationRebrandUi.islandCollections : [];
  if (!sameSet(configured ?? [], contractCollections) || new Set(contractCollections).size !== contractCollections.length) failures.push('migrationRebrandUiContract configuredCollections must exactly equal migration configuredCollections');
  if (!sameSet(contractCollections, islandCollections) || new Set(islandCollections).size !== islandCollections.length) failures.push('migrationRebrandUiContract islandCollections must exactly cover every configured collection');
  if (migrationRebrandUi.categoryUrlShape !== 'prefix-free') failures.push('migrationRebrandUiContract.categoryUrlShape must be prefix-free');
  const viewports = Array.isArray(migrationRebrandUi.responsiveViewports) ? migrationRebrandUi.responsiveViewports : [];
  if (!sameSet(policy.migrationRebrandUiRequiredViewports, viewports) || new Set(viewports).size !== viewports.length) failures.push('migrationRebrandUiContract responsiveViewports must exactly cover desktop, tablet and mobile');
  const checks = migrationRebrandUi.checks && typeof migrationRebrandUi.checks === 'object' && !Array.isArray(migrationRebrandUi.checks) ? migrationRebrandUi.checks : {};
  if (!sameSet(policy.migrationRebrandUiRequiredChecks, Object.keys(checks))) failures.push('migrationRebrandUiContract checks must exactly equal required rebrand UI checks');
  for (const name of policy.migrationRebrandUiRequiredChecks) if (!passed(checks[name])) failures.push(`migrationRebrandUiContract check ${name} requires PASS with retained evidence`);
  const negatives = Array.isArray(migrationRebrandUi.controlledNegativesPassed) ? migrationRebrandUi.controlledNegativesPassed : [];
  const negativeIds = negatives.map((entry) => entry?.id);
  if (!sameSet(policy.migrationRebrandUiRequiredNegatives, negativeIds)) failures.push('migrationRebrandUiContract controlled negatives must exactly equal required negative IDs');
  for (const entry of negatives) if (entry?.status !== 'PASS' || !nonEmptyString(entry?.expectedFailure) || !evidencePresent(entry?.evidence)) failures.push(`migrationRebrandUiContract negative ${JSON.stringify(entry?.id)} requires PASS, expectedFailure and evidence`);
  if (migrationRebrandUi.status !== 'PASS' || !evidencePresent(migrationRebrandUi.evidence)) failures.push('migrationRebrandUiContract status PASS requires retained evidence');
}

const seoReflection = manifest.seoReflectionChain;
if (!seoReflection || typeof seoReflection !== 'object' || Array.isArray(seoReflection)) {
  failures.push('seoReflectionChain record is required');
} else {
  const applicable = Array.isArray(seoReflection.applicableCollections) ? seoReflection.applicableCollections : [];
  if (applicable.length === 0 || applicable.some((name) => !nonEmptyString(name)) || new Set(applicable).size !== applicable.length) failures.push('seoReflectionChain.applicableCollections must be a non-empty unique string array');
  if (Array.isArray(configured) && applicable.some((name) => !configured.includes(name))) failures.push('seoReflectionChain applicableCollections must be configured collections');
  for (const key of ['positiveCommand', 'negativeCommand', 'buildCommand']) {
    const command = seoReflection[key];
    if (!nonEmptyString(command) || /^\s*(true|:|echo\b)/i.test(command)) failures.push(`seoReflectionChain.${key} must name a real package-wired executable command`);
  }
  const checks = seoReflection.checks && typeof seoReflection.checks === 'object' && !Array.isArray(seoReflection.checks) ? seoReflection.checks : {};
  if (!sameSet(policy.seoReflectionRequiredChecks, Object.keys(checks))) failures.push('seoReflectionChain checks must exactly equal required SEO reflection checks');
  for (const name of policy.seoReflectionRequiredChecks) if (!passed(checks[name])) failures.push(`seoReflectionChain check ${name} requires PASS with retained evidence`);
  const negatives = Array.isArray(seoReflection.controlledNegativesPassed) ? seoReflection.controlledNegativesPassed : [];
  const negativeIds = negatives.map((entry) => entry?.id);
  if (!sameSet(policy.seoReflectionRequiredNegatives, negativeIds)) failures.push('seoReflectionChain controlled negatives must exactly equal required negative IDs');
  for (const entry of negatives) if (entry?.status !== 'PASS' || !nonEmptyString(entry?.expectedFailure) || !evidencePresent(entry?.evidence)) failures.push(`seoReflectionChain negative ${JSON.stringify(entry?.id)} requires PASS, expectedFailure and evidence`);
  if (!Number.isInteger(seoReflection.configuredDocumentCount) || seoReflection.configuredDocumentCount <= 0) failures.push('seoReflectionChain.configuredDocumentCount must be positive');
  if (seoReflection.auditedRouteCount !== seoReflection.configuredDocumentCount) failures.push('seoReflectionChain auditedRouteCount must exactly equal configuredDocumentCount');
  const rows = Array.isArray(seoReflection.routeRows) ? seoReflection.routeRows : [];
  if (rows.length !== seoReflection.configuredDocumentCount) failures.push('seoReflectionChain routeRows must exactly cover every configured SEO document');
  const rowCollections = [...new Set(rows.map((row) => row?.collection).filter(nonEmptyString))];
  if (!sameSet(applicable, rowCollections)) failures.push('seoReflectionChain routeRows must cover every applicable collection');
  const rowKeys = rows.map((row) => `${row?.collection ?? ''}:${row?.document ?? ''}:${row?.route ?? ''}`);
  if (new Set(rowKeys).size !== rowKeys.length) failures.push('seoReflectionChain routeRows must be unique by collection, document and route');
  for (const row of rows) {
    const prefix = `seoReflectionChain route ${JSON.stringify(row?.route)}`;
    for (const key of ['collection', 'document', 'route', 'schemaField', 'queryField', 'dataAuthority', 'resolver', 'renderedTarget']) if (!nonEmptyString(row?.[key])) failures.push(`${prefix}: ${key} is required`);
    for (const key of ['backendMutation', 'publicMutation', 'backendRestoration', 'publicRestoration']) if (!passed(row?.[key])) failures.push(`${prefix}: ${key} requires PASS with retained evidence`);
    if (row?.markerAbsent !== true) failures.push(`${prefix}: markerAbsent must be true`);
    if (row?.status !== 'PASS') failures.push(`${prefix}: status must be PASS`);
    if (!evidencePresent(row?.evidence)) failures.push(`${prefix}: retained evidence required`);
  }
  if (!Array.isArray(seoReflection.zeroMarkerLocations) || seoReflection.zeroMarkerLocations.length === 0 || seoReflection.zeroMarkerLocations.some((item) => !nonEmptyString(item))) failures.push('seoReflectionChain.zeroMarkerLocations must retain every checked cleanup location');
  for (const key of ['restorationTipSha', 'finalDeployedSha']) if (!/^[0-9a-f]{40}$/i.test(seoReflection[key] ?? '')) failures.push(`seoReflectionChain.${key} must be a full SHA`);
  if (seoReflection.restorationTipSha !== seoReflection.finalDeployedSha) failures.push('seoReflectionChain restoration tip and final deployed SHA must match exactly');
  if (seoReflection.status !== 'PASS' || !evidencePresent(seoReflection.evidence)) failures.push('seoReflectionChain status PASS requires retained evidence');
}

const editableRoutes = Array.isArray(manifest.editableRoutes) ? manifest.editableRoutes : [];
if (!Array.isArray(manifest.editableRoutes)) failures.push('editableRoutes must be an array');
for (const entry of editableRoutes) {
  if (!nonEmptyString(entry?.collection) || !nonEmptyString(entry?.url)) failures.push('every editableRoutes entry requires collection and url');
  if (!configured?.includes(entry?.collection)) failures.push(`editable route references unknown collection ${JSON.stringify(entry?.collection)}`);
}

for (const name of Array.isArray(configured) ? configured : []) {
  const record = collectionMap[name] ?? {};
  if (record.status !== 'PASS') failures.push(`collection ${name}: status must be PASS`);
  if (record.authenticatedAdminLogin !== true) failures.push(`collection ${name}: authenticatedAdminLogin must be true`);
  if (record.correctSidebarSelection !== true) failures.push(`collection ${name}: correctSidebarSelection must be true`);
  if (!nonEmptyString(record.document)) failures.push(`collection ${name}: document is required`);
  for (const field of ['save', 'backendReflection', 'publicReflection', 'adminRestoration', 'backendRestoration', 'publicRestoration']) {
    if (!passed(record[field])) failures.push(`collection ${name}: ${field} requires PASS with retained evidence`);
  }
  if (record.markerAbsent !== true) failures.push(`collection ${name}: markerAbsent must be true`);
  if (!Array.isArray(record.routeEvidence) || record.routeEvidence.length === 0) failures.push(`collection ${name}: routeEvidence must be non-empty`);
  for (const route of record.routeEvidence ?? []) {
    if (!nonEmptyString(route.url)) failures.push(`collection ${name}: route url required`);
    if (!nonEmptyString(route.formId)) failures.push(`collection ${name} ${route.url}: formId required`);
    if (!Number.isInteger(route.queryLength) || route.queryLength <= 100) failures.push(`collection ${name} ${route.url}: queryLength must exceed 100`);
    if (!route.variables || typeof route.variables !== 'object' || Array.isArray(route.variables) || Object.keys(route.variables).length === 0) failures.push(`collection ${name} ${route.url}: variables must be meaningful`);
    if (!nonEmptyString(route.dataKey)) failures.push(`collection ${name} ${route.url}: dataKey required`);
    if (route.primaryFormCount !== 1) failures.push(`collection ${name} ${route.url}: primaryFormCount must equal 1`);
    if (route.bridgeLoaded !== true) failures.push(`collection ${name} ${route.url}: bridgeLoaded must be true`);
    if (route.status !== 'PASS') failures.push(`collection ${name} ${route.url}: status must be PASS`);
    if (!evidencePresent(route.evidence)) failures.push(`collection ${name} ${route.url}: retained route evidence required`);
  }
}

for (const expected of editableRoutes) {
  const found = collectionMap[expected.collection]?.routeEvidence?.some((r) => r.url === expected.url && r.status === 'PASS');
  if (!found) failures.push(`editable route missing PASS evidence: ${expected.collection} ${expected.url}`);
}

const systemMap = manifest.systemClasses && typeof manifest.systemClasses === 'object' && !Array.isArray(manifest.systemClasses) ? manifest.systemClasses : {};
if (!sameSet(policy.requiredSystemClasses, Object.keys(systemMap))) failures.push('required system classes must exactly equal systemClasses keys');
for (const name of policy.requiredSystemClasses) {
  const record = systemMap[name];
  if (record?.status === 'PASS') {
    if (!evidencePresent(record.evidence)) failures.push(`system class ${name}: PASS requires evidence`);
  } else if (record?.status === 'NOT_APPLICABLE') {
    if (!nonEmptyString(record.rationale) || !evidencePresent(record.evidence)) failures.push(`system class ${name}: NOT_APPLICABLE requires rationale and evidence`);
  } else {
    failures.push(`system class ${name}: expected PASS or evidenced NOT_APPLICABLE`);
  }
}

const deploymentRuntime = manifest.deploymentRuntime;
if (!deploymentRuntime || typeof deploymentRuntime !== 'object' || Array.isArray(deploymentRuntime)) failures.push('deploymentRuntime is required');
else {
  for (const field of ['deploymentModel', 'activationEvidence', 'evidence']) {
    if (typeof deploymentRuntime[field] !== 'string' || !deploymentRuntime[field].trim()) failures.push(`deploymentRuntime.${field} must be non-empty`);
  }
  const runtimeShas = ['targetReleaseSha', 'activePointerSha', 'servingReleaseSha'].map((field) => deploymentRuntime[field]);
  for (const [index, field] of ['targetReleaseSha', 'activePointerSha', 'servingReleaseSha'].entries()) {
    if (!/^[0-9a-f]{40}$/i.test(runtimeShas[index] ?? '')) failures.push(`deploymentRuntime.${field} must be a full SHA`);
  }
  if (new Set(runtimeShas).size !== 1) failures.push('deploymentRuntime target, active pointer and serving release SHAs must match exactly');
  if (deploymentRuntime.restartVerified !== true) failures.push('deploymentRuntime.restartVerified must be true');
  if (!/^[0-9a-f]{40}$/i.test(deploymentRuntime.rollbackReleaseSha ?? '')) failures.push('deploymentRuntime.rollbackReleaseSha must be a full SHA');
  if (deploymentRuntime.rollbackVerified !== true) failures.push('deploymentRuntime.rollbackVerified must be true');
  for (const field of ['staleRuntimeInstances', 'ownedTemporaryJobs', 'ownedTransportArtifacts']) {
    if (!Array.isArray(deploymentRuntime[field]) || deploymentRuntime[field].length !== 0) failures.push(`deploymentRuntime.${field} must be an empty array`);
  }
  if (deploymentRuntime.status !== 'PASS') failures.push('deploymentRuntime.status must be PASS');
}

if (manifest.cleanup?.exactRestoration !== true) failures.push('cleanup.exactRestoration must be true');
if (manifest.cleanup?.markerAbsence !== true) failures.push('cleanup.markerAbsence must be true');
if (manifest.cleanup?.temporaryMediaAbsent !== true) failures.push('cleanup.temporaryMediaAbsent must be true');
if (!Array.isArray(manifest.cleanup?.dirtyRecords) || manifest.cleanup.dirtyRecords.length !== 0) failures.push('cleanup.dirtyRecords must be an empty array');

const lineageFields = ['restorationTipSha', 'localHead', 'remoteHead', 'archiveSha', 'deployedSha', 'activeReleaseSha'];
const shas = lineageFields.map((k) => manifest.lineage?.[k]);
for (let i = 0; i < lineageFields.length; i++) if (!/^[0-9a-f]{40}$/i.test(shas[i] ?? '')) failures.push(`lineage.${lineageFields[i]} must be a full SHA`);
if (manifest.lineage?.allEqual !== true || new Set(shas).size !== 1) failures.push('all lineage SHAs must be equal and allEqual must be true');
if (manifest.seoReflectionChain?.restorationTipSha !== manifest.lineage?.restorationTipSha || manifest.seoReflectionChain?.finalDeployedSha !== manifest.lineage?.deployedSha) failures.push('seoReflectionChain SHAs must equal final lineage restoration and deployment SHAs');
if (deploymentRuntime?.targetReleaseSha !== manifest.lineage?.activeReleaseSha) failures.push('deploymentRuntime targetReleaseSha must equal lineage.activeReleaseSha');

if (manifest.final?.readOnlyPostDeploy !== true) failures.push('final.readOnlyPostDeploy must be true');
if (!Array.isArray(manifest.final?.unrun) || manifest.final.unrun.length !== 0) failures.push('final.unrun must be an empty array');
if (!Array.isArray(manifest.final?.failures) || manifest.final.failures.length !== 0) failures.push('final.failures must be an empty array');
if (manifest.final?.completionEligible !== true) failures.push('final.completionEligible must be true');

const result = {
  policyId: policy.policyId,
  state: failures.length ? 'BLOCKED' : 'COMPLETE',
  completionEligible: failures.length === 0,
  failures,
};
console.log(JSON.stringify(result, null, 2));
process.exit(failures.length ? 2 : 0);
