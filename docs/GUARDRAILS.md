# Guardrails — where each thing lives, and what stops a second copy

**Kind:** decided (ADR-0001). **As of:** <YYYY-MM-DD>. Keep this table true: when a rule becomes mechanical, change its
"Enforced by" in the same commit.

**The rule:** every kind of thing has one home. Before writing an export, search [`CODEMAP.md`](CODEMAP.md) and grep.
Every duplicate found is folded into its home **and** becomes a rule that fails the build.

The checks live in `tools/guardrails/` and run in `pnpm test`. **Each one is proven by a planted violation** in
`guardrails.test.ts`. A row marked *review-only* is a debt to close.

## The homes

| Kind of thing | Its one home | Enforced by |
|---|---|---|
| A date shown to a person | `src/core/time.ts` `formatDay` — always in a named zone | ✅ ESLint: `Intl.DateTimeFormat`, `toLocaleDateString` anywhere else fail |
| A network request | `src/core/http.ts` `getJson` — one timeout, one error shape | ✅ ESLint: `fetch(` anywhere else fails |
| Reading the environment | `src/core/config.ts` `loadConfig` | ✅ check `env-read` |
| A URL, timeout, limit or retry count | `src/core/config.ts` `DEFAULTS` — never a literal where it is used | ✅ check `config-literal` |
| Logging in shipped code | `console.warn` / `console.error` only (or your logger) | ✅ ESLint `no-console` |
| Screen copy promising unbuilt work | nowhere — a screen never says what is not built | ✅ check `not-built-copy` |
| An export defined twice | — | ✅ `duplicateExports` (a re-export is fine) |
| <your next one> | <its home> | review-only |

## How a row is born

1. A session finds a second copy (a reviewer, a bug, a grep).
2. It folds the copy into the home, in the same commit.
3. It adds a check whose pattern matches **the copy it just removed** — that is the shape the next one will take.
4. It adds the planted test (fires on the copy, silent in the home) and the row above, with the date and what was found.
