# PR #1 CodeQL follow-up

Reviewed on 22 November 2026 against the local changes following `4ce7f038`.
This is a source-review record, not a fresh CodeQL analysis or an alert dismissal.
The earlier final SARIF and its 18-finding triage retain their historical scope.

## Changes awaiting a fresh scan

- Alerts #6 and #7 (`js/sql-injection`, bookmark creation): the route already
  applies `bookmarkCreateBody`, which requires a 24-character hexadecimal string
  ObjectId and rejects operator objects. Both lookup filters now explicitly use
  `$eq`; ownership still comes from the authenticated session. The atomic upsert
  and `$setOnInsert` remain unchanged. Regression checks cover normal creation,
  duplicate creation, operator rejection and ownership.
- Alert #19 (`js/type-confusion-through-parameter-tampering`, TOR search): the
  HTTP route already validates search input, but the helper now independently
  accepts `unknown` and rejects non-string values before calling string methods.
  Added direct null/undefined/number/array/object checks and an HTTP repeated-`q`
  regression check.

These changes are not evidence that the corresponding scanner alerts have closed.

## Retained alerts requiring contextual review

- Alert #20 (`js/insufficient-password-hash`, OAuth transaction verification):
  the reported cookie value is a signed transaction payload, not a password.
  HMAC-SHA256 authenticates it using a server-side secret, followed by timing-safe
  MAC comparison, expiry and state checks. A password KDF is not a substitute for
  this MAC. The password-hashing classification is a false positive in this
  reviewed context; this does not claim that every aspect of the cookie design
  has been verified.
- Alert #21 (`js/file-access-to-http`, procurement fetch): current production
  callers perform procurement lookups/downloads with project/feed parameters,
  fixed headers and timeout signals. HTTPS destinations are restricted to three
  explicit procurement hosts, credentials in URLs are rejected and redirects
  are validated again. The reviewed calls do not upload arbitrary local files.
  Classification: constrained intended outbound flow within the reviewed caller
  scope. Destination validation alone does not prove that arbitrary future
  request bodies or sensitive query values are safe to send.
- Alert #22 (`js/file-access-to-http`, security test helper): requests target the
  loopback server created by the synthetic test harness, backed by its disposable
  MongoDB replica set. Classification: test-fixture flow, not a production file
  upload or arbitrary external destination.

## Remote follow-up on 22 November 2026

CodeQL analysis `2223404526` of PR merge revision
`a1e8f3f5b45b458a55feeb27e9e8284286cbac4b` retained three alerts after
the search and bookmark changes. Its complete SARIF dataflows were reviewed:

- #20: cookie payload -> HMAC-SHA256 update; dismissed as `false positive`.
- #21: `eval-prompt.ts` reads a gold fixture -> selects `gold.projectNumber` ->
  `fetchProjectArchive` -> `getZipInfo` -> encoded `projectId` query parameter ->
  allowlisted HTTPS procurement request. This intended lookup sends the project
  identifier, not the fixture body; dismissed as `false positive` for this flow.
- #22: reads route source -> extracts route names -> synthetic requests to the
  owned loopback test server; dismissed as `used in tests`.

Each disposition includes a rationale in GitHub. No scanner rules or severity
gates were disabled. After triage, the PR CodeQL gate and all displayed build,
lint, type, security-test, Semgrep, audit and SBOM checks passed. Dismissal is a
review decision, not removal from SARIF or a claim that no vulnerabilities exist.
The PR was not merged as part of this review.

## Local verification on 22 November 2026

- Backend `npm run build`: passed.
- `npm run test:security`: completed with exit code 0.
- Main security suite: 171 passed, 0 failed.
- Ingestion security suite: passed.
- Supplementary suite: 25 passed, 0 failed.
- Resilience suite: 61 passed, 0 failed.
- Integrity suite: 30 passed, 0 failed.

The suites use disposable synthetic databases and mocked external providers.
No live SMTP/AI/Google verification is claimed by this run. CodeQL was not rerun
locally; the CLI is not installed. The later remote analysis and triage are
recorded above.

## Main-branch follow-up: 12 open alerts

Reviewed on 22 November 2026 using CodeQL analysis `2223772666` for main
revision `024dbc7f75df27b7f415794782e9ba87199370e8`. The changes below are local
follow-up work; no new CodeQL execution or dismissal is claimed by this section.

- #8, #23: admin user queries receive validated status/role values. Filters now
  use explicit `$eq` operands; escaped regex matching is retained for name/email.
- #10, #24: admin audit queries receive a validated action string. Both list and
  count queries now use the same explicit equality filter.
- #12, #13: review status is schema-validated and branch-allowlisted. The
  verified/outdated filter now explicitly uses `$eq`.
- #14, #15: TOR phase is schema-validated; the phase filter now uses `$eq`.
  Existing ownership, authorization, numeric bounds and sort allowlists remain.
- #25: the month-regex alternatives came from a fixed internal month-name map,
  not arbitrary input. Replaced dot-only escaping with the shared full regex
  escaping helper so future additions cannot introduce regex metacharacters.
- #17, #18: filename rules intentionally combined anchored generated-file
  prefixes with substring keywords. Split those alternatives into separate
  regexes evaluated with `some`, preserving both kinds of match without mixed
  anchoring. These classify documents; they do not authorize file access.
- #3: maintenance detection previously removed HTML tags with regexes. It now
  uses the existing Cheerio dependency to parse HTML, remove script/style nodes,
  and extract plain text. This is notice detection, not a general HTML sanitizer;
  callers must continue to render any extracted notice as text.

Verification:

- Backend build passed.
- Full `npm run test:security` completed successfully after the source changes:
  main 171, supplementary 25, resilience 61 and integrity 30 checks passed;
  ingestion checks also passed, including the new parser/classifier cases.
- Added four equality-filter regression checks and reran the main suite:
  **175 passed, 0 failed**. The earlier 171 result remains a separate execution.
- Offline deterministic extraction checks: **88 passed, 0 failed**.
- New cases cover script/style exclusion, real maintenance text, anchored file
  prefixes, substring keywords and non-prefix lookalikes.
- These checks did not use the application database or live external providers.

After pushing, inspect a new CodeQL analysis before claiming any of these
12 alerts are fixed. No rules were disabled and no remaining alerts dismissed.
