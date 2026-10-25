#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const policy = JSON.parse(
  fs.readFileSync(new URL('../references/CORE-GATE-0-RESOURCE-POLICY.json', import.meta.url), 'utf8'),
);

const standingRuleUrl = new URL('../references/USER-PROVIDED-EVERYTHING-001.md', import.meta.url);
const standingRule = fs.existsSync(standingRuleUrl) ? fs.readFileSync(standingRuleUrl, 'utf8') : '';
const standingRuleRequiredClauses = [
  'permanent, automatic, global rule',
  'not limited to Commercial Daily News',
  'user_provided_everything_user_tested=true',
  'RESOURCE_EXISTENCE=PASS_USER_VERIFIED',
  'general `BLOCKED_ON_RESOURCES` status',
  'Only one exact operation may be `AUTH_BLOCKED`',
  'Agent assumptions have zero authority to override user-verified supplied-resource evidence',
  'Prose-only acknowledgment cannot pass',
];

const mandatoryResourceTypes = [
  'repository', 'project_folder', 'tina_project', 'tina_client', 'organization', 'branch',
  'token', 'api', 'api_credential', 'login', 'hosting_resource', 'service_resource',
  'service_account', 'account', 'path', 'demo', 'other_user_supplied_input',
];

if (
  policy.schema !== 'astro-tina-global-resource-policy-v3'
  || policy.control_id !== 'USER-PROVIDED-EVERYTHING-001'
  || policy.scope !== 'all-astro-tina-migrations'
  || policy.site_specific !== false
  || policy.automatic !== true
  || policy.user_reminder_required !== false
  || policy.standing_user_declaration_is_positive_evidence !== true
  || policy.agent_assumption_cannot_override_user_verified_resources !== true
  || !Array.isArray(policy.required_global_documents)
  || !policy.required_global_documents.includes('references/ASTRO-TINA-MIGRATION-CORE.md')
  || !policy.required_global_documents.includes('references/TINA-MIGRATION-GOLD.md')
  || !policy.required_global_documents.includes('references/USER-PROVIDED-EVERYTHING-001.md')
  || standingRuleRequiredClauses.some((clause) => !standingRule.includes(clause))
  || policy.user_verified_resource_existence !== 'PASS_USER_VERIFIED'
  || policy.user_declared_prerequisites_complete !== true
  || policy.user_provided_everything_user_tested !== true
  || !Array.isArray(policy.resource_types)
  || mandatoryResourceTypes.some((type) => !policy.resource_types.includes(type))
  || policy.prohibited_general_status !== 'BLOCKED_ON_RESOURCES'
  || policy.auth_blocked_scope !== 'exact-exhausted-operation-only'
  || policy.replacement_resources_forbidden !== true
  || policy.resource_recreation_requests_forbidden !== true
  || policy.prose_only_acknowledgement_passes !== false
) {
  throw new Error('Global CORE GATE 0 resource policy is missing or weakened');
}

export const requiredTrueFields = policy.required_true_fields;

const allowedConsumption = new Set(['PENDING', 'PASS', 'FAIL']);
const allowedAccess = new Set(['PASS', 'AUTH_BLOCKED']);

export function validateLedger(ledger) {
  const errors = [];
  if (!ledger || ledger.schema !== 'astro-tina-core-gate-zero-v1') {
    errors.push('schema must be astro-tina-core-gate-zero-v1');
  }
  for (const field of requiredTrueFields) {
    if (ledger?.[field] !== true) errors.push(`${field} must be true`);
  }
  if (ledger?.general_status === 'BLOCKED_ON_RESOURCES') {
    errors.push('general status BLOCKED_ON_RESOURCES is forbidden');
  }
  if (!Array.isArray(ledger?.resources) || ledger.resources.length === 0) {
    errors.push('resources must contain every user-verified supplied input');
  } else {
    ledger.resources.forEach((resource, index) => {
      const label = `resources[${index}]`;
      if (!resource?.name || typeof resource.name !== 'string') errors.push(`${label}.name is required`);
      if (resource?.existence !== 'PASS_USER_VERIFIED') errors.push(`${label}.existence must remain PASS_USER_VERIFIED`);
      if (!allowedConsumption.has(resource?.consumption)) errors.push(`${label}.consumption must be PENDING, PASS, or FAIL`);
      if (!allowedAccess.has(resource?.access)) errors.push(`${label}.access must be PASS or AUTH_BLOCKED`);
      if (resource?.approved_sources_checked !== true) errors.push(`${label}.approved_sources_checked must be true`);
      if (resource?.replacement_created !== false) errors.push(`${label}.replacement_created must be false`);
      if (resource?.recreation_requested === true) errors.push(`${label}.recreation_requested must not be true`);
      if (resource?.access === 'AUTH_BLOCKED' && !resource?.exact_blocked_operation) {
        errors.push(`${label}.exact_blocked_operation is required when access is AUTH_BLOCKED`);
      }
    });
  }
  return errors;
}

export function readAndValidate(file) {
  const ledger = JSON.parse(fs.readFileSync(file, 'utf8'));
  const errors = validateLedger(ledger);
  if (errors.length) {
    console.error(JSON.stringify({ gate: 'CORE_GATE_0', control: policy.control_id, status: 'BLOCKED', errors }, null, 2));
    return 2;
  }
  console.log(JSON.stringify({ gate: 'CORE_GATE_0', control: policy.control_id, status: 'PASS', resources: ledger.resources.length }, null, 2));
  return 0;
}

const self = path.resolve(process.argv[1] || '') === fileURLToPath(import.meta.url);
if (self) {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node validate-core-gate-zero.mjs <sanitized-ledger.json>');
    process.exit(2);
  }
  try {
    process.exit(readAndValidate(path.resolve(file)));
  } catch (error) {
    console.error(JSON.stringify({ gate: 'CORE_GATE_0', control: policy.control_id, status: 'BLOCKED', errors: [error.message] }, null, 2));
    process.exit(2);
  }
}
