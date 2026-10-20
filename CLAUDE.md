# <Project> — CLAUDE.md

**This file is a router.** It points at the documents that hold the decisions; it does not restate them.
If something here disagrees with a document in `docs/`, the document is right and this file is stale.

## What this is

<One paragraph: what the project is, who owns it, what stage it is at. Point at docs/README.md for status.>

## Read in this order

| Need | Read |
|---|---|
| Orientation | [`docs/README.md`](docs/README.md) — the index, which document wins, the status of each |
| What is undecided | [`docs/OPEN-QUESTIONS.md`](docs/OPEN-QUESTIONS.md) — **the register. Never pick an answer to something listed there.** |
| Where each thing lives | [`docs/GUARDRAILS.md`](docs/GUARDRAILS.md) · [`docs/CODEMAP.md`](docs/CODEMAP.md) (generated) |
| How to build anything | [`docs/plan/BUILD-METHOD.md`](docs/plan/BUILD-METHOD.md) — tests first, judged against what exists |
| When it is done | [`docs/plan/DEFINITION-OF-DONE.md`](docs/plan/DEFINITION-OF-DONE.md) |
| Why it is built this way | [`docs/decisions/`](docs/decisions/) — ADRs, append-only |
| What is annoying | [`docs/plan/FRICTION-LOG.md`](docs/plan/FRICTION-LOG.md) |

## Rules about how a session behaves (not in a document, because they are about sessions)

1. **Provenance on every claim.** An owner ruling (with its date and their words) ≠ what the code does (with path and
   commit) ≠ what you inferred. Never label a proposal "decided".
2. **Parked questions stay parked.** If the register says the owner deferred it, do not ask it again until they reopen it.
3. **Every scripted doc edit asserts its match; a commit is gated on exit codes** (`&&`, never `;`, never
   `check | grep && commit` — capture `$?`). A silent miss leaves a document stale for days.
4. **`friction:` messages** from the owner are filed onto the friction log with no ceremony and no follow-up questions.
5. **Dates are absolute.** `2026-10-19`, never "today" or "last week" in a document.
6. **Rulings land in the docs in the same unit of work.** A decision that lives only in chat is lost.
7. **Commit only when a unit of work is complete and the gate is green.** Message body: what changed and why, the
   owner's words where a ruling landed, the new exports and why none duplicates one, and the deliberately red first run.

## One home per function (ADR-0001)

**Before writing any export, search [`docs/CODEMAP.md`](docs/CODEMAP.md) and grep; if it exists, use it.** After adding
or changing one, `pnpm codemap` (the test fails on a stale map). Every duplicate you find is folded into its home **and**
gets a check in `tools/guardrails` that fails the build next time.

## What a session does first

1. Read what the SessionStart hook printed. **Unrecorded inbox entries are the first job** — the commit hook blocks
   `git commit` until each is written into its owning document (`docs/INBOX.md` says how).
2. Read `docs/README.md` (status) and `docs/OPEN-QUESTIONS.md` (what you may not decide alone).
3. If building: follow `docs/plan/BUILD-METHOD.md`. Done means `docs/plan/DEFINITION-OF-DONE.md`, nothing less.
