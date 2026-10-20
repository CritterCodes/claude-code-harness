# ADR-0002 — Subagents: narrow jobs, one truth

**Status:** accepted (owner, <YYYY-MM-DD>)
**Date:** <YYYY-MM-DD>

## Context

Claude Code can hand work to subagents (`.claude/agents/*.md`): each runs in its own context and returns only its
answer. That helps in three ways: big reads stay out of the main session's context, a reviewer that didn't write the
change has none of the author's assumptions, and read-only searches can run in parallel on a cheaper model.

It can also go wrong in a familiar way. A setup with an agent per department, each with its own instructions (often one
copy per model), is the five-contradictory-rulebooks problem multiplied. When a rule changes, every copy has to change,
and they drift. Two agents writing at once overwrite each other.

The author's own audit on the day this was written showed the review case: a commit message claimed its tests were
written first when they weren't. The session that wrote it had reviewed its own work and missed it.

## Decision

Four agents, each with one job, all **read-only**, all reading the same docs:

| Agent | Job | Model |
|---|---|---|
| `reuse-scout` | Before a new export: does it exist? (CODEMAP, GUARDRAILS, grep) | cheapest |
| `tracer` | How does the code actually do X? Screen → call → route → data, with paths | mid |
| `reviewer` | Before a commit: is the message true, is anything duplicated, was a register question decided, did the docs move, would the tests fail on a revert? | strongest |
| `screen-checker` | Before a person sees screenshots: do they meet SCREEN-STANDARD? | mid |

- **No agent holds rules of its own.** It links `CLAUDE.md` and the docs that hold the rules, and does one job.
- **Agents report; the main session decides and writes.** No agent edits, commits, or answers the register.
- **One agent per job, never one per model.** The model is a setting on the agent.
- Add an agent only when a job recurs and its answer is checkable, the same way a guardrail is added.

## Enforced by

`tools/guardrails/agents.ts`, with planted tests: an agent with a file-editing tool (Edit, Write, NotebookEdit,
MultiEdit), no tools list (which grants every tool), no link to `CLAUDE.md`, a link to a doc that doesn't exist, a name
that doesn't match its file, or a body over 30 lines fails the build.

**What it can't enforce:** a shell (Bash, PowerShell) can write, commit and push, and nothing in an agent's frontmatter
limits what it runs. `tracer` and `reviewer` need one for `git`. So an agent with a shell must *say* in its body that it
never writes or commits, and the check fails the build if that sentence is missing. That sentence is the only limit: the
check makes sure it is there, not that it is obeyed. Give a shell only to agents that need it. Calling the reviewer before a commit is in [`DEFINITION-OF-DONE.md`](../plan/DEFINITION-OF-DONE.md), and is
review-only until a project decides to require a `Reviewed:` line in the commit hook.

## Consequences

Longer sessions stay sharp, duplicates are caught before they're written, and a second reader looks at every commit.
The cost is a little latency per call, and keeping the four files short.
