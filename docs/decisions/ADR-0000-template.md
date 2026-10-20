# ADR-NNNN — <title>

**Status:** proposed | accepted (owner, YYYY-MM-DD) | superseded by ADR-NNNN
**Date:** YYYY-MM-DD

ADRs are append-only. An accepted ADR is never edited; a change is a new ADR that supersedes it. "Proposed" is not
"decided" — a session never writes "accepted" without the owner's ruling, quoted.

## Context

What forced the decision. Evidence with provenance: what the code does (path, commit), what the owner said (date,
words), what was inferred (say so).

## Decision

One paragraph. What is true from now on.

## Enforced by

How a machine notices when this is broken: a lint rule, a check in `tools/guardrails`, a type, a test. If nothing can
notice, say "review-only" — that is a debt, and it goes in GUARDRAILS.md.

## Consequences

What gets easier, what gets harder, what is now out of scope.
