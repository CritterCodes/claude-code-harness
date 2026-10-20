# Goal — <the run's name>

**Kind:** standing instructions for a working session. **Set by the owner, <YYYY-MM-DD>:** *"<their words that set the
run>"*

Read `CLAUDE.md` first; every rule there holds. This file only says **what to work on, in what order, and what never to
do.** How it's built is [`BUILD-METHOD.md`](BUILD-METHOD.md); when it's done is
[`DEFINITION-OF-DONE.md`](DEFINITION-OF-DONE.md).

## The loop

Pick the first unfinished item below. Before starting, search `git log` and the docs for it; if it's already built, tick
it with the commit that built it and move on. Build it the standard way, run the gate, commit, and tick it here
(`[x]`, the commit SHA, one line on what was built) **in the same commit**. Then the next. When the list is empty, go to
**Never idle**, and keep going.

If an item needs a decision that is the owner's: put it on the register, build what doesn't depend on it, say so in the
report, and go to the next item.

## The queue (in order)

1. [ ] **<Item>** — <what, and what done looks like>. <The owner's words, dated, if a ruling shaped it.> <Where the
   plan lives.>
2. [ ] **<Item>** — …

## Never idle — when the queue is empty, or blocked

In this order, logging each in the report:

- **Bug-hunt today's work.** Re-read the diffs with fresh eyes. Every bug gets a failing test first, then the fix.
- **Open fixes** from testers or the screen review.
- **Docs against code.** A claim the code doesn't back gets fixed in the doc or the code.
- **Guardrail debt.** A rule GUARDRAILS marks review-only gets made mechanical.
- **Small ruled things** in the register or friction log that nobody built.

## Standing permissions (owner)

- <e.g. Push to `main` when a unit is gated green — owner, YYYY-MM-DD: *"…"*>
- <e.g. Run database migrations on staging — …>

## Never (stop and put it in the report instead)

- Answer a question on the register.
- Spend real money, place real orders, or send real messages to customers.
- Write to production data without a written permission above.
- Print, copy into chat, or commit a secret.

## The report

Keep `docs/plan/runs/RUN-<YYYY-MM-DD>.md` (the date the run ends) as you go:
[template](runs/RUN-TEMPLATE.md).
