# GITHUB-AUTHORIZATION-CONTRACT-001 — Strict migration repository authorization

## Automatic scope

Load this control during `CORE GATE 0` for every Astro/Tina migration, repair, resumption, deployment, push, CI operation, or completion claim. It is permanent and does not require a reminder.

## Exact fine-grained PAT contract

For every destination repository the retained authorization record must identify the correct resource owner and selected repository and require exactly these repository permissions:

- `Contents: Read and write`
- `Workflows: Read and write`
- `Actions: Read and write`
- `Pull requests: Read and write`
- `Metadata: Read-only` (GitHub includes this automatically)

`Contents` does not substitute for `Workflows`; `Pull requests` does not substitute for `Workflows`; and `Actions` controls runs while `Workflows` controls workflow files. Any permission omission, read-only downgrade, wrong resource owner, unselected repository, pending organization approval, expired token, or inability to push a tracked `.github/workflows/*.yml` file is `AUTH_BLOCKED` for the exact GitHub operation and may not be reported as pass.

Do not request unrelated permissions merely for convenience. Administration, Deployments, Environments, Secrets, Variables, Webhooks, Pages, Issues, Commit statuses, security permissions, and organization permissions remain unrequested unless a named operation actually requires one. cPanel, Tina Cloud, and media-service credentials remain separate from GitHub authorization.

## Executable evidence

The migration manifest must retain `githubAuthorization` with:

- exact resource owner and repository;
- `repositorySelected=true`;
- the exact permission map above;
- `tokenApproved=true` and `tokenUnexpired=true`;
- `workflowFilePushVerified=true` after a real tracked workflow-file push;
- a successful Actions run URL and conclusion for the pushed commit;
- secret-safe retained evidence.

The completion validator must reject any missing, extra, downgraded, unverified, expired, pending, or failed field. Controlled negatives must independently remove `Workflows`, downgrade `Contents`, select the wrong repository, mark approval pending, and remove workflow-push proof. Prose, a successful non-workflow push, or PR access cannot satisfy this contract.
