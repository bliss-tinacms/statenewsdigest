#!/usr/bin/env node
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const validator = path.join(here, 'validate-migration-contracts.mjs');
const cases = [
  ['old-brand-residue', 'rebrand', 'REBRAND_RESIDUE'],
  ['category-prefix-regression', 'category', 'CATEGORY_PREFIX_FREE'],
  ['first-category-reduction', 'category', 'DEMO_MULTICAT_OVERRIDE'],
  ['paginate-before-filter', 'category', 'CATEGORY_FILTER_ORDER'],
  ['author-island-omission', 'author', 'AUTHOR_ISLAND'],
  ['author-editability-omission', 'author', 'AUTHOR_EDITABLE_FIELD'],
  ['responsive-breakpoint-omission', 'responsive', 'MOBILE_BREAKPOINT'],
  ['media-prefix-leak', 'media', 'MEDIA_PREFIX_ISOLATION'],
];
for (const [id, contract, expected] of cases) {
  const result = spawnSync(process.execPath, [validator, '--contract', contract, '--controlled-negative', id], { encoding: 'utf8' });
  const output = `${result.stdout || ''}${result.stderr || ''}`;
  if (result.status === 0 || !output.includes(expected)) {
    throw new Error(`Controlled negative ${id} failed to fail closed with ${expected}:\n${output}`);
  }
}
console.log(`MIGRATION_CONTRACT_NEGATIVE_PASS ${cases.length}`);
