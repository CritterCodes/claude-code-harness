# Documentation

Start with [`OPEN-QUESTIONS.md`](OPEN-QUESTIONS.md) and the status table at the bottom. Every document says at its top
what **kind** it is and **as of** when.

## When two documents disagree

Split by what they disagree about:

- **Purpose, values, audience** — the more foundational document wins. A later document does not get to quietly redefine
  why the project exists.
- **Scope, data, behaviour, rules** — the **most recent owner ruling** wins, whatever document it is in. The older
  document is then stale and must be amended or annotated in the same unit of work. Leaving it to be read as current is
  the bug.

*(A plain "the foundational doc wins" rule breaks the first week: the vision documents are written first, so they are
also the most out of date about mechanics.)*

## Kinds

| Kind | Means | Changes |
|---|---|---|
| **decided** | The owner ruled, or an ADR accepted it. Cite the ruling with its date. | by ruling only |
| **descriptive** | What something *is* today (an old system, a vendor's API). The map, not the spec. | when the thing changes |
| **planning** | Scope, sequencing, method | often |
| **view** | Written *from* other documents (the register, a partner summary). Never a fork. | whenever its sources change |
| **generated** | Written by a script. Never edit by hand; a test fails when stale. | on `pnpm <script>` |
| **practice** | How the people work the harness — not rules for Claude | when the practice changes |

## The documents

| Document | Kind | Holds |
|---|---|---|
| [`OPEN-QUESTIONS.md`](OPEN-QUESTIONS.md) | view | Every open question, who can answer it, where it is defined |
| [`INBOX.md`](INBOX.md) | inbox | Human input waiting to be written into the document that owns it |
| [`GUARDRAILS.md`](GUARDRAILS.md) | decided | Where each kind of thing lives, and what stops a second copy |
| [`CODEMAP.md`](CODEMAP.md) | generated | Every export that exists |
| [`decisions/`](decisions/) | decided | ADRs — numbered, append-only, superseded never edited |
| [`plan/BUILD-METHOD.md`](plan/BUILD-METHOD.md) | decided (method) | How any piece of work is built |
| [`plan/DEFINITION-OF-DONE.md`](plan/DEFINITION-OF-DONE.md) | decided (method) | The gate |
| [`plan/FRICTION-LOG.md`](plan/FRICTION-LOG.md) | planning | What annoys the owner, filed against the work it belongs to |
| [`plan/GOAL.md`](plan/GOAL.md) | planning | The queue for a run, the loop, permissions and the "never" list |
| [`plan/runs/`](plan/runs/) | run report | One per run, kept as it goes |
| [`plan/SCREEN-STANDARD.md`](plan/SCREEN-STANDARD.md) | decided (method) | The bar a screen meets before a person looks at it |
| [`practice/AUTONOMOUS-RUNS.md`](practice/AUTONOMOUS-RUNS.md) | practice | How the owner sets up, starts, steers and reviews a run, with the prompts |
| [`practice/ADMIN-COMPANION.md`](practice/ADMIN-COMPANION.md) | practice | Admin pages that mirror these docs and take input back |

## Status

| Area | Status | As of |
|---|---|---|
| <slice / feature> | <built · in progress · next · parked> | <YYYY-MM-DD> |
