# How any piece of work is built

**Kind:** decided (method). **As of:** <YYYY-MM-DD>.

## In one paragraph

**It is test-driven, per unit of work, with a judgment step before the tests.** Look at what exists (the old system, the
current code, the docs) → **judge it** → write the tests that say what it must do → watch them fail → write the code
until they pass → run the gate. A unit is done only on green; there is no "mostly done".

## 1. Look at what exists — traced, not guessed

"The old system does X" is established by **tracing it**: the screen → the call → the route → the data it touches. Never
from a file name or a route name. (In the project this came from, the route whose name matched a core feature turned
out to be dead code from an abandoned integration; the real one was somewhere else. Trusting the name would have rebuilt
the wrong thing.)

Read old code at a **pinned commit**, and say which, so a claim can be checked later.

## 2. Judge it

For each behaviour, say which it is:

| Verdict | Meaning | What happens |
|---|---|---|
| **promise** | Users rely on it | Port it, with its tests if it has them |
| **artifact** | It is that way by accident | Do it the way it should have been |
| **defect** | It is wrong | Fix it — and write the test that proves the fix |

And for how it is used: **keep · smooth · rethink**. *This judgment is where the improvement happens* — it stops the
mess from riding along with the promise. The bar is *better than what it replaces*, never equal.

## 3. Tests first — and the first run is red

Assemble the suite before the code. **Run it and watch it fail**, and record that failure in the commit body (`module
missing`, `expected 3, got undefined`). A test that has never failed has not been shown to test anything.

## 4. Build until green, then the gate

[`DEFINITION-OF-DONE.md`](DEFINITION-OF-DONE.md). If the work found a duplicate, folded it, or ruled on a question, the
docs change in the same commit: GUARDRAILS, the register, the owning document.
