# Final implementation mapping review

Updated 22 November 2026. This overview combines recorded evidence from separate
executions. Each result retains its own date, source scope and limitations;
updating this file does not rerun any test or scan.

## Current evidence summary

- Google-only authentication is permitted by the instructor, as reported by the
  team. Local password authentication is not implemented or claimed.
- Live Google sign-in passed five browser-reported checks on 20 November 2026.
- One synthetic SMTP message was submitted and received on 20 November 2026.
  Database-backed notification dispatch through live SMTP remains unverified.
- Live AI baseline extraction and one embedded-instruction case passed in separate
  text-only custom-schema executions on 21 November 2026 (Asia/Bangkok). Full live
  TOR/PDF extraction, factual accuracy and broad adversarial coverage remain open.
- Local regression checks on 22 November: main 171, supplementary 25, resilience
  61 and integrity 30 passed; ingestion checks and backend build also passed.
  These used disposable synthetic databases and mocked providers. The exact local
  commit was not captured in that execution output. See
  [PR follow-up](reports/codeql-pr1-review.md).
- [Remote Security run 45002854162](https://github.com/cooldog98/ICheerTOR/actions/runs/45002854162)
  passed on main revision `5688b81a76ce74ac9262cedbeb71f8dbdde2ef6a`.
- The associated main CodeQL analysis recorded 15 findings: at that review,
  12 alerts were open and three were dismissed with documented reasons. Its log
  records 290 extracted files, including code, configuration and HTML files.
  These numbers differ in scope from the historical 134-file/18-finding scan below.
- At this update, remote main was `1cde23d41cf2cbc364e62a881be71d4b69d3f3ce`.
  Its [Security run 45009424373](https://github.com/cooldog98/ICheerTOR/actions/runs/45009424373)
  was still in progress when checked; no successful execution is claimed here.
  The [branch run 45009292053](https://github.com/cooldog98/ICheerTOR/actions/runs/45009292053)
  passed for `345b51658f15d8039bb8897f74ebe5d49b1d39e6`.

The Google Docs report contains the live execution screenshots and additional
ASVS Level 1 review. The repository reports below retain their historical scope.
CI success is not evidence of production TLS, signed provenance, complete ASVS
compliance or resolution of every scanner alert.

## Assignment checklist

- **Password authentication — instructor-approved scope exception.** The team
  confirmed instructor permission for Google-only authentication. This is not an
  implementation claim for local password authentication.
- **Social OAuth/OpenID — implementation and scoped live verification present.**
  The isolated live Google flow passed five browser-reported checks on
  20 November 2026; broader OAuth attack coverage is not inferred from that run.
- **Authorization and object access — implemented in tested scope.** Current
  role/status, route scopes, field allowlists and ownership checks are enforced
  at the backend; synthetic admin and user matrices pass.
- **Input validation / SQL, NoSQL and ORM injection — implemented in tested
  scope.** Zod middleware, typed/allowlisted queries and escaped search regexes
  have attack tests. The app uses MongoDB, not SQL. Retain CodeQL query-flow
  warnings and their mitigation review rather than claiming no findings.
- **Environment/credentials — source controls present.** Configuration checks,
  exclusions and historical secret scans exist. This review does not certify
  credentials, production IAM or secret rotation. Vertex smoke-test output was
  changed to stop displaying even a key prefix/suffix.
- **CORS — fixed-origin policy with browser evidence.** Allowed-origin and
  attacker-origin Firefox checks exist; not a wildcard policy.
- **Error handling and logging — implemented, partial operational coverage.**
  Generic observed errors and structured auth/security events are tested.
  Off-host immutable retention and alerting remain operational gaps.
- **HTTP headers — local implementation/evidence present.** Helmet/backend and
  nonce/frontend controls exist. Keep the actual ZAP warnings about inline CSS
  and cross-origin isolation, and capture DevTools headers for presentation.
- **SAST/DAST reports — dated analyses recorded below.** API regressions
  are not SAST and are not a substitute for a ZAP report.

## Four selected advanced features

1. **Login attempt rate limit:** a separate MongoDB-backed auth limiter allows
   20 requests per IP in a 15-minute fixed window, shared across Google login
   start, callback and code exchange. API tests verify 429, Retry-After and
   RATE_LIMITED. This limits the application's OAuth endpoints, not Google's
   password entry or a local password-login feature.
2. **Backend API rate limit:** shared MongoDB fixed-window counters; 300 allowed,
   request 301 rejected, Retry-After and recovery tested with synthetic traffic.
3. **Login inactivity timeout:** server-side lastActivityAt and absolute expiry
   are checked; expired synthetic sessions are rejected.
4. **JWT expiration checking/management:** fixed signature algorithm, issuer,
   audience and time claims plus server-side revocation/session checks. Synthetic
   expiry, logout, suspension and role-change cases are covered.

Scope authorization remains part of the base authorization implementation and
is **not counted** among these four advanced features. Detailed report-ready
descriptions, ASVS references and screenshot instructions are in
[ADVANCED-SECURITY-FEATURES.md](ADVANCED-SECURITY-FEATURES.md).

## ASVS 5.0.0 plan review

The connected Assignment 1 Sheet was read only. It contains 345 requirements and
58 selected items (32 L1, 22 L2, 4 L3). Its descriptions are an earlier source
review and contain stale observations, for example missing regex validation that
has since been implemented. No Sheet cell or checkbox was changed here.

[Full requirement snapshot](reports/asvs-plan-snapshot.csv) retains requirements
and the earlier plan text, excluding team-member rows. [Selected-item review](reports/asvs-final-selected-review.csv)
covers **all 58 selected IDs**, with code, evidence and explicit limits:

- 28 implemented with scoped tests; 3 implemented with scoped source review.
- 18 partial; 2 source-reviewed without comprehensive runtime proof.
- 4 need operational evidence; 3 are not applicable to current input/storage
  features. The SBOM item is now partial: production lockfile inventories and a
  CI artifact job exist, while full component provenance review remains open.

These are review categories, not ASVS certification or 31 fully verified ASVS
requirements. Scope reductions need justification, not automatic green ticks.
The Sheet's Implemented=0 is historical sheet data; this file does not recalculate
or replace that spreadsheet status.

## Threat model

Application-password, application-MFA and cookie-authenticated API threats are excluded. References below use the current sequential T01–T25 register. [THREAT-COVERAGE.md](THREAT-COVERAGE.md) describes the retained controls
and residual risks. T14/T15 now have mocked-model and generated-document evidence;
one live embedded-instruction case also passed separately. Full live TOR/PDF
extraction and broader adversarial evaluation remain unverified. T25 has synthetic lease/crash/load
and fixture restore evidence, not global quotas or production recovery proof.
The mapping uses the repository threat IDs. The Google Docs report separately
records implementation and verification status for the current review scope.

## OWASP Top 10 mapping

Version: **2025**, based on [OWASP's official list](https://top10.owasp.org/2025/).
Category mapping is traceability, not proof of complete mitigation. If the class
requires 2021 numbering, use an explicit 2021 crosswalk rather than mixing IDs.

- **A01 Broken Access Control:** T05/T06/T10; role/scope/ownership and procurement
  egress controls; API matrix and redirect/allowlist tests.
- **A02 Security Misconfiguration:** T22/T23; CORS, headers and configuration
  checks; local browser/ZAP evidence, deployment settings unverified.
- **A03 Software Supply Chain Failures:** T23/T24; lockfiles, scanner/workflow
  source; production CycloneDX inventories now exist. Provenance and complete
  runtime/image/development-component inventory remain incomplete.

- **A04 Cryptographic Failures:** T03; random JWT secrets, HMAC/signature controls;
  source/token tests, not transport/cloud certification.
- **A05 Injection:** T07/T08/T09; schemas, query allowlists, escaping and safe
  rendering; API attacks and Firefox evidence.
- **A06 Insecure Design:** T13/T14/T15/T25; limits, review boundaries and recovery
  design; synthetic resilience tests, residual AI/global-quota risks.
- **A07 Authentication Failures:** T01/T02/T03/T04; OAuth state/PKCE, browser
  binding, JWT/session revocation and timeouts; scoped live Google flow passed.
- **A08 Software or Data Integrity Failures:** T11/T12/T16/T17; archive checks,
  transaction rollback and fenced updates; not a signed artifact supply chain.
- **A09 Security Logging and Alerting Failures:** T18/T19; structured security
  logs and restricted audit APIs; immutable retention/alerting not established.
- **A10 Mishandling of Exceptional Conditions:** T25; fail-closed rate/session
  stores, provider timeout/circuit handling, worker recovery; synthetic faults.

### SBOM addition — 20 November 2026

Generated CycloneDX 1.5 inventories using npm 10.9.3:
`npm sbom --package-lock-only --omit=dev --sbom-format=cyclonedx --sbom-type=application`.
The backend contains 164 components and frontend 93 components. Both JSON outputs
were parsed and dependency references checked for consistency; this is not full
CycloneDX schema validation. Files are
[backend SBOM](reports/sbom-backend.cyclonedx.json) and
[frontend SBOM](reports/sbom-frontend.cyclonedx.json), with lockfile/output SHA-256
values in [generation summary](reports/sbom-generation-summary.json).

The security workflow now generates the same inventories from each app lockfile
and uploads `sbom-backend` and `sbom-frontend` artifacts, retained for 30 days.
The job does not install packages or run their lifecycle scripts. It has been
verified in remote Security run 45002854162 for revision `5688b81`, including
the SBOM generation/upload jobs. This does not validate every artifact content
or establish signed provenance. Regenerate inventories whenever lockfiles change. These are production
lockfile graphs, not proof of installed runtime contents, image/OS packages,
development dependencies or signed build provenance. ASVS V15.1.2 remains partial.

## Historical scan evidence (18–20 November 2026)

CodeQL 2.27.4 ran 105 security-extended queries over 134 source/script files.
The initial expanded scan had 19 results; removing the Vertex diagnostic's key
prefix/suffix output reduced that to **18 retained findings**. Seventeen match
earlier local reviews; the additional file-to-HTTP flow passes the explicit
procurement destination/redirect allowlist. Review decisions are documented,
not suppressions or proof of zero risk. Scripts are now included, so this count
must not be compared as identical scope to the older 17-result run.

ZAP completed at **2026-11-18T12:42:11Z**. All five active scans finished at 100%
with zero queued passive records: frontend 3,089 requests; user 4,174; admin
4,216; developer 4,216; anonymous 4,080. Total **19,775 active scan requests**.
No high-risk alert was reported in these configured scopes. Frontend warnings
remain: medium CSP inline styles and HTTP-only local site; low missing COEP;
four informational alert types. API scopes reported only informational client
error/no-store observations. Local HTTP explains the HTTPS warning but does not
establish that any future deployment has valid HTTPS.

Administrative mutations/logout/deletion are excluded from ZAP and covered by
synthetic API tests. Authenticated frontend behavior is checked separately by
Firefox. A completed configured scan is not an exhaustive attack guarantee.

The recorded isolated Firefox run passed **57 checks, zero failures**, and its
runtime exited 0. See `reports/browser-security-comprehensive.json` and
`reports/final-zap-run.txt`. The harness stopped its owned scan/browser processes
and temporary databases after the run.

See `reports/codeql-final.sarif` for the initial expanded source/script scan and
`reports/codeql-final-fixed.sarif` for the rerun after removing partial key output.
Final result counts and scope are recorded in `reports/codeql-final-triage.json`.
ZAP completion and scope are recorded in `reports/zap-comprehensive-manifest.json`.
Do not infer success from the existence of an old manifest; use its finishedAtUtc
and the scan-run output for this round.

The earlier API/security evidence recorded 249 counted assertions plus ingestion
checks. Later local regressions and live provider checks are summarized at the top
of this file; they do not retroactively change these historical scanner results.
No production-data attack testing is claimed.
