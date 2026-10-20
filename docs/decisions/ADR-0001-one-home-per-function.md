# ADR-0001 — One home per function

**Status:** accepted (owner, <YYYY-MM-DD>)
**Date:** <YYYY-MM-DD>

## Context

AI sessions do not remember each other. Without a mechanism, each session that needs to format a date, call an API or
read a config value writes its own — correct in isolation, slightly different from the last one. In the project this
harness came from, the old codebase had its core business logic copied in several places, and the rewrite's own first
weeks folded six copies of one notification writer, seven of one rounding helper and twelve of one status list — each found
only because a rule was written to look for it.

Instructions alone ("check before writing a helper") do not hold: a session that is deep in a task does not stop to
search. A failing build does hold.

## Decision

Every kind of thing has exactly one home, listed in [`GUARDRAILS.md`](../GUARDRAILS.md).

- Before writing an export, search [`CODEMAP.md`](../CODEMAP.md) (generated; stale fails the build) and grep.
- Every duplicate found is folded into its home **and** gets a rule that fails the build the next time.
- Every rule is proven by a planted violation in a test. A rule that cannot fail is not a rule.
- Every commit lists its new exports and why none duplicates one.

## Enforced by

ESLint `no-restricted-syntax` (selectors), `tools/guardrails/checks.ts` (patterns), `duplicateExports` (same name
defined twice), the CODEMAP staleness test.

## Examples

The homes in `src/core` — dates (`time.ts`), the network (`http.ts`), configuration (`config.ts`) — are examples that
almost every project has. Replace them with yours: the database client, the auth check, the date math, the one place a
total is calculated, the component that renders a table.

## Consequences

The codebase gets *stricter* as it grows, instead of looser. The cost is a few minutes per duplicate found, paid once.
