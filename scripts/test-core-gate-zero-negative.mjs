#!/usr/bin/env node
import { requiredTrueFields, validateLedger } from './validate-core-gate-zero.mjs';

const base = Object.fromEntries(requiredTrueFields.map((field) => [field, true]));
base.schema = 'astro-tina-core-gate-zero-v1';
base.general_status = 'READY_FOR_EXACT_ACCESS_CHECKS';
base.resources = [{
  name: 'user-supplied-tina-project',
  existence: 'PASS_USER_VERIFIED',
  consumption: 'PENDING',
  access: 'AUTH_BLOCKED',
  exact_blocked_operation: 'read project metadata after approved sources were exhausted',
  approved_sources_checked: true,
  replacement_created: false,
  recreation_requested: false,
}];

const clone = () => structuredClone(base);
const cases = [
  ['401 cannot erase existence', (x) => { x.resources[0].existence = 'MISSING_AFTER_401'; }],
  ['403 cannot erase existence', (x) => { x.resources[0].existence = 'MISSING_AFTER_403'; }],
  ['failed lookup cannot become not provided', (x) => { x.resources[0].existence = 'NOT_PROVIDED'; }],
  ['empty default organization cannot erase existence', (x) => { x.resources[0].existence = 'NONEXISTENT'; }],
  ['compacted transcript cannot erase existence', (x) => { x.resources[0].existence = 'UNKNOWN'; }],
  ['general blocked-on-resources status is forbidden', (x) => { x.general_status = 'BLOCKED_ON_RESOURCES'; }],
  ['AUTH_BLOCKED must name one exact exhausted operation', (x) => { delete x.resources[0].exact_blocked_operation; }],
  ['replacement resource is forbidden', (x) => { x.resources[0].replacement_created = true; }],
  ['resource recreation request is forbidden', (x) => { x.resources[0].recreation_requested = true; }],
  ['approved sources must be exhausted', (x) => { x.approved_sources_exhausted_before_auth_blocked = false; }],
  ['existence/access separation is mandatory', (x) => { x.resource_existence_separated_from_access = false; }],
  ['user-declared prerequisite completeness cannot be omitted', (x) => { x.user_declared_prerequisites_complete = false; }],
  ['standing everything-provided-and-tested declaration cannot be omitted', (x) => { x.user_provided_everything_user_tested = false; }],
  ['agent assumption cannot override user-verified resources', (x) => { x.agent_assumption_cannot_override_user_verified_resources = false; }],
  ['user-supplied evidence must be preserved', (x) => { x.user_supplied_resources_preserved = false; }],
];

const validErrors = validateLedger(base);
if (validErrors.length) {
  console.error(JSON.stringify({ suite: 'CORE_GATE_0_NEGATIVE', control: 'USER-PROVIDED-EVERYTHING-001', status: 'FAIL', reason: 'valid baseline rejected', errors: validErrors }, null, 2));
  process.exit(1);
}

const results = [];
for (const [name, mutate] of cases) {
  const candidate = clone();
  mutate(candidate);
  const errors = validateLedger(candidate);
  results.push({ name, rejected: errors.length > 0 });
}

const failed = results.filter((result) => !result.rejected);
console.log(JSON.stringify({
  suite: 'CORE_GATE_0_NEGATIVE',
  control: 'USER-PROVIDED-EVERYTHING-001',
  status: failed.length ? 'FAIL' : 'PASS',
  passed: results.length - failed.length,
  total: results.length,
  results,
}, null, 2));
process.exit(failed.length ? 1 : 0);
